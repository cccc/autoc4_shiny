var autoc4;
var __AUTOC4_CONFIG_LOCATION = __AUTOC4_CONFIG_LOCATION || "config.json";
$(function () {
    $.getJSON(__AUTOC4_CONFIG_LOCATION)
        .done(function (config) {
        if (config.debug && config.debug.configLoaded)
            console.debug("Config loaded successfully", config);
        autoc4 = new AutoC4(config);
        update_time();
    })
        .fail(function (e, f) {
        console.error("Couldn't load config.json", e, f);
    });
});
var mqtt_client;
class AutoC4 {
    constructor(config) {
        this.modules = [];
        this.config = config;
        this.client = new Paho.MQTT.Client(config.server || window.location.hostname, config.port || 9000, AutoC4.generateClientId());
        this.client.onMessageArrived = this.onMessage.bind(this);
        this.client.onConnectionLost = this.onConnectionFailure.bind(this);
        for (let moduleConfig of config.modules) {
            try {
                moduleConfig.instance = AutoC4.moduleConfigToModule(moduleConfig).init(this, moduleConfig.options);
                this.modules.push(moduleConfig.instance);
                if (this.config.debug && this.config.debug.moduleLoaded)
                    console.debug(`Successfully loaded module of type "${moduleConfig.module}".`, moduleConfig);
            }
            catch (err) {
                console.error("An error occured while initializing a module.");
                console.error("Module: ", moduleConfig.module);
                console.error(err);
            }
        }
        $('#help').click(function (ev) {
            ev.preventDefault();
            $('#help-display').toggle();
        });
        $("body").on("click input change", "[data-toggle=value][data-target][data-value]", function () {
            document.querySelectorAll(this.getAttribute("data-target")).forEach((e) => e.value = this.getAttribute("data-value"));
        });
        this.connect();
    }
    connect() {
        this.client.connect({ onSuccess: this.onConnect.bind(this), onFailure: this.client.onConnectionLost, mqttVersion: 3 });
    }
    onMessage(message) {
        if (this.config.debug.message)
            console.debug("MQTT message received:", message);
        for (let moduleConfig of this.config.modules) {
            try {
                if (moduleConfig.subscribe && moduleConfig.subscribe.some((sub) => mqtt_match_topic(sub, message.destinationName)))
                    moduleConfig.instance.onMessage(this, message);
            }
            catch (err) {
                console.error("An error occured while processing a message.");
                console.error("Module: ", moduleConfig.instance);
                console.error(err);
            }
        }
    }
    onConnect(o) {
        if (this.config.debug && this.config.debug.connect)
            console.debug('MQTT connection successfull.', o);
        for (let moduleConfig of this.config.modules) {
            if (!moduleConfig.subscribe)
                continue;
            for (let topic of moduleConfig.subscribe) {
                this.client.subscribe(topic);
            }
        }
        for (let module of this.modules) {
            try {
                module.onConnect(this, o);
            }
            catch (err) {
                console.error("An error occured while handling disconnect.");
                console.error("Module: ", module);
                console.error(err);
            }
        }
    }
    onConnectionFailure(e) {
        if (this.config.debug && this.config.debug.disconnect)
            console.warn('MQTT connection failure, retrying in 5 seconds..', e);
        setTimeout(function (self) { self.connect(); }, 5000, this);
        for (let module of this.modules) {
            try {
                module.onConnectionFailure(this, e);
            }
            catch (err) {
                console.error("An error occured while handling disconnect.");
                console.error("Module: ", module);
                console.error(err);
            }
        }
    }
    sendData(topic, data, retained = false) {
        var message = new Paho.MQTT.Message(data);
        message.destinationName = topic;
        message.retained = retained;
        this.client.send(message);
    }
    sendByte(topic, data, retained = false) {
        var buf = new Uint8Array(data === undefined ? [0] : [data]);
        var message = new Paho.MQTT.Message(buf);
        message.destinationName = topic;
        message.retained = retained;
        this.client.send(message);
    }
    static generateClientId() {
        return 'c4sw_yxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0;
            var v = (c == 'x') ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    static registerModule(name, factory) {
        this._modules[name] = factory;
    }
    static moduleConfigToModule(config) {
        return this._modules[config.module]();
    }
}
AutoC4._modules = {};
var update_time = function () {
    var now = new Date();
    var text = two_digits(now.getDate()) + "." + two_digits(now.getMonth() + 1) + "." + now.getFullYear() + " " + two_digits(now.getHours()) + ":" + two_digits(now.getMinutes());
    $('#datetime').text(text);
    setTimeout(update_time, 60000 - now.getSeconds() * 1000 - now.getMilliseconds());
};
//# sourceMappingURL=autoc4.js.map