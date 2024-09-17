import type Lamp from "./Lamp";

export default class LampManager {
	rooms = new Map<string, Lamp[]>();

	addLamp(room: string, lamp: Lamp): void {
		if (!this.rooms.has(room)) this.rooms.set(room, []);
		this.rooms.get(room)!.push(lamp);
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
