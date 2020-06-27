class AutoC4Light {
    init(autoc4, options) {
        this.autoc4 = autoc4;
        this.options = options;
        this.initLightButtons();
        return this;
    }
    initLightButtons() {
        const self = this;
        $("body").on("click", `[${this.options.topicDataAttribute}]`, function () {
            self.autoc4.sendByte(this.getAttribute(self.options.topicDataAttribute), this.classList.contains(self.options.onClass) ? 0 : 1, true);
        });
    }
    onMessage(autoc4, message) {
        var button = $(`[${this.options.topicDataAttribute}="${message.destinationName}"]`);
        if (button && message.payloadBytes[0] !== 0)
            button.addClass(this.options.onClass);
        else
            button.removeClass(this.options.onClass);
    }
    onConnect(autoc4, o) { }
    onConnectionFailure(autoc4, error) { }
}
export default (autoc4) => autoc4.registerModule("light", () => new AutoC4Light());
