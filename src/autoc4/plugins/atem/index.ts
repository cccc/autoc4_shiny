/**
 * @description A joke module which activates the cyber mode when
 * a certain key sequence is pressed or a certain topic gets activated.
 * This is primarily intended to react to the Konami Code and the cyber
 * alert topic but can in theory add any class to any element upon
 * activation of any topic.
 * @author Qb
 * @copyright Chaos Computer Club Cologne 2019-2020
 * @license MIT
 */
import EventEmitter from "eventemitter3";
import type { AutoC4, AutoC4Module } from "../../autoc4";
import { createHTMLElement } from "../../utils";
import registerOutputButton from "./OutputButton";
import registerSourceButton from "./SourceButton";
import type { AtemSourceDescription } from "./util";

class Module extends EventEmitter implements AutoC4Module {
	constructor(autoc4: AutoC4) {
		super();

		registerSourceButton(autoc4, this);
		registerOutputButton(autoc4, this);
	}

	public onMessage(_autoc4: AutoC4, message: Paho.Message): void {
		const atem = message.destinationName.split("/").slice(0, -1).join("/");
		const type = message.destinationName.split("/").at(-1);
		const messageData = JSON.parse(message.payloadString);

		switch (type) {
			case "status":
				for (const statusContainer of document.querySelectorAll<HTMLElement>(
					`[data-atem-status="${atem}"]`,
				)) {
					if (messageData.upstream) {
						statusContainer.classList.replace(
							"atem-status-offline",
							"atem-status-online",
						);
					} else {
						statusContainer.classList.replace(
							"atem-status-online",
							"atem-status-offline",
						);
					}
				}
				break;
			case "input-properties": // 1 Black // 0 HDMI in // port_types:
				// 2 Bars
				// 3 Color
				// 4 Media Player
				// 5 Media Player Key
				// 6 Supersource
				// 7 Passthrough
				// 128 Program / Preview
				// 129 Output
				// 131 Multiview, Recording Status, Streaming Status, Audio Status
				{
					const sourcesContainers = document.querySelectorAll<HTMLElement>(
						`[data-atem-sources="${atem}"]`,
					);
					for (const sourcesContainer of sourcesContainers) {
						sourcesContainer.replaceChildren();
					}

					const outputsContainers = document.querySelectorAll<HTMLElement>(
						`[data-atem-outputs="${atem}"]`,
					);
					for (const outputsContainer of outputsContainers) {
						outputsContainer?.replaceChildren();
					}

					for (const v of Object.values(
						messageData,
					) as AtemSourceDescription[]) {
						if ([0, 1, 2, 3, 4].includes(v.port_type)) {
							for (const sourcesContainer of sourcesContainers) {
								sourcesContainer.append(
									createHTMLElement(
										"atem-source",
										{
											name: v.name,
											"short-name": v.short_name,
											topic: atem,
											source: v.index,
										},
										v.short_name,
									),
								);
							}
						}
						if ([0, 128].includes(v.port_type) || v.index === 9001) {
							// HDMIs, program, preview, multiview

							for (const outputContainer of outputsContainers) {
								outputContainer.append(
									createHTMLElement(
										"atem-output",
										{
											name: v.name,
											"short-name": v.short_name,
											topic: atem,
											source: v.index,
										},
										v.short_name,
									),
								);
							}
						}
					}
				}
				break;
			case "program-bus-input":
				this.emit("program-bus-input", messageData);
				break;
			case "preview-bus-input":
				this.emit("preview-bus-input", messageData);
				break;
			case "aux-output-source":
				this.emit("aux-output-source", messageData);
				break;
		}
	}
}

export default function AutoC4Atem(autoc4: AutoC4): AutoC4Module {
	return new Module(autoc4);
}
