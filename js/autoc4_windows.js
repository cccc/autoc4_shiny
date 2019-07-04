// Copyright (c) 2014-2016 Chaos Computer Club Cologne
//
// This file is MIT licensed. Please see the
// LICENSE file in the source package for more information.
//

/* jshint strict: global */

/* globals
    Uint8Array,
    $, Paho
*/

"use strict";

var autoc4_windows = function(){
    var init = function () {};

    var subscribe = function (mqtt_client) {
        mqtt_client.subscribe('fenster/+/+');
    };

    var on_message=function (message) {
        if (!message.destinationName.startsWith('fenster/'))
            return;
        // update .box-window state
        var button = $('.box-window').filter('[data-topic="' + message.destinationName + '"]');
        if (button && message.payloadBytes[0] !== 0)
            button.addClass('open');
        else
            button.removeClass('open');
    };
    
    return {
        init:init,
        subscribe:subscribe,
        on_message:on_message
    };
}
