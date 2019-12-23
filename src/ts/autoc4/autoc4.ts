/**
 * @copyright Chaos Computer Club Cologne 2014-2019
 * @license MIT
 * @requires utils
 */
/// <reference path="utils.ts" />

var autoc4;
var __AUTOC4_CONFIG_LOCATION:string = __AUTOC4_CONFIG_LOCATION || "config.json";

$(function () {
    $.getJSON(__AUTOC4_CONFIG_LOCATION)
        .done(function (config) {
            if (config.debug && config.debug.configLoaded)
                console.debug("Config loaded successfully", config);
            autoc4 = new AutoC4(
                config
            );
            update_time();
        })
        .fail(function (e, f) {
            console.error("Couldn't load config.json", e, f);
        });
});

var mqtt_client;

interface AutoC4Module {
    init(autoc4: AutoC4, options: any): this;
    onMessage(autoc4: AutoC4, message: Paho.MQTT.Message): void;
    onConnect(autoc4: AutoC4, o: Paho.MQTT.WithInvocationContext): void;
    onConnectionFailure(autoc4: AutoC4, error: Paho.MQTT.MQTTError): void;
}

interface AutoC4ModuleFactory {
    (): AutoC4Module;
}

interface AutoC4ModuleConfig {
    module: string;
    options: any;
    subscribe: string[];
    instance: AutoC4Module;
}

interface AutoC4DebugConfig {
    message: boolean;
    connect: boolean;
    disconnect: boolean;
    configLoaded: boolean;
    moduleLoaded: boolean;
}

interface AutoC4Config {
    server?: string;
    port?: number;
    modules: AutoC4ModuleConfig[];
    debug?: AutoC4DebugConfig;
}

class AutoC4 {
    private config: AutoC4Config;
    private readonly modules: AutoC4Module[] = [];
    public readonly client: Paho.MQTT.Client;

    public constructor(config: AutoC4Config) {
        this.config = config;

        this.client = new Paho.MQTT.Client(
            config.server || window.location.hostname,
            config.port || 9000,
            AutoC4.generateClientId()
        );
        this.client.onMessageArrived = this.onMessage.bind(this);
        this.client.onConnectionLost = this.onConnectionFailure.bind(this);

        for (let moduleConfig of config.modules) {
            try {
                moduleConfig.instance=AutoC4.moduleConfigToModule(moduleConfig).init(this, moduleConfig.options)
                this.modules.push(moduleConfig.instance);
                if (this.config.debug && this.config.debug.moduleLoaded)
                    console.debug(`Successfully loaded module of type "${moduleConfig.module}".`, moduleConfig);
            } catch (err) {
                console.error("An error occured while initializing a module.");
                console.error("Module: ", moduleConfig.module);
                console.error(err);
            }
        }

        $('#help').click(function (ev) {
            ev.preventDefault();
            $('#help-display').toggle();
        });

        $("body").on("click input change", "[data-toggle=value][data-target][data-value]", function() {
            document.querySelectorAll<HTMLInputElement>(this.getAttribute("data-target")).forEach((e)=>e.value=this.getAttribute("data-value"));
        });

        this.connect();
    }

    public connect():void{
        this.client.connect({ onSuccess: this.onConnect.bind(this), onFailure: this.client.onConnectionLost, mqttVersion: 3 });
    }

    public onMessage(message: Paho.MQTT.Message) {
        if (this.config.debug.message)
            console.debug("MQTT message received:", message);
        for (let moduleConfig of this.config.modules) {
            try {
                if(moduleConfig.subscribe && moduleConfig.subscribe.some((sub)=>mqtt_match_topic(sub,message.destinationName)))
                    moduleConfig.instance.onMessage(this, message);
            } catch (err) {
                console.error("An error occured while processing a message.");
                console.error("Module: ", moduleConfig.instance);
                console.error(err);
            }
        }
    }

    public onConnect(o: Paho.MQTT.WithInvocationContext): void {
        if (this.config.debug && this.config.debug.connect)
            console.debug('MQTT connection successfull.', o);
        // Once a connection has been made, make subscriptions.
        for (let moduleConfig of this.config.modules) {
            if(!moduleConfig.subscribe)
                continue;
            for (let topic of moduleConfig.subscribe) {
                this.client.subscribe(topic);
            }
        }

        for (let module of this.modules) {
            try {
                module.onConnect(this, o);
            } catch (err) {
                console.error("An error occured while handling disconnect.");
                console.error("Module: ", module);
                console.error(err);
            }
        }
    }

    public onConnectionFailure(e: Paho.MQTT.MQTTError): void {
        if (this.config.debug && this.config.debug.disconnect)
            console.warn('MQTT connection failure, retrying in 5 seconds..', e);
        setTimeout(function (self: AutoC4) { self.connect() }, 5000, this);

        for (let module of this.modules) {
            try {
                module.onConnectionFailure(this, e);
            } catch (err) {
                console.error("An error occured while handling disconnect.");
                console.error("Module: ", module);
                console.error(err);
            }
        }
    }

    public sendData(topic: string, data: string|Uint8Array, retained:boolean = false): void {
        let message = new Paho.MQTT.Message(data);
        message.destinationName = topic;
        message.retained = retained;
        this.client.send(message);
    }
    public sendByte(topic: string, data: number, retained:boolean = false): void {
        let buf = new Uint8Array(data===undefined ? [0] : [data]);
        let message = new Paho.MQTT.Message(buf);
        message.destinationName = topic;
        message.retained = retained;
        this.client.send(message);
    }

    public static generateClientId(): string {
        return 'c4sw_yxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0;
            let v = (c == 'x') ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    private static _modules: {[name: string]:AutoC4ModuleFactory} = {};
    public static registerModule(name: string, factory: AutoC4ModuleFactory): void {
        this._modules[name]=factory;
    }
    public static moduleConfigToModule(config: AutoC4ModuleConfig): AutoC4Module {
        return this._modules[config.module]();
    }
}

var update_time = function ():void {
    var now = new Date();
    var text = two_digits(now.getDate()) + "." + two_digits(now.getMonth() + 1) + "." + now.getFullYear() + " " + two_digits(now.getHours()) + ":" + two_digits(now.getMinutes());
    $('#datetime').text(text);
    setTimeout(update_time, 60000 - now.getSeconds() * 1000 - now.getMilliseconds());
};