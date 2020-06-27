/**
 * @copyright Chaos Computer Club Cologne 2014-2020
 * @license MIT
 */
import {AutoC4, AutoC4Module} from '../autoc4.js';

class AutoC4Windows implements AutoC4Module {
    private autoc4: AutoC4;

    public init(autoc4: AutoC4, options: any): this {
        this.autoc4=autoc4;
        return this;
    }

    public onMessage(autoc4: AutoC4, message: Paho.MQTT.Message): void {
        // update .box-window state
        let button = $('.box-window').filter('[data-topic="' + message.destinationName + '"]');
        if (button && (message.payloadBytes as Uint8Array)[0] !== 0)
            button.addClass('open');
        else
            button.removeClass('open');
    }

    onConnect(autoc4: AutoC4, o: Paho.MQTT.WithInvocationContext): void {}
    onConnectionFailure(autoc4: AutoC4, error: Paho.MQTT.MQTTError): void {}
}

export default (autoc4: AutoC4) => autoc4.registerModule("windows", () => new AutoC4Windows());
