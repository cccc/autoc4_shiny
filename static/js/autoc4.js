var mqtt_client;

function init_mqtt() {
    mqtt_client = new Messaging.Client(location.hostname, 9000, mqtt_generate_clientid());
    mqtt_client.onMessageArrived = mqtt_on_message;
    mqtt_client.onConnectionLost = mqtt_on_connect_failure;
    mqtt_client.connect({onSuccess: mqtt_on_connect, onFailure: mqtt_on_connect_failure});
}

// generate a random mqtt clientid
function mqtt_generate_clientid() {
    return 'c4sw_yxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0;
        var v = (c == 'x') ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

function mqtt_on_connect() {
    console.log('onConnect');
    // Once a connection has been made, make subscriptions.
    mqtt_subscribe_light();
}

function mqtt_on_connect_failure() {
    console.log('mqtt connect failed, retrying in 5 sec');
    setTimeout(init_mqtt, 5000);
}

function mqtt_on_message(message) {
    if (message.destinationName.startsWith('licht/')) {
        mqtt_on_light_message(message);
    }
}

$(function() {
    Raphael.colorwheel($("#dmxcolorplenar") ,250).color("#F00");
    Raphael.colorwheel($("#dmxcolorwohnzimmer") ,250).color("#F00");
    Raphael.colorwheel($("#dmxcolorfnordcenter") ,250).color("#F00");

    $(".btn-light").click(function (e) {
        var light = $(this);
        switch_light(light.data("topic"), !light.hasClass("on"));
    });

    init_mqtt();
});
