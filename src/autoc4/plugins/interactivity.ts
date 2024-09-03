/**
 * @description A simple module for defining data attributes for elements
 * such that when there is any user interaction with the element an MQTT
 * message is sent.
 * @author Qb
 * @copyright Chaos Computer Club Cologne 2019-2020
 * @license MIT
 */
import type { AutoC4, AutoC4Module } from "../autoc4";

interface AutoC4InteractivityConfig {
	mqttTopicDataAttibute: string;
	mqttRetainedDataAttribute: string;
	mqttMessageDataAttribute: string;
	mqttByteMessageDataAttribute: string;
}

// @ts-ignore: Weak type here because it doesn't implement any methods of AutoC4Module
class Module implements AutoC4Module {
	private autoc4: AutoC4;
	private options: AutoC4InteractivityConfig;

	constructor(autoc4: AutoC4, options: AutoC4InteractivityConfig) {
		this.options = options;
		this.autoc4 = autoc4;

		const self = this;
		$("body").on(
			"click change input",
			`[${this.options.mqttTopicDataAttibute}]`,
			function (this: HTMLElement, event) {
				event.preventDefault();

				const mqttTopic = this.getAttribute(self.options.mqttTopicDataAttibute);
				if (!mqttTopic) return;

				const mqttRetained = Boolean(
					this.getAttribute(self.options.mqttRetainedDataAttribute),
				);

				if (this.hasAttribute(self.options.mqttMessageDataAttribute)) {
					self.autoc4.sendData(
						mqttTopic,
						this.getAttribute(self.options.mqttMessageDataAttribute) as string,
						mqttRetained,
					);
				} else if (
					this.hasAttribute(self.options.mqttByteMessageDataAttribute)
				) {
					self.autoc4.sendByte(
						mqttTopic,
						Number(
							this.getAttribute(self.options.mqttByteMessageDataAttribute),
						),
						mqttRetained,
					);
				} else {
					self.autoc4.sendByte(mqttTopic, 0, mqttRetained);
				}
			},
		);
	}
}

export default function AutoC4Interactivity(
	autoc4: AutoC4,
	options: any,
): AutoC4Module {
	// @ts-ignore: Weak type here because it doesn't implement any methods of AutoC4Module
	return new Module(autoc4, options as AutoC4InteractivityConfig);
}
