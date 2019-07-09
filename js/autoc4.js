// Copyright (c) 2014-2016 Chaos Computer Club Cologne
//
// This file is MIT licensed. Please see the
// LICENSE file in the source package for more information.
//

"use strict";

var autoc4;
var __AUTOC4_SERVER = location.hostname;
var __AUTOC4_DEBUG = true;
var __AUTOC4_DEBUG_INCOMING_MESSAGES = false;
var __AUTOC4_CONFIG_LOCATION = __AUTOC4_CONFIG_LOCATION || "config.json";

$(function() {
    $.getJSON(__AUTOC4_CONFIG_LOCATION)
        .done(function(config) {
            if (config.debug && config.debug.configLoaded)
                console.log("Config loaded successfully", config);
            autoc4 = new AutoC4(
                config
            );
            update_time();
        })
        .fail(function(e, f) {
            console.error("Couldn't load config.json", e, f);
        });
});

var mqtt_client;

var AutoC4 = function(config) {
    this.config = config;
    this.modules = config.modules.map(function(m) { return AutoC4.get_module(m.module)(m.options); });
    //temporary until all modules can be loaded via config
    Array.prototype.push.apply(this.modules, [
        autoc4_windows(),
        autoc4_presets(),
        autoc4_state(),
        autoc4_light(),
        autoc4_kitchenlight()
    ]);

    var self = this;

    $('#gate').click(function(ev) {
        ev.preventDefault();
        self.mqtt_send_data('club/gate');
    });

    $('#help').click(function(ev) {
        ev.preventDefault();
        $('#help-display').toggle();
    });

    for (var module of this.modules) {
        if (module.init) {
            try {
                module.init(this);
            } catch (err) {
                console.error("An error occured while initializing module.");
                console.error("Module: ", module);
                console.error(err);
            }
        }
    }
    this.init_mqtt();
};

AutoC4.prototype.mqtt_on_message = function(message) {
    if (__AUTOC4_DEBUG && __AUTOC4_DEBUG_INCOMING_MESSAGES)
        console.log("MQTT message received:", message);
    for (var module of this.modules) {
        if (module.on_message) {
            try {
                module.on_message(message, this.mqtt_client, this);
            } catch (err) {
                console.error("An error occured while processing message.");
                console.error("Module: ", module);
                console.error(err);
            }
        }
    }
};

AutoC4.prototype.mqtt_on_connect = function(e) {
    if (this.config.debug && this.config.debug.connect)
        console.log('MQTT connection failure, retrying in 5 seconds..', e);
    // Once a connection has been made, make subscriptions.
    for (var module of this.modules) {
        if (module.subscribe) {
            try {
                module.subscribe(this.mqtt_client, this);
            } catch (err) {
                console.error("An error occured while subscribing to topics.");
                console.error("Module: ", module);
                console.error(err);
            }
        }
    }
}

AutoC4.prototype.mqtt_on_connect_failure = function(e) {
    if (this.config.debug && this.config.debug.disconnect)
        console.log('MQTT connection failure, retrying in 5 seconds..', e);
    setTimeout(function(self) { self.init_mqtt() }, 5000, this);

    for (var module of this.modules) {
        if (module.on_connect_failure) {
            try {
                module.on_connect_failure(this.mqtt_client, this);
            } catch (err) {
                console.error("An error occured while handling disconnect.");
                console.error("Module: ", module);
                console.error(err);
            }
        }
    }
}

AutoC4.prototype.mqtt_send_data = function(topic, data) {
    var buf = new Uint8Array(data || 0);
    var message = new Paho.MQTT.Message(buf);
    message.destinationName = topic;
    this.mqtt_client.send(message);
}

AutoC4.prototype.mqtt_send_string = function(topic, data) {
    var message = new Paho.MQTT.Message(data);
    message.destinationName = topic;
    this.mqtt_client.send(message);
}

AutoC4.prototype.init_mqtt = function() {
    mqtt_client = this.mqtt_client = new Paho.MQTT.Client(
        this.config.server || window.location.hostname,
        this.config.port || 9000,
        AutoC4.mqtt_generate_clientid()
    );
    mqtt_client.onMessageArrived = this.mqtt_on_message.bind(this);
    mqtt_client.onConnectionLost = this.mqtt_on_connect_failure.bind(this);
    mqtt_client.connect({ onSuccess: this.mqtt_on_connect.bind(this), onFailure: this.mqtt_on_connect_failure.bind(this), mqttVersion: 3 });
};

AutoC4.mqtt_generate_clientid = function() {
    return 'c4sw_yxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        var v = (c == 'x') ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

var update_time = function() {
    var now = new Date();
    var text = two_digits(now.getDate()) + "." + two_digits(now.getMonth() + 1) + "." + now.getFullYear() + " " + two_digits(now.getHours()) + ":" + two_digits(now.getMinutes());
    $('#datetime').text(text);
    setTimeout(update_time, 60000 - now.getSeconds() * 1000 - now.getMilliseconds());
};

/**
 * BEGINING OF MODULE TYPE REGISTRATION HANDLING
 */

/**The object registered module types are stored in. */
AutoC4.__MODULES = {};
AutoC4.register_module = function(name, mod) {
    AutoC4.__MODULES[name] = mod;
}
AutoC4.get_module = function(name) {
    return AutoC4.__MODULES[name];
}

$(function() {
    $("body").on("click input change", "[data-toggle=value][data-target][data-value]", function() {
        var $this = $(this);
        $($this.attr("data-target")).val($this.attr("data-value"));
    });
});