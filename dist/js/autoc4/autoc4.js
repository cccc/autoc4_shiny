var autoc4, __awaiter = this && this.__awaiter || function(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))((function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator.throw(value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : function adopt(value) {
                return value instanceof P ? value : new P((function(resolve) {
                    resolve(value);
                }));
            }(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    }));
};

import { mqtt_match_topic, generateUUID } from "./utils.js";

var __AUTOC4_CONFIG_LOCATION = __AUTOC4_CONFIG_LOCATION || "config.json";

$((function() {
    $.getJSON(__AUTOC4_CONFIG_LOCATION).done((function(config) {
        config.debug && config.debug.configLoaded && console.debug("Config loaded successfully", config), 
        autoc4 = new AutoC4(config), window.autoc4 = autoc4;
    })).fail((function(e, f) {
        console.error("Couldn't load config.json", e, f);
    }));
}));

export class AutoC4 {
    constructor(config) {
        this.modules = [], this._moduleTypes = {}, this.config = config, this.client = new Paho.MQTT.Client(config.server || window.location.hostname, config.port || 9000, (config.clientIdPrefix || "shiny_") + generateUUID()), 
        this.client.onMessageArrived = this.onMessage.bind(this), this.client.onConnectionLost = this.onConnectionFailure.bind(this), 
        this.loadPlugins().then((exprts => {
            exprts.forEach((exp => exp.default(this))), this.loadModules(), this.connect();
        })).catch((error => console.error("Failed to load plugins.", error)));
    }
    loadPlugins() {
        return __awaiter(this, void 0, void 0, (function*() {
            return yield Promise.all(this.config.plugins.map((plugin => __awaiter(this, void 0, void 0, (function*() {
                return import(plugin).then((obj => __awaiter(this, void 0, void 0, (function*() {
                    return this.config.debug && this.config.debug.pluginLoaded && console.debug(`Successfully loaded plugin: ${plugin}`, obj), 
                    obj;
                })))).catch((err => __awaiter(this, void 0, void 0, (function*() {
                    throw console.error(`Failed to load plugin: ${plugin}`, err), err;
                }))));
            })))));
        }));
    }
    loadModules() {
        for (const moduleConfig of this.config.modules) try {
            moduleConfig.instance = this.moduleConfigToModule(moduleConfig).init(this, moduleConfig.options), 
            this.modules.push(moduleConfig.instance), this.config.debug && this.config.debug.moduleLoaded && console.debug(`Successfully initialized module of type "${moduleConfig.type}".`, moduleConfig);
        } catch (err) {
            console.error("An error occured while initializing a module."), console.error("Module Type: ", moduleConfig.type), 
            console.error(err);
        }
    }
    connect() {
        this.client.connect({
            onSuccess: this.onConnect.bind(this),
            onFailure: this.client.onConnectionLost,
            mqttVersion: 3
        });
    }
    onMessage(message) {
        this.config.debug.message && console.debug("MQTT message received:", message);
        for (let moduleConfig of this.config.modules) try {
            moduleConfig.subscribe && moduleConfig.subscribe.some((sub => mqtt_match_topic(sub, message.destinationName))) && moduleConfig.instance.onMessage(this, message);
        } catch (err) {
            console.error("An error occured while processing a message."), console.error("Module: ", moduleConfig.instance), 
            console.error(err);
        }
    }
    onConnect(o) {
        this.config.debug && this.config.debug.connect && console.debug("MQTT connection successfull.", o);
        for (let moduleConfig of this.config.modules) if (moduleConfig.subscribe) for (let topic of moduleConfig.subscribe) this.client.subscribe(topic);
        for (let module of this.modules) try {
            module.onConnect(this, o);
        } catch (err) {
            console.error("An error occured while handling disconnect."), console.error("Module: ", module), 
            console.error(err);
        }
    }
    onConnectionFailure(e) {
        this.config.debug && this.config.debug.disconnect && console.warn("MQTT connection failure, retrying in 5 seconds..", e), 
        setTimeout((function(self) {
            self.connect();
        }), 5000, this);
        for (let module of this.modules) try {
            module.onConnectionFailure(this, e);
        } catch (err) {
            console.error("An error occured while handling disconnect."), console.error("Module: ", module), 
            console.error(err);
        }
    }
    sendData(topic, data, retained = !1) {
        let message = new Paho.MQTT.Message(data);
        message.destinationName = topic, message.retained = retained, this.client.send(message), 
        this.config.debug && this.config.debug.sentMessage && console.debug("Sent MQTT Message:", message);
    }
    sendByte(topic, data, retained = !1) {
        this.sendData(topic, new Uint8Array(void 0 === data ? [ 0 ] : [ data ]), retained);
    }
    registerModuleType(type, factory) {
        this._moduleTypes[type] = factory;
    }
    moduleConfigToModule(config) {
        if (config.type in this._moduleTypes) return this._moduleTypes[config.type]();
        throw new Error(`Unknown module type: ${config.type}`);
    }
}
//# sourceMappingURL=autoc4.js.map
