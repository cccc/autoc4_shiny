import type EventEmitter from "eventemitter3";
import type { AutoC4 } from "../../autoc4";
import AtemButton from "./AtemButton";
import { type AtemChangeSourceMessage, getSourceFromMessage } from "./util";

export default function registerOutputButton(
	autoc4: AutoC4,
	eventEmitter: EventEmitter,
): void {
	class AtemOutput extends AtemButton {
		_onClick() {
			autoc4.sendData(
				`${this.topic}/set/aux-source`,
				JSON.stringify({
					index: 0,
					source: this.source,
				}),
			);
		}
		_onContextMenu() {}

		connectedCallback() {
			super.connectedCallback();
			eventEmitter.on("aux-output-source", this.onAuxOutputSource, this);
		}

		disconnectedCallback() {
			super.disconnectedCallback();
			eventEmitter.off("aux-output-source", this.onAuxOutputSource, this);
		}

		onAuxOutputSource(message: AtemChangeSourceMessage): void {
			const source = getSourceFromMessage(message, 0);
			this.isPrimaryActive = source === this.source;
		}

		static styles = AtemButton.styles;
	}
	globalThis.customElements.define("atem-output", AtemOutput);
}
