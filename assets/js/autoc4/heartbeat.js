class AutoC4Heartbeat {
    constructor() {
        this.heartbeats = {};
    }
    init(autoc4, options) {
        this.autoc4 = autoc4;
        return this;
    }
    onMessage(autoc4, message) {
        var name = message.destinationName.substring('heartbeat/'.length);
        if (!(name in this.heartbeats)) {
            this.heartbeats[name] = this.createEntry(name);
            $("#infrastructure-table").append(this.heartbeats[name].element);
        }
        if (!message.payloadBytes.length) {
            this.heartbeats[name].element.remove();
            delete this.heartbeats[name];
        }
        if (message.payloadBytes[0])
            this.heartbeats[name].state_icon.addClass('fa-thumbs-up').removeClass('fa-thumbs-down');
        else
            this.heartbeats[name].state_icon.addClass('fa-thumbs-down').removeClass('fa-thumbs-up');
    }
    createEntry(name) {
        let entry = {
            element: $("<tr>")
                .append($("<td>")
                .addClass("heartbeat-name")
                .text(name)),
            state_icon: $("<i>")
                .addClass("heartbeat-state-icon fa")
                .attr("data-heartbeat-name", name)
        };
        entry.element.append($("<td>")
            .addClass("heartbeat-state")
            .append(entry.state_icon));
        return entry;
    }
    ;
    onConnect(autoc4, o) { }
    onConnectionFailure(autoc4, error) { }
}
AutoC4.registerModule("heartbeat", () => new AutoC4Heartbeat());

//# sourceMappingURL=heartbeat.js.map
