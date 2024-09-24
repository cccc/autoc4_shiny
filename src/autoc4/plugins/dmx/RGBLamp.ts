import type { AutoC4 } from "../../autoc4";
import Color from "../../color";
import type LampManager from "./LampManager";
import { RGBInputLamp } from "./RGBInput";

export function registerRGB(autoc4: AutoC4, lampManager: LampManager): void {
	class RGBLamp extends RGBInputLamp {
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
				new Uint8Array([color.r, color.g, color.b]),
				true,
			);
		}

		poweroff(): void {
			autoc4.sendData(this.topic, new Uint8Array([0, 0, 0]), true);
		}
	}
	globalThis.customElements.define("rgb-lamp", RGBLamp);
}
