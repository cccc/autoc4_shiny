class AutoC4State {
    init(autoc4, options) {
        return this.options = options, this;
    }
    onMessage(autoc4, message) {
        let targets = document.querySelectorAll(this.options.target);
        message.payloadBytes[0] ? targets.forEach((e => {
            e.classList.remove(this.options.closedClass, this.options.disconnectedClass), e.classList.add(this.options.openClass);
        })) : targets.forEach((e => {
            e.classList.remove(this.options.openClass, this.options.disconnectedClass), e.classList.add(this.options.closedClass);
        }));
    }
    onConnect(autoc4, o) {}
    onConnectionFailure(autoc4, error) {
        document.querySelectorAll(this.options.target).forEach((e => {
            e.classList.remove(this.options.openClass, this.options.closedClass), e.classList.add(this.options.disconnectedClass);
        }));
    }
}

export default autoc4 => autoc4.registerModuleType("state", (() => new AutoC4State));
//# sourceMappingURL=state.js.map
