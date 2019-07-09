// Copyright (c) 2014-2016 Chaos Computer Club Cologne
//
// This file is MIT licensed. Please see the
// LICENSE file in the source package for more information.
//

/* jshint strict: global */

/* globals
    $,
    mqtt_client
*/

"use strict";

var autoc4_state = function() {
    var subscribe = function(mqtt_client) {
        mqtt_client.subscribe('club/status');
    };

    var on_connect_failure = function(message) {
        var icon = $('#club-status .fa');
        var text = $('#club-status :last-child');
        icon.removeClass('fa-thumbs-down fa-thumbs-up')
            .addClass('fa-exclamation-circle');
        icon.css('color', '#a00');
        text.text('Disconnected');
    }

    var on_message = function(message) {
        if (message.destinationName != "club/status")
            return;
        var icon = $('#club-status .fa');
        var text = $('#club-status :last-child');
        if (message.payloadBytes[0]) {
            icon.removeClass('fa-hand-point-right fa-thumbs-down fa-exclamation-circle')
                .addClass('fa-thumbs-up');
            icon.css('color', '#0c0');
            text.text('Open');
        } else {
            icon.removeClass('fa-hand-point-right fa-thumbs-up fa-exclamation-circle')
                .addClass('fa-thumbs-down');
            icon.css('color', '#c00');
            text.text('Closed');
        }
    };

    return {
        subscribe: subscribe,
        on_message: on_message,
        on_connect_failure: on_connect_failure
    }
}