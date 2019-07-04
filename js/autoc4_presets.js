// Copyright (c) 2017 Chaos Computer Club Cologne
//
// This file is MIT licensed. Please see the
// LICENSE file in the source package for more information.
//

/* jshint strict: global */

/* globals
    console,
    $, Paho,
    mqtt_client
*/

"use strict";

var autoc4_presets=function(){
    var init = function(){
        $("body").on("click","[data-preset-topic]",function(e) {
            var $this = $(this);
            autoc4.mqtt_send_string($this.attr('data-preset-topic'), $this.attr('data-preset-message'));
        });
    }

    var subscribe = function(mqtt_client){
        mqtt_client.subscribe('preset/list');
        mqtt_client.subscribe('preset/+/list');
        $("div.preset-pane[data-room] > [data-preset-topic]").remove();
    };
    
    var create_button = function(room, preset) {
        return $('<button>',{
            "type": 'button',
            "class": 'btn btn-preset',
            'data-preset-topic': room === 'global' ? 'preset/set' : 'preset/' + room + '/set',
            'data-preset-message' : preset
        }).text(preset);
    };
    
    var on_message=function(message, client, autoc4) {
        if (!message.destinationName.startsWith('preset/'))
            return;
        
        var presets;
        try {
            presets = JSON.parse(message.payloadString);
        } catch (e) {
            console.log('Invalid JSON received');
        }
        
        var room = message.destinationName.split('/')[1];
        if (room === 'list'){
            room="global";
            $('div.preset-pane[data-room]').each(function(){
            var $this = $(this);
            var marker = $(".preset-pane-global-marker",$this);
            var r = $this.attr("data-room");
            for (var pre of presets) {
                create_button(r, pre).insertBefore(marker);
            }
            });
        }
        
        var marker = $("div.preset-pane[data-room=\""+room+"\"] > .preset-pane-room-marker");
        for (var pre of presets) {
            create_button(room, pre).insertBefore(marker);
        }
    };
    
    return {
        init: init,
        subscribe: subscribe,
        on_message: on_message
    };
};
