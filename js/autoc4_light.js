// Copyright (c) 2014-2016 Chaos Computer Club Cologne
//
// This file is MIT licensed. Please see the
// LICENSE file in the source package for more information.
//

"use strict";

var autoc4_light = function(){
    
    // publish (on ? 0x01 : 0x00) message to a topic
    var switch_light = function(mqtt_client, topic, on) {
        var buf = new Uint8Array([on ? 1 : 0]);
        var message = new Paho.MQTT.Message(buf);
        message.retained = true;
        message.destinationName = topic;
        mqtt_client.send(message);
    };

    var init = function(autoc4){
        $(".btn-light").click(function (e) {
            var light = $(this);
            switch_light(autoc4.mqtt_client,light.attr("data-topic"), !light.hasClass("on"));
        });
    };
    
    var subscribe = function(mqtt_client){
        mqtt_client.subscribe('licht/+/+');
        mqtt_client.subscribe('led/+/+');
        mqtt_client.subscribe('power/+/+');
        mqtt_client.subscribe('socket/+/+/+');
        mqtt_client.subscribe('screen/+/+');
    };
    
    var on_message = function(message){
        if (!(message.destinationName.startsWith('licht/') || message.destinationName.startsWith('power/') || message.destinationName.startsWith('socket/') || message.destinationName.startsWith('led/') || message.destinationName.startsWith('screen/')))
            return;
            
        // update .btn-light state
        var button = $('.btn-light').filter('[data-topic="' + message.destinationName + '"]');
        if (button && message.payloadBytes[0] !== 0)
            button.addClass('on');
        else
            button.removeClass('on');
    };
    
    return {
        init:init,
        subscribe:subscribe,
        on_message:on_message,
        switch_light:switch_light
    };
};
