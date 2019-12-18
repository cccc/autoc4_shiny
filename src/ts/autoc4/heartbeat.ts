/**
 * @copyright Chaos Computer Club Cologne 2014-2019
 * @license MIT
 */
/// <reference path="autoc4.ts" />

type HeartbeatEntry = {element:JQuery<HTMLElement>,state_icon:JQuery<HTMLElement>};

class AutoC4Heartbeat implements AutoC4Module {
    private autoc4: AutoC4;
    private heartbeats: {[key:string]:HeartbeatEntry} = {}; 

    public init(autoc4: AutoC4, options: any): this {
        this.autoc4=autoc4;
        return this;
    }

    public onMessage(autoc4: AutoC4, message: Paho.MQTT.Message): void {
        if (!message.destinationName.startsWith('heartbeat/'))
            return;
        // update .box-window state
        var name = message.destinationName.substring('heartbeat/'.length);
        if (!(name in this.heartbeats)) {
            this.heartbeats[name] = this.createEntry(name);
            $("#infrastructure-table").append(this.heartbeats[name].element)
        }
        if (!(message.payloadBytes as Uint8Array).length) {
            this.heartbeats[name].element.remove();
            delete this.heartbeats[name]
        }

        if ((message.payloadBytes as Uint8Array)[0])
            this.heartbeats[name].state_icon.addClass('fa-thumbs-up').removeClass('fa-thumbs-down');
        else
            this.heartbeats[name].state_icon.addClass('fa-thumbs-down').removeClass('fa-thumbs-up');
    }
    
    public createEntry(name: string) : HeartbeatEntry {
        let entry = {
            element:
                $("<tr>")
                    .append(
                        $("<td>")
                            .addClass("heartbeat-name")
                            .text(name)
                    ),
            state_icon:
                $("<i>")
                    .addClass("heartbeat-state-icon fa")
                    .attr("data-heartbeat-name", name)
        }
        entry.element.append(
            $("<td>")
                .addClass("heartbeat-state")
                .append(entry.state_icon)
        )
        return entry;
    };
    onConnect(autoc4: AutoC4, o: Paho.MQTT.WithInvocationContext): void {}
    onConnectionFailure(autoc4: AutoC4, error: Paho.MQTT.MQTTError): void {}
}

AutoC4.registerModule("heartbeat", () => new AutoC4Heartbeat());
