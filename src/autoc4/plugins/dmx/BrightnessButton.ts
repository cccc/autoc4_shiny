import { button, buttonPrimary, buttonSmall } from "@/styles/button";
import { LitElement, css, html } from "lit";
import { property } from "lit/decorators.js";
import type LampManager from "./LampManager";

/*
 */

export default function registerBrightnessButton(
	lampManager: LampManager,
): void {
	class BrightnessButton extends LitElement {
		@property({ attribute: "room" })
		room = "";
		@property({ attribute: "value", type: Number })
		value = 1;

		render() {
			return html`
                <button @click=${this._onClick}>
					<slot />
				</button>
			`;
		}

		private _onClick() {
			for (const lamp of lampManager.getRoom(this.room)) {
				lamp.brightness(this.value);
			}
		}

		static styles = [button, buttonPrimary, buttonSmall];
	}
	customElements.define("brightness-button", BrightnessButton);
}
