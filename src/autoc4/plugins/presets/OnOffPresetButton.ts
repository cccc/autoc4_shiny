import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { AutoC4 } from "@/autoc4/autoc4";
import { button, buttonPrimary } from "@/styles/button";
import { styles } from "./PresetButton";

@customElement("onoff-preset-button")
export default class OnOffPresetButton extends LitElement {
	@property({ attribute: "topic" })
	topic = "";

	render() {
		return html`
			<button @click=${this._onClick}>
				<slot />
			</button>
		`;
	}

	_onClick() {
		OnOffPresetButton.autoc4.sendData(this.topic, "", false);
	}

	static styles = [button, buttonPrimary, styles];

	static autoc4: AutoC4;
}
