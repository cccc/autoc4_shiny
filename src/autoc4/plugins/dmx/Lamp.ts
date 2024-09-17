import type { AutoC4 } from "../../autoc4";
import Color from "../../color";

export default interface Lamp {
	canReceiveMessage(message: Paho.MQTT.Message): boolean;
	receiveMessage(message: Paho.MQTT.Message): void;
	isIncludedInMasterCalculation(): boolean;
	getColorForMasterCalculation(): Color;
	poweroff(): void;
	brightness(factor: number): void;
	randomize(brightness: number): void;
	sound(sensitivity: number): void;
	fade(speed: number): void;
}
export abstract class BaseLamp implements Lamp {
	protected autoc4: AutoC4;
	protected topic: string;

	public constructor(autoc4: AutoC4, topic: string) {
		this.autoc4 = autoc4;
		this.topic = topic;
	}

	public canReceiveMessage(message: Paho.MQTT.Message): boolean {
		return message.destinationName === this.topic;
	}

	abstract receiveMessage(message: Paho.MQTT.Message): void;
	abstract isIncludedInMasterCalculation(): boolean;
	abstract getColorForMasterCalculation(): Color;
	abstract poweroff(): void;

	public brightness(_factor: number): void {
		// do nothing
	}
	public randomize(_brightness: number): void {
		// do nothing
	}
	public sound(_sensitivity: number): void {
		// do nothing
	}
	public fade(_speed: number): void {
		// do nothing
	}
}

export abstract class BaseRGBLamp extends BaseLamp {
	getColor: () => Color;
	setColor: (color: Color) => void;

	constructor(
		autoc4: AutoC4,
		topic: string,
		getColor: () => Color,
		setColor: (color: Color) => void,
	) {
		super(autoc4, topic);
		this.getColor = getColor;
		this.setColor = setColor;
	}

	getColorForMasterCalculation(): Color {
		return this.getColor();
	}

	abstract receiveMessage(message: Paho.MQTT.Message): void;
	abstract sendColor(color: Color): void;
	abstract poweroff(): void;

	public isIncludedInMasterCalculation(): boolean {
		return true;
	}

	public brightness(factor: number): void {
		const color = this.getColor();
		color.v = Math.min(Math.max(0, color.v * factor), 1);
		this.sendColor(color);
	}
	public randomize(brightness: number): void {
		this.sendColor(Color.randomColor(brightness));
	}
}
