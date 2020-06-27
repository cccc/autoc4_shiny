/**
 * @copyright Chaos Computer Club Cologne 2014-2020
 * @license MIT
 */
import {AutoC4, AutoC4Module} from '../autoc4.js';

/** @todo button templates */
interface AutoC4LightOptions {
    topicDataAttribute: string;
    onClass: string;
}

class AutoC4Presets implements AutoC4Module {
    private autoc4: AutoC4;
    private options: AutoC4LightOptions;

    public init(autoc4: AutoC4, options: any): this {
        this.autoc4=autoc4;
        $("body").on("click", "[data-preset-topic]", function(e) {
            var $this = $(this);
            autoc4.sendData($this.attr("data-preset-topic"), $this.attr("data-preset-message"));
        });
        return this;
    }

    private create_button(room: string, preset: string): JQuery<HTMLElement> {
        return $("<button>", {
            "type": "button",
            "class": "btn btn-preset",
            "data-preset-topic": room === "global" ? "preset/set" : "preset/" + room + "/set",
            "data-preset-message": preset
        }).text(preset);
    };

    public onMessage(autoc4: AutoC4, message: Paho.MQTT.Message): void {
        let presets: string[];
        try {
            presets = JSON.parse(message.payloadString);
        } catch (e) {
            console.log("Invalid JSON received");
        }

        var room = message.destinationName.split("/")[1];
        if (room === "list") {
            room = "global";
            for(let element of document.querySelectorAll("div.preset-pane[data-room]")){
                let marker = element.querySelector(".preset-pane-global-marker");
                var r = element.getAttribute("data-room");
                for (var pre of presets) {
                    this.create_button(r, pre).insertBefore(marker);
                }
            }
        }

        let marker = document.querySelector("div.preset-pane[data-room=\"" + room + "\"] > .preset-pane-room-marker");
        for (var pre of presets) {
            this.create_button(room, pre).insertBefore(marker);
        }
    }

    onConnect(autoc4: AutoC4, o: Paho.MQTT.WithInvocationContext): void {
        $("div.preset-pane[data-room] > [data-preset-topic]").remove();
    }
    onConnectionFailure(autoc4: AutoC4, error: Paho.MQTT.MQTTError): void {}
}

export default (autoc4: AutoC4) => autoc4.registerModule("presets", () => new AutoC4Presets());
