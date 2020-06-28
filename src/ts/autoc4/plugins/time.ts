/**
 * @copyright Chaos Computer Club Cologne 2014-2020
 * @license MIT
 */
import {AutoC4, AutoC4Module} from '../autoc4.js';
import { simpleDateFormat } from '../utils.js';

interface AutoC4TimeOptions{
    targetSelector: string;
    templateDataAttribute: string;
}

class AutoC4Time implements AutoC4Module {
    private autoc4: AutoC4;
    private options: AutoC4TimeOptions;

    public init(autoc4: AutoC4, options: any): this {
        this.autoc4=autoc4;
        this.options=options as AutoC4TimeOptions;
        return this;
    }

    public onMessage(autoc4: AutoC4, message: Paho.MQTT.Message): void {
        if(message.payloadBytes.byteLength < 7) {
            console.warn(`Received invalid time payload on topic "${message.destinationName}".`);
            return;
        }

        const targets = document.querySelectorAll(this.options.targetSelector);
        if(targets.length === 0)
            return;

        const bytes = message.payloadBytes as Uint8Array;
        const now = new Date();
        //f*cking hell this incoming data format is broken
        const date = new Date(
            (now.getFullYear() - now.getFullYear()%100) + bytes[7], //year
            bytes[5]-1, //month
            bytes[6], //day
            bytes[0], //hour
            bytes[1], //minute
            bytes[2] //second
        );

        for (const target of targets){
            target.textContent = simpleDateFormat(target.getAttribute(this.options.templateDataAttribute)||"yyyy-MM-ddZhh-mm-ss", date);
        }
    }

    onConnect(autoc4: AutoC4, o: Paho.MQTT.WithInvocationContext): void {}
    onConnectionFailure(autoc4: AutoC4, error: Paho.MQTT.MQTTError): void {}
}

export default (autoc4: AutoC4) => autoc4.registerModuleType("time", () => new AutoC4Time());