/**
 * @copyright Chaos Computer Club Cologne 2014-2019
 * @license MIT
 */
/// <reference path="autoc4.ts" />

class AutoC4Cyber implements AutoC4Module {
    private options: AutoC4DMXOptions;
    private autoc4: AutoC4;

    init(autoc4: AutoC4, options: any): this {
        this.options = options as AutoC4DMXOptions;
        this.autoc4 = autoc4;

        return this;
    }

    public onMessage(autoc4: AutoC4, message: Paho.MQTT.Message): void {
        if ((message.payloadBytes as Uint8Array)[0]) {
            document.body.classList.add("cyber");
        } else {
            document.body.classList.remove("cyber");
        }
    }

    onConnect(autoc4: AutoC4, o: Paho.MQTT.WithInvocationContext): void {}
    onConnectionFailure(autoc4: AutoC4, error: Paho.MQTT.MQTTError): void {}
}

AutoC4.registerModule("cyber", () => new AutoC4Cyber());