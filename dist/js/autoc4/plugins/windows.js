class AutoC4Windows {
    init(autoc4, options) {
        this.autoc4 = autoc4;
        return this;
    }
    onMessage(autoc4, message) {
        let button = $('.box-window').filter('[data-topic="' + message.destinationName + '"]');
        if (button && message.payloadBytes[0] !== 0)
            button.addClass('open');
        else
            button.removeClass('open');
    }
    onConnect(autoc4, o) { }
    onConnectionFailure(autoc4, error) { }
}
export default (autoc4) => autoc4.registerModuleType("windows", () => new AutoC4Windows());

//# sourceMappingURL=windows.js.map
