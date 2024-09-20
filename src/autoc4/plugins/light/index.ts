import EventEmitter from "eventemitter3";
import type { AutoC4, AutoC4Module } from "../../autoc4";
import LightButton from "./LightButton";

class Module extends EventEmitter implements AutoC4Module {
	public constructor(autoc4: AutoC4) {
		super();
		LightButton.autoc4 = autoc4;
		LightButton.eventEmitter = this;
		globalThis.customElements.define("light-button", LightButton);
	}

	public onMessage(_autoc4: AutoC4, message: Paho.Message): void {
		this.emit("lamp-update", {
			topic: message.destinationName,
			isOn: (message.payloadBytes as Uint8Array)[0] !== 0,
		});
	}
}

export default function AutoC4Light(autoc4: AutoC4): AutoC4Module {
	return new Module(autoc4);
}
