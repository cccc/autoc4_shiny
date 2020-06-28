/**
 * @copyright Chaos Computer Club Cologne 2014-2020
 * @license MIT
 * @requires utils
 */
import {mqtt_match_topic, two_digits, generateUUID, simpleDateFormat} from "./utils.js";

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
        })
        .fail(function (e, f) {
            console.error("Couldn't load config.json", e, f);
        });
});

export interface AutoC4Module {
    init(autoc4: AutoC4, options: any): this;
    onMessage(autoc4: AutoC4, message: Paho.MQTT.Message): void;
    onConnect(autoc4: AutoC4, o: Paho.MQTT.WithInvocationContext): void;
    onConnectionFailure(autoc4: AutoC4, error: Paho.MQTT.MQTTError): void;
}

export interface AutoC4ModuleFactory {
    (): AutoC4Module;
}

export interface AutoC4ModuleConfig {
    type: string;
    options: any;
    subscribe: string[];
    instance: AutoC4Module;
}

export interface AutoC4DebugConfig {
    message: boolean;
    connect: boolean;
    disconnect: boolean;
    configLoaded: boolean;
    moduleLoaded: boolean;
    sentMessage: boolean;
}

export interface AutoC4Config {
    server?: string;
    port?: number;
    clientIdPrefix?: string;
    plugins: string[];
    modules: AutoC4ModuleConfig[];
    debug?: AutoC4DebugConfig;
}

export class AutoC4 {
    private config: AutoC4Config;
    private readonly modules: AutoC4Module[] = [];
    public readonly client: Paho.MQTT.Client;

    public constructor(config: AutoC4Config) {
        this.config = config;

        this.client = new Paho.MQTT.Client(
            config.server || window.location.hostname,
            config.port || 9000,
            (config.clientIdPrefix || "shiny_") + generateUUID()
        );
        this.client.onMessageArrived = this.onMessage.bind(this);
        this.client.onConnectionLost = this.onConnectionFailure.bind(this);

        Promise.all(config.plugins.map(plugin => import(plugin)))
            .then( exprts => {
                exprts.forEach(exp => exp.default(this));
                this.loadModules()
                this.connect();
            })
            .catch( error => console.error(error) );
    }

    public loadModules():void{
        for (const moduleConfig of this.config.modules) {
            try {
                moduleConfig.instance = this.moduleConfigToModule(moduleConfig).init(this, moduleConfig.options)
                this.modules.push(moduleConfig.instance);
                if (this.config.debug && this.config.debug.moduleLoaded)
                    console.debug(`Successfully initialized module of type "${moduleConfig.type}".`, moduleConfig);
            } catch (err) {
                console.error("An error occured while initializing a module.");
                console.error("Module Type: ", moduleConfig.type);
                console.error(err);
            }
        }
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

        //call onConnect handler for all modules
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

    public sendData(topic: string, data: string|Uint8Array, retained: boolean = false): void {
        let message = new Paho.MQTT.Message(data);
        message.destinationName = topic;
        message.retained = retained;
        this.client.send(message);
        if (this.config.debug && this.config.debug.sentMessage)
            console.debug('Sent MQTT Message:', message);
    }
    public sendByte(topic: string, data: number, retained: boolean = false): void {
        this.sendData(topic, new Uint8Array(data===undefined ? [0] : [data]), retained);
    }

    private _moduleTypes: {[type: string]:AutoC4ModuleFactory} = {};
    public registerModuleType(type: string, factory: AutoC4ModuleFactory): void {
        this._moduleTypes[type]=factory;
    }
    public moduleConfigToModule(config: AutoC4ModuleConfig): AutoC4Module {
        if(config.type in this._moduleTypes)
            return this._moduleTypes[config.type]();
        else
            throw new Error(`Unknown module type: ${config.type}`);
    }
}