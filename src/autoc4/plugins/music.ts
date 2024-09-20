/**
 * @description A simple module to add support for MPD bridge states
 * @author Qb
 * @copyright Chaos Computer Club Cologne 2014-2020
 * @license MIT
 */
import type { AutoC4, AutoC4Module } from "../autoc4";

interface AutoC4MusicOptions {
	roleDataAttribute: string;
	topicDataAttribute: string;
	playingClass: string;
	pausedClass: string;
	stoppedClass: string;
}

class Module implements AutoC4Module {
	private options: AutoC4MusicOptions;

	public constructor(_autoc4: AutoC4, options: AutoC4MusicOptions) {
		this.options = options;
	}

	public onMessage(_autoc4: AutoC4, message: Paho.Message): void {
		let elements = document.querySelectorAll<HTMLElement>(
			`[${this.options.roleDataAttribute}=state][${this.options.topicDataAttribute}="${message.destinationName}"]`,
		);
		for (const e of elements) {
			if (message.payloadString === "play") {
				e.classList.add(this.options.playingClass);
				e.classList.remove(this.options.pausedClass, this.options.stoppedClass);
			} else if (message.payloadString === "pause") {
				e.classList.add(this.options.pausedClass);
				e.classList.remove(
					this.options.playingClass,
					this.options.stoppedClass,
				);
			} else if (message.payloadString === "stop") {
				e.classList.add(this.options.stoppedClass);
				e.classList.remove(this.options.playingClass, this.options.pausedClass);
			}
		}
		elements = document.querySelectorAll<HTMLElement>(
			`[${this.options.roleDataAttribute}=song][${this.options.topicDataAttribute}="${message.destinationName}"]`,
		);
		for (const e of elements) {
			e.innerText = message.payloadString;
		}
	}
}

export default function AutoC4Music(
	autoc4: AutoC4,
	options: any,
): AutoC4Module {
	return new Module(autoc4, options as AutoC4MusicOptions);
}
