import type EventEmitter from "eventemitter3";
import type { AutoC4 } from "../../autoc4";
import { type AtemChangeSourceMessage, getSourceFromMessage } from "./util";

export default function registerSourceButton(
	autoc4: AutoC4,
	eventEmitter: EventEmitter,
): void {
	class AtemSource extends HTMLElement {
		connectedCallback() {
			const name = this.getAttribute("name");
			const shortName = this.getAttribute("short-name");
			this.innerHTML = `
                <button class="btn btn-secondary btn-atem" title="${name}">
                    ${shortName}
                </button>
            `;

			const topic = this.getAttribute("topic")!;
			const source = this.getAttribute("source")!;

			const button = this.querySelector("button")!;
			button.addEventListener("click", (event) => {
				event.preventDefault();
				autoc4.sendData(
					`${topic}/set/program-input`,
					JSON.stringify({
						index: 0,
						source,
					}),
				);
			});
			button.addEventListener("contextmenu", (event) => {
				event.preventDefault();
				autoc4.sendData(
					`${topic}/set/preview-input`,
					JSON.stringify({
						index: 0,
						source,
					}),
				);
			});
			eventEmitter.on("program-bus-input", this.onProgramBusInput, this);
			eventEmitter.on("preview-bus-input", this.onPreviewBusInput, this);
		}

		onDisconnected() {
			eventEmitter.off("program-bus-input", this.onProgramBusInput, this);
			eventEmitter.off("preview-bus-input", this.onPreviewBusInput, this);
		}

		onProgramBusInput(message: AtemChangeSourceMessage): void {
			const source = getSourceFromMessage(message, 0);
			const button = this.querySelector("button")!;
			button.classList.toggle(
				"btn-atem-program",
				source === Number.parseInt(this.getAttribute("source")!),
			);
		}

		onPreviewBusInput(message: AtemChangeSourceMessage): void {
			const source = getSourceFromMessage(message, 0);
			const button = this.querySelector("button")!;
			button.classList.toggle(
				"btn-atem-preview",
				source === Number.parseInt(this.getAttribute("source")!),
			);
		}
	}
	globalThis.customElements.define("atem-source", AtemSource);
}
