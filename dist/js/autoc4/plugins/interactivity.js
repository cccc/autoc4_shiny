class AutoC4Interactivity {
    init(autoc4, options) {
        this.options = options;
        this.autoc4 = autoc4;
        const self = this;
        $('body').on("click change input", `[${this.options.mqttTopicDataAttibute}]`, function (event) {
            event.preventDefault();
            if (this.hasAttribute(self.options.mqttMessageDataAttribute)) {
                self.autoc4.sendData(this.getAttribute(self.options.mqttTopicDataAttibute), this.getAttribute(self.options.mqttMessageDataAttribute), Boolean(this.getAttribute(self.options.mqttRetainedDataAttribute)));
            }
            else if (this.hasAttribute(self.options.mqttByteMessageDataAttribute)) {
                self.autoc4.sendByte(this.getAttribute(self.options.mqttTopicDataAttibute), Number(this.getAttribute(self.options.mqttByteMessageDataAttribute)), Boolean(this.getAttribute(self.options.mqttRetainedDataAttribute)));
            }
            else {
                self.autoc4.sendByte(this.getAttribute(self.options.mqttTopicDataAttibute), 0, Boolean(this.getAttribute(self.options.mqttRetainedDataAttribute)));
            }
        });
        return this;
    }
    onMessage(autoc4, message) { }
    onConnect(autoc4, o) { }
    onConnectionFailure(autoc4, error) { }
}
export default (autoc4) => autoc4.registerModule("interactivity", () => new AutoC4Interactivity());
