var pickers = { plenar: {}, fnord: {} };
function init_dmx() {
    pickers["plenar"]["master"] = $("#dmxcolorplenar-master")
    pickers["plenar"]["vorne1"] = $("#dmxcolorplenar-vorne1")
    pickers["plenar"]["vorne2"] = $("#dmxcolorplenar-vorne2")
    pickers["plenar"]["vorne3"] = $("#dmxcolorplenar-vorne3")
    pickers["plenar"]["hinten1"] = $("#dmxcolorplenar-hinten1")
    pickers["plenar"]["hinten2"] = $("#dmxcolorplenar-hinten2")
    pickers["plenar"]["hinten3"] = $("#dmxcolorplenar-hinten3")
    pickers["plenar"]["hinten4"] = $("#dmxcolorplenar-hinten4")
    pickers["fnord"]["master"] = $("#dmxcolorfnordcenter-master")
    pickers["fnord"]["scummfenster"] = $("#dmxcolorfnordcenter-sf");
    pickers["fnord"]["schranklinks"] = $("#dmxcolorfnordcenter-ss");
    pickers["fnord"]["fairyfenster"] = $("#dmxcolorfnordcenter-ff");
    pickers["fnord"]["schrankrechts"] = $("#dmxcolorfnordcenter-fs");

    $('input[type="color"]').change(dmx_change);
    $('.btn-fade').click(dmx_fade);
    $('.btn-sound').click(dmx_sound);
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

    if (payloadBytes.length == 7) {
        var speed = payloadBytes[4];
        if (speed == 0) { speed = 100; }
        $("#dmxfade" + room + " > .dmxspeed").val(speed);
    }
}

function dmx_change(e) {
    var dmx = $(this);
    var topic = dmx.data("topic");
    var color = dmx.val();
    var send_dmx_data;
    if (!topic.contains("plenar")) {
	send_dmx_data = send_dmx_data_3ch;
    } else {
	send_dmx_data = send_dmx_data_7ch;
    }
    if (topic.startsWith("dmx/")) {
        send_dmx_data(topic, color);
        return;
    }
    for (light in pickers[topic]) {
        if (light == "master") { continue; }
        send_dmx_data("dmx/" + topic + "/" + light, color);
    }
}

function dmx_fade(e) {
    var dmx = $(this);
    var topic = dmx.data("topic");
    var speed = parseInt(dmx.siblings(".dmxspeed").val());
    for (light in pickers[topic]) {
        if (light == "master") { continue; }
        send_dmx_fade_7ch("dmx/" + topic + "/" + light, speed);
    }
}

function dmx_sound(e) {
    var dmx = $(this);
    var topic = dmx.data("topic");
    for (light in pickers[topic]) {
        if (light == "master") { continue; }
        send_dmx_sound_7ch("dmx/" + topic + "/" + light);
    }
}

// publish dmx rgb color + enable byte for a dmx room container
function send_dmx_data_3ch(topic, value) {
    var r = parseInt(value.substr(1, 2), 16);
    var g = parseInt(value.substr(3, 2), 16);
    var b = parseInt(value.substr(5, 2), 16);
    var buf = new Uint8Array([r, g, b, 255]);
    var message = new Messaging.Message(buf);
    message.retained = true;
    message.destinationName = topic;
    mqtt_client.send(message);
};

function send_dmx_data_7ch(topic, value) {
    var r = parseInt(value.substr(1, 2), 16);
    var g = parseInt(value.substr(3, 2), 16);
    var b = parseInt(value.substr(5, 2), 16);
    var buf = new Uint8Array([r, g, b, 0, 0, 0, 255]);
    var message = new Messaging.Message(buf);
    message.retained = true;
    message.destinationName = topic;
    mqtt_client.send(message);
};

function send_dmx_sound_7ch(topic) {
    var buf = new Uint8Array([0, 0, 0, 0, 255, 246, 255]);
    var message = new Messaging.Message(buf);
    message.retained = true;
    message.destinationName = topic;
    mqtt_client.send(message);
}

function send_dmx_fade_7ch(topic, speed) {
    if (speed > 255) { speed = 255; }
    var buf = new Uint8Array([0, 0, 0, 0, speed, 140, 255]);
    var message = new Messaging.Message(buf);
    message.retained = true;
    message.destinationName = topic;
    mqtt_client.send(message);
};
