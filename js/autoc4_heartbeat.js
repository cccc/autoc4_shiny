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

var autoc4_heartbeat = function(){
    var heartbeats={};

    var subscribe = function (mqtt_client) {
        mqtt_client.subscribe('heartbeat/#');
    };

    var on_message=function (message) {
        if (!message.destinationName.startsWith('heartbeat/'))
            return;
        // update .box-window state
        var name=message.destinationName.substring('heartbeat/'.length);
        if(!(name in heartbeats)){
            heartbeats[name]=createElement(name);
            $("#infrastructure-table").append(heartbeats[name].element)
        }
        if (!message.payloadBytes.length){
            heartbeats[name].element.remove();
            delete heartbeats[name]
        }
        
        if (message.payloadBytes[0])
            heartbeats[name].state_icon.addClass('fa-thumbs-up').removeClass('fa-thumbs-down');
        else
            heartbeats[name].state_icon.addClass('fa-thumbs-down').removeClass('fa-thumbs-up');
    };
    
    var createElement=function(name){
        var ret={};
        ret.element = $("<tr>")
            .append(
                ret.name=$("<td>")
                    .addClass("heartbeat-name")
                    .text(name)
            )
            .append(
                ret.state=$("<td>")
                    .addClass("heartbeat-state")
                    .append(
                        ret.state_icon=$("<i>")
                            .addClass("heartbeat-state-icon fa")
                            .attr("data-heartbeat-name",name)
                    )
            );
        return ret;
    }
    
    return {
        subscribe:subscribe,
        on_message:on_message
    };
}
