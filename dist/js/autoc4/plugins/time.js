import { simpleDateFormat } from '../utils.js';
class AutoC4Time {
    init(autoc4, options) {
        this.options = options;
        return this;
    }
    onMessage(autoc4, message) {
        if (message.payloadBytes.byteLength < 7) {
            console.warn(`Received invalid time payload on topic "${message.destinationName}".`);
            return;
        }
        const targets = document.querySelectorAll(this.options.targetSelector);
        if (targets.length === 0)
            return;
        const bytes = message.payloadBytes;
        const now = new Date();
        const date = new Date((now.getFullYear() - now.getFullYear() % 100) + bytes[7], bytes[5] - 1, bytes[6], bytes[0], bytes[1], bytes[2]);
        for (const target of targets) {
            target.textContent = simpleDateFormat(target.getAttribute(this.options.templateDataAttribute) || "yyyy-MM-ddZhh-mm-ss", date);
        }
    }
    onConnect(autoc4, o) { }
    onConnectionFailure(autoc4, error) { }
}
export default (autoc4) => autoc4.registerModuleType("time", () => new AutoC4Time());

//# sourceMappingURL=time.js.map
