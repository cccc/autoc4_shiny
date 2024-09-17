/**
 * @description A simple module for defining data attributes for elements
 * such that when there is any user interaction with the element an MQTT
 * message is sent.
 * @author Qb
 * @copyright Chaos Computer Club Cologne 2019-2020
 * @license MIT
 */
import type { AutoC4, AutoC4Module } from "../autoc4";

// @ts-ignore: Weak type here because it doesn't implement any methods of AutoC4Module
class Module implements AutoC4Module {
	constructor(autoc4: AutoC4) {
		$(document.body).on(
			"click change input",
			"[data-mqtt-topic]",
			function (this: HTMLElement, event) {
				event.preventDefault();

				const mqttTopic = this.getAttribute("data-mqtt-topic");
				if (!mqttTopic) return;

				const mqttRetained = this.hasAttribute("data-mqtt-retained");

				if (this.hasAttribute("data-mqtt-message")) {
					autoc4.sendData(
						mqttTopic,
						this.getAttribute("data-mqtt-message")!,
						mqttRetained,
					);
				} else if (this.hasAttribute("data-mqtt-message-byte")) {
					autoc4.sendByte(
						mqttTopic,
						Number(this.getAttribute("data-mqtt-message-byte")),
						mqttRetained,
					);
				} else {
					autoc4.sendByte(mqttTopic, 0, mqttRetained);
				}
			},
		);
		$(document.body).on(
			"submit",
			"[data-mqtt-form]",
			function (this: HTMLFormElement, event) {
				event.preventDefault();
				const formData = new FormData(this);
				const mqttRetained = this.hasAttribute("data-mqtt-retained");
				for (const [key, value] of formData.entries()) {
					autoc4.sendData(key, value.toString(), mqttRetained);
				}
			},
		);
	}
	onMessage(_autoc4: AutoC4, message: Paho.MQTT.Message): void {
		console.log(
			"Got value message:",
			message.destinationName,
			message.payloadString,
		);
		$(`[data-mqtt-value="${message.destinationName}"]`).val(
			message.payloadString,
		);
	}
}

export default function AutoC4Interactivity(autoc4: AutoC4): AutoC4Module {
	// @ts-ignore: Weak type here because it doesn't implement any methods of AutoC4Module
	return new Module(autoc4);
}
