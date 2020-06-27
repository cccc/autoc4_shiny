/**
 * @description The code below is cursed. Look at it at your own risk.
 * @copyright Chaos Computer Club Cologne 2014-2020
 * @license MIT
 */
import {AutoC4, AutoC4Module} from '../autoc4.js';

class AutoC4Kitchenlight implements AutoC4Module {
    private autoc4: AutoC4;

    init(autoc4: AutoC4, options: any): this {
        this.autoc4 = autoc4;

        ($("#klMatrixLines") as JQuery<HTMLInputElement>).on('input', function (ev) {
            $("#klMatrixLinesOut").val(parseInt(this.value));
        });
        ($("#klConwaySpeed") as JQuery<HTMLInputElement>).on('input', function (ev) {
            $("#klConwaySpeedOut").val(parseInt(this.value));
        });
        ($("#klConwayGenerations") as JQuery<HTMLInputElement>).on('input', function (ev) {
            $("#klConwayGenerationsOut").val(parseInt(this.value));
        });
        ($("#klSelect") as JQuery<HTMLInputElement>).change(function (ev) {
            $(".klPane.active").removeClass("active");
            $("#" + this.value).addClass("active");
        });
        let _self=this;
        ($("#klSet") as JQuery<HTMLInputElement>).click(function (ev) {
            switch ($("#klSelect").val()) {
                case "klEmpty":
                    _self.kl_empty();
                    break;
                case "klChecker":
                    _self.kl_checker(parseInt($("#klCheckerDelay").val() as string), $("#klCheckerColorA").val() as string, $("#klCheckerColorB").val() as string);
                    break;
                case "klPacman":
                    _self.kl_pacman();
                    break;
                case "klText":
                    _self.kl_text(parseInt($("#klTextDelay").val() as string), $("#klTextText").val() as string);
                    break;
                case "klOpenChaos":
                    _self.kl_open_chaos(parseInt($("#klOCDelay").val() as string));
                    break;
                case "klMatrix":
                    _self.kl_matrix(parseInt($("#klMatrixLines").val() as string));
                    break;
                case "klMood":
                    _self.kl_moodlight(parseInt($("#klMoodMode").val() as string));
                    break;
                case "klSine":
                    _self.kl_sine();
                    break;
                case "klStrobe":
                    _self.kl_strobe();
                    break;
                case "klFlood":
                    _self.kl_flood();
                    break;
                case "klClock":
                    _self.kl_clock();
                    break;
                case "klConway":
                    _self.kl_conway(parseInt($("#klConwaySpeed").val() as string), parseInt($("#klConwayGenerations").val() as string), $<HTMLInputElement>("#klConwayFill")[0].checked);
                    break;
            }
        });
        $(".klPane.active").removeClass("active");
        $("#" + $("#klSelect").val()).addClass("active");
        $(".btn-floodit").click(function (ev) {
            var i = parseInt(this.textContent) - 1;
            return autoc4.sendByte("kitchenlight/FloodIt/flood",i,true);
        });
        $("#klFlood").keypress(function (ev) {
            if (ev.which < 49 || ev.which > 56)
                return;
            $("#klFlood" + (ev.which - 48)).click();
            ev.preventDefault();
        });

        return this;
    }

    private kl_change_screen(data:any):void {
        this.autoc4.sendData("kitchenlight/change_screen",data,true);
    };

    private kl_empty():void {
        var data = new ArrayBuffer(4);
        var v = new DataView(data);
        // Empty is screen 0
        v.setUint32(0, 0, true);
        this.kl_change_screen(data);
    };

    private kl_checker(delay:number, colA:string, colB:string):void {
        let data = new ArrayBuffer(20);
        let v = new DataView(data);
        // Checker is screen 1
        v.setUint32(0, 1, true);
        // Delay
        v.setUint32(4, delay, true);

        // Color A Red
        v.setUint16(8, parseInt(colA.substr(1, 2), 16) * 0x3ff / 0xff, true);
        // Color A Green
        v.setUint16(10, parseInt(colA.substr(3, 2), 16) * 0x3ff / 0xff, true);
        // Color A Blue
        v.setUint16(12, parseInt(colA.substr(5, 2), 16) * 0x3ff / 0xff, true);

        // Color B Red
        v.setUint16(14, parseInt(colB.substr(1, 2), 16) * 0x3ff / 0xff, true);
        // Color B Green
        v.setUint16(16, parseInt(colB.substr(3, 2), 16) * 0x3ff / 0xff, true);
        // Color B Blue
        v.setUint16(18, parseInt(colB.substr(5, 2), 16) * 0x3ff / 0xff, true);

        this.kl_change_screen(data);
    };

    private kl_matrix(lines:number):void {
        let data = new ArrayBuffer(8);
        let v = new DataView(data);
        // Matrix is screen 2
        v.setUint32(0, 2, true);
        // Lines
        v.setUint32(4, lines, true);
        this.kl_change_screen(data);
    };

    private kl_moodlight(mode:number):void {
        let data, v;
        if (mode === 1) { // colorwheel
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
    };

    private kl_open_chaos(delay: number):void {
        let data = new ArrayBuffer(8);
        let v = new DataView(data);
        // OC is screen 4
        v.setUint32(0, 4, true);
        // Delay
        v.setUint32(4, delay, true);
        this.kl_change_screen(data);
    };

    private kl_pacman():void {
        var data = new ArrayBuffer(4);
        var v = new DataView(data);
        // Pacman is screen 5
        v.setUint32(0, 5, true);
        this.kl_change_screen(data);
    };

    private kl_sine():void {
        var data = new ArrayBuffer(4);
        var v = new DataView(data);
        // Sine is screen 6
        v.setUint32(0, 6, true);
        this.kl_change_screen(data);
    }

    private kl_strobe():void {
        var data = new ArrayBuffer(4);
        var v = new DataView(data);
        // Strobe is screen 7
        v.setUint32(0, 7, true);
        this.kl_change_screen(data);
    }

    private kl_text(delay:number, text:string):void {
        var data = new ArrayBuffer(8 + text.length + 1);
        var v = new DataView(data);
        // Text is screen 8
        v.setUint32(0, 8, true);
        // Delay
        v.setUint32(4, delay, true);
        // Text
        for (var i = 0; i < text.length; i += 1) {
            v.setUint8(8 + i, text.charCodeAt(i) & 0xff);
        }
        v.setUint8(8 + text.length, 0);
        this.kl_change_screen(data);
    }

    private kl_flood():void {
        var data = new ArrayBuffer(4);
        var v = new DataView(data);
        // FloodIt is screen 9
        v.setUint32(0, 9, true);
        this.kl_change_screen(data);
    }

    private kl_clock():void {
        var data = new ArrayBuffer(4);
        var v = new DataView(data);
        // Clock is screen 11
        v.setUint32(0, 11, true);
        this.kl_change_screen(data);
    }

    private kl_conway(speed:number, generations:number, fill:boolean):void {
        var data = new ArrayBuffer(16);
        var v = new DataView(data);
        // Conway is screen 12
        v.setUint32(0, 12, true);
        // Speed
        v.setUint32(4, speed, true);
        // Generations Count
        v.setUint32(8, generations, true);
        if (fill)
            v.setUint32(12, 1, true);
        else
            v.setUint32(12, 0, true);
        this.kl_change_screen(data);
    }

    public onMessage(autoc4: AutoC4, message: Paho.MQTT.Message): void {}
    public onConnect(autoc4: AutoC4, o: Paho.MQTT.WithInvocationContext): void { }
    public onConnectionFailure(autoc4: AutoC4, error: Paho.MQTT.MQTTError): void { }

}

export default (autoc4: AutoC4) => autoc4.registerModule("kitchenlight", () => new AutoC4Kitchenlight());