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

function mqtt_send_string(topic, data) {
    var message = new Paho.MQTT.Message(data);
    message.destinationName = topic;
    mqtt_client.send(message);
}

function mqtt_subscribe_presets() {
    mqtt_client.subscribe('preset/list');
    mqtt_client.subscribe('preset/+/list');
    $("div.preset-pane[data-room] > [data-preset]").remove();
}

function create_button(room, preset) {
    return $('<button>',{
        "type": 'button',
        "class": 'btn btn-preset',
        'data-mqtt-topic': room === 'global' ? 'preset/set' : 'preset/' + room + '/set',
        'data-mqtt-message' : preset,
        'data-preset' : preset
    }).text(preset);
}

function mqtt_on_presets_message(message) {
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
    var prebtn = $('div.preset-pane[data-room='+room+']');
    var marker = $(".preset-pane-room-marker", prebtn);
    for (var pre of presets) {
        create_button(room, pre).insertBefore(marker);
    }
    
    prebtn.on("click","button",function(e) {
          var $this = $(this);
          mqtt_send_string($this.attr('data-mqtt-topic'), $this.attr('data-mqtt-message'));
      });
}
