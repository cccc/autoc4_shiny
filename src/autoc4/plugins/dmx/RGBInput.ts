import Color from "@/autoc4/color";
import { LitElement, css, html } from "lit";
import { property, state } from "lit/decorators.js";
import type { Lamp } from "./LampManager";

const styles = css`
label {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    > span {
        flex-grow: 1;
    }
}
input[type="color"] {
    border: 0;
    padding: 0;
}
input[type="range"] {
    width: 100%;
}
`;

export default abstract class RGBInput extends LitElement {
	@property({ attribute: "label" })
	label = "Master";
	@state()
	value = "#000000";

	get color(): Color {
		return Color.fromHexString(this.value);
	}
	set color(value: Color) {
		this.value = value.toHexString();
	}

	render() {
		return html`
            <label>
                <span>${this.label}:</span>
                <input 
                    type="color"
                    .value=${this.value}
                    @input=${this._onInput}
                />
            </label>
        `;
	}

	_onInput(event: Event): void {
		this.value = (event.target as HTMLInputElement).value;
	}

	static styles = styles;
}

export abstract class RGBInputLamp extends RGBInput implements Lamp {
	@property({ attribute: "room" })
	room = "";
	@property({ attribute: "topic" })
	topic = "";

	_onInput(event: Event): void {
		super._onInput(event);
		this.sendColor(this.color);
	}

	canReceiveMessage(message: Paho.Message): boolean {
		return this.topic === message.destinationName;
	}

	isIncludedInMasterCalculation(): boolean {
		return true;
	}
	getColorForMasterCalculation(): Color {
		return this.color;
	}

	brightness(factor: number): void {
		const newColor = this.color.copy();
		newColor.v = Math.min(Math.max(0, newColor.v * factor), 1);
		this.sendColor(newColor);
		// this.color = newColor;
	}
	randomize(brightness: number): void {
		const newColor = Color.randomColor(brightness);
		this.sendColor(newColor);
		// this.color = newColor;
	}

	sound(_sensitivity: number): void {}
	fade(_speed: number): void {}

	abstract receiveMessage(message: Paho.Message): void;
	abstract sendColor(color: Color): void;
	abstract poweroff(): void;
}
