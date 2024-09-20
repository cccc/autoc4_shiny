/**
 * @description This module looks for the actication of a range of topics and adds them
 * into a list monitoring the activation/deactivation and displaying the current state.
 * This primarily used for monitoring the state of infrastructure(running/dead) that is
 * part of AutoC4.
 * @author Qb
 * @copyright Chaos Computer Club Cologne 2014-2020
 * @license MIT
 */
import type { AutoC4, AutoC4Module } from "../autoc4";
import { createHTMLElement } from "../utils";

type HeartbeatEntry = HTMLElement;

/** @todo entry element templates */
class Module implements AutoC4Module {
	private heartbeats: { [key: string]: HeartbeatEntry } = {};

	public onMessage(_autoc4: AutoC4, message: Paho.Message): void {
		const name = message.destinationName.substring("heartbeat/".length);
		if (!(name in this.heartbeats)) {
			this.heartbeats[name] = this.createEntry(name);
			document
				.querySelector("#infrastructure-table")
				?.append(this.heartbeats[name]);
		}

		const entry = this.heartbeats[name];
		if (!(message.payloadBytes as Uint8Array).length) {
			entry.remove();
			delete this.heartbeats[name];
		}

		if ((message.payloadBytes as Uint8Array)[0])
			entry.classList.replace(
				"heartbeat-entry-offline",
				"heartbeat-entry-online",
			);
		else
			entry.classList.replace(
				"heartbeat-entry-online",
				"heartbeat-entry-offline",
			);
	}

	public createEntry(name: string): HeartbeatEntry {
		return createHTMLElement(
			"tr",
			{ className: "heartbeat-entry heartbeat-entry-online" },
			createHTMLElement("td", { className: "heartbeat-name" }, name),
			createHTMLElement(
				"td",
				{ className: "heartbeat-state" },
				createHTMLElement("i", {
					className:
						"heartbeat-state-icon heartbeat-state-icon-online fa fa-thumbs-up",
				}),
				createHTMLElement("i", {
					className:
						"heartbeat-state-icon heartbeat-state-icon-offline fa fa-thumbs-down",
				}),
			),
		);
	}
}

export default function AutoC4Heartbeat(): AutoC4Module {
	return new Module();
}
