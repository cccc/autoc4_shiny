class AutoC4Music {
    init(autoc4, options) {
        this.autoc4 = autoc4;
        this.options = options;
        return this;
    }
    onMessage(autoc4, message) {
        let elements = document.querySelectorAll(`[${this.options.roleDataAttribute}=state][${this.options.topicDataAttribute}="${message.destinationName}"]`);
        for (let e of elements) {
            if (message.payloadString === "play") {
                e.classList.add(this.options.playingClass);
                e.classList.remove(this.options.pausedClass, this.options.stoppedClass);
            }
            else if (message.payloadString === "pause") {
                e.classList.add(this.options.pausedClass);
                e.classList.remove(this.options.playingClass, this.options.stoppedClass);
            }
            else if (message.payloadString === "stop") {
                e.classList.add(this.options.stoppedClass);
                e.classList.remove(this.options.playingClass, this.options.pausedClass);
            }
        }
        elements = document.querySelectorAll(`[${this.options.roleDataAttribute}=song][${this.options.topicDataAttribute}="${message.destinationName}"]`);
        for (let e of elements) {
            e.innerText = message.payloadString;
        }
    }
    onConnect(autoc4, o) { }
    onConnectionFailure(autoc4, error) { }
}
AutoC4.registerModule("music", () => new AutoC4Music());

//# sourceMappingURL=music.js.map
