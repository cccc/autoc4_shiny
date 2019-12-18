// Copyright (c) 2014-2016 Chaos Computer Club Cologne
//
// This file is MIT licensed. Please see the
// LICENSE file in the source package for more information.
//
/// <reference path="color.ts" />
/// <reference path="autoc4.ts" />


interface AutoC4DMXOptions {
    roomDataAttribute: string;
    roleDataAttribute: string;
    valueDataAttribute: string;
    lightDataAttribute: string;
    channelsDataAttribute: string;
}

class AutoC4DMX implements AutoC4Module {
    private options: AutoC4DMXOptions;
    private autoc4: AutoC4;

    init(autoc4: AutoC4, options: any): this {
        this.options = options as AutoC4DMXOptions;
        this.autoc4 = autoc4;

        this.initColorSelection();
        this.initBrightness();
        this.initFade();
        this.initRandom();
        this.initSound();

        return this;
    }

    public onMessage(autoc4: AutoC4, message: Paho.MQTT.Message): void {
        let components = message.destinationName.split("/");
        if (components.length < 3)
            return; //if the topic has no room or light specified

        let payloadBytes = message.payloadBytes as Uint8Array;
        if (payloadBytes.length < 3) /** @todo change to support one byte channels */
            return; //if the message has less than 3 bytes

        let room = components[1];
        let light = components[2];

        //search for pickers with the right room and light attribute
        let pickers = this.getPickers(room, "light", light);
        if (!pickers.length) return; //stop if none were found

        //set the value of all found pickers to the proper color
        let color = Color.fromRGB({ r: payloadBytes[0], g: payloadBytes[1], b: payloadBytes[2] }).toHexString();
        for (let picker of pickers) {
            (picker as HTMLInputElement).value = color;
        }

        this.updateMasterForRoom(room);
    }

    /**
     * Updates a room's masters' color
     * @param {string} room room to update masters for
     */
    public updateMasterForRoom(room: string): void {
        let value: string;

        //check if all light's colors are equal
        for (let picker of this.getPickers(room)) {
            if (value === undefined) {
                //first value for comparison
                value = (picker as HTMLInputElement).value;
            } else if (value != picker.value) {
                //set color to black and break if another color was found
                value = "#000000";
            }
        }
        //set color for master picker
        for (let picker of this.getPickers(room, "master")) {
            picker.value = value;
        }
    }

    private initColorSelection(): void {
        const self = this;
        $("body").on(
            "change",
            `[${this.options.roomDataAttribute}][${this.options.roleDataAttribute}=light],[${this.options.roomDataAttribute}][${this.options.roleDataAttribute}=master]`,
            function (this: HTMLInputElement) {
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
            }
        );
    }

    private initBrightness(): void {
        const self = this;
        $("body").on(
            "click change",
            `[${this.options.roomDataAttribute}][${this.options.roleDataAttribute}=brightness][${this.options.valueDataAttribute}]`,
            function (this: HTMLElement) {
                let value = (+this.getAttribute(self.options.valueDataAttribute));
                let room = this.getAttribute(self.options.roomDataAttribute);

                for (let picker of self.getPickers(room)) {
                    let channels = (+picker.getAttribute(self.options.channelsDataAttribute)) || 7;
                    let light = picker.getAttribute(self.options.lightDataAttribute);
                    let color = Color.fromHexString(picker.value);
                    color.v = Math.min(Math.max(0, color.v * value), 1);
                    self.setLightColor(room, light, channels, color);
                }
            }
        );
    }

    private initRandom(): void {
        const self = this;
        $("body").on(
            "click change",
            `[${this.options.roomDataAttribute}][${this.options.roleDataAttribute}=fade][${this.options.valueDataAttribute}]`,
            function (this: HTMLElement) {
                let value = (+$(this.getAttribute(self.options.valueDataAttribute)).val());
                let room = $(this.getAttribute(self.options.roomDataAttribute)).val() as string;

                for (let picker of self.getPickers(room)) {
                    let channels = (+picker.getAttribute(self.options.channelsDataAttribute)) || 7;
                    let light = picker.getAttribute(self.options.lightDataAttribute);
                    let color = Color.fromHSV({ h: Math.random(), s: 1, v: value });
                    self.setLightColor(room, light, channels, color);
                }
            }
        );
    }

    private initFade(): void {
        const self = this;
        $("body").on(
            "click change",
            `[${this.options.roomDataAttribute}][${this.options.roleDataAttribute}=fade][${this.options.valueDataAttribute}]`,
            function (this: HTMLElement) {
                let value = (+$(this.getAttribute(self.options.valueDataAttribute)).val());
                let room = $(this.getAttribute(self.options.roomDataAttribute)).val() as string;

                for (let picker of self.getPickers(room)) {
                    let channels = (+picker.getAttribute(self.options.channelsDataAttribute)) || 7;
                    if (channels != 7)
                        continue;
                    let light = picker.getAttribute(self.options.lightDataAttribute);
                    self.sendLightData(room, light, new Uint8Array([0, 0, 0, 0, value, 140, 255]));
                }
            }
        );
    }

    private initSound(): void {
        const self = this;
        $("body").on(
            "click change",
            `[${this.options.roomDataAttribute}][${this.options.roleDataAttribute}=sound][${this.options.valueDataAttribute}]`,
            function (this: HTMLElement) {
                let value = (+$(this.getAttribute(self.options.valueDataAttribute)).val());
                let room = $(this.getAttribute(self.options.roomDataAttribute)).val() as string;

                for (let picker of self.getPickers(room)) {
                    let channels = (+picker.getAttribute(self.options.channelsDataAttribute)) || 7;
                    if (channels != 7)
                        continue;
                    let light = picker.getAttribute(self.options.lightDataAttribute);
                    self.sendLightData(room, light, new Uint8Array([0, 0, 0, 0, value, 246, 255]));
                }
            }
        );
    }

    public setLightColor(room: string, light: string, channels: number, color: Color): void {
        if (channels == 3) {
            this.sendLightData(room, light, new Uint8Array([color.r, color.g, color.b, 255]));
        } else {
            this.sendLightData(room, light, new Uint8Array([color.r, color.g, color.b, 0, 0, 0, 255]));
        }
    }

    public sendLightData(room: string, light: string, data: Uint8Array): void {
        this.autoc4.sendData("dmx/" + room + "/" + light, data, true);
        this.updateMasterForRoom(room);
    }

    public getPickers(room: string, role: string = "light", light?: string): HTMLInputElement[] {
        let ret: NodeListOf<HTMLInputElement>;
        if (light === undefined) {
            ret = document.querySelectorAll(
                `[${this.options.roleDataAttribute}="${role}"]` +
                `[${this.options.roomDataAttribute}="${room}"]`
            );
        } else {
            ret = document.querySelectorAll(
                `[${this.options.roleDataAttribute}="${role}"]` +
                `[${this.options.roomDataAttribute}="${room}"]` +
                `[${this.options.lightDataAttribute}="${light}"]`
            );
        }
        return Array.prototype.slice.apply(ret);
    }

    public onConnect(autoc4: AutoC4, o: Paho.MQTT.WithInvocationContext): void { }
    public onConnectionFailure(autoc4: AutoC4, error: Paho.MQTT.MQTTError): void { }

}

AutoC4.registerModule("dmx", () => new AutoC4DMX());