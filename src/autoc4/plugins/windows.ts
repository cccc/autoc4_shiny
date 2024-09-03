/**
 * @copyright Chaos Computer Club Cologne 2014-2020
 * @license MIT
 */
import type { AutoC4, AutoC4Module } from "../autoc4";

class Module implements AutoC4Module {
	public onMessage(_autoc4: AutoC4, message: Paho.MQTT.Message): void {
		// update .box-window state
		const button = $(".box-window").filter(
			`[data-topic="${message.destinationName}"]`,
		);
		if (button && (message.payloadBytes as Uint8Array)[0] !== 0)
			button.addClass("open");
		else button.removeClass("open");
	}
}
export default function AutoC4Windows(
	_autoc4: AutoC4,
	_options: any,
): AutoC4Module {
	return new Module();
}
