/**
 * @description A module to provide simple toggle buttons for topics
 * @copyright Chaos Computer Club Cologne 2014-2020
 * @license MIT
 */
import {AutoC4, AutoC4Module} from '../autoc4.js';

interface AutoC4LightOptions {
    topicDataAttribute: string;
    onClass: string;
}

class AutoC4Light implements AutoC4Module {
    private autoc4: AutoC4;
    private options: AutoC4LightOptions;

    public init(autoc4: AutoC4, options: any): this {
        this.autoc4=autoc4;
        this.options=options;

        this.initLightButtons();

        return this;
    }

    public initLightButtons(){
        const self=this;
        $("body").on("click",`[${this.options.topicDataAttribute}]`,function (this:HTMLElement) {
            self.autoc4.sendByte(
                this.getAttribute(self.options.topicDataAttribute),
                this.classList.contains(self.options.onClass)?0:1,
                true
            );
        });
    }

    public onMessage(autoc4: AutoC4, message: Paho.MQTT.Message): void {
        // update .btn-light state
        var button = $(`[${this.options.topicDataAttribute}="${message.destinationName}"]`);
        if (button && (message.payloadBytes as Uint8Array)[0] !== 0)
            button.addClass(this.options.onClass);
        else
            button.removeClass(this.options.onClass);
    }

    onConnect(autoc4: AutoC4, o: Paho.MQTT.WithInvocationContext): void {}
    onConnectionFailure(autoc4: AutoC4, error: Paho.MQTT.MQTTError): void {}
}

export default (autoc4: AutoC4) => autoc4.registerModule("light", () => new AutoC4Light());
