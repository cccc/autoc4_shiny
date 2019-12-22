/**
 * @copyright Chaos Computer Club Cologne 2014-2019
 * @license MIT
 */
/// <reference path="autoc4.ts" />

interface AutoC4StateOptions{
    target: string;
    openClass: string;
    closedClass: string;
    disconnectedClass: string;
}

class AutoC4State implements AutoC4Module {
    private autoc4: AutoC4;
    private options: AutoC4StateOptions;

    public init(autoc4: AutoC4, options: any): this {
        this.autoc4=autoc4;
        this.options=options as AutoC4StateOptions;
        return this;
    }

    public onMessage(autoc4: AutoC4, message: Paho.MQTT.Message): void {
        let targets = document.querySelectorAll(this.options.target);

        if ((message.payloadBytes as Uint8Array)[0]) {
            targets.forEach((e)=>{
                e.classList.remove(this.options.closedClass,this.options.disconnectedClass);
                e.classList.add(this.options.openClass);
            });
        } else {
            targets.forEach((e)=>{
                e.classList.remove(this.options.openClass,this.options.disconnectedClass);
                e.classList.add(this.options.closedClass);
            });
        }
    }

    onConnect(autoc4: AutoC4, o: Paho.MQTT.WithInvocationContext): void {}
    onConnectionFailure(autoc4: AutoC4, error: Paho.MQTT.MQTTError): void {
        document.querySelectorAll(this.options.target).forEach((e)=>{
            e.classList.remove(this.options.openClass,this.options.closedClass);
            e.classList.add(this.options.disconnectedClass);
        });
    }
}

AutoC4.registerModule("state", () => new AutoC4State());
