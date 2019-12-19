class AutoC4Kitchenlight {
    init(autoc4, options) {
        this.autoc4 = autoc4;
        $("#klMatrixLines").on('input', function (ev) {
            $("#klMatrixLinesOut").val(parseInt(this.value));
        });
        $("#klConwaySpeed").on('input', function (ev) {
            $("#klConwaySpeedOut").val(parseInt(this.value));
        });
        $("#klConwayGenerations").on('input', function (ev) {
            $("#klConwayGenerationsOut").val(parseInt(this.value));
        });
        $("#klSelect").change(function (ev) {
            $(".klPane.active").removeClass("active");
            $("#" + this.value).addClass("active");
        });
        let _self = this;
        $("#klSet").click(function (ev) {
            switch ($("#klSelect").val()) {
                case "klEmpty":
                    _self.kl_empty();
                    break;
                case "klChecker":
                    _self.kl_checker(parseInt($("#klCheckerDelay").val()), $("#klCheckerColorA").val(), $("#klCheckerColorB").val());
                    break;
                case "klPacman":
                    _self.kl_pacman();
                    break;
                case "klText":
                    _self.kl_text(parseInt($("#klTextDelay").val()), $("#klTextText").val());
                    break;
                case "klOpenChaos":
                    _self.kl_open_chaos(parseInt($("#klOCDelay").val()));
                    break;
                case "klMatrix":
                    _self.kl_matrix(parseInt($("#klMatrixLines").val()));
                    break;
                case "klMood":
                    _self.kl_moodlight(parseInt($("#klMoodMode").val()));
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
                    _self.kl_conway(parseInt($("#klConwaySpeed").val()), parseInt($("#klConwayGenerations").val()), $("#klConwayFill")[0].checked);
                    break;
            }
        });
        $(".klPane.active").removeClass("active");
        $("#" + $("#klSelect").val()).addClass("active");
        $(".btn-floodit").click(function (ev) {
            var i = parseInt(this.textContent) - 1;
            return autoc4.sendByte("kitchenlight/FloodIt/flood", i, true);
        });
        $("#klFlood").keypress(function (ev) {
            if (ev.which < 49 || ev.which > 56)
                return;
            $("#klFlood" + (ev.which - 48)).click();
            ev.preventDefault();
        });
        return this;
    }
    kl_change_screen(data) {
        this.autoc4.sendData("kitchenlight/change_screen", data, true);
    }
    ;
    kl_empty() {
        var data = new ArrayBuffer(4);
        var v = new DataView(data);
        v.setUint32(0, 0, true);
        this.kl_change_screen(data);
    }
    ;
    kl_checker(delay, colA, colB) {
        let data = new ArrayBuffer(20);
        let v = new DataView(data);
        v.setUint32(0, 1, true);
        v.setUint32(4, delay, true);
        v.setUint16(8, parseInt(colA.substr(1, 2), 16) * 0x3ff / 0xff, true);
        v.setUint16(10, parseInt(colA.substr(3, 2), 16) * 0x3ff / 0xff, true);
        v.setUint16(12, parseInt(colA.substr(5, 2), 16) * 0x3ff / 0xff, true);
        v.setUint16(14, parseInt(colB.substr(1, 2), 16) * 0x3ff / 0xff, true);
        v.setUint16(16, parseInt(colB.substr(3, 2), 16) * 0x3ff / 0xff, true);
        v.setUint16(18, parseInt(colB.substr(5, 2), 16) * 0x3ff / 0xff, true);
        this.kl_change_screen(data);
    }
    ;
    kl_matrix(lines) {
        let data = new ArrayBuffer(8);
        let v = new DataView(data);
        v.setUint32(0, 2, true);
        v.setUint32(4, lines, true);
        this.kl_change_screen(data);
    }
    ;
    kl_moodlight(mode) {
        let data, v;
        if (mode === 1) {
            data = new ArrayBuffer(19);
            v = new DataView(data);
            v.setUint32(0, 3, true);
            v.setUint8(4, mode);
            v.setUint32(5, 1, true);
            v.setUint32(9, 10, true);
            v.setUint32(13, 10000, true);
            v.setUint16(17, 30, true);
            this.kl_change_screen(data);
        }
        else {
            data = new ArrayBuffer(17);
            v = new DataView(data);
            v.setUint32(0, 3, true);
            v.setUint8(4, mode);
            v.setUint32(5, 1, true);
            v.setUint32(9, 10, true);
            v.setUint32(13, 10000, true);
            this.kl_change_screen(data);
        }
    }
    ;
    kl_open_chaos(delay) {
        let data = new ArrayBuffer(8);
        let v = new DataView(data);
        v.setUint32(0, 4, true);
        v.setUint32(4, delay, true);
        this.kl_change_screen(data);
    }
    ;
    kl_pacman() {
        var data = new ArrayBuffer(4);
        var v = new DataView(data);
        v.setUint32(0, 5, true);
        this.kl_change_screen(data);
    }
    ;
    kl_sine() {
        var data = new ArrayBuffer(4);
        var v = new DataView(data);
        v.setUint32(0, 6, true);
        this.kl_change_screen(data);
    }
    kl_strobe() {
        var data = new ArrayBuffer(4);
        var v = new DataView(data);
        v.setUint32(0, 7, true);
        this.kl_change_screen(data);
    }
    kl_text(delay, text) {
        var data = new ArrayBuffer(8 + text.length + 1);
        var v = new DataView(data);
        v.setUint32(0, 8, true);
        v.setUint32(4, delay, true);
        for (var i = 0; i < text.length; i += 1) {
            v.setUint8(8 + i, text.charCodeAt(i) & 0xff);
        }
        v.setUint8(8 + text.length, 0);
        this.kl_change_screen(data);
    }
    kl_flood() {
        var data = new ArrayBuffer(4);
        var v = new DataView(data);
        v.setUint32(0, 9, true);
        this.kl_change_screen(data);
    }
    kl_clock() {
        var data = new ArrayBuffer(4);
        var v = new DataView(data);
        v.setUint32(0, 11, true);
        this.kl_change_screen(data);
    }
    kl_conway(speed, generations, fill) {
        var data = new ArrayBuffer(16);
        var v = new DataView(data);
        v.setUint32(0, 12, true);
        v.setUint32(4, speed, true);
        v.setUint32(8, generations, true);
        if (fill)
            v.setUint32(12, 1, true);
        else
            v.setUint32(12, 0, true);
        this.kl_change_screen(data);
    }
    onMessage(autoc4, message) { }
    onConnect(autoc4, o) { }
    onConnectionFailure(autoc4, error) { }
}
AutoC4.registerModule("kitchenlight", () => new AutoC4Kitchenlight());
//# sourceMappingURL=kitchenlight.js.map