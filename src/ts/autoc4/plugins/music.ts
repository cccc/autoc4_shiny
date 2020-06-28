/**
 * @description A simple module to add support for MPD bridge states
 * @author Necro
 * @copyright Chaos Computer Club Cologne 2014-2020
 * @license MIT
 */
import {AutoC4, AutoC4Module} from '../autoc4.js';

interface AutoC4MusicOptions {
    roleDataAttribute: string;
    topicDataAttribute: string;
    playingClass: string;
    pausedClass: string;
    stoppedClass: string;
}

class AutoC4Music implements AutoC4Module {
    private autoc4: AutoC4;
    private options: AutoC4MusicOptions;

    public init(autoc4: AutoC4, options: any): this {
        this.autoc4=autoc4;
        this.options=options;

        return this;
    }

    public onMessage(autoc4: AutoC4, message: Paho.MQTT.Message): void {
        let elements = document.querySelectorAll<HTMLElement>(`[${this.options.roleDataAttribute}=state][${this.options.topicDataAttribute}="${message.destinationName}"]`);
        for(let e of elements){
            if(message.payloadString==="play"){
                e.classList.add(this.options.playingClass);
                e.classList.remove(this.options.pausedClass, this.options.stoppedClass);
            }else if(message.payloadString==="pause"){
                e.classList.add(this.options.pausedClass);
                e.classList.remove(this.options.playingClass, this.options.stoppedClass);
            }else if(message.payloadString==="stop"){
                e.classList.add(this.options.stoppedClass);
                e.classList.remove(this.options.playingClass, this.options.pausedClass);
            }
        }
        elements = document.querySelectorAll<HTMLElement>(`[${this.options.roleDataAttribute}=song][${this.options.topicDataAttribute}="${message.destinationName}"]`);
        for(let e of elements){
            e.innerText=message.payloadString;
        }
    }

    onConnect(autoc4: AutoC4, o: Paho.MQTT.WithInvocationContext): void {}
    onConnectionFailure(autoc4: AutoC4, error: Paho.MQTT.MQTTError): void {}
}

export default (autoc4: AutoC4) => autoc4.registerModuleType("music", () => new AutoC4Music());