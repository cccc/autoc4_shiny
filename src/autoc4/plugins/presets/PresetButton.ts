import type { AutoC4 } from "@/autoc4/autoc4";
import { button, buttonPrimary } from "@/styles/button";
import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";

import preset from "./preset.png";
import preset_hover from "./preset_hover.png";

export const styles = css`
	button {
		width: 120px !important;
		height: 120px;
		aspect-ratio: 1/1;
		margin: 0 auto;
		padding: 0;
		padding-top: 10px;
		background-image: url(${unsafeCSS(preset)});
		background-position: center top;
		background-size: 50% auto;
		background-repeat: no-repeat;
		background-origin: content-box;
		line-height: 180px;
		color: #ffffff;
		background-color: #2612ca;
		border-color: #2612ca;
		margin: 2px;
		margin-top: 4px;
		
		&:hover,
		&:focus,
		&:active {
			background-image: url(${unsafeCSS(preset_hover)});
			color: #ffffff;
			background-color: #604efe;
			border-color: #604efe;
		}
	}
`;

@customElement("preset-button")
export default class PresetButton extends LitElement {
	@property({ attribute: "room" })
	room = "";
	@property({ attribute: "preset" })
	preset = "";

	render() {
		return html`
			<button @click=${this._onClick}>
				${this.preset}
			</button>
		`;
	}

	_onClick() {
		PresetButton.autoc4.sendData(
			this.room === "global" ? "preset/set" : `preset/${this.room}/set`,
			this.preset,
		);
	}

	static styles = [button, buttonPrimary, styles];

	static autoc4: AutoC4;
}
