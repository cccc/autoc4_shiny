import { html } from "lit";
import { state } from "lit/decorators.js";
import type { AutoC4 } from "../../autoc4";
import Color from "../../color";
import type LampManager from "./LampManager";
import { RGBInputLamp } from "./RGBInput";

export function registerRGBW(autoc4: AutoC4, lampManager: LampManager): void {
	class LampElement extends RGBInputLamp {
		@state()
		white = 0;

		connectedCallback(): void {
			super.connectedCallback();
			lampManager.addLamp(this.room, this);
		}

		disconnectedCallback(): void {
			super.disconnectedCallback();
			lampManager.removeLamp(this.room, this);
		}

		receiveMessage(message: Paho.Message): void {
			const payloadBytes = message.payloadBytes as Uint8Array;
			if (payloadBytes.length < 3) return;
			this.color = Color.fromRGB({
				r: payloadBytes[0],
				g: payloadBytes[1],
				b: payloadBytes[2],
			});
			if (payloadBytes.length < 4) this.white = 0;
			else this.white = payloadBytes[3];
		}

		poweroff(): void {
			autoc4.sendData(this.topic, new Uint8Array([0, 0, 0, 0]), true);
		}

		render() {
			const original = super.render();
			return html`
				${original}
				<input @input=${this._onWhiteInput} .value=${this.white} type="range" min="0" max="255" step="1" value="0" />
			`;
		}

		_onWhiteInput(event: Event) {
			const value = (event.target as HTMLInputElement).value;
			this.white = Number.parseInt(value);
			this.sendWhite(this.white);
		}

		sendColor(color: Color): void {
			autoc4.sendData(
				this.topic,
				new Uint8Array([color.r, color.g, color.b, this.white]),
				true,
			);
		}

		sendWhite(white: number): void {
			autoc4.sendData(
				this.topic,
				new Uint8Array([this.color.r, this.color.g, this.color.b, white]),
				true,
			);
		}
	}
	globalThis.customElements.define("rgbw-lamp", LampElement);
}
