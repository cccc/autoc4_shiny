/**
 * @copyright Chaos Computer Club Cologne 2014-2020
 * @license MIT
 */
import {AutoC4, AutoC4Module} from '../autoc4.js';

interface AutoC4StateOptions{
    target: string;
    openClass: string;
    closedClass: string;
    disconnectedClass: string;
}

class AutoC4State implements AutoC4Module {
    private options: AutoC4StateOptions;

    public init(autoc4: AutoC4, options: any): this {
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

export default (autoc4: AutoC4) => autoc4.registerModuleType("state", () => new AutoC4State());
