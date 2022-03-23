class AutoC4Music {
    init(autoc4, options) {
        return this.autoc4 = autoc4, this.options = options, this;
    }
    onMessage(autoc4, message) {
        let elements = document.querySelectorAll(`[${this.options.roleDataAttribute}=state][${this.options.topicDataAttribute}="${message.destinationName}"]`);
        for (let e of elements) "play" === message.payloadString ? (e.classList.add(this.options.playingClass), 
        e.classList.remove(this.options.pausedClass, this.options.stoppedClass)) : "pause" === message.payloadString ? (e.classList.add(this.options.pausedClass), 
        e.classList.remove(this.options.playingClass, this.options.stoppedClass)) : "stop" === message.payloadString && (e.classList.add(this.options.stoppedClass), 
        e.classList.remove(this.options.playingClass, this.options.pausedClass));
        elements = document.querySelectorAll(`[${this.options.roleDataAttribute}=song][${this.options.topicDataAttribute}="${message.destinationName}"]`);
        for (let e of elements) e.innerText = message.payloadString;
    }
    onConnect(autoc4, o) {}
    onConnectionFailure(autoc4, error) {}
}

export default autoc4 => autoc4.registerModuleType("music", (() => new AutoC4Music));
//# sourceMappingURL=music.js.map
