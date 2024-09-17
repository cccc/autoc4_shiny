import type EventEmitter from "eventemitter3";
import type { AutoC4 } from "../../autoc4";
import Color from "../../color";
import type LampManager from "./LampManager";

export default function registerDMXMaster(
	autoc4: AutoC4,
	lampManager: LampManager,
	eventEmitter: EventEmitter,
): void {
	class MasterElement extends HTMLElement {
		connectedCallback(): void {
			const label = this.getAttribute("label") || "Master";
			const topic = this.getAttribute("topic")!;

			this.innerHTML = `
                <label><span>${label}:</span><input type="color" /></label>
            `;

			const picker = this.querySelector("input") as HTMLInputElement;
			console.log("picker", picker);
			picker.addEventListener("input", () => {
				const color = Color.fromHexString(picker.value);
				autoc4.sendData(topic, new Uint8Array([color.r, color.g, color.b]));
			});
			picker.addEventListener("", () => {
				const color = Color.fromHexString(picker.value);
				autoc4.sendData(topic, new Uint8Array([color.r, color.g, color.b]));
			});
			console.log("picker event added", picker);

			eventEmitter.on("master-update", this.updateMaster, this);
		}

		disconnectedCallback(): void {
			eventEmitter.off("master-update", this.updateMaster, this);
		}

		setColor(color: Color | null): void {
			this.querySelector("input")!.value = color?.toHexString() || "#000001";
		}

		updateMaster(room: string): void {
			if (room !== this.getAttribute("room")) return;

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
				this.setColor(Color.BLACK);
				return;
			}
			this.setColor(value);
		}
	}
	globalThis.customElements.define("dmx-master", MasterElement);
}
