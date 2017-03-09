// Copyright (c) 2017 Chaos Computer Club Cologne
//
// This file is MIT licensed. Please see the
// LICENSE-MIT file in the source package for more information.
//

var preset_list = {
    global: [],
    wohnzimmer: [],
    plenar: [],
    fnord: [],
    keller: []
};

function init_presets() {
    $('#presets .set').each(function (idx, setter) {
        $(setter).click(function(e) {
            var room = $(this).parent().attr('data-room');
            if (room === 'global') {
                mqtt_send_string('preset/set', $(this).siblings("select").val());
            } else {
                mqtt_send_string('preset/' + room + '/set', $(this).siblings("select").val());
            }
        });
    });
}

function mqtt_subscribe_presets() {
    mqtt_client.subscribe('preset/list');
    mqtt_client.subscribe('preset/+/list');
}

function mqtt_on_presets_message(message) {
    console.log(message.destinationName + ": " + message.payloadString);
    try {
        var presets = JSON.parse(message.payloadString);
        var name = message.destinationName.split('/');
        var room = name[1];
        if (room === 'list') {
            preset_list.global = presets;
        } else {
            preset_list[room] = presets;
        }
        for (var r in preset_list) {
            var select = $('div[data-room=' + r + '] select');
            select.empty();
            for (var p in preset_list[r]) {
                var pre = preset_list[r][p];
                select.append('<option value="' + pre + '">' + pre + '</option>');
            }
            for (var g in preset_list.global) {
                if (preset_list[r].indexOf(preset_list.global[g]) === -1) {
                    var pre = preset_list.global[g];
                    select.append('<option value="' + pre + '">' + pre + '</option>');
                }
            }
        }
    } catch (e) {
        console.log('Invalid JSON received');
    }
}
