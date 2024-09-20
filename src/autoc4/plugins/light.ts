/**
 * @description A module to provide simple toggle buttons for topics
 * @copyright Chaos Computer Club Cologne 2014-2020
 * @license MIT
 */
import type { AutoC4, AutoC4Module } from "../autoc4";

/*
class LightButton extends HTMLElement {
	connectedCallback() {
		this.classList.add("btn", "btn-light");
		this.setAttribute("data-light-topic", this.getAttribute("topic")!);
	}

	get topic(): string {
		return this.getAttribute("topic")!;
	}

	toggleOn(force?: boolean): void {
		if (force === undefined) {
			this.classList.toggle("on");
			return;
		}
		if (force) this.setAttribute("on", "");
		else this.removeAttribute("on");
	}

	isOn(): boolean {
		return this.hasAttribute("on");
	}
}
	*/

abstract class BaseLightButton extends HTMLElement {
	connectedCallback() {
		this.innerHTML = `
			<button type="button" class="${this.templateClassName}">
				${this.innerText}
			</button>
		`;
		this.addEventListener("click", () => {
			this.autoc4.sendByte(this.topic, this.isOn() ? 0 : 1, true);
		});
	}

	abstract get templateClassName(): string;
	abstract get autoc4(): AutoC4;

	get topic(): string {
		return this.getAttribute("topic")!;
	}

	get button(): HTMLButtonElement {
		return this.querySelector("button")!;
	}

	toggleOn(force?: boolean): boolean {
		return this.button.classList.toggle("on", force);
	}

	isOn(): boolean {
		return this.button.classList.contains("on");
	}
}

class Module implements AutoC4Module {
	public constructor(autoc4: AutoC4) {
		class LightButton extends BaseLightButton {
			get templateClassName(): string {
				return "btn btn-light";
			}
			get autoc4(): AutoC4 {
				return autoc4;
			}
		}
		class PowerButton extends BaseLightButton {
			get templateClassName(): string {
				return "btn btn-power";
			}
			get autoc4(): AutoC4 {
				return autoc4;
			}
		}
		globalThis.customElements.define("light-button", LightButton);
		globalThis.customElements.define("power-button", PowerButton);
	}

	public onMessage(_autoc4: AutoC4, message: Paho.Message): void {
		// update .btn-light state
		const buttons = document.querySelectorAll<BaseLightButton>(
			"light-button, power-button",
		);
		for (const button of buttons) {
			if (button.topic !== message.destinationName) continue;
			button.toggleOn((message.payloadBytes as Uint8Array)[0] !== 0);
		}
	}
}

export default function AutoC4Light(autoc4: AutoC4): AutoC4Module {
	return new Module(autoc4);
}
