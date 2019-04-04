// Copyright (c) 2014-2016 Chaos Computer Club Cologne
//
// This file is MIT licensed. Please see the
// LICENSE-MIT file in the source package for more information.
//

/* jshint strict: global */

/* globals
    $,
    mqtt_client
*/

"use strict";

var autoc4_status = function(){
    var subscribe = function(mqtt_client) {
        mqtt_client.subscribe('club/status');
    };
    
    var on_message = function(message) {
        if (message.destinationName != "club/status")
            return;
        var icon = $('#club-status .fa');
        var text = $('#club-status :last-child');
        if (message.payloadBytes[0]) {
            icon.removeClass('fa-hand-point-right')
                .removeClass('fa-thumbs-down')
                .addClass('fa-thumbs-up');
            icon.css('color', '#0c0');
            text.text('Open');
        } else {
            icon.removeClass('fa-hand-point-right')
                .removeClass('fa-thumbs-up')
                .addClass('fa-thumbs-down');
            icon.css('color', '#c00');
            text.text('Closed');
        }
    };
    
    return {
        subscribe:subscribe,
        on_message:on_message
    }
}
