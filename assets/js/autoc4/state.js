class AutoC4State {
    init(autoc4, options) {
        this.autoc4 = autoc4;
        this.options = options;
        return this;
    }
    onMessage(autoc4, message) {
        let targets = document.querySelectorAll(this.options.target);
        if (message.payloadBytes[0]) {
            targets.forEach((e) => {
                e.classList.remove(this.options.closedClass, this.options.disconnectedClass);
                e.classList.add(this.options.openClass);
            });
        }
        else {
            targets.forEach((e) => {
                e.classList.remove(this.options.openClass, this.options.disconnectedClass);
                e.classList.add(this.options.closedClass);
            });
        }
    }
    onConnect(autoc4, o) { }
    onConnectionFailure(autoc4, error) {
        document.querySelectorAll(this.options.target).forEach((e) => {
            e.classList.remove(this.options.openClass, this.options.openClass);
            e.classList.add(this.options.disconnectedClass);
        });
    }
}
AutoC4.registerModule("state", () => new AutoC4State());
//# sourceMappingURL=state.js.map