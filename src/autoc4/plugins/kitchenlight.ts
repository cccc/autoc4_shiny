/**
 * @description The code below is cursed. Look at it at your own risk.
 * @copyright Chaos Computer Club Cologne 2014-2020
 * @license MIT
 */
import type { AutoC4, AutoC4Module } from "../autoc4";

// @ts-ignore: Weak type here because it doesn't implement any methods of AutoC4Module
class Module implements AutoC4Module {
	private autoc4: AutoC4;

	constructor(autoc4: AutoC4, _options: any) {
		this.autoc4 = autoc4;

		($("#klMatrixLines") as JQuery<HTMLInputElement>).on("input", function () {
			$("#klMatrixLinesOut").val(Number.parseInt(this.value));
		});
		($("#klConwaySpeed") as JQuery<HTMLInputElement>).on("input", function () {
			$("#klConwaySpeedOut").val(Number.parseInt(this.value));
		});
		($("#klConwayGenerations") as JQuery<HTMLInputElement>).on(
			"input",
			function () {
				$("#klConwayGenerationsOut").val(Number.parseInt(this.value));
			},
		);
		($("#klSelect") as JQuery<HTMLInputElement>).change(function () {
			$(".klPane.active").removeClass("active");
			$(`#${this.value}`).addClass("active");
		});
		($("#klSet") as JQuery<HTMLInputElement>).click(() => {
			switch ($("#klSelect").val()) {
				case "klEmpty":
					this.kl_empty();
					break;
				case "klChecker":
					this.kl_checker(
						Number.parseInt($("#klCheckerDelay").val() as string),
						$("#klCheckerColorA").val() as string,
						$("#klCheckerColorB").val() as string,
					);
					break;
				case "klPacman":
					this.kl_pacman();
					break;
				case "klText":
					this.kl_text(
						Number.parseInt($("#klTextDelay").val() as string),
						$("#klTextText").val() as string,
					);
					break;
				case "klOpenChaos":
					this.kl_open_chaos(Number.parseInt($("#klOCDelay").val() as string));
					break;
				case "klMatrix":
					this.kl_matrix(Number.parseInt($("#klMatrixLines").val() as string));
					break;
				case "klMood":
					this.kl_moodlight(Number.parseInt($("#klMoodMode").val() as string));
					break;
				case "klSine":
					this.kl_sine();
					break;
				case "klStrobe":
					this.kl_strobe();
					break;
				case "klFlood":
					this.kl_flood();
					break;
				case "klClock":
					this.kl_clock();
					break;
				case "klConway":
					this.kl_conway(
						Number.parseInt($("#klConwaySpeed").val() as string),
						Number.parseInt($("#klConwayGenerations").val() as string),
						$<HTMLInputElement>("#klConwayFill")[0].checked,
					);
					break;
			}
		});
		$(".klPane.active").removeClass("active");
		$(`#${$("#klSelect").val()}`).addClass("active");
		$(".btn-floodit").click(function () {
			const numStr = this.textContent;
			if (!numStr) return;
			const i = Number.parseInt(numStr) - 1;
			autoc4.sendByte("kitchenlight/FloodIt/flood", i, true);
		});
		$("#klFlood").keypress((ev) => {
			if (ev.which < 49 || ev.which > 56) return;
			$(`#klFlood${ev.which - 48}`).click();
			ev.preventDefault();
		});
	}

	private kl_change_screen(data: any): void {
		this.autoc4.sendData("kitchenlight/change_screen", data, true);
	}

	private kl_empty(): void {
		const data = new ArrayBuffer(4);
		const v = new DataView(data);
		// Empty is screen 0
		v.setUint32(0, 0, true);
		this.kl_change_screen(data);
	}

	private kl_checker(delay: number, colA: string, colB: string): void {
		const data = new ArrayBuffer(20);
		const v = new DataView(data);
		// Checker is screen 1
		v.setUint32(0, 1, true);
		// Delay
		v.setUint32(4, delay, true);

		// Color A Red
		v.setUint16(
			8,
			(Number.parseInt(colA.substr(1, 2), 16) * 0x3ff) / 0xff,
			true,
		);
		// Color A Green
		v.setUint16(
			10,
			(Number.parseInt(colA.substr(3, 2), 16) * 0x3ff) / 0xff,
			true,
		);
		// Color A Blue
		v.setUint16(
			12,
			(Number.parseInt(colA.substr(5, 2), 16) * 0x3ff) / 0xff,
			true,
		);

		// Color B Red
		v.setUint16(
			14,
			(Number.parseInt(colB.substr(1, 2), 16) * 0x3ff) / 0xff,
			true,
		);
		// Color B Green
		v.setUint16(
			16,
			(Number.parseInt(colB.substr(3, 2), 16) * 0x3ff) / 0xff,
			true,
		);
		// Color B Blue
		v.setUint16(
			18,
			(Number.parseInt(colB.substr(5, 2), 16) * 0x3ff) / 0xff,
			true,
		);

		this.kl_change_screen(data);
	}

	private kl_matrix(lines: number): void {
		const data = new ArrayBuffer(8);
		const v = new DataView(data);
		// Matrix is screen 2
		v.setUint32(0, 2, true);
		// Lines
		v.setUint32(4, lines, true);
		this.kl_change_screen(data);
	}

	private kl_moodlight(mode: number): void {
		let data;
		let v;
		if (mode === 1) {
			// colorwheel
			data = new ArrayBuffer(19);
			v = new DataView(data);
			// Moodlight is screen 3
			v.setUint32(0, 3, true);
			// Mode
			v.setUint8(4, mode);
			// Step
			v.setUint32(5, 1, true);
			// Fade Delay
			v.setUint32(9, 10, true);
			// Pause
			v.setUint32(13, 10000, true);
			// Hue Step
			v.setUint16(17, 30, true);
			this.kl_change_screen(data);
		} else {
			data = new ArrayBuffer(17);
			v = new DataView(data);
			// Moodlight is screen 3
			v.setUint32(0, 3, true);
			// Mode
			v.setUint8(4, mode);
			// Step
			v.setUint32(5, 1, true);
			// Fade Delay
			v.setUint32(9, 10, true);
			// Pause
			v.setUint32(13, 10000, true);
			this.kl_change_screen(data);
		}
	}

	private kl_open_chaos(delay: number): void {
		const data = new ArrayBuffer(8);
		const v = new DataView(data);
		// OC is screen 4
		v.setUint32(0, 4, true);
		// Delay
		v.setUint32(4, delay, true);
		this.kl_change_screen(data);
	}

	private kl_pacman(): void {
		const data = new ArrayBuffer(4);
		const v = new DataView(data);
		// Pacman is screen 5
		v.setUint32(0, 5, true);
		this.kl_change_screen(data);
	}

	private kl_sine(): void {
		const data = new ArrayBuffer(4);
		const v = new DataView(data);
		// Sine is screen 6
		v.setUint32(0, 6, true);
		this.kl_change_screen(data);
	}

	private kl_strobe(): void {
		const data = new ArrayBuffer(4);
		const v = new DataView(data);
		// Strobe is screen 7
		v.setUint32(0, 7, true);
		this.kl_change_screen(data);
	}

	private kl_text(delay: number, text: string): void {
		const data = new ArrayBuffer(8 + text.length + 1);
		const v = new DataView(data);
		// Text is screen 8
		v.setUint32(0, 8, true);
		// Delay
		v.setUint32(4, delay, true);
		// Text
		for (let i = 0; i < text.length; i += 1) {
			v.setUint8(8 + i, text.charCodeAt(i) & 0xff);
		}
		v.setUint8(8 + text.length, 0);
		this.kl_change_screen(data);
	}

	private kl_flood(): void {
		const data = new ArrayBuffer(4);
		const v = new DataView(data);
		// FloodIt is screen 9
		v.setUint32(0, 9, true);
		this.kl_change_screen(data);
	}

	private kl_clock(): void {
		const data = new ArrayBuffer(4);
		const v = new DataView(data);
		// Clock is screen 11
		v.setUint32(0, 11, true);
		this.kl_change_screen(data);
	}

	private kl_conway(speed: number, generations: number, fill: boolean): void {
		const data = new ArrayBuffer(16);
		const v = new DataView(data);
		// Conway is screen 12
		v.setUint32(0, 12, true);
		// Speed
		v.setUint32(4, speed, true);
		// Generations Count
		v.setUint32(8, generations, true);
		if (fill) v.setUint32(12, 1, true);
		else v.setUint32(12, 0, true);
		this.kl_change_screen(data);
	}
}

export default function AutoC4Kitchenlight(
	autoc4: AutoC4,
	options: any,
): AutoC4Module {
	// @ts-ignore: Weak type here because it doesn't implement any methods of AutoC4Module
	return new Module(autoc4, options);
}
