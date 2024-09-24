import type { AutoC4, AutoC4Module } from "../../autoc4";
import { createHTMLElement } from "../../utils";
import OnOffPresetButton from "./OnOffPresetButton";
import PresetButton from "./PresetButton";

class Module implements AutoC4Module {
	public constructor(autoc4: AutoC4) {
		PresetButton.autoc4 = autoc4;
		OnOffPresetButton.autoc4 = autoc4;
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
