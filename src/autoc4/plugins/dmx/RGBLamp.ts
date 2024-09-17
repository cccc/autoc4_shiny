import type { AutoC4 } from "../../autoc4";
import Color from "../../color";
import { BaseRGBLamp } from "./Lamp";
import type LampManager from "./LampManager";

export default class RGBLamp extends BaseRGBLamp {
	receiveMessage(message: Paho.MQTT.Message): void {
		const payloadBytes = message.payloadBytes as Uint8Array;
		if (payloadBytes.length < 3) return; //if the message has less than 3 bytes
		this.setColor(
			Color.fromRGB({
				r: payloadBytes[0],
				g: payloadBytes[1],
				b: payloadBytes[2],
			}),
		);
	}

	sendColor(color: Color): void {
		this.autoc4.sendData(
			this.topic,
			new Uint8Array([color.r, color.g, color.b]),
			true,
		);
	}

	poweroff(): void {
		this.autoc4.sendData(this.topic, new Uint8Array([0, 0, 0]), true);
	}
}

export function registerRGB(autoc4: AutoC4, lampManager: LampManager): void {
	class LampElement extends HTMLElement {
		connectedCallback(): void {
			this.innerHTML = `
                <label><span>${this.getAttribute("label")}:</span><input type="color" /></label>
            `;

			const picker = this.querySelector("input") as HTMLInputElement;
			const getColor = (): Color => Color.fromHexString(picker.value);
			const setColor = (color: Color) => {
				picker.value = color.toHexString();
			};
			picker.addEventListener("input", () => {
				const color = Color.fromHexString(picker.value);
				lamp.sendColor(color);
			});
			const lamp = new RGBLamp(
				autoc4,
				this.getAttribute("topic")!,
				getColor,
				setColor,
			);

			lampManager.addLamp(this.getAttribute("room")!, lamp);
		}
	}
	globalThis.customElements.define("rgb-lamp", LampElement);
}
