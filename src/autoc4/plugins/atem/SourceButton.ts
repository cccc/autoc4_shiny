import type EventEmitter from "eventemitter3";
import type { AutoC4 } from "../../autoc4";
import { type AtemChangeSourceMessage, getSourceFromMessage } from "./util";

import AtemButton from "./AtemButton";

export default function registerSourceButton(
	autoc4: AutoC4,
	eventEmitter: EventEmitter,
): void {
	class AtemSource extends AtemButton {
		_onClick() {
			autoc4.sendData(
				`${this.topic}/set/program-input`,
				JSON.stringify({
					index: 0,
					source: this.source,
				}),
			);
		}

		_onContextMenu() {
			autoc4.sendData(
				`${this.topic}/set/preview-input`,
				JSON.stringify({
					index: 0,
					source: this.source,
				}),
			);
		}

		connectedCallback() {
			super.connectedCallback();
			eventEmitter.on("program-bus-input", this.onProgramBusInput, this);
			eventEmitter.on("preview-bus-input", this.onPreviewBusInput, this);
		}

		disconnectedCallback() {
			super.disconnectedCallback();
			eventEmitter.off("program-bus-input", this.onProgramBusInput, this);
			eventEmitter.off("preview-bus-input", this.onPreviewBusInput, this);
		}

		onProgramBusInput(message: AtemChangeSourceMessage): void {
			const source = getSourceFromMessage(message, 0);
			this.isPrimaryActive = source === this.source;
		}

		onPreviewBusInput(message: AtemChangeSourceMessage): void {
			const source = getSourceFromMessage(message, 0);
			this.isSecondaryActive = source === this.source;
		}

		static styles = AtemButton.styles;
	}
	globalThis.customElements.define("atem-source", AtemSource);
}
