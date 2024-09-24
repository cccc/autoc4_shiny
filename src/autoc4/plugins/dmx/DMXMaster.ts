import type EventEmitter from "eventemitter3";
import { property } from "lit/decorators.js";
import type { AutoC4 } from "../../autoc4";
import Color from "../../color";
import type LampManager from "./LampManager";
import RGBInput from "./RGBInput";

export default function registerDMXMaster(
	autoc4: AutoC4,
	lampManager: LampManager,
	eventEmitter: EventEmitter,
): void {
	class MasterElement extends RGBInput {
		@property({ attribute: "room" })
		room = "";
		@property({ attribute: "topic" })
		topic = "";

		connectedCallback(): void {
			super.connectedCallback();
			eventEmitter.on("master-update", this.updateMaster, this);
		}
		disconnectedCallback(): void {
			super.disconnectedCallback();
			eventEmitter.off("master-update", this.updateMaster, this);
		}

		_onInput(event: InputEvent) {
			super._onInput(event);
			const color = Color.fromHexString(this.value);
			autoc4.sendData(this.topic, new Uint8Array([color.r, color.g, color.b]));
		}

		setColor(color: Color | null): void {
			this.value = color?.toHexString() || "#000001";
		}

		updateMaster(room: string): void {
			if (room !== this.room) return;

			let value: Color | undefined;
			//check if all light's colors are equal
			for (const lamp of lampManager.getRoom(room)) {
				if (!lamp.isIncludedInMasterCalculation()) continue;
				if (value === undefined) {
					//first value for comparison
					value = lamp.getColorForMasterCalculation();
				} else if (!value.equals(lamp.getColorForMasterCalculation())) {
					//set color to black and break if another color was found
					this.setColor(null);
					// and break the loop because we cannot have a uniform color anymore
					return;
				}
			}
			if (value === undefined) {
				console.warn(
					`module/dmx: No color found for room "${room}". Could not update master picker.`,
				);
				this.setColor(null);
				return;
			}
			this.setColor(value);
		}

		static styles = RGBInput.styles;
	}
	globalThis.customElements.define("dmx-master", MasterElement);
}
