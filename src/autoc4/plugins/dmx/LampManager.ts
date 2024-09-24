import type Color from "../../color";

export interface Lamp {
	canReceiveMessage(message: Paho.Message): boolean;
	receiveMessage(message: Paho.Message): void;
	isIncludedInMasterCalculation(): boolean;
	getColorForMasterCalculation(): Color;
	poweroff(): void;
	brightness(factor: number): void;
	randomize(brightness: number): void;
	sound(sensitivity: number): void;
	fade(speed: number): void;
}

export default class LampManager {
	rooms = new Map<string, Lamp[]>();

	addLamp(room: string, lamp: Lamp): void {
		if (!this.rooms.has(room)) this.rooms.set(room, []);
		this.rooms.get(room)!.push(lamp);
	}

	removeLamp(room: string, lamp: Lamp): void {
		const lamps = this.rooms.get(room);
		if (!lamps) return;
		const index = lamps.indexOf(lamp);
		if (index === -1) return;
		lamps.splice(index, 1);
	}

	getRoom(room: string): Lamp[] {
		return this.rooms.get(room) || [];
	}

	getLamps(): Lamp[] {
		return Array.from(this.rooms.values()).flat();
	}

	getRoomForLamp(lamp: Lamp): string | undefined {
		for (const [room, lamps] of this.rooms) {
			if (lamps.includes(lamp)) return room;
		}
		return undefined;
	}
}
