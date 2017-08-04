// Copyright (c) 2014-2016 Chaos Computer Club Cologne
//
// This file is MIT licensed. Please see the
// LICENSE-MIT file in the source package for more information.
//

/* jshint strict: global */

/* globals
    console, ArrayBuffer, DataView, Uint8Array,
    $, Paho,
    mqtt_client
*/

"use strict";

function init_kitchenlight() {
    $("#klMatrixLines").on('input', function(ev) {
        $("#klMatrixLinesOut").val(parseInt(this.value));
    });
    $("#klConwaySpeed").on('input', function(ev) {
        $("#klConwaySpeedOut").val(parseInt(this.value));
    });
    $("#klConwayGenerations").on('input', function(ev) {
        $("#klConwayGenerationsOut").val(parseInt(this.value));
    });
    $("#klSelect").change(function(ev) {
        $(".klPane.active").removeClass("active");
        $("#" + this.value).addClass("active");
    });
    $("#klSet").click(function(ev) {
        switch ($("#klSelect").val()) {
            case "klEmpty":
                kl_empty();
                break;
            case "klChecker":
                kl_checker(parseInt($("#klCheckerDelay").val()), $("#klCheckerColorA").val(), $("#klCheckerColorB").val());
                break;
            case "klPacman":
                kl_pacman();
                break;
            case "klText":
                kl_text(parseInt($("#klTextDelay").val()), $("#klTextText").val());
                break;
            case "klOpenChaos":
                kl_open_chaos(parseInt($("#klOCDelay").val()));
                break;
            case "klMatrix":
                kl_matrix(parseInt($("#klMatrixLines").val()));
                break;
            case "klMood":
                kl_moodlight(parseInt($("#klMoodMode").val()));
                break;
            case "klSine":
                kl_sine();
                break;
            case "klStrobe":
                kl_strobe();
                break;
            case "klFlood":
                kl_flood();
                break;
            case "klClock":
                kl_clock();
                break;
	    case "klConway":
		kl_conway(parseInt($("#klConwaySpeed").val()), parseInt($("#klConwayGenerations").val()));
		break;
        }
    });
    $(".klPane.active").removeClass("active");
    $("#" + $("#klSelect").val()).addClass("active");
    $(".btn-floodit").click(function(ev) {
        var i = parseInt(this.textContent) - 1;
        var message = new Paho.MQTT.Message(new Uint8Array([i]));
        message.retained = true;
        message.destinationName = "kitchenlight/FloodIt/flood";
        return mqtt_client.send(message);
    });
    $("#klFlood").keypress(function(ev) {
        if (ev.which < 49 || ev.which > 56)
            return;
        $("#klFlood" + (ev.which - 48)).click();
        ev.preventDefault();
    });
}

function kl_change_screen(data) {
    var message = new Paho.MQTT.Message(data);
    message.retained = true;
    message.destinationName = "kitchenlight/change_screen";
    return mqtt_client.send(message);
}

function kl_empty() {
    var data = new ArrayBuffer(4);
    var v = new DataView(data);
    // Empty is screen 0
    v.setUint32(0, 0, true);
    kl_change_screen(data);
}

function kl_checker(delay, colA, colB) {
    var data = new ArrayBuffer(20);
    var v = new DataView(data);
    // Checker is screen 1
    v.setUint32(0, 1, true);
    // Delay
    v.setUint32(4, delay, true);

    // Color A Red
    v.setUint16(8, parseInt(colA.substr(1, 2), 16) * 0x3ff / 0xff, true);
    // Color A Green
    v.setUint16(10, parseInt(colA.substr(3, 2), 16) * 0x3ff / 0xff, true);
    // Color A Blue
    v.setUint16(12, parseInt(colA.substr(5, 2), 16) * 0x3ff / 0xff, true);

    // Color B Red
    v.setUint16(14, parseInt(colB.substr(1, 2), 16) * 0x3ff / 0xff, true);
    // Color B Green
    v.setUint16(16, parseInt(colB.substr(3, 2), 16) * 0x3ff / 0xff, true);
    // Color B Blue
    v.setUint16(18, parseInt(colB.substr(5, 2), 16) * 0x3ff / 0xff, true);

    kl_change_screen(data);
}

function kl_matrix(lines) {
    var data = new ArrayBuffer(8);
    var v = new DataView(data);
    // Matrix is screen 2
    v.setUint32(0, 2, true);
    // Lines
    v.setUint32(4, lines, true);
    kl_change_screen(data);
}

function kl_moodlight(mode) {
    var data, v;
    if (mode === 1) { // colorwheel
        data = new ArrayBuffer(19);
        v = new DataView(data);
        // Moodlight is screen 3
        v.setUint32(0, 3, true);
        // Mode
        v.setUint8(4, mode);
        // Step
        v.setUint32(5, 1, true);
        // Fade Delay
        v.setUint32(9, 10, true);
        // Pause
        v.setUint32(13, 10000, true);
        // Hue Step
        v.setUint16(17, 30, true);
        kl_change_screen(data);
    } else {
        data = new ArrayBuffer(17);
        v = new DataView(data);
        // Moodlight is screen 3
        v.setUint32(0, 3, true);
        // Mode
        v.setUint8(4, mode);
        // Step
        v.setUint32(5, 1, true);
        // Fade Delay
        v.setUint32(9, 10, true);
        // Pause
        v.setUint32(13, 10000, true);
        kl_change_screen(data);
    }
}

function kl_open_chaos(delay) {
    var data = new ArrayBuffer(8);
    var v = new DataView(data);
    // OC is screen 4
    v.setUint32(0, 4, true);
    // Delay
    v.setUint32(4, delay, true);
    kl_change_screen(data);
}

function kl_pacman() {
    var data = new ArrayBuffer(4);
    var v = new DataView(data);
    // Pacman is screen 5
    v.setUint32(0, 5, true);
    kl_change_screen(data);
}

function kl_sine() {
    var data = new ArrayBuffer(4);
    var v = new DataView(data);
    // Sine is screen 6
    v.setUint32(0, 6, true);
    kl_change_screen(data);
}

function kl_strobe() {
    var data = new ArrayBuffer(4);
    var v = new DataView(data);
    // Strobe is screen 7
    v.setUint32(0, 7, true);
    kl_change_screen(data);
}

function kl_text(delay, text) {
    var data = new ArrayBuffer(8 + text.length + 1);
    var v = new DataView(data);
    // Text is screen 8
    v.setUint32(0, 8, true);
    // Delay
    v.setUint32(4, delay, true);
    // Text
    for (var i = 0; i < text.length; i += 1) {
        v.setUint8(8 + i, text.charCodeAt(i) & 0xff);
    }
    v.setUint8(8 + text.length, 0);
    kl_change_screen(data);
}

function kl_flood() {
    var data = new ArrayBuffer(4);
    var v = new DataView(data);
    // FloodIt is screen 9
    v.setUint32(0, 9, true);
    kl_change_screen(data);
}

function kl_clock() {
    var data = new ArrayBuffer(4);
    var v = new DataView(data);
    // Clock is screen 11
    v.setUint32(0, 11, true);
    kl_change_screen(data);
}
function kl_conway(speed, generations) {
    var data = new ArrayBuffer(12);
    var v = new DataView(data);
    // Conway is screen 12
    v.setUint32(0, 12, true);
    // Speed
    v.setUint32(4, speed, true);
    // Generations Count
    v.setUint32(8, generations, true);
    kl_change_screen(data);
}


