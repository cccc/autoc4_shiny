/**
 * @copyright Chaos Computer Club Cologne 2014-2020
 * @license MIT
 */
import type { AutoC4, AutoC4Module } from "../autoc4";

interface AutoC4StateOptions {
	target: string;
	openClass: string;
	closedClass: string;
	disconnectedClass: string;
}

class Module implements AutoC4Module {
	private options: AutoC4StateOptions;

	constructor(_autoc4: AutoC4, options: any) {
		this.options = options as AutoC4StateOptions;
	}

	public onMessage(_autoc4: AutoC4, message: Paho.MQTT.Message): void {
		const targets = document.querySelectorAll(this.options.target);

		if ((message.payloadBytes as Uint8Array)[0]) {
			for (const e of targets) {
				e.classList.remove(
					this.options.closedClass,
					this.options.disconnectedClass,
				);
				e.classList.add(this.options.openClass);
			}
		} else {
			for (const e of targets) {
				e.classList.remove(
					this.options.openClass,
					this.options.disconnectedClass,
				);
				e.classList.add(this.options.closedClass);
			}
		}
	}

	onConnectionFailure(_autoc4: AutoC4, _error: Paho.MQTT.MQTTError): void {
		for (const e of document.querySelectorAll(this.options.target)) {
			e.classList.remove(this.options.openClass, this.options.closedClass);
			e.classList.add(this.options.disconnectedClass);
		}
	}
}

export default function AutoC4State(
	autoc4: AutoC4,
	options: any,
): AutoC4Module {
	return new Module(autoc4, options);
}
