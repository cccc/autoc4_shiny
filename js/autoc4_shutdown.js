// Copyright (c) 2017 Chaos Computer Club Cologne
//
// This file is MIT licensed. Please see the
// LICENSE file in the source package for more information.
//

var autoc4_shutdown = function(){

    var init = function(autoc4){
        $('#shutdown').click(function(ev) {
            ev.preventDefault();
            autoc4.mqtt_send_data('club/shutdown');
        });
    
        $('#shutdown-force').click(function(ev) {
            ev.preventDefault();
            autoc4.mqtt_send_data('club/shutdown', [0x44]);
        });
    };
    
    return {
        init:init
    };
};
