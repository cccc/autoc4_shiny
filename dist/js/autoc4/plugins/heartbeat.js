class AutoC4Heartbeat {
    constructor() {
        this.heartbeats = {};
    }
    init(autoc4, options) {
        return this.autoc4 = autoc4, this;
    }
    onMessage(autoc4, message) {
        var name = message.destinationName.substring("heartbeat/".length);
        name in this.heartbeats || (this.heartbeats[name] = this.createEntry(name), $("#infrastructure-table").append(this.heartbeats[name].element)), 
        message.payloadBytes.length || (this.heartbeats[name].element.remove(), delete this.heartbeats[name]), 
        message.payloadBytes[0] ? this.heartbeats[name].state_icon.addClass("fa-thumbs-up").removeClass("fa-thumbs-down") : this.heartbeats[name].state_icon.addClass("fa-thumbs-down").removeClass("fa-thumbs-up");
    }
    createEntry(name) {
        let entry = {
            element: $("<tr>").append($("<td>").addClass("heartbeat-name").text(name)),
            state_icon: $("<i>").addClass("heartbeat-state-icon fa").attr("data-heartbeat-name", name)
        };
        return entry.element.append($("<td>").addClass("heartbeat-state").append(entry.state_icon)), 
        entry;
    }
    onConnect(autoc4, o) {}
    onConnectionFailure(autoc4, error) {}
}

export default autoc4 => autoc4.registerModuleType("heartbeat", (() => new AutoC4Heartbeat));
//# sourceMappingURL=heartbeat.js.map
