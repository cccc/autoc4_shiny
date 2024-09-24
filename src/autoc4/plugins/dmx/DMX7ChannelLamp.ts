import type { AutoC4 } from "../../autoc4";
import Color from "../../color";
import type LampManager from "./LampManager";
import { RGBInputLamp } from "./RGBInput";

export function registerDMX7Ch(autoc4: AutoC4, lampManager: LampManager): void {
	class DMX7ChannelLamp extends RGBInputLamp {
		connectedCallback(): void {
			super.connectedCallback();
			lampManager.addLamp(this.room, this);
		}

		disconnectedCallback(): void {
			super.disconnectedCallback();
			lampManager.removeLamp(this.room, this);
		}

		receiveMessage(message: Paho.Message): void {
			const payloadBytes = message.payloadBytes as Uint8Array;
			if (payloadBytes.length < 3) return; //if the message has less than 3 bytes
			this.color = Color.fromRGB({
				r: payloadBytes[0],
				g: payloadBytes[1],
				b: payloadBytes[2],
			});
		}

		sendColor(color: Color): void {
			autoc4.sendData(
				this.topic,
				new Uint8Array([color.r, color.g, color.b, 0, 0, 0, 255]),
				true,
			);
		}

		poweroff(): void {
			autoc4.sendData(this.topic, new Uint8Array([0, 0, 0, 0, 0, 0, 0]), true);
		}

		sound(sensitivity: number): void {
			autoc4.sendData(
				this.topic,
				new Uint8Array([0, 0, 0, 0, sensitivity, 246, 255]),
				true,
			);
		}
		fade(speed: number): void {
			autoc4.sendData(
				this.topic,
				new Uint8Array([0, 0, 0, 0, speed, 140, 255]),
				true,
			);
		}
	}
	globalThis.customElements.define("dmx7ch-lamp", DMX7ChannelLamp);
}
