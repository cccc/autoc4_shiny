/**
 * @description A simple module for defining data attributes for elements
 * such that when there is any user interaction with the element an MQTT
 * message is sent.
 * @author Qb
 * @copyright Chaos Computer Club Cologne 2019-2024
 * @license MIT
 */
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import type { AutoC4, AutoC4Module } from "../autoc4";

interface AutoC4NotifyConfig {
	textTemplate: string;
	payloadStringPlaceholder?: string;
	hideDelayMs?: number;
}

class Module implements AutoC4Module {
	private options: AutoC4NotifyConfig;

	constructor(_autoc4: AutoC4, options: AutoC4NotifyConfig) {
		this.options = options;
	}

	public onMessage(_autoc4: AutoC4, message: Paho.Message): void {
		const payload = message.payloadString;

		let textContent = this.options.textTemplate;
		if (this.options.payloadStringPlaceholder)
			textContent = textContent
				.split(this.options.payloadStringPlaceholder)
				.join(payload);
		Toastify({
			text: textContent,
			duration: this.options.hideDelayMs,
			gravity: "bottom",
			position: "center",
			style: {
				border: "2px solid #888",
				borderRadius: "6px",
				background: "inherit",
				color: "inherit",
				boxShadow: "none",
			},
		}).showToast();
	}
}

export default function AutoC4Notify(
	autoc4: AutoC4,
	options: any,
): AutoC4Module {
	return new Module(autoc4, options as AutoC4NotifyConfig);
}
