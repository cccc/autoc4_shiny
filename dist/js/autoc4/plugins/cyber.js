class AutoC4Cyber {
    init(autoc4, options) {
        if (this.options = options, this.autoc4 = autoc4, this.options.keys) {
            let cursor = 0;
            document.addEventListener("keydown", (e => {
                cursor = e.keyCode == this.options.keys[cursor] ? cursor + 1 : 0, cursor == this.options.keys.length && (document.querySelectorAll(this.options.target).forEach((e => e.classList.toggle(this.options.class))), 
                cursor = 0);
            }));
        }
        return this;
    }
    onMessage(autoc4, message) {
        message.payloadBytes[0] ? document.querySelectorAll(this.options.target).forEach((e => e.classList.add(this.options.class))) : document.querySelectorAll(this.options.target).forEach((e => e.classList.remove(this.options.class)));
    }
    onConnect(autoc4, o) {}
    onConnectionFailure(autoc4, error) {}
}

export default autoc4 => autoc4.registerModuleType("cyber", (() => new AutoC4Cyber));
//# sourceMappingURL=cyber.js.map
