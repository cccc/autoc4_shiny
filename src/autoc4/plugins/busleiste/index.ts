import EventEmitter from "eventemitter3";
import type { AutoC4, AutoC4Module } from "../../autoc4";
import BusleisteControl from "./BusleisteControl";

class Module extends EventEmitter implements AutoC4Module {
	public constructor(autoc4: AutoC4) {
		super();
		BusleisteControl.autoc4 = autoc4;
		BusleisteControl.eventEmitter = this;
		globalThis.customElements.define("busleiste-control", BusleisteControl);
	}

	public onMessage(_autoc4: AutoC4, message: Paho.Message): void {
		const topic = message.destinationName;

		if (topic === "busleiste/modules") {
			this.emit(
				"busleiste-modules",
				JSON.parse(message.payloadString),
			);
			return;
		}

		if (/^busleiste\/modules\/[^/]+\/enabled$/.test(topic)) {
			this.emit("busleiste-enabled", {
				name: topic.split("/")[2],
				enabled: (message.payloadBytes as Uint8Array)[0] !== 0,
			});
			return;
		}

		if (topic === "busleiste/active_module") {
			this.emit("busleiste-active-module", message.payloadString);
			return;
		}

		if (topic === "busleiste/active_interrupt") {
			this.emit(
				"busleiste-active-interrupt",
				message.payloadString === ""
					? undefined
					: message.payloadString,
			);
		}
	}
}

export default function AutoC4Busleiste(autoc4: AutoC4): AutoC4Module {
	return new Module(autoc4);
}
