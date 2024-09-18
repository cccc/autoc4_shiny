import type EventEmitter from "eventemitter3";
import type { AutoC4 } from "../../autoc4";
import { type AtemChangeSourceMessage, getSourceFromMessage } from "./util";

export default function registerOutputButton(
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
					`${topic}/set/aux-source`,
					JSON.stringify({
						index: 0,
						source,
					}),
				);
			});
			eventEmitter.on("aux-output-source", this.onAuxOutputSource, this);
		}

		onDisconnected() {
			eventEmitter.off("aux-output-source", this.onAuxOutputSource, this);
		}

		onAuxOutputSource(message: AtemChangeSourceMessage): void {
			const source = getSourceFromMessage(message, 0);

			const button = this.querySelector("button")!;
			button.classList.toggle(
				"btn-atem-aux-output",
				source === Number.parseInt(this.getAttribute("source")!),
			);
		}
	}
	globalThis.customElements.define("atem-output", AtemSource);
}
