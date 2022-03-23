class AutoC4Windows {
    init(autoc4, options) {
        return this.autoc4 = autoc4, this;
    }
    onMessage(autoc4, message) {
        let button = $(".box-window").filter('[data-topic="' + message.destinationName + '"]');
        button && 0 !== message.payloadBytes[0] ? button.addClass("open") : button.removeClass("open");
    }
    onConnect(autoc4, o) {}
    onConnectionFailure(autoc4, error) {}
}

export default autoc4 => autoc4.registerModuleType("windows", (() => new AutoC4Windows));
//# sourceMappingURL=windows.js.map
