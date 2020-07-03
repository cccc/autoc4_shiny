import { simpleDateFormat } from '../utils.js';
class AutoC4Time {
    init(autoc4, options) {
        this.options = options;
        if (this.options.defaultToCurrentTime) {
            this.setTime(new Date());
        }
        return this;
    }
    onMessage(autoc4, message) {
        if (message.payloadBytes.byteLength < 7) {
            console.warn(`Received invalid time payload on topic "${message.destinationName}".`);
            return;
        }
        const bytes = message.payloadBytes;
        const now = new Date();
        const time = new Date((now.getFullYear() - now.getFullYear() % 100) + bytes[7], bytes[5] - 1, bytes[6], bytes[0], bytes[1], bytes[2]);
        this.setTime(time);
    }
    setTime(time) {
        const targets = document.querySelectorAll(this.options.targetSelector);
        for (const target of targets) {
            target.textContent = simpleDateFormat(target.getAttribute(this.options.templateDataAttribute) || "yyyy-MM-ddZHH-mm-ss", time);
        }
    }
    onConnect(autoc4, o) { }
    onConnectionFailure(autoc4, error) { }
}
export default (autoc4) => autoc4.registerModuleType("time", () => new AutoC4Time());

//# sourceMappingURL=time.js.map
