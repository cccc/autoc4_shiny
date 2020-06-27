export default class Color {
    constructor() {
        this.rgb = { r: 0, g: 0, b: 0 };
    }
    get h() { return this._h; }
    set h(value) {
        this._h = value;
        this.updateRGB();
    }
    get s() { return this._s; }
    set s(value) {
        this._s = value;
        this.updateRGB();
    }
    get v() { return this._v; }
    set v(value) {
        this._v = value;
        this.updateRGB();
    }
    get hsv() {
        return { h: this._h, s: this._s, v: this._v };
    }
    set hsv(value) {
        this._h = value.h;
        this._s = value.s;
        this._v = value.v;
        this.updateRGB();
    }
    get r() { return this._r; }
    set r(value) {
        this._r = value;
        this.updateHSV();
    }
    get g() { return this._g; }
    set g(value) {
        this._g = value;
        this.updateHSV();
    }
    get b() { return this._b; }
    set b(value) {
        this._b = value;
        this.updateHSV();
    }
    get rgb() {
        return { r: this._r, g: this._g, b: this._b };
    }
    set rgb(value) {
        this._r = value.r;
        this._g = value.g;
        this._b = value.b;
        this.updateHSV();
    }
    updateHSV() {
        let hsv = Color.RGBtoHSV(this.rgb);
        this._h = hsv.h;
        this._s = hsv.s;
        this._v = hsv.v;
    }
    updateRGB() {
        let rgb = Color.HSVtoRGB(this.hsv);
        this._r = rgb.r;
        this._g = rgb.g;
        this._b = rgb.b;
    }
    static RGBtoHSV(rgb) {
        const g = rgb.g, b = rgb.b, r = rgb.r;
        var max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, h, s = (max === 0 ? 0 : d / max), v = max / 255;
        switch (max) {
            case min:
                h = 0;
                break;
            case r:
                h = (g - b) + d * (g < b ? 6 : 0);
                h /= 6 * d;
                break;
            case g:
                h = (b - r) + d * 2;
                h /= 6 * d;
                break;
            case b:
                h = (r - g) + d * 4;
                h /= 6 * d;
                break;
        }
        return {
            h: h,
            s: s,
            v: v
        };
    }
    static HSVtoRGB(hsv) {
        let r, g, b, i, f, p, q, t;
        const h = hsv.h, s = hsv.s, v = hsv.v;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0:
                r = v, g = t, b = p;
                break;
            case 1:
                r = q, g = v, b = p;
                break;
            case 2:
                r = p, g = v, b = t;
                break;
            case 3:
                r = p, g = q, b = v;
                break;
            case 4:
                r = t, g = p, b = v;
                break;
            case 5:
                r = v, g = p, b = q;
                break;
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    toHexString() {
        return "#" + Color.numberToHexString(this._r) + Color.numberToHexString(this._g) + Color.numberToHexString(this._b);
    }
    static fromRGB(rgb) {
        let ret = new Color();
        ret.rgb = rgb;
        return ret;
    }
    static fromHSV(hsv) {
        let ret = new Color();
        ret.hsv = hsv;
        return ret;
    }
    static fromHexString(hex) {
        let ret = new Color();
        ret.rgb = {
            r: parseInt(hex.substr(1, 2), 16),
            g: parseInt(hex.substr(3, 2), 16),
            b: parseInt(hex.substr(5, 2), 16)
        };
        return ret;
    }
    static numberToHexString(num, digits = 2) {
        let ret = num.toString(16);
        ret = "0".repeat(digits - ret.length) + ret;
        return ret;
    }
}
