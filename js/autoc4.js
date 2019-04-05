// Copyright (c) 2014-2016 Chaos Computer Club Cologne
//
// This file is MIT licensed. Please see the
// LICENSE-MIT file in the source package for more information.
//

/* jshint strict: global */

/* globals
    console, setTimeout, Uint8Array,
    $, Paho,
    two_digits,
    mqtt_subscribe_light, mqtt_subscribe_dmx, mqtt_subscribe_status, mqtt_subscribe_presets,
    mqtt_on_light_message, mqtt_on_dmx_message, mqtt_on_status_message, mqtt_on_presets_message,
    init_light, init_dmx, init_mqtt, init_kitchenlight
*/

"use strict";

var __AUTOC4_SERVER=location.hostname||'172.23.23.110';

var mqtt_client;

var AutoC4=function(server,modules){
    this.server=server;
    this.modules=modules;
    
    var self=this;
    $('#shutdown').click(function(ev) {
        ev.preventDefault();
        self.mqtt_send_data('club/shutdown');
    });

    $('#shutdown-force').click(function(ev) {
        ev.preventDefault();
        self.mqtt_send_data('club/shutdown', [0x44]);
    });

    $('#gate').click(function(ev) {
        ev.preventDefault();
        self.mqtt_send_data('club/gate');
    });

    $('#help').click(function(ev) {
        ev.preventDefault();
        $('#help-display').toggle();
    });
    
    init_kitchenlight();
    for(var module of modules){
        if(module.init)
            module.init(this);
    }
    this.init_mqtt();
}

AutoC4.prototype.mqtt_on_message = function (message) {
    for(var module of this.modules){
        if(module.on_message)
            module.on_message(message, mqtt_client, this);
    }
};

AutoC4.prototype.mqtt_on_connect = function () {
    console.log('onConnect');
    // Once a connection has been made, make subscriptions.
    for(var module of this.modules){
        if(module.subscribe)
            module.subscribe(mqtt_client, this);
    }
}

AutoC4.prototype.mqtt_on_connect_failure = function () {
    console.log('mqtt connect failed, retrying in 5 sec');
    setTimeout(function(self){self.init_mqtt()}, 5000, this);
}

AutoC4.prototype.mqtt_send_data = function (topic, data) {
    var buf = new Uint8Array(data || 0);
    var message = new Paho.MQTT.Message(buf);
    message.destinationName = topic;
    this.mqtt_client.send(message);
}

AutoC4.prototype.mqtt_send_string = function (topic, data) {
    var message = new Paho.MQTT.Message(data);
    message.destinationName = topic;
    this.mqtt_client.send(message);
}

AutoC4.prototype.init_mqtt = function () {
    //mqtt_client = new Paho.MQTT.Client(location.hostname, 9000, mqtt_generate_clientid());
    mqtt_client = this.mqtt_client = new Paho.MQTT.Client(this.server, 9000, AutoC4.mqtt_generate_clientid());
    mqtt_client.onMessageArrived = this.mqtt_on_message.bind(this);
    mqtt_client.onConnectionLost = this.mqtt_on_connect_failure.bind(this);
    mqtt_client.connect({onSuccess: this.mqtt_on_connect.bind(this), onFailure: this.mqtt_on_connect_failure.bind(this), mqttVersion: 3});
};
    

AutoC4.mqtt_generate_clientid = function() {
    return 'c4sw_yxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0;
        var v = (c == 'x') ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};

var update_time = function () {
    var now = new Date();
    var text = two_digits(now.getDate()) + "." + two_digits(now.getMonth() + 1) + "." + now.getFullYear() + " " + two_digits(now.getHours()) + ":" + two_digits(now.getMinutes());
    $('#datetime').text(text);
    setTimeout(update_time, 60000 - now.getSeconds() * 1000 - now.getMilliseconds());
};

var autoc4
$(function(){
    autoc4=new AutoC4(
        __AUTOC4_SERVER,
        [
            autoc4_windows(),
            autoc4_presets(),
            autoc4_status(),
            autoc4_light(),
            autoc4_dmx(),
            autoc4_heartbeat()
        ]
    );
    update_time();
});
