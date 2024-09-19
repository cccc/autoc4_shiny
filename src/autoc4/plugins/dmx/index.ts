/**
 * @description A module that allows controlling DMX/RGB lights
 * controlled through AutoC4. It supports 3/4 and 7 channel
 * DMX lights.
 * @copyright Chaos Computer Club Cologne 2014-2020
 * @license MIT
 * @requires color
 */
import EventEmitter from "eventemitter3";
import type { AutoC4, AutoC4Module } from "../../autoc4.js";
import registerBrightnessButton from "./BrightnessButton.js";
import { registerDMX4Ch } from "./DMX4ChannelLamp.js";
import { registerDMX7Ch } from "./DMX7ChannelLamp.js";
import registerDMXMaster from "./DMXMaster.js";
import LampManager from "./LampManager.js";
import { registerRGB } from "./RGBLamp.js";
import { registerRGBW } from "./RGBWLamp.js";

class Module extends EventEmitter implements AutoC4Module {
	private lampManager = new LampManager();

	constructor(autoc4: AutoC4) {
		super();

		registerDMXMaster(autoc4, this.lampManager, this);

		registerDMX4Ch(autoc4, this.lampManager);
		registerDMX7Ch(autoc4, this.lampManager);
		registerRGB(autoc4, this.lampManager);
		registerRGBW(autoc4, this.lampManager);

		registerBrightnessButton(this.lampManager);

		this.initPoweroff();
		this.initFade();
		this.initRandom();
		this.initSound();
	}

	public onMessage(_autoc4: AutoC4, message: Paho.MQTT.Message): void {
		for (const lamp of this.lampManager.getLamps()) {
			if (lamp.canReceiveMessage(message)) {
				lamp.receiveMessage(message);
				if (lamp.isIncludedInMasterCalculation()) {
					const room = this.lampManager.getRoomForLamp(lamp);
					this.emit("master-update", room);
				}
			}
		}
	}

	private initPoweroff(): void {
		const self = this;
		$("body").on(
			"click change",
			"[data-dmx-room][data-dmx-role=poweroff]",
			function (this: HTMLInputElement) {
				const room = this.getAttribute("data-dmx-room")!;

				for (const lamp of self.lampManager.getRoom(room)) {
					lamp.poweroff();
				}
			},
		);
	}

	private initRandom(): void {
		const self = this;
		$(document.body).on(
			"click change",
			"[data-dmx-room][data-dmx-role=random][data-dmx-value]",
			function (this: HTMLElement) {
				const value = Number($(this.getAttribute("data-dmx-value")!).val());
				const room = $(this.getAttribute("data-dmx-room")!).val();

				if (typeof room !== "string") {
					console.error("module/dmx: Room for random could not be determined.");
					return;
				}

				for (const lamp of self.lampManager.getRoom(room)) {
					lamp.randomize(value);
				}
			},
		);
	}

	private initFade(): void {
		const self = this;
		$(document.body).on(
			"click change",
			"[data-dmx-room][data-dmx-role=fade][data-dmx-value]",
			function (this: HTMLElement) {
				const value = Number($(this.getAttribute("data-dmx-value")!).val());
				const room = $(this.getAttribute("data-dmx-room")!).val();

				if (typeof room !== "string") {
					console.error("module/dmx: Room for fade could not be determined.");
					return;
				}

				for (const lamp of self.lampManager.getRoom(room)) {
					lamp.fade(value);
				}
			},
		);
	}

	private initSound(): void {
		const self = this;
		$("body").on(
			"click change",
			"[data-dmx-room][data-dmx-role=sound][data-dmx-value]",
			function (this: HTMLElement) {
				const value = Number($(this.getAttribute("data-dmx-value")!).val());
				const room = $(this.getAttribute("data-dmx-room")!).val();

				if (typeof room !== "string") {
					console.error("module/dmx: Room for sound could not be determined.");
					return;
				}

				for (const lamp of self.lampManager.getRoom(room)) {
					lamp.sound(value);
				}
			},
		);
	}
}

export default function AutoC4DMX(autoc4: AutoC4): AutoC4Module {
	return new Module(autoc4);
}
