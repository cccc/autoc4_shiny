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

var mqtt_client;

function init_mqtt() {
    mqtt_client = new Paho.MQTT.Client(location.hostname, 9000, mqtt_generate_clientid());
    mqtt_client.onMessageArrived = mqtt_on_message;
    mqtt_client.onConnectionLost = mqtt_on_connect_failure;
    mqtt_client.connect({onSuccess: mqtt_on_connect, onFailure: mqtt_on_connect_failure, mqttVersion: 3});
}

// generate a random mqtt clientid
function mqtt_generate_clientid() {
    return 'c4sw_yxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0;
        var v = (c == 'x') ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

function mqtt_on_connect() {
    console.log('onConnect');
    // Once a connection has been made, make subscriptions.
    mqtt_subscribe_light();
    mqtt_subscribe_dmx();
    mqtt_subscribe_status();
    mqtt_subscribe_presets();
}

function mqtt_on_connect_failure() {
    console.log('mqtt connect failed, retrying in 5 sec');
    setTimeout(init_mqtt, 5000);
}

function mqtt_on_message(message) {
    if (message.destinationName.startsWith('licht/') || message.destinationName.startsWith('power/') || message.destinationName.startsWith('socket/') || message.destinationName.startsWith('led/')) {
        mqtt_on_light_message(message);
    } else if (message.destinationName.startsWith('dmx/') || message.destinationName.startsWith('led/')) {
        mqtt_on_dmx_message(message);
    } else if (message.destinationName == "club/status") {
        mqtt_on_status_message(message);
    } else if (message.destinationName.startsWith('preset/')) {
        mqtt_on_presets_message(message);
    }
}

function mqtt_send_data(topic, data) {
    var buf = new Uint8Array(data || 0);
    var message = new Paho.MQTT.Message(buf);
    message.destinationName = topic;
    mqtt_client.send(message);
}

function update_time() {
    var now = new Date();
    var text = two_digits(now.getDate()) + "." + two_digits(now.getMonth() + 1) + "." + now.getFullYear() + " " + two_digits(now.getHours()) + ":" + two_digits(now.getMinutes());
    $('#datetime').text(text);
    setTimeout(update_time, 60000 - now.getSeconds() * 1000 - now.getMilliseconds());
}

$(function() {
    $('#shutdown').click(function(ev) {
        ev.preventDefault();
        mqtt_send_data('club/shutdown');
    });

    $('#shutdown-force').click(function(ev) {
        ev.preventDefault();
        mqtt_send_data('club/shutdown', [0x44]);
    });

    $('#gate').click(function(ev) {
        ev.preventDefault();
        mqtt_send_data('club/gate');
    });

    $('#help').click(function(ev) {
        ev.preventDefault();
        $('#help-display').toggle();
    });

    update_time();
    init_light();
    init_dmx();
    init_mqtt();
    init_kitchenlight();
});
