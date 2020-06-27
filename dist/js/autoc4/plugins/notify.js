const _notificationQueue = [];
let _currentNotificationTimeout = undefined;
const _notificationContainer = document.createElement("div");
_notificationContainer.classList.add("notify-container");
export function setMessage(node) {
    if (document.body.contains(_notificationContainer))
        document.body.removeChild(_notificationContainer);
    _notificationContainer.textContent = "";
    if (node) {
        _notificationContainer.appendChild(node);
        document.body.appendChild(_notificationContainer);
    }
}
export function nextMessage() {
    const message = _notificationQueue.shift();
    if (message === undefined) {
        _currentNotificationTimeout = undefined;
        setMessage(undefined);
    }
    else {
        _currentNotificationTimeout = setTimeout(nextMessage, message && message.duration);
        setMessage(message && message.node);
    }
}
export function notify(message, duration) {
    if (message instanceof Node) {
        _notificationQueue.push({
            node: message,
            duration: duration || 1500
        });
    }
    else {
        const div = document.createElement("div");
        div.classList.add("notify-message");
        div.appendChild(document.createTextNode(message));
        _notificationQueue.push({
            node: div,
            duration: duration || 1500
        });
    }
    if (_currentNotificationTimeout === undefined)
        nextMessage();
}
class AutoC4Notify {
    init(autoc4, options) {
        this.options = options;
        this.autoc4 = autoc4;
        return this;
    }
    onMessage(autoc4, message) {
        const payload = message.payloadString;
        let textContent = this.options.textTemplate.split(this.options.payloadStringPlaceholder).join("");
        notify(textContent, this.options.hideDelayMs);
    }
    onConnect(autoc4, o) { }
    onConnectionFailure(autoc4, error) { }
}
export default (autoc4) => autoc4.registerModule("notify", () => new AutoC4Notify());
