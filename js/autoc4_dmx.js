// Copyright (c) 2014-2016 Chaos Computer Club Cologne
//
// This file is MIT licensed. Please see the
// LICENSE file in the source package for more information.
//

"use strict";

(function() {
    var autoc4_dmx = function(options) {
        var autoc4;

        var init = function(_autoc4) {

            $("[" + options.roleDataAttribute + "=light][" + options.roomDataAttribute + "]").change(color_input);
            $("[" + options.roleDataAttribute + "=master][" + options.roomDataAttribute + "]").change(color_input);
            $("[" + options.roleDataAttribute + "=brightness][" + options.roomDataAttribute + "][" + options.valueDataAttribute + "]").click(brightness_input);

            $("[" + options.roleDataAttribute + "=sound][" + options.roomDataAttribute + "][" + options.valueDataAttribute + "]").click(sound_input);
            $("[" + options.roleDataAttribute + "=fade][" + options.roomDataAttribute + "][" + options.valueDataAttribute + "]").click(fade_input);
            $("[" + options.roleDataAttribute + "=random][" + options.roomDataAttribute + "][" + options.valueDataAttribute + "]").click(random_input);
            // $('.btn-fade').click(dmx_fade);
            // $('.btn-rand').click(dmx_rand);
            // $('.btn-sound').click(dmx_sound);

            autoc4 = _autoc4;
        };

        var subscribe = function(mqtt_client) {
            mqtt_client.subscribe('dmx/+/+');
        };

        var on_message = function(message) {
            if (!(message.destinationName.startsWith('dmx/')))
                return;

            var components = message.destinationName.split("/");
            if (components.length < 3)
                return; //if the topic has no room or light specified

            var payloadBytes = message.payloadBytes;
            if (payloadBytes.length < 3) /** @todo change to support one byte channels */
                return; //if the message has less than 3 bytes

            var room = components[1];
            var light = components[2];

            //search for pickers with the right room and light attribute
            var pickers = $("[" + options.roleDataAttribute + "=light][" + options.roomDataAttribute + "=\"" + room + "\"][" + options.lightDataAttribute + "=\"" + light + "\"]");
            if (!pickers.length) return; //stop if none were found

            //set the value of all found pickers to the proper color
            var color = autoc4_dmx.bytes_to_color(payloadBytes);
            for (var picker of pickers) {
                picker.value = color;
            }

            update_room(room);
        };

        var color_input = function(e) {
            var color = this.value;
            var channels = this.getAttribute(options.channelsDataAttribute) || 7;
            var room = this.getAttribute(options.roomDataAttribute);
            var light = this.getAttribute(options.lightDataAttribute);
            if (!light) {
                if (this.getAttribute(options.roleDataAttribute) === "master")
                    light = "master";
                else
                    return;
            }

            change_light(room, light, channels, color);
        }

        var change_light = function(room, light, channels, value) {
            var send_dmx_data;
            var color;
            if (channels == 1) {
                send_dmx_data = send_dmx_data_1ch;
                color = parseInt(value, 10);
            } else if (channels == 3) {
                send_dmx_data = send_dmx_data_3ch;
                color = autoc4_dmx.hexstring_to_rgb(value);
            } else {
                send_dmx_data = send_dmx_data_7ch;
                color = autoc4_dmx.hexstring_to_rgb(value);
            }

            send_dmx_data(room, light, color);
            update_room(room);
        };

        var brightness_input = function(e) {
            var value = Number(this.getAttribute(options.valueDataAttribute));
            var room = this.getAttribute(options.roomDataAttribute);

            for (var picker of get_light_pickers_for_room(room)) {
                var channels = picker.getAttribute(options.channelsDataAttribute) || 7;
                var light = picker.getAttribute(options.lightDataAttribute);
                var original_rgb = autoc4_dmx.hexstring_to_rgb(picker.value);
                var hsl = autoc4_dmx.rgb_to_hsl(original_rgb);
                hsl.l = Math.min(1, hsl.l * value);
                var new_rgb = autoc4_dmx.hsl_to_rgb(hsl);
                if (new_rgb.r == original_rgb.r && new_rgb.g == original_rgb.g && new_rgb.b == original_rgb.b) {
                    if (value > 1) {
                        if (new_rgb.r != 255)
                            new_rgb.r++;
                        if (new_rgb.g != 255)
                            new_rgb.g++;
                        if (new_rgb.b != 255)
                            new_rgb.b++;
                    } else if (value < 1) {
                        if (new_rgb.r != 0)
                            new_rgb.r--;
                        if (new_rgb.g != 0)
                            new_rgb.g--;
                        if (new_rgb.b != 0)
                            new_rgb.b--;
                    }
                }
                change_light(room, light, channels, autoc4_dmx.rgb_to_hexstring(new_rgb));
            }
        };

        var sound_input = function(e) {
            var room = $(this.getAttribute(options.roomDataAttribute)).val();
            var sensitivity = $(this.getAttribute(options.valueDataAttribute)).val();

            for (var picker of get_light_pickers_for_room(room)) {
                var channels = picker.getAttribute(options.channelsDataAttribute) || 7;
                if (channels != 7)
                    continue;
                var light = picker.getAttribute(options.lightDataAttribute);
                send_dmx_sound_7ch(room, light, sensitivity);
            }
        };

        var fade_input = function(e) {
            var room = $(this.getAttribute(options.roomDataAttribute)).val();
            var speed = $(this.getAttribute(options.valueDataAttribute)).val();

            for (var picker of get_light_pickers_for_room(room)) {
                var channels = picker.getAttribute(options.channelsDataAttribute) || 7;
                if (channels != 7)
                    continue;
                var light = picker.getAttribute(options.lightDataAttribute);
                send_dmx_fade_7ch(room, light, speed);
            }
        };

        var random_input = function(e) {
            var room = $(this.getAttribute(options.roomDataAttribute)).val();
            var brightness = $(this.getAttribute(options.valueDataAttribute)).val();

            for (var picker of get_light_pickers_for_room(room)) {
                var light = picker.getAttribute(options.lightDataAttribute);
                var channels = picker.getAttribute(options.channelsDataAttribute) || 7;
                send_dmx_random(room, light, channels, brightness);
            }
        };

        /**
         * Updates a room's masters' color
         * @param {string} room room to update masters for
         */
        var update_room = function(room) {
            var value;

            //check if all light's colors are equal
            for (var picker of $("[" + options.roomDataAttribute + "=\"" + room + "\"][" + options.lightDataAttribute + "]")) {
                if (value === undefined) {
                    //first value for comparison
                    value = picker.value;
                } else if (value != picker.value) {
                    //terminate if another color was found
                    return;
                }
            }
            //set masters' color
            for (var picker of $("[" + options.roomDataAttribute + "=\"" + room + "\"][" + options.roleDataAttribute + "=master]")) {
                picker.value = value;
            }
        };

        // var dmx_fade=function(e) {
        //     /* jshint validthis: true */
        //     var dmx = $(this);
        //     var topic = dmx.data("topic");
        //     var speed = parseInt(dmx.siblings(".dmxspeed").val());
        //     for (var light in pickers[topic]) {
        //         if (light == "master") { continue; }
        //         send_dmx_fade_7ch("dmx/" + topic + "/" + light, speed);
        //     }
        // };

        // publish dmx single channel(brightness)
        var send_dmx_data_1ch = function(room, light, value) {
            var buf = new Uint8Array([value]);
            var message = new Paho.MQTT.Message(buf);
            message.retained = true;
            message.destinationName = "dmx/" + room + "/" + light;
            autoc4.mqtt_client.send(message);
        };

        // publish dmx rgb color + enable byte for a dmx room container
        var send_dmx_data_3ch = function(room, light, rgb) {
            var buf = new Uint8Array([rgb.r, rgb.g, rgb.b, 255]);
            var message = new Paho.MQTT.Message(buf);
            message.retained = true;
            message.destinationName = "dmx/" + room + "/" + light;
            autoc4.mqtt_client.send(message);
        };

        var send_dmx_data_7ch = function(room, light, rgb) {
            var buf = new Uint8Array([rgb.r, rgb.g, rgb.b, 0, 0, 0, 255]);
            var message = new Paho.MQTT.Message(buf);
            message.retained = true;
            message.destinationName = "dmx/" + room + "/" + light;
            autoc4.mqtt_client.send(message);
        };

        var send_dmx_sound_7ch = function(room, light, sensitivity) {
            var buf = new Uint8Array([0, 0, 0, 0, 255, sensitivity, 255]);
            var message = new Paho.MQTT.Message(buf);
            message.retained = true;
            message.destinationName = "dmx/" + room + "/" + light;
            autoc4.mqtt_client.send(message);
        };

        var send_dmx_fade_7ch = function(room, light, speed) {
            var buf = new Uint8Array([0, 0, 0, 0, speed, 140, 255]);
            var message = new Paho.MQTT.Message(buf);
            message.retained = true;
            message.destinationName = "dmx/" + room + "/" + light;
            autoc4.mqtt_client.send(message);
        };

        var send_dmx_random = function(room, light, channels, brightness) {
            var color = {
                h: Math.random(),
                s: 1,
                l: brightness
            };
            if (channels == 3)
                send_dmx_data_3ch(room, light, autoc4_dmx.hsl_to_rgb(color));
            else if (channels == 7)
                send_dmx_data_7ch(room, light, autoc4_dmx.hsl_to_rgb(color));
        };

        var get_light_pickers_for_room = function(room) {
            return $("[" + options.roleDataAttribute + "=light][" + options.roomDataAttribute + "=\"" + room + "\"][" + options.lightDataAttribute + "]");
        }

        return {
            init: init,
            subscribe: subscribe,
            on_message: on_message
        };
    };

    autoc4_dmx.hsl_to_rgb = function(hsl) {
        var r, g, b, h = hsl.h,
            s = hsl.s,
            l = hsl.l;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            var hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    };

    autoc4_dmx.rgb_to_hsl = function(rgb) {
        var r = rgb.r / 255,
            g = rgb.g / 255,
            b = rgb.b / 255;
        var max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return {
            h: h,
            s: s,
            l: l
        };
    };

    autoc4_dmx.hexstring_to_rgb = function(value) {
        return {
            r: parseInt(value.substr(1, 2), 16),
            g: parseInt(value.substr(3, 2), 16),
            b: parseInt(value.substr(5, 2), 16)
        };
    };

    autoc4_dmx.rgb_to_hexstring = function(rgb) {
        return "#" + dec2hex(rgb.r) + dec2hex(rgb.g) + dec2hex(rgb.b);
    };

    autoc4_dmx.bytes_to_color = function(bytes) {
        return "#" + dec2hex(bytes[0]) + dec2hex(bytes[1]) + dec2hex(bytes[2]);
    }

    AutoC4.register_module("dmx", autoc4_dmx);
})(AutoC4);