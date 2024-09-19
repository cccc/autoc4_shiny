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

		static styles = css`
			button {
				display: inline-block;
				padding: 0.25rem 0.5rem;
				font-family: var(--bs-btn-font-family);
				font-size: 0.875rem;
				font-weight: 400;
				line-height: 1.5;
				color: #fff;
				text-align: center;
				text-decoration: none;
				vertical-align: middle;
				cursor: pointer;
				user-select: none;
				border: var(--bs-border-width) solid #0d6efd;
				border-radius: var(--bs-border-radius);
				background-color: #0d6efd;
				transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

				&:active {
					background-color: #0b5ed7;
					border-color: #0a53be;
					outline: 0;
					box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
				}

				&:hover, &:focus-visible {
					background-color: #0b5ed7;
					border-color: #0a58ca;
				}

				&:focus-visible {
					outline: 0;
					box-shadow: 0 0 0 0.25rem rgba(49, 132, 253, .5);
				}

				&:disabled {
					opacity: 0.65;
				}
			}
		`;
	}
	customElements.define("brightness-button", BrightnessButton);
}
