/**
 * @description A simple module for defining data attributes for elements
 * such that when there is any user interaction with the element an MQTT
 * message is sent.
 * @author Necro
 * @copyright Chaos Computer Club Cologne 2019-2020
 * @license MIT
 */
import {AutoC4, AutoC4Module} from '../autoc4.js';

interface NotificationQueueElement{
    node: Node;
    duration: number;
}

const _notificationQueue: NotificationQueueElement[] = [];
let _currentNotificationTimeout: NodeJS.Timeout = undefined;

const _notificationContainer = document.createElement("div");
_notificationContainer.classList.add("notify-container");

export function setMessage(node: Node) {
    if(document.body.contains(_notificationContainer))
        document.body.removeChild(_notificationContainer);
    
    _notificationContainer.textContent = "";

    if (node) {
        _notificationContainer.appendChild(node);
        document.body.appendChild(_notificationContainer);
    }
}

export function nextMessage(): void {
    const message = _notificationQueue.shift();
    if(message === undefined){
        _currentNotificationTimeout = undefined;
        setMessage(undefined);
    } else {
        _currentNotificationTimeout = setTimeout(nextMessage, message && message.duration);
        setMessage(message && message.node);
    }
}

export function notify(message: string|Node, duration?: number): void {
    if(message instanceof Node){
        _notificationQueue.push(
            {
                node: message,
                duration: duration || 1500
            }
        );
    } else {
        const div = document.createElement("div");
        div.classList.add("notify-message");
        div.appendChild(document.createTextNode(message));
        _notificationQueue.push(
            {
                node: div,
                duration: duration || 1500
            }
        );
    }
    if(_currentNotificationTimeout===undefined)
        nextMessage();
}

interface AutoC4NotifyConfig {
    textTemplate: string;
    payloadStringPlaceholder?: string;
    hideDelayMs?: number;
}

class AutoC4Notify implements AutoC4Module {
    private autoc4: AutoC4;
    private options: AutoC4NotifyConfig;

    init(autoc4: AutoC4, options: any): this {
        this.options = options as AutoC4NotifyConfig;
        this.autoc4 = autoc4;

        return this;
    }

    public onMessage(autoc4: AutoC4, message: Paho.MQTT.Message): void {
        const payload = message.payloadString;

        let textContent = this.options.textTemplate.split(this.options.payloadStringPlaceholder).join("");
        notify(textContent, this.options.hideDelayMs);
    }

    onConnect(autoc4: AutoC4, o: Paho.MQTT.WithInvocationContext): void {}
    onConnectionFailure(autoc4: AutoC4, error: Paho.MQTT.MQTTError): void {}
}

export default (autoc4: AutoC4) => autoc4.registerModuleType("notify", () => new AutoC4Notify());