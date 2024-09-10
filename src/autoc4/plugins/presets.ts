/**
 * @copyright Chaos Computer Club Cologne 2014-2020
 * @license MIT
 */
import type { AutoC4, AutoC4Module } from "../autoc4";
import { createHTMLElement } from "../utils";

/** @todo button templates */
interface AutoC4PresetOptions {
	topicDataAttribute: string;
	onClass: string;
}

class Module implements AutoC4Module {
	public constructor(_autoc4: AutoC4, _options: AutoC4PresetOptions) {}

	private create_button(room: string, preset: string): HTMLElement {
		return createHTMLElement(
			"button",
			{
				type: "button",
				className: "btn btn-preset",
				"data-mqtt-topic":
					room === "global" ? "preset/set" : `preset/${room}/set`,
				"data-mqtt-message": preset,
			},
			preset,
		);
	}

	public onMessage(_autoc4: AutoC4, message: Paho.MQTT.Message): void {
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

	onConnect(_autoc4: AutoC4, _o: Paho.MQTT.WithInvocationContext): void {
		$("div.preset-pane[data-room] > [data-preset-topic]").remove();
	}
}

export default function AutoC4Presets(
	autoc4: AutoC4,
	options: any,
): AutoC4Module {
	return new Module(autoc4, options as AutoC4PresetOptions);
}
