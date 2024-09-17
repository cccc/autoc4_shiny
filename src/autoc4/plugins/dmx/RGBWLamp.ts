import type { AutoC4 } from "../../autoc4";
import Color from "../../color";
import { BaseRGBLamp } from "./Lamp";
import type LampManager from "./LampManager";

export default class RGBWLamp extends BaseRGBLamp {
	getWhite: () => number;
	setWhite: (white: number) => void;

	constructor(
		autoc4: AutoC4,
		topic: string,
		getColor: () => Color,
		setColor: (color: Color) => void,
		getWhite: () => number,
		setWhite: (white: number) => void,
	) {
		super(autoc4, topic, getColor, setColor);
		this.getWhite = getWhite;
		this.setWhite = setWhite;
	}

	receiveMessage(message: Paho.MQTT.Message): void {
		const payloadBytes = message.payloadBytes as Uint8Array;
		if (payloadBytes.length < 4) return; //if the message has less than 4 bytes
		this.setColor(
			Color.fromRGB({
				r: payloadBytes[0],
				g: payloadBytes[1],
				b: payloadBytes[2],
			}),
		);
		this.setWhite(payloadBytes[3]);
	}

	sendColor(color: Color): void {
		this.autoc4.sendData(
			this.topic,
			new Uint8Array([color.r, color.g, color.b, this.getWhite()]),
			true,
		);
	}

	sendWhite(white: number): void {
		const color = this.getColor();
		this.autoc4.sendData(
			this.topic,
			new Uint8Array([color.r, color.g, color.b, white]),
			true,
		);
	}

	poweroff(): void {
		this.autoc4.sendData(this.topic, new Uint8Array([0, 0, 0, 0]), true);
	}

	public brightness(factor: number): void {
		const color = this.getColor();
		color.v = Math.min(Math.max(0, color.v * factor), 1);
		this.sendColor(color);
		// TODO: maybe also affect white channel
	}
	public randomize(brightness: number): void {
		this.sendColor(Color.randomColor(brightness));
	}
}

export function registerRGBW(autoc4: AutoC4, lampManager: LampManager): void {
	class LampElement extends HTMLElement {
		connectedCallback(): void {
			this.innerHTML = `
                <label>
					<span>${this.getAttribute("label")}:</span>
					<div>
						<input type="color" />
					</div>
					<input type="range" min="0" max="255" step="1" value="0" />
				</label>
            `;

			const picker = this.querySelector(
				"input[type=color]",
			) as HTMLInputElement;
			const getColor = (): Color => Color.fromHexString(picker.value);
			const setColor = (color: Color) => {
				picker.value = color.toHexString();
			};
			picker.addEventListener("input", () => {
				const color = Color.fromHexString(picker.value);
				lamp.setColor(color);
				lamp.sendColor(color);
			});

			const whitePicker = this.querySelector(
				"input[type=range]",
			) as HTMLInputElement;
			const getWhite = (): number => Number.parseInt(whitePicker.value);
			const setWhite = (white: number) => {
				whitePicker.value = white.toString();
			};
			whitePicker.addEventListener("input", () => {
				const white = Number.parseInt(whitePicker.value);
				lamp.setWhite(white);
				lamp.sendWhite(white);
			});

			const lamp = new RGBWLamp(
				autoc4,
				this.getAttribute("topic")!,
				getColor,
				setColor,
				getWhite,
				setWhite,
			);

			lampManager.addLamp(this.getAttribute("room")!, lamp);
		}
	}
	globalThis.customElements.define("rgbw-lamp", LampElement);
}
