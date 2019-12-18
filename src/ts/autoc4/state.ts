/**
 * @copyright Chaos Computer Club Cologne 2014-2019
 * @license MIT
 */
/// <reference path="autoc4.ts" />;

class AutoC4State implements AutoC4Module {
    private autoc4: AutoC4;

    public init(autoc4: AutoC4, options: any): this {
        this.autoc4=autoc4;
        return this;
    }

    public onMessage(autoc4: AutoC4, message: Paho.MQTT.Message): void {
        if (message.destinationName != "club/status")
            return;
        
        let icon = $('#club-status .fa');
        let text = $('#club-status :last-child');
        if ((message.payloadBytes as Uint8Array)[0]) {
            icon.removeClass('fa-hand-point-right fa-thumbs-down fa-exclamation-circle')
                .addClass('fa-thumbs-up');
            icon.css('color', '#0c0');
            text.text('Open');
        } else {
            icon.removeClass('fa-hand-point-right fa-thumbs-up fa-exclamation-circle')
                .addClass('fa-thumbs-down');
            icon.css('color', '#c00');
            text.text('Closed');
        }
    }

    onConnect(autoc4: AutoC4, o: Paho.MQTT.WithInvocationContext): void {}
    onConnectionFailure(autoc4: AutoC4, error: Paho.MQTT.MQTTError): void {
        let icon = $('#club-status .fa');
        let text = $('#club-status :last-child');
        icon.removeClass('fa-thumbs-down fa-thumbs-up')
            .addClass('fa-exclamation-circle');
        icon.css('color', '#a00');
        text.text('Disconnected');
    }
}

AutoC4.registerModule("state", () => new AutoC4State());
