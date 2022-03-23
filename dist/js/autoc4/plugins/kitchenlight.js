class AutoC4Kitchenlight {
    init(autoc4, options) {
        this.autoc4 = autoc4, $("#klMatrixLines").on("input", (function(ev) {
            $("#klMatrixLinesOut").val(parseInt(this.value));
        })), $("#klConwaySpeed").on("input", (function(ev) {
            $("#klConwaySpeedOut").val(parseInt(this.value));
        })), $("#klConwayGenerations").on("input", (function(ev) {
            $("#klConwayGenerationsOut").val(parseInt(this.value));
        })), $("#klSelect").change((function(ev) {
            $(".klPane.active").removeClass("active"), $("#" + this.value).addClass("active");
        }));
        let _self = this;
        return $("#klSet").click((function(ev) {
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
            }
        })), $(".klPane.active").removeClass("active"), $("#" + $("#klSelect").val()).addClass("active"), 
        $(".btn-floodit").click((function(ev) {
            var i = parseInt(this.textContent) - 1;
            return autoc4.sendByte("kitchenlight/FloodIt/flood", i, !0);
        })), $("#klFlood").keypress((function(ev) {
            ev.which < 49 || ev.which > 56 || ($("#klFlood" + (ev.which - 48)).click(), ev.preventDefault());
        })), this;
    }
    kl_change_screen(data) {
        this.autoc4.sendData("kitchenlight/change_screen", data, !0);
    }
    kl_empty() {
        var data = new ArrayBuffer(4);
        new DataView(data).setUint32(0, 0, !0), this.kl_change_screen(data);
    }
    kl_checker(delay, colA, colB) {
        let data = new ArrayBuffer(20), v = new DataView(data);
        v.setUint32(0, 1, !0), v.setUint32(4, delay, !0), v.setUint16(8, 0x3ff * parseInt(colA.substr(1, 2), 16) / 0xff, !0), 
        v.setUint16(10, 0x3ff * parseInt(colA.substr(3, 2), 16) / 0xff, !0), v.setUint16(12, 0x3ff * parseInt(colA.substr(5, 2), 16) / 0xff, !0), 
        v.setUint16(14, 0x3ff * parseInt(colB.substr(1, 2), 16) / 0xff, !0), v.setUint16(16, 0x3ff * parseInt(colB.substr(3, 2), 16) / 0xff, !0), 
        v.setUint16(18, 0x3ff * parseInt(colB.substr(5, 2), 16) / 0xff, !0), this.kl_change_screen(data);
    }
    kl_matrix(lines) {
        let data = new ArrayBuffer(8), v = new DataView(data);
        v.setUint32(0, 2, !0), v.setUint32(4, lines, !0), this.kl_change_screen(data);
    }
    kl_moodlight(mode) {
        let data, v;
        1 === mode ? (data = new ArrayBuffer(19), v = new DataView(data), v.setUint32(0, 3, !0), 
        v.setUint8(4, mode), v.setUint32(5, 1, !0), v.setUint32(9, 10, !0), v.setUint32(13, 10000, !0), 
        v.setUint16(17, 30, !0), this.kl_change_screen(data)) : (data = new ArrayBuffer(17), 
        v = new DataView(data), v.setUint32(0, 3, !0), v.setUint8(4, mode), v.setUint32(5, 1, !0), 
        v.setUint32(9, 10, !0), v.setUint32(13, 10000, !0), this.kl_change_screen(data));
    }
    kl_open_chaos(delay) {
        let data = new ArrayBuffer(8), v = new DataView(data);
        v.setUint32(0, 4, !0), v.setUint32(4, delay, !0), this.kl_change_screen(data);
    }
    kl_pacman() {
        var data = new ArrayBuffer(4);
        new DataView(data).setUint32(0, 5, !0), this.kl_change_screen(data);
    }
    kl_sine() {
        var data = new ArrayBuffer(4);
        new DataView(data).setUint32(0, 6, !0), this.kl_change_screen(data);
    }
    kl_strobe() {
        var data = new ArrayBuffer(4);
        new DataView(data).setUint32(0, 7, !0), this.kl_change_screen(data);
    }
    kl_text(delay, text) {
        var data = new ArrayBuffer(8 + text.length + 1), v = new DataView(data);
        v.setUint32(0, 8, !0), v.setUint32(4, delay, !0);
        for (var i = 0; i < text.length; i += 1) v.setUint8(8 + i, 0xff & text.charCodeAt(i));
        v.setUint8(8 + text.length, 0), this.kl_change_screen(data);
    }
    kl_flood() {
        var data = new ArrayBuffer(4);
        new DataView(data).setUint32(0, 9, !0), this.kl_change_screen(data);
    }
    kl_clock() {
        var data = new ArrayBuffer(4);
        new DataView(data).setUint32(0, 11, !0), this.kl_change_screen(data);
    }
    kl_conway(speed, generations, fill) {
        var data = new ArrayBuffer(16), v = new DataView(data);
        v.setUint32(0, 12, !0), v.setUint32(4, speed, !0), v.setUint32(8, generations, !0), 
        fill ? v.setUint32(12, 1, !0) : v.setUint32(12, 0, !0), this.kl_change_screen(data);
    }
    onMessage(autoc4, message) {}
    onConnect(autoc4, o) {}
    onConnectionFailure(autoc4, error) {}
}

export default autoc4 => autoc4.registerModuleType("kitchenlight", (() => new AutoC4Kitchenlight));
//# sourceMappingURL=kitchenlight.js.map
