/**
 * @description A joke module which activates the cyber mode when
 * a certain key sequence is pressed or a certain topic gets activated.
 * This is primarily intended to react to the Konami Code and the cyber
 * alert topic but can in theory add any class to any element upon
 * activation of any topic. 
 * @author Necro
 * @copyright Chaos Computer Club Cologne 2019-2020
 * @license MIT
 */
import {AutoC4, AutoC4Module} from '../autoc4.js';

interface AutoC4CyberOptions {
    class:string;
    target:string;
    keys:number[];
}

class AutoC4Cyber implements AutoC4Module {
    private autoc4: AutoC4;
    private options: AutoC4CyberOptions;

    init(autoc4: AutoC4, options: any): this {
        this.options = options as AutoC4CyberOptions;
        this.autoc4 = autoc4;
        if(this.options.keys){
            let cursor = 0;
            document.addEventListener("keydown", (e) => {
                cursor = (e.keyCode == this.options.keys[cursor]) ? cursor + 1 : 0;
                if (cursor == this.options.keys.length){
                    document.querySelectorAll<HTMLElement>(this.options.target)
                        .forEach((e)=>e.classList.toggle(this.options.class));
                    cursor=0;
                }
            });
        }
        return this;
    }

    public onMessage(autoc4: AutoC4, message: Paho.MQTT.Message): void {
        if ((message.payloadBytes as Uint8Array)[0]) {
            document.querySelectorAll<HTMLElement>(this.options.target)
                .forEach((e)=>e.classList.add(this.options.class));
        } else {
            document.querySelectorAll<HTMLElement>(this.options.target)
                .forEach((e)=>e.classList.remove(this.options.class));
        }
    }

    onConnect(autoc4: AutoC4, o: Paho.MQTT.WithInvocationContext): void {}
    onConnectionFailure(autoc4: AutoC4, error: Paho.MQTT.MQTTError): void {}
}

export default (autoc4: AutoC4) => autoc4.registerModuleType("cyber", () => new AutoC4Cyber());