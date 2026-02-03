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
import type { AutoC4, AutoC4Module } from "../autoc4";

interface AutoC4AdminOptions {
	class: string;
	target: string;
	clickTriggerSelector: string;
	clickCount: number;
	clickTimeout: number;
	localStorageKey?: string;
}

class Module implements AutoC4Module {
	private enabled: boolean = false;
	private options: AutoC4AdminOptions;
	private clickCounter: number = 0;
	private lastClick: number = 0;

	constructor(_autoc4: AutoC4, options: AutoC4AdminOptions) {
		this.options = options;

		if (this.options.localStorageKey) {
			if (localStorage.getItem(this.options.localStorageKey) === "true") {
				this.toggle(true);
			}
		}

		if (options.clickTriggerSelector) {
			// register delegated event listener
			document.body.addEventListener("click", (e) => {
				const target = e.target as HTMLElement;
				if (target.closest(options.clickTriggerSelector!)) {
					this.handleClick();
				}
			});
		}
	}

	public handleClick(): void {
		if (Date.now() - this.lastClick > this.options.clickTimeout!)
			this.clickCounter = 0;

		this.clickCounter++;
		this.lastClick = Date.now();

		if (this.clickCounter >= this.options.clickCount!) {
			this.toggle();
			this.clickCounter = 0;
		}
	}

	public toggle(force?: boolean): void {
		this.enabled = force ?? !this.enabled;

		if (this.options.localStorageKey) {
			localStorage.setItem(
				this.options.localStorageKey,
				this.enabled ? "true" : "false",
			);
		}

		const elements = document.querySelectorAll<HTMLElement>(
			this.options.target,
		);
		for (const e of elements) {
			e.classList.toggle(this.options.class, this.enabled);
		}
	}

	public onMessage(_autoc4: AutoC4, message: Paho.Message): void {
		if ((message.payloadBytes as Uint8Array)[0]) {
			this.toggle(true);
		} else {
			this.toggle(false);
		}
	}
}

export default function AutoC4Cyber(
	autoc4: AutoC4,
	options: any,
): AutoC4Module {
	return new Module(autoc4, options as AutoC4AdminOptions);
}
