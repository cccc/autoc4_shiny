// Copyright (c) 2017 Chaos Computer Club Cologne
//
// This file is MIT licensed. Please see the
// LICENSE-MIT file in the source package for more information.
//

/* jshint strict: global */

/* globals
    console, Uint8Array,
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

function init_presets() {
    $('#presets .set').each(function (idx, setter) {
        $(setter).click(function(e) {
            var room = $(this).parent().attr('data-room');
            if (room === 'global') {
                mqtt_send_string('preset/set', $(this).siblings("select").val());
            } else {
                mqtt_send_string('preset/' + room + '/set', $(this).siblings("select").val());
            }
        });
    });
}

function mqtt_subscribe_presets() {
    mqtt_client.subscribe('preset/list');
    mqtt_client.subscribe('preset/+/list');
}

function mqtt_on_presets_message(message) {
    var presets;
    try {
        presets = JSON.parse(message.payloadString);
    } catch (e) {
        console.log('Invalid JSON received');
    }
    var name = message.destinationName.split('/');
    var room = name[1];
    if (room === 'list') {
        preset_list.global = presets;
    } else {
        preset_list[room] = presets;
    }
    for (var r in preset_list) {
        var select = $('div[data-room=' + r + '] select');
        select.empty();
        var room_presets = preset_list[r];
        for (var p = 0; p < room_presets.length; p += 1) {
            var pre = room_presets[p];
            select.append('<option value="' + pre + '">' + pre + '</option>');
        }
        var global_presets = preset_list.global;
        for (var g = 0; g < global_presets.length; g += 1) {
            if (room_presets.indexOf(global_presets[g]) === -1) {
                var gpre = global_presets[g];
                select.append('<option value="' + gpre + '">' + gpre + '</option>');
            }
        }
    }
}
