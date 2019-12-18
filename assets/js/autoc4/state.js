class AutoC4State {
    init(autoc4, options) {
        this.autoc4 = autoc4;
        return this;
    }
    onMessage(autoc4, message) {
        if (message.destinationName != "club/status")
            return;
        let icon = $('#club-status .fa');
        let text = $('#club-status :last-child');
        if (message.payloadBytes[0]) {
            icon.removeClass('fa-hand-point-right fa-thumbs-down fa-exclamation-circle')
                .addClass('fa-thumbs-up');
            icon.css('color', '#0c0');
            text.text('Open');
        }
        else {
            icon.removeClass('fa-hand-point-right fa-thumbs-up fa-exclamation-circle')
                .addClass('fa-thumbs-down');
            icon.css('color', '#c00');
            text.text('Closed');
        }
    }
    onConnect(autoc4, o) { }
    onConnectionFailure(autoc4, error) {
        let icon = $('#club-status .fa');
        let text = $('#club-status :last-child');
        icon.removeClass('fa-thumbs-down fa-thumbs-up')
            .addClass('fa-exclamation-circle');
        icon.css('color', '#a00');
        text.text('Disconnected');
    }
}
AutoC4.registerModule("state", () => new AutoC4State());
//# sourceMappingURL=state.js.map