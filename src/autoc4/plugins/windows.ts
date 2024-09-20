/**
 * @copyright Chaos Computer Club Cologne 2014-2020
 * @license MIT
 */
import type { AutoC4, AutoC4Module } from "../autoc4";

class Module implements AutoC4Module {
	public onMessage(_autoc4: AutoC4, message: Paho.Message): void {
		// update .box-window state
		for (const item of document.querySelectorAll(
			`.box-window[data-topic="${message.destinationName}"]`,
		)) {
			if ((message.payloadBytes as Uint8Array)[0] !== 0)
				item.classList.add("open");
			else item.classList.remove("open");
		}
	}
}
export default function AutoC4Windows(): AutoC4Module {
	return new Module();
}
