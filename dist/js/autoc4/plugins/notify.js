const _notificationQueue = [];

let _currentNotificationTimeout;

const _notificationContainer = document.createElement("div");

_notificationContainer.classList.add("notify-container");

export function setMessage(node) {
    document.body.contains(_notificationContainer) && document.body.removeChild(_notificationContainer), 
    _notificationContainer.textContent = "", node && (_notificationContainer.appendChild(node), 
    document.body.appendChild(_notificationContainer));
}

export function nextMessage() {
    const message = _notificationQueue.shift();
    void 0 === message ? (_currentNotificationTimeout = void 0, setMessage(void 0)) : (_currentNotificationTimeout = setTimeout(nextMessage, message && message.duration), 
    setMessage(message && message.node));
}

export function notify(message, duration) {
    if (message instanceof Node) _notificationQueue.push({
        node: message,
        duration: duration || 1500
    }); else {
        const div = document.createElement("div");
        div.classList.add("notify-message"), div.appendChild(document.createTextNode(message)), 
        _notificationQueue.push({
            node: div,
            duration: duration || 1500
        });
    }
    void 0 === _currentNotificationTimeout && nextMessage();
}

class AutoC4Notify {
    init(autoc4, options) {
        return this.options = options, this.autoc4 = autoc4, this;
    }
    onMessage(autoc4, message) {
        message.payloadString, notify(this.options.textTemplate.split(this.options.payloadStringPlaceholder).join(""), this.options.hideDelayMs);
    }
    onConnect(autoc4, o) {}
    onConnectionFailure(autoc4, error) {}
}

export default autoc4 => autoc4.registerModuleType("notify", (() => new AutoC4Notify));
//# sourceMappingURL=notify.js.map
