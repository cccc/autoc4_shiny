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

type HeartbeatEntry = {
	element: JQuery<HTMLElement>;
	state_icon: JQuery<HTMLElement>;
};

/** @todo entry element templates */
class Module implements AutoC4Module {
	private heartbeats: { [key: string]: HeartbeatEntry } = {};

	public onMessage(_autoc4: AutoC4, message: Paho.MQTT.Message): void {
		const name = message.destinationName.substring("heartbeat/".length);
		if (!(name in this.heartbeats)) {
			this.heartbeats[name] = this.createEntry(name);
			$("#infrastructure-table").append(this.heartbeats[name].element);
		}
		if (!(message.payloadBytes as Uint8Array).length) {
			this.heartbeats[name].element.remove();
			delete this.heartbeats[name];
		}

		if ((message.payloadBytes as Uint8Array)[0])
			this.heartbeats[name].state_icon
				.addClass("fa-thumbs-up")
				.removeClass("fa-thumbs-down");
		else
			this.heartbeats[name].state_icon
				.addClass("fa-thumbs-down")
				.removeClass("fa-thumbs-up");
	}

	public createEntry(name: string): HeartbeatEntry {
		const entry = {
			element: $("<tr>").append(
				$("<td>").addClass("heartbeat-name").text(name),
			),
			state_icon: $("<i>")
				.addClass("heartbeat-state-icon fa")
				.attr("data-heartbeat-name", name),
		};
		entry.element.append(
			$("<td>").addClass("heartbeat-state").append(entry.state_icon),
		);
		return entry;
	}
}

export default function AutoC4Heartbeat(
	_autoc4: AutoC4,
	_options: any,
): AutoC4Module {
	return new Module();
}
