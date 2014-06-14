var pickers = { fnord: {} };
function init_dmx() {
    pickers["fnord"]["master"] = $("#dmxcolorfnordcenter-master")
    pickers["fnord"]["scummfenster"] = $("#dmxcolorfnordcenter-sf");
    pickers["fnord"]["schranklinks"] = $("#dmxcolorfnordcenter-ss");
    pickers["fnord"]["fairyfenster"] = $("#dmxcolorfnordcenter-ff");
    pickers["fnord"]["schrankrechts"] = $("#dmxcolorfnordcenter-fs");

    $('input[type="color"]').change(dmx_change);
}

function mqtt_subscribe_dmx() {
    mqtt_client.subscribe('dmx/+/+');
}

function mqtt_on_dmx_message(message) {
    var name = message.destinationName.split('/');
    var room = name[1];
    var picker = (pickers[room] || {})[name[2]];
    if (!picker) { return; }
    var payloadBytes = message.payloadBytes;
    if (payloadBytes.length >= 3) {
        var color = "#" + dec2hex(payloadBytes[0]) + dec2hex(payloadBytes[1]) + dec2hex(payloadBytes[2]);
        // update DMX picker values
        picker.val(color);

        var same = true;
        for (light in pickers[room]) {
            if (light == "master") { continue; }
            same = same && (pickers[room][light].val() == color);
        }
        if (same) {
            pickers[room]["master"].val(color);
        }
    }
}

function dmx_change(e) {
    var dmx = $(this);
    var topic = dmx.data("topic");
    var color = dmx.val();
    if (topic.startsWith("dmx/")) {
        send_dmx_data(topic, color);
        return;
    }
    for (light in pickers[topic]) {
        if (light == "master") { continue; }
        send_dmx_data("dmx/" + topic + "/" + light, color);
    }
}

// publish dmx rgb color + enable byte for a dmx room container
// actually publishes the value off the room slider for all sub dmx-containers
function send_dmx_data(topic, value) {
    var r = parseInt(value.substr(1, 2), 16);
    var g = parseInt(value.substr(3, 2), 16);
    var b = parseInt(value.substr(5, 2), 16);
    var buf = new Uint8Array([r, g, b, 255]);
    var message = new Messaging.Message(buf);
    message.retained = false;
    message.destinationName = topic;
    mqtt_client.send(message);
};
