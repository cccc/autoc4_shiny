/**
 * @copyright Chaos Computer Club Cologne 2014-2020
 * @license MIT
 */
import type { AutoC4, AutoC4Module } from "../autoc4.js";
import { simpleDateFormat } from "../utils.js";

interface AutoC4TimeOptions {
	targetSelector: string;
	templateDataAttribute: string;
	defaultToCurrentTime?: boolean;
}

class Module implements AutoC4Module {
	private options: AutoC4TimeOptions;

	public constructor(_autoc4: AutoC4, options: any) {
		this.options = options as AutoC4TimeOptions;

		if (this.options.defaultToCurrentTime) {
			this.setTime(new Date());
		}
	}

	public onMessage(_autoc4: AutoC4, message: Paho.Message): void {
		if (message.payloadBytes.byteLength < 7) {
			console.warn(
				`Received invalid time payload on topic "${message.destinationName}".`,
			);
			return;
		}

		const bytes = message.payloadBytes as Uint8Array;
		const now = new Date();
		//f*cking hell this incoming data format is broken
		const time = new Date(
			now.getFullYear() - (now.getFullYear() % 100) + bytes[7], //year
			bytes[5] - 1, //month
			bytes[6], //day
			bytes[0], //hour
			bytes[1], //minute
			bytes[2], //second
		);

		this.setTime(time);
	}

	public setTime(time: Date) {
		const targets = document.querySelectorAll(this.options.targetSelector);
		for (const target of targets) {
			target.textContent = simpleDateFormat(
				target.getAttribute(this.options.templateDataAttribute) ||
					"yyyy-MM-ddZHH-mm-ss",
				time,
			);
		}
	}
}

export default function AutoC4Time(autoc4: AutoC4, options: any): AutoC4Module {
	return new Module(autoc4, options);
}
