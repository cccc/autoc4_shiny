// Copyright (c) 2017 Chaos Computer Club Cologne
//
// This file is MIT licensed. Please see the
// LICENSE-MIT file in the source package for more information.
//

/* jshint strict: global */

/* globals
    console,
    $, Paho,
    mqtt_client
*/

"use strict";

var preset_list = {
    global: [],
    wohnzimmer: [],
    plenar: [],
    fnord: [],
    keller: []
};

function mqtt_send_string(topic, data) {
    var message = new Paho.MQTT.Message(data);
    message.destinationName = topic;
    mqtt_client.send(message);
}

function mqtt_subscribe_presets() {
    mqtt_client.subscribe('preset/list');
    mqtt_client.subscribe('preset/+/list');
}

function create_button(preset) {
    var button = $('<button></button>', { type: 'button', "class": 'btn btn-preset', 'data-preset': preset });
    button.text(preset);
    button.click(function(e) {
        var room = $(this).parent().data('room');
        if (room === 'global') {
            mqtt_send_string('preset/set', $(this).data("preset"));
        } else {
            mqtt_send_string('preset/' + room + '/set', $(this).data("preset"));
        }
    });
    return button;
}

function mqtt_on_presets_message(message) {
    var presets;
    try {
        presets = JSON.parse(message.payloadString);
    } catch (e) {
        console.log('Invalid JSON received');
    }
    var room = message.destinationName.split('/')[1];
    if (room === 'list') {
        preset_list.global = presets;
    } else {
        preset_list[room] = presets;
    }
    for (var r in preset_list) {
        var prebtn = $('div[data-room=' + r + ']');
        prebtn.empty();
        var room_presets = preset_list[r];
        for (var p = 0; p < room_presets.length; p += 1) {
            var pre = room_presets[p];
            create_button(pre).appendTo(prebtn);
        }
        var global_presets = preset_list.global;
        for (var g = 0; g < global_presets.length; g += 1) {
            var gpre = global_presets[g];
            if (room_presets.indexOf(gpre) === -1) {
                create_button(gpre).appendTo(prebtn);
            }
        }
    }
}
