// Copyright (c) 2017 Chaos Computer Club Cologne
//
// This file is MIT licensed. Please see the
// LICENSE file in the source package for more information.
//

(function () {
    var autoc4_shutdown = function (options) {

        var init = function (autoc4) {
            $(options.shutdownButtonSelector).click(function (ev) {
                ev.preventDefault();
                autoc4.mqtt_send_data('club/shutdown');
            });

            $(options.forceShutdownButtonSelector).click(function (ev) {
                ev.preventDefault();
                autoc4.mqtt_send_data('club/shutdown', [0x44]);
            });
        };

        return {
            init: init
        };
    };
    AutoC4.register_module("shutdown", autoc4_shutdown);
})(AutoC4);