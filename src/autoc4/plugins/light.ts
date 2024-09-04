/**
 * @description A module to provide simple toggle buttons for topics
 * @copyright Chaos Computer Club Cologne 2014-2020
 * @license MIT
 */
import type { AutoC4, AutoC4Module } from "../autoc4";

interface AutoC4LightOptions {
	topicDataAttribute: string;
	onClass: string;
}

class Module implements AutoC4Module {
	private autoc4: AutoC4;
	private options: AutoC4LightOptions;

	public constructor(autoc4: AutoC4, options: any) {
		this.autoc4 = autoc4;
		this.options = options;

		this.initLightButtons();
	}

	public initLightButtons() {
		const self = this;
		$("body").on(
			"click",
			`[${this.options.topicDataAttribute}]`,
			function (this: HTMLElement) {
				self.autoc4.sendByte(
					this.getAttribute(self.options.topicDataAttribute)!,
					this.classList.contains(self.options.onClass) ? 0 : 1,
					true,
				);
			},
		);
	}

	public onMessage(_autoc4: AutoC4, message: Paho.MQTT.Message): void {
		// update .btn-light state
		const button = $(
			`[${this.options.topicDataAttribute}="${message.destinationName}"]`,
		);
		if (button && (message.payloadBytes as Uint8Array)[0] !== 0)
			button.addClass(this.options.onClass);
		else button.removeClass(this.options.onClass);
	}
}

export default function AutoC4Light(
	autoc4: AutoC4,
	options: any,
): AutoC4Module {
	return new Module(autoc4, options);
}
