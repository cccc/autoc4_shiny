import EventEmitter from "eventemitter3";
import type { AutoC4, AutoC4Module } from "../../autoc4";
import LightButton from "./LightButton";
import TasmotaButton from "./TasmotaButton";

class Module extends EventEmitter implements AutoC4Module {
	public constructor(autoc4: AutoC4) {
		super();
		LightButton.autoc4 = autoc4;
		LightButton.eventEmitter = this;
		globalThis.customElements.define("light-button", LightButton);
		globalThis.customElements.define("tasmota-button", TasmotaButton);
	}

	public onMessage(_autoc4: AutoC4, message: Paho.Message): void {
		if (message.destinationName.startsWith("tasmota/") && message.destinationName.endsWith("/POWER")) {
			const topic = message.destinationName.substring(0, message.destinationName.length - 6);
			this.emit("lamp-update", {
				topic: topic,
				isOn: message.payloadString === "ON",
			});
			return;
		}

		this.emit("lamp-update", {
			topic: message.destinationName,
			isOn: (message.payloadBytes as Uint8Array)[0] !== 0,
		});
	}
}

export default function AutoC4Light(autoc4: AutoC4): AutoC4Module {
	return new Module(autoc4);
}
