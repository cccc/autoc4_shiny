class AutoC4Presets {
    init(autoc4, options) {
        this.autoc4 = autoc4;
        $("body").on("click", "[data-preset-topic]", function (e) {
            var $this = $(this);
            autoc4.sendData($this.attr("data-preset-topic"), $this.attr("data-preset-message"));
        });
        return this;
    }
    create_button(room, preset) {
        return $("<button>", {
            "type": "button",
            "class": "btn btn-preset",
            "data-preset-topic": room === "global" ? "preset/set" : "preset/" + room + "/set",
            "data-preset-message": preset
        }).text(preset);
    }
    ;
    onMessage(autoc4, message) {
        let presets;
        try {
            presets = JSON.parse(message.payloadString);
        }
        catch (e) {
            console.log("Invalid JSON received");
        }
        var room = message.destinationName.split("/")[1];
        if (room === "list") {
            room = "global";
            for (let element of document.querySelectorAll("div.preset-pane[data-room]")) {
                let marker = element.querySelector(".preset-pane-global-marker");
                var r = element.getAttribute("data-room");
                for (var pre of presets) {
                    this.create_button(r, pre).insertBefore(marker);
                }
            }
        }
        let marker = document.querySelector("div.preset-pane[data-room=\"" + room + "\"] > .preset-pane-room-marker");
        for (var pre of presets) {
            this.create_button(room, pre).insertBefore(marker);
        }
    }
    onConnect(autoc4, o) {
        $("div.preset-pane[data-room] > [data-preset-topic]").remove();
    }
    onConnectionFailure(autoc4, error) { }
}
export default (autoc4) => autoc4.registerModuleType("presets", () => new AutoC4Presets());

//# sourceMappingURL=presets.js.map
