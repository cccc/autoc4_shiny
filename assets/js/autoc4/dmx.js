class AutoC4DMX {
    init(autoc4, options) {
        this.options = options;
        this.autoc4 = autoc4;
        this.initColorSelection();
        this.initPoweroff();
        this.initBrightness();
        this.initFade();
        this.initRandom();
        this.initSound();
        return this;
    }
    onMessage(autoc4, message) {
        let components = message.destinationName.split("/");
        if (components.length < 3)
            return;
        let payloadBytes = message.payloadBytes;
        if (payloadBytes.length < 3)
            return;
        let room = components[1];
        let light = components[2];
        let pickers = this.getPickers(room, "light", light);
        if (!pickers.length)
            return;
        let color = Color.fromRGB({ r: payloadBytes[0], g: payloadBytes[1], b: payloadBytes[2] }).toHexString();
        for (let picker of pickers) {
            picker.value = color;
        }
        this.updateMasterForRoom(room);
    }
    updateMasterForRoom(room) {
        let value;
        for (let picker of this.getPickers(room)) {
            if (value === undefined) {
                value = picker.value;
            }
            else if (value != picker.value) {
                value = "#000000";
            }
        }
        for (let picker of this.getPickers(room, "master")) {
            picker.value = value;
        }
    }
    initColorSelection() {
        const self = this;
        $("body").on("change", `[${this.options.roomDataAttribute}][${this.options.roleDataAttribute}=light],[${this.options.roomDataAttribute}][${this.options.roleDataAttribute}=master]`, function () {
            let color = Color.fromHexString(this.value);
            let channels = (+this.getAttribute(self.options.channelsDataAttribute)) || 7;
            let room = this.getAttribute(self.options.roomDataAttribute);
            let light = this.getAttribute(self.options.lightDataAttribute);
            if (!light) {
                if (this.getAttribute(self.options.roleDataAttribute) === "master")
                    light = "master";
                else
                    return;
            }
            self.setLightColor(room, light, channels, color);
        });
    }
    initPoweroff() {
        const self = this;
        $("body").on("click change", `[${this.options.roomDataAttribute}][${this.options.roleDataAttribute}=poweroff]`, function () {
            let color = Color.fromRGB({ r: 0, g: 0, b: 0 });
            let channels = (+this.getAttribute(self.options.channelsDataAttribute)) || 7;
            let room = this.getAttribute(self.options.roomDataAttribute);
            let light = this.getAttribute(self.options.lightDataAttribute);
            if (!light) {
                light = "master";
            }
            self.setLightColor(room, light, channels, color);
        });
    }
    initBrightness() {
        const self = this;
        $("body").on("click change", `[${this.options.roomDataAttribute}][${this.options.roleDataAttribute}=brightness][${this.options.valueDataAttribute}]`, function () {
            let value = (+this.getAttribute(self.options.valueDataAttribute));
            let room = this.getAttribute(self.options.roomDataAttribute);
            for (let picker of self.getPickers(room)) {
                let channels = (+picker.getAttribute(self.options.channelsDataAttribute)) || 7;
                let light = picker.getAttribute(self.options.lightDataAttribute);
                let color = Color.fromHexString(picker.value);
                color.v = Math.min(Math.max(0, color.v * value), 1);
                self.setLightColor(room, light, channels, color);
            }
        });
    }
    initRandom() {
        const self = this;
        $("body").on("click change", `[${this.options.roomDataAttribute}][${this.options.roleDataAttribute}=fade][${this.options.valueDataAttribute}]`, function () {
            let value = (+$(this.getAttribute(self.options.valueDataAttribute)).val());
            let room = $(this.getAttribute(self.options.roomDataAttribute)).val();
            for (let picker of self.getPickers(room)) {
                let channels = (+picker.getAttribute(self.options.channelsDataAttribute)) || 7;
                let light = picker.getAttribute(self.options.lightDataAttribute);
                let color = Color.fromHSV({ h: Math.random(), s: 1, v: value });
                self.setLightColor(room, light, channels, color);
            }
        });
    }
    initFade() {
        const self = this;
        $("body").on("click change", `[${this.options.roomDataAttribute}][${this.options.roleDataAttribute}=fade][${this.options.valueDataAttribute}]`, function () {
            let value = (+$(this.getAttribute(self.options.valueDataAttribute)).val());
            let room = $(this.getAttribute(self.options.roomDataAttribute)).val();
            for (let picker of self.getPickers(room)) {
                let channels = (+picker.getAttribute(self.options.channelsDataAttribute)) || 7;
                if (channels != 7)
                    continue;
                let light = picker.getAttribute(self.options.lightDataAttribute);
                self.sendLightData(room, light, new Uint8Array([0, 0, 0, 0, value, 140, 255]));
            }
        });
    }
    initSound() {
        const self = this;
        $("body").on("click change", `[${this.options.roomDataAttribute}][${this.options.roleDataAttribute}=sound][${this.options.valueDataAttribute}]`, function () {
            let value = (+$(this.getAttribute(self.options.valueDataAttribute)).val());
            let room = $(this.getAttribute(self.options.roomDataAttribute)).val();
            for (let picker of self.getPickers(room)) {
                let channels = (+picker.getAttribute(self.options.channelsDataAttribute)) || 7;
                if (channels != 7)
                    continue;
                let light = picker.getAttribute(self.options.lightDataAttribute);
                self.sendLightData(room, light, new Uint8Array([0, 0, 0, 0, value, 246, 255]));
            }
        });
    }
    setLightColor(room, light, channels, color) {
        if (channels == 3) {
            this.sendLightData(room, light, new Uint8Array([color.r, color.g, color.b, 255]));
        }
        else {
            this.sendLightData(room, light, new Uint8Array([color.r, color.g, color.b, 0, 0, 0, 255]));
        }
    }
    sendLightData(room, light, data) {
        this.autoc4.sendData("dmx/" + room + "/" + light, data, true);
        this.updateMasterForRoom(room);
    }
    getPickers(room, role = "light", light) {
        let ret;
        if (light === undefined) {
            ret = document.querySelectorAll(`[${this.options.roleDataAttribute}="${role}"]` +
                `[${this.options.roomDataAttribute}="${room}"]`);
        }
        else {
            ret = document.querySelectorAll(`[${this.options.roleDataAttribute}="${role}"]` +
                `[${this.options.roomDataAttribute}="${room}"]` +
                `[${this.options.lightDataAttribute}="${light}"]`);
        }
        return Array.prototype.slice.apply(ret);
    }
    onConnect(autoc4, o) { }
    onConnectionFailure(autoc4, error) { }
}
AutoC4.registerModule("dmx", () => new AutoC4DMX());
//# sourceMappingURL=dmx.js.map