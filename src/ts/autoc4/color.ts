/**
 * @description A simple module defining a utility class for simple RGB/HSV color conversion
 * @author Necro
 * @copyright Chaos Computer Club Cologne 2014-2019
 * @license MIT
 */

interface RGB {
    r: number;
    g: number;
    b: number;
}

interface HSV {
    h: number;
    s: number;
    v: number;
}

class Color implements RGB, HSV {
    private constructor() {
        this.rgb = { r: 0, g: 0, b: 0 };
    }
    private _h: number;
    public get h(): number { return this._h; }
    public set h(value: number) {
        this._h = value;
        this.updateRGB();
    }

    private _s: number;
    public get s(): number { return this._s; }
    public set s(value: number) {
        this._s = value;
        this.updateRGB();
    }

    private _v: number;
    public get v(): number { return this._v; }
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

    private _r: number;
    public get r(): number { return this._r; }
    public set r(value: number) {
        this._r = value;
        this.updateHSV();
    }

    private _g: number;
    public get g(): number { return this._g; }
    public set g(value: number) {
        this._g = value;
        this.updateHSV();
    }

    private _b: number;
    public get b(): number { return this._b; }
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
        let hsv = Color.RGBtoHSV(this.rgb);
        this._h = hsv.h;
        this._s = hsv.s;
        this._v = hsv.v;
    }

    private updateRGB(): void {
        let rgb = Color.HSVtoRGB(this.hsv);
        this._r = rgb.r;
        this._g = rgb.g;
        this._b = rgb.b;
    }

    public static RGBtoHSV(rgb: RGB): HSV {
        const g = rgb.g, b = rgb.b, r = rgb.r;
        var max = Math.max(r, g, b), min = Math.min(r, g, b),
            d = max - min,
            h: number,
            s = (max === 0 ? 0 : d / max),
            v = max / 255;

        switch (max) {
            case min: h = 0; break;
            case r: h = (g - b) + d * (g < b ? 6 : 0); h /= 6 * d; break;
            case g: h = (b - r) + d * 2; h /= 6 * d; break;
            case b: h = (r - g) + d * 4; h /= 6 * d; break;
        }

        return {
            h: h,
            s: s,
            v: v
        };
    }

    public static HSVtoRGB(hsv: HSV): RGB {
        let r: number, g: number, b: number, i: number, f: number, p: number, q: number, t: number;
        const h = hsv.h, s = hsv.s, v = hsv.v;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    public toHexString(): string {
        return "#" + Color.numberToHexString(this._r) + Color.numberToHexString(this._g) + Color.numberToHexString(this._b);
    }

    public static fromRGB(rgb: RGB): Color {
        let ret = new Color();
        ret.rgb = rgb;
        return ret;
    }
    public static fromHSV(hsv: HSV): Color {
        let ret = new Color();
        ret.hsv = hsv;
        return ret;
    }
    public static fromHexString(hex: string): Color {
        let ret = new Color();
        ret.rgb = {
            r: parseInt(hex.substr(1, 2), 16),
            g: parseInt(hex.substr(3, 2), 16),
            b: parseInt(hex.substr(5, 2), 16)
        };
        return ret;
    }

    private static numberToHexString(num: number, digits: number = 2): string {
        let ret : string = num.toString(16);
        ret = "0".repeat(digits - ret.length) + ret;
        return ret;
    }
}