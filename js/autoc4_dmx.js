// Copyright (c) 2014-2016 Chaos Computer Club Cologne
//
// This file is MIT licensed. Please see the
// LICENSE-MIT file in the source package for more information.
//

/* jshint strict: global */

/* globals
    Uint8Array,
    $, Paho,
    mqtt_client,
    dec2hex
*/

"use strict";

var autoc4_dmx = function (){
    var pickers = { plenar: {}, fnord: {}, wohnzimmer: {}, kitchen: {} };
    var autoc4;

    var init = function(_autoc4) {
        pickers.plenar.master = $("#dmxcolorplenar-master");
        pickers.plenar.vorne1 = $("#dmxcolorplenar-vorne1");
        pickers.plenar.vorne2 = $("#dmxcolorplenar-vorne2");
        pickers.plenar.vorne3 = $("#dmxcolorplenar-vorne3");
        pickers.plenar.hinten1 = $("#dmxcolorplenar-hinten1");
        pickers.plenar.hinten2 = $("#dmxcolorplenar-hinten2");
        pickers.plenar.hinten3 = $("#dmxcolorplenar-hinten3");
        pickers.plenar.hinten4 = $("#dmxcolorplenar-hinten4");
        pickers.fnord.master = $("#dmxcolorfnordcenter-master");
        pickers.fnord.scummfenster = $("#dmxcolorfnordcenter-sf");
        pickers.fnord.schranklinks = $("#dmxcolorfnordcenter-ss");
        pickers.fnord.fairyfenster = $("#dmxcolorfnordcenter-ff");
        pickers.fnord.schrankrechts = $("#dmxcolorfnordcenter-fs");
        pickers.wohnzimmer.master = $("#dmxcolorwohnzimmer-master");
        pickers.wohnzimmer.mitte1 = $("#dmxcolorwohnzimmer-mitte1");
        pickers.wohnzimmer.mitte2 = $("#dmxcolorwohnzimmer-mitte2");
        pickers.wohnzimmer.mitte3 = $("#dmxcolorwohnzimmer-mitte3");
        pickers.wohnzimmer.tuer1 = $("#dmxcolorwohnzimmer-tuer1");
        pickers.wohnzimmer.tuer2 = $("#dmxcolorwohnzimmer-tuer2");
        pickers.wohnzimmer.tuer3 = $("#dmxcolorwohnzimmer-tuer3");
        pickers.wohnzimmer.gang = $("#dmxcolorwohnzimmer-gang");
        pickers.wohnzimmer.baellebad = $("#dmxcolorwohnzimmer-baellebad");
        pickers.kitchen.master = $("#dmxcolorwohnzimmer-sink");
        pickers.kitchen.sink = $("#dmxcolorwohnzimmer-sink");

        $('.dmxinput').change(dmx_change);
        $('.btn-fade').click(dmx_fade);
        $('.btn-rand').click(dmx_rand);
        $('.btn-sound').click(dmx_sound);
        
        autoc4 = _autoc4;
    }
    
    var subscribe = function(mqtt_client) {
        mqtt_client.subscribe('dmx/+/+');
        mqtt_client.subscribe('led/+/+');
    }
    
    var on_message = function(message) {
        if (!(message.destinationName.startsWith('dmx/') || message.destinationName.startsWith('led/')))
            return;
        var name = message.destinationName.split('/');
        var room = name[1];
        var picker = (pickers[room] || {})[name[2]];
        if (!picker) { return; }
        var payloadBytes = message.payloadBytes;
        if (payloadBytes.length >= 3) {
            var color = "#" + dec2hex(payloadBytes[0]) + dec2hex(payloadBytes[1]) + dec2hex(payloadBytes[2]);
            // update DMX picker values
            picker.val(color);

            var same = true;
            for (var light in pickers[room]) {
                if (light == "master") { continue; }
                same = same && (pickers[room][light].val() == color);
            }
            if (same) {
                pickers[room].master.val(color);
            }
        }

        if (payloadBytes.length == 7) {
            var speed = payloadBytes[4];
            if (speed === 0) { speed = 100; }
            $("#dmxfade" + room + " > .dmxspeed").val(speed);
        }
    }
    
    var dmx_change = function (e) {
        /* jshint validthis: true */
        var dmx = $(this);
        var topic = dmx.data("topic");
        var color = dmx.val();
        var send_dmx_data;
        if (!topic.contains("fnord")) {
            send_dmx_data = send_dmx_data_7ch;
        } else {
            send_dmx_data = send_dmx_data_3ch;
        }
        if (!topic.startsWith("master/")) {
            send_dmx_data(topic, color);
            return;
        }
        topic = topic.split('/', 2)[1];
        for (var light in pickers[topic]) {
            if (light == "master") { continue; }
            send_dmx_data("dmx/" + topic + "/" + light, color);
        }
    }
    
    var dmx_fade=function(e) {
        /* jshint validthis: true */
        var dmx = $(this);
        var topic = dmx.data("topic");
        var speed = parseInt(dmx.siblings(".dmxspeed").val());
        for (var light in pickers[topic]) {
            if (light == "master") { continue; }
            send_dmx_fade_7ch("dmx/" + topic + "/" + light, speed);
        }
    }
    
    var dmx_rand=function(e) {
        /* jshint validthis: true */
        var dmx = $(this);
        var topic = dmx.data("topic");
        var send_dmx_data;
        if (!topic.contains("fnord")) {
            send_dmx_data = send_dmx_data_7ch;
        } else {
            send_dmx_data = send_dmx_data_3ch;
        }

        var v = parseFloat(dmx.siblings(".dmxbright").val());
        for (var light in pickers[topic]) {
            if (light == "master") { continue; }
            var rgb = autoc4_dmx.hsv_to_rgb(Math.random(), 0.8, v);
            var rgb_s = "#" + dec2hex(rgb[0]) + dec2hex(rgb[1]) + dec2hex(rgb[2]);
            send_dmx_data("dmx/" + topic + "/" + light, rgb_s);
        }
    }
    
    var dmx_sound=function(e) {
        /* jshint validthis: true */
        var dmx = $(this);
        var topic = dmx.data("topic");
        for (var light in pickers[topic]) {
            if (light == "master") { continue; }
            send_dmx_sound_7ch("dmx/" + topic + "/" + light);
        }
    }
    
    // publish dmx rgb color + enable byte for a dmx room container
    var send_dmx_data_3ch=function(topic, value) {
        var r = parseInt(value.substr(1, 2), 16);
        var g = parseInt(value.substr(3, 2), 16);
        var b = parseInt(value.substr(5, 2), 16);
        var buf = new Uint8Array([r, g, b, 255]);
        var message = new Paho.MQTT.Message(buf);
        message.retained = true;
        message.destinationName = topic;
        autoc4.mqtt_client.send(message);
    }
    
    var send_dmx_data_7ch=function(topic, value) {
        var r = parseInt(value.substr(1, 2), 16);
        var g = parseInt(value.substr(3, 2), 16);
        var b = parseInt(value.substr(5, 2), 16);
        var buf = new Uint8Array([r, g, b, 0, 0, 0, 255]);
        var message = new Paho.MQTT.Message(buf);
        message.retained = true;
        message.destinationName = topic;
        autoc4.mqtt_client.send(message);
    }
    
    var send_dmx_sound_7ch = function (topic) {
        var buf = new Uint8Array([0, 0, 0, 0, 255, 246, 255]);
        var message = new Paho.MQTT.Message(buf);
        message.retained = true;
        message.destinationName = topic;
        autoc4.mqtt_client.send(message);
    }

    var send_dmx_fade_7ch = function (topic, speed) {
        if (speed > 255) { speed = 255; }
        var buf = new Uint8Array([0, 0, 0, 0, speed, 140, 255]);
        var message = new Paho.MQTT.Message(buf);
        message.retained = true;
        message.destinationName = topic;
        autoc4.mqtt_client.send(message);
    }
    
    return {
        init:init,
        subscribe:subscribe,
        on_message:on_message
    }
}

autoc4_dmx.hsv_to_rgb = function(h, s, v) {
    var h_i = Math.floor(h*6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    var r, g, b;
    switch (h_i) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [Math.floor(r*255), Math.floor(g*255), Math.floor(b*255)];
}


