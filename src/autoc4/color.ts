/**
 * @description A simple module defining a utility class for simple RGB/HSV color conversion
 * @author Qb
 * @copyright Chaos Computer Club Cologne 2019-2020
 * @license MIT
 */

export interface RGB {
	r: number;
	g: number;
	b: number;
}

export interface HSV {
	h: number;
	s: number;
	v: number;
}

export default class Color implements RGB, HSV {
	private constructor() {
		this.rgb = { r: 0, g: 0, b: 0 };
	}
	private _h = 0;
	public get h(): number {
		return this._h;
	}
	public set h(value: number) {
		this._h = value;
		this.updateRGB();
	}

	private _s = 0;
	public get s(): number {
		return this._s;
	}
	public set s(value: number) {
		this._s = value;
		this.updateRGB();
	}

	private _v = 0;
	public get v(): number {
		return this._v;
	}
	public set v(value: number) {
		this._v = value;
		this.updateRGB();
	}

	public get hsv(): HSV {
		return { h: this._h, s: this._s, v: this._v };
	}
	public set hsv(value: HSV) {
		this._h = value.h;
		this._s = value.s;
		this._v = value.v;
		this.updateRGB();
	}

	private _r = 0;
	public get r(): number {
		return this._r;
	}
	public set r(value: number) {
		this._r = value;
		this.updateHSV();
	}

	private _g = 0;
	public get g(): number {
		return this._g;
	}
	public set g(value: number) {
		this._g = value;
		this.updateHSV();
	}

	private _b = 0;
	public get b(): number {
		return this._b;
	}
	public set b(value: number) {
		this._b = value;
		this.updateHSV();
	}

	public get rgb(): RGB {
		return { r: this._r, g: this._g, b: this._b };
	}
	public set rgb(value: RGB) {
		this._r = value.r;
		this._g = value.g;
		this._b = value.b;
		this.updateHSV();
	}

	private updateHSV(): void {
		const hsv = Color.RGBtoHSV(this.rgb);
		this._h = hsv.h;
		this._s = hsv.s;
		this._v = hsv.v;
	}

	private updateRGB(): void {
		const rgb = Color.HSVtoRGB(this.hsv);
		this._r = rgb.r;
		this._g = rgb.g;
		this._b = rgb.b;
	}

	public static RGBtoHSV(rgb: RGB): HSV {
		const g = rgb.g;
		const b = rgb.b;
		const r = rgb.r;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const d = max - min;

		let h = 0;
		switch (max) {
			case min:
				h = 0;
				break;
			case r:
				h = g - b + d * (g < b ? 6 : 0);
				h /= 6 * d;
				break;
			case g:
				h = b - r + d * 2;
				h /= 6 * d;
				break;
			case b:
				h = r - g + d * 4;
				h /= 6 * d;
				break;
		}

		const s = max === 0 ? 0 : d / max;
		const v = max / 255;

		return {
			h: h,
			s: s,
			v: v,
		};
	}

	public static HSVtoRGB(hsv: HSV): RGB {
		let i: number;

		const h = hsv.h;
		const s = hsv.s;
		const v = hsv.v;
		i = Math.floor(h * 6);

		const f = h * 6 - i;
		const p = v * (1 - s);
		const q = v * (1 - f * s);
		const t = v * (1 - (1 - f) * s);

		let r = 0;
		let g = 0;
		let b = 0;
		switch (i % 6) {
			case 0:
				r = v;
				g = t;
				b = p;
				break;
			case 1:
				r = q;
				g = v;
				b = p;
				break;
			case 2:
				r = p;
				g = v;
				b = t;
				break;
			case 3:
				r = p;
				g = q;
				b = v;
				break;
			case 4:
				r = t;
				g = p;
				b = v;
				break;
			case 5:
				r = v;
				g = p;
				b = q;
				break;
		}

		return {
			r: Math.round(r * 255),
			g: Math.round(g * 255),
			b: Math.round(b * 255),
		};
	}

	/** Simple comparison by RGB values */
	public equals(other: Color): boolean {
		return (
			this.rgb.r === other.rgb.r &&
			this.rgb.g === other.rgb.g &&
			this.rgb.b === other.rgb.b
		);
	}

	private static numberToHexString(num: number, digits = 2): string {
		let ret: string = num.toString(16);
		ret = "0".repeat(digits - ret.length) + ret;
		return ret;
	}
	public toHexString(): string {
		return `#${Color.numberToHexString(this._r)}${Color.numberToHexString(this._g)}${Color.numberToHexString(this._b)}`;
	}

	public static fromRGB(rgb: RGB): Color {
		const ret = new Color();
		ret.rgb = rgb;
		return ret;
	}
	public static fromHSV(hsv: HSV): Color {
		const ret = new Color();
		ret.hsv = hsv;
		return ret;
	}
	public static fromHexString(hex: string): Color {
		const ret = new Color();
		ret.rgb = {
			r: Number.parseInt(hex.substring(1, 3), 16),
			g: Number.parseInt(hex.substring(3, 5), 16),
			b: Number.parseInt(hex.substring(5, 7), 16),
		};
		return ret;
	}

	public static randomColor(value: number): Color {
		return Color.fromHSV({ h: Math.random(), s: 1, v: value });
	}

	public static get BLACK(): Color {
		return Color.fromRGB({ r: 0, g: 0, b: 0 });
	}
}
