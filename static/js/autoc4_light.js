function init_light() {
    $(".btn-light").click(function (e) {
        var light = $(this);
        switch_light(light.data("topic"), !light.hasClass("on"));
    });
}

function mqtt_subscribe_light() {
    mqtt_client.subscribe('licht/+/+');
}

function mqtt_on_light_message(message) {
    // update .btn-light state
    var button = $('.btn-light').filter('[data-topic="' + message.destinationName + '"]');
    if (button && message.payloadBytes[0] != 0)
        button.addClass('on');
    else
        button.removeClass('on');
}

// publish (on ? 0x01 : 0x00) message to a topic
function switch_light(topic, on) {
    var buf = new Uint8Array([on ? 1 : 0]);
    var message = new Messaging.Message(buf);
    message.retained = true;
    message.destinationName = topic;
    mqtt_client.send(message);
}

