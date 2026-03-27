import EventEmitter from "eventemitter3";
import type { AutoC4, AutoC4Module } from "../../autoc4";
import AtenMatrixControl from "./AtenMatrixControl";

class Module extends EventEmitter implements AutoC4Module {
	public constructor(autoc4: AutoC4) {
		super();
		AtenMatrixControl.autoc4 = autoc4;
		AtenMatrixControl.eventEmitter = this;
		globalThis.customElements.define("aten-matrix", AtenMatrixControl);
	}

	public onMessage(_autoc4: AutoC4, message: Paho.Message): void {
		const topic = message.destinationName;
		const parts = topic.split("/");
		// Expected: aten/{location}/connection or aten/{location}/state
		if (parts.length < 3) return;
		const baseTopic = `${parts[0]}/${parts[1]}`;
		const subtopic = parts[2];

		if (subtopic === "connection") {
			if ((message.payloadBytes as Uint8Array).length !== 1) return;
			this.emit("aten-connection", {
				topic: baseTopic,
				online: (message.payloadBytes as Uint8Array)[0] !== 0,
			});
			return;
		}

		if (subtopic === "state") {
			this.emit("aten-state", {
				topic: baseTopic,
				state: JSON.parse(message.payloadString),
			});
		}
	}
}

export default function AutoC4Aten(autoc4: AutoC4): AutoC4Module {
	return new Module(autoc4);
}
