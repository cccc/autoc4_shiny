// Copyright (c) 2014-2016 Chaos Computer Club Cologne
//
// This file is MIT licensed. Please see the
// LICENSE file in the source package for more information.
//

"use strict";

var autoc4_dmx = function (options){
    var autoc4;

    var init = function(_autoc4) {

        $("input["+options.roomDataAttribute+"]").change(dmx_change);
        // $('.btn-fade').click(dmx_fade);
        // $('.btn-rand').click(dmx_rand);
        // $('.btn-sound').click(dmx_sound);
        
        autoc4 = _autoc4;
    };
    
    var subscribe = function(mqtt_client) {
        mqtt_client.subscribe('dmx/+/+');
    };
    
    var on_message = function(message) {
        if (!(message.destinationName.startsWith('dmx/')))
            return;
        
        var components = message.destinationName.split("/");
        if (components.length<3)
            return; //if the topic has no room or light specified
        
        var payloadBytes = message.payloadBytes;
        if (payloadBytes.length < 3) /** @todo change to support one byte channels */
            return; //if the message has less than 3 bytes
        
        var room = components[1];
        var light = components[2];
        
        //search for pickers with the right room and light attribute
        var pickers = $("["+options.roomDataAttribute+"=\""+room+"\"]["+options.lightDataAttribute+"=\""+light+"\"]");
        if (!pickers.length) return; //stop if none were found

        //set the value of all found pickers to the proper color
        var color=autoc4_dmx.bytes_to_color(payloadBytes);
        for(var picker of pickers){
            picker.value=color;
        }
        
        update_room(room);

        // speedSlider = picker.getAttribute(options.speedSliderDataAttribute);
        // if (speedSlider) {
        //     var speed = payloadBytes[4] || 100;
        //     document.querySelector(speedSlider).value = val;
        // }
    };
    
    var dmx_change = function (e) {
        var color = this.value;
        var send_dmx_data;
        var channels = this.getAttribute("data-dmx-channels") || 7;
        if (channels==1) {
            send_dmx_data = send_dmx_data_1ch;
        } else if (channels==3) {
            send_dmx_data = send_dmx_data_3ch;
        } else {
            send_dmx_data = send_dmx_data_7ch;
        }

        var room = this.getAttribute(options.roomDataAttribute);
        var light = this.getAttribute(options.lightDataAttribute);

        send_dmx_data("dmx/"+room+"/"+light, color);
        update_room(room);
    };

    /**
     * Updates a room's masters' color
     * @param {string} room room to update masters for
     */
    var update_room = function(room){
        var value;

        //check if all light's colors are equal
        for(var picker of $("["+options.roomDataAttribute+"=\""+room+"\"]["+options.lightDataAttribute+"]")){
            if(value===undefined){
                //first value for comparison
                value=picker.value;
            }else if(value!=picker.value){
                //terminate if another color was found
                return;
            }
        }
        //set masters' color
        for(var picker of $("["+options.roomDataAttribute+"=\""+room+"\"]["+options.roleDataAttribute+"=master]")){
            picker.value=value;
        }
    }
    
    // var dmx_fade=function(e) {
    //     /* jshint validthis: true */
    //     var dmx = $(this);
    //     var topic = dmx.data("topic");
    //     var speed = parseInt(dmx.siblings(".dmxspeed").val());
    //     for (var light in pickers[topic]) {
    //         if (light == "master") { continue; }
    //         send_dmx_fade_7ch("dmx/" + topic + "/" + light, speed);
    //     }
    // };
    
    // var dmx_sound=function(e) {
    //     /* jshint validthis: true */
    //     var dmx = $(this);
    //     var topic = dmx.data("topic");
    //     for (var light in pickers[topic]) {
    //         if (light == "master") { continue; }
    //         send_dmx_sound_7ch("dmx/" + topic + "/" + light);
    //     }
    // };

    // publish dmx brightness
    var send_dmx_data_1ch=function(topic, value) {
        var v = parseInt(value, 10);
        var buf = new Uint8Array([v, 255]);
        var message = new Paho.MQTT.Message(buf);
        message.retained = true;
        message.destinationName = topic;
        autoc4.mqtt_client.send(message);
    };
    
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
    };
    
    var send_dmx_data_7ch=function(topic, value) {
        var r = parseInt(value.substr(1, 2), 16);
        var g = parseInt(value.substr(3, 2), 16);
        var b = parseInt(value.substr(5, 2), 16);
        var buf = new Uint8Array([r, g, b, 0, 0, 0, 255]);
        var message = new Paho.MQTT.Message(buf);
        message.retained = true;
        message.destinationName = topic;
        autoc4.mqtt_client.send(message);
    };
    
    var send_dmx_sound_7ch = function (topic) {
        var buf = new Uint8Array([0, 0, 0, 0, 255, 246, 255]);
        var message = new Paho.MQTT.Message(buf);
        message.retained = true;
        message.destinationName = topic;
        autoc4.mqtt_client.send(message);
    };

    var send_dmx_fade_7ch = function (topic, speed) {
        if (speed > 255) { speed = 255; }
        var buf = new Uint8Array([0, 0, 0, 0, speed, 140, 255]);
        var message = new Paho.MQTT.Message(buf);
        message.retained = true;
        message.destinationName = topic;
        autoc4.mqtt_client.send(message);
    };
    
    return {
        init:init,
        subscribe:subscribe,
        on_message:on_message
    };
};

autoc4_dmx.hsv_to_rgb = function(h, s, v) {
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [ r * 255, g * 255, b * 255 ];
};

autoc4_dmx.bytes_to_color = function(bytes){
    return "#" + dec2hex(bytes[0]) + dec2hex(bytes[1]) + dec2hex(bytes[2]);
}