class AutoC4Cyber {
    init(autoc4, options) {
        this.options = options;
        this.autoc4 = autoc4;
        return this;
    }
    onMessage(autoc4, message) {
        if (message.payloadBytes[0]) {
            document.body.classList.add("cyber");
        }
        else {
            document.body.classList.remove("cyber");
        }
    }
    onConnect(autoc4, o) { }
    onConnectionFailure(autoc4, error) { }
}
AutoC4.registerModule("cyber", () => new AutoC4Cyber());
//# sourceMappingURL=cyber.js.map