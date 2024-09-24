import { button, buttonPrimary } from "@/styles/button";
/**
 * @copyright Chaos Computer Club Cologne 2014-2020
 * @license MIT
 */
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { AutoC4, AutoC4Module } from "../autoc4";
import { createHTMLElement } from "../utils";

const styles = css`
	button {
		width: 120px !important;
		height: 120px;
		aspect-ratio: 1/1;
		margin: 0 auto;
		padding: 0;
		padding-top: 10px;
		background-image: url(/img/preset.png);
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
			background-image: url(/img/preset_hover.png);
			color: #ffffff;
			background-color: #604efe;
			border-color: #604efe;
		}
	}
`;

@customElement("preset-button")
class PresetButton extends LitElement {
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

class Module implements AutoC4Module {
	public constructor(autoc4: AutoC4) {
		PresetButton.autoc4 = autoc4;
	}

	private create_button(room: string, preset: string): HTMLElement {
		return createHTMLElement("preset-button", {
			room,
			preset,
		});
	}

	public onMessage(_autoc4: AutoC4, message: Paho.Message): void {
		let presets: string[];
		try {
			presets = JSON.parse(message.payloadString);
		} catch (e) {
			console.log("module/presets: Invalid JSON received");
			return;
		}

		let room = message.destinationName.split("/")[1];
		if (room === "list") {
			room = "global";
			for (const element of document.querySelectorAll(
				"div.preset-pane[data-room]",
			)) {
				const marker = element.querySelector(".preset-pane-global-marker");
				if (!marker) {
					console.warn(
						"module/presets: No global marker found for preset pane",
						element,
					);
					continue;
				}
				const r = element.getAttribute("data-room") as string;
				for (const pre of presets) {
					marker.insertAdjacentElement(
						"beforebegin",
						this.create_button(r, pre),
					);
				}
			}
		}

		const marker = document.querySelector(
			`div.preset-pane[data-room="${room}"] > .preset-pane-room-marker`,
		);
		if (!marker) {
			console.warn(`module/presets: No room marker found for room: ${room}`);
			return;
		}
		for (const pre of presets) {
			marker.insertAdjacentElement(
				"beforebegin",
				this.create_button(room, pre),
			);
		}
	}

	onConnect(_autoc4: AutoC4, _o: Paho.WithInvocationContext): void {
		$("preset-button").remove();
	}
}

export default function AutoC4Presets(autoc4: AutoC4): AutoC4Module {
	return new Module(autoc4);
}
