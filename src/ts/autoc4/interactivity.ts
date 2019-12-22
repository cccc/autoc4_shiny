/**
 * @copyright Chaos Computer Club Cologne 2014-2019
 * @license MIT
 */
/// <reference path="autoc4.ts" />

interface AutoC4InteractivityConfig{
    mqttTopicDataAttibute: string;
    mqttRetainedDataAttribute: string;
    mqttMessageDataAttribute: string;
    mqttByteMessageDataAttribute: string;
}

class AutoC4Interactivity implements AutoC4Module {
    private autoc4: AutoC4;
    private options: AutoC4InteractivityConfig;

    init(autoc4: AutoC4, options: any): this {
        this.options = options as AutoC4InteractivityConfig;
        this.autoc4 = autoc4;

        const self=this;
        $('body').on("click change input", `[${this.options.mqttTopicDataAttibute}]`, function (this:HTMLElement) {
            if(this.hasAttribute(self.options.mqttMessageDataAttribute)){
                self.autoc4.sendData(
                    this.getAttribute(self.options.mqttTopicDataAttibute),
                    this.getAttribute(self.options.mqttMessageDataAttribute) as string,
                    Boolean(this.getAttribute(self.options.mqttRetainedDataAttribute))
                );
            }else if(this.hasAttribute(self.options.mqttByteMessageDataAttribute)){
                self.autoc4.sendByte(
                    this.getAttribute(self.options.mqttTopicDataAttibute),
                    Number(this.getAttribute(self.options.mqttByteMessageDataAttribute)),
                    Boolean(this.getAttribute(self.options.mqttRetainedDataAttribute))
                );
            }else{
                self.autoc4.sendByte(
                    this.getAttribute(self.options.mqttTopicDataAttibute),
                    0,
                    Boolean(this.getAttribute(self.options.mqttRetainedDataAttribute))
                );
            }
        });
        return this;
    }

    public onMessage(autoc4: AutoC4, message: Paho.MQTT.Message): void {}

    onConnect(autoc4: AutoC4, o: Paho.MQTT.WithInvocationContext): void {}
    onConnectionFailure(autoc4: AutoC4, error: Paho.MQTT.MQTTError): void {}
}

AutoC4.registerModule("interactivity", () => new AutoC4Interactivity());