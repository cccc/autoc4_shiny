import type EventEmitter from "eventemitter3";
import { LitElement, css, html, unsafeCSS } from "lit";
import { property, state } from "lit/decorators.js";

import type { AutoC4 } from "@/autoc4/autoc4";
import { button } from "@/styles/button";

import bulb_off from "./bulb_off.png";
import bulb_on from "./bulb_on.png";
import power_off from "./power_off.png";
import power_on from "./power_on.png";

const styles = css`
button {
    width: 120px;
    height: 120px;
    aspect-ratio: 1/1;
    padding: 0;
    padding-top: 10px;
    background-image: url(${unsafeCSS(bulb_off)});
    background-position: center top;
    background-size: 50% auto;
    background-repeat: no-repeat;
    background-origin: content-box;
    font-size: 1em;
    line-height: 180px;
    color: #ffffff;
    background-color: #ff0039;
    border: 1px solid #ff0039;
    margin: 2px;
    margin-top: 4px;

    &:hover,
    &:focus,
    &:active {
        color: #ffffff;
        background-color: #d60030;
        border-color: #c2002b;
    }

    &.on {
        background-image: url(${unsafeCSS(bulb_on)});
        color: #ffffff;
        background-color: #3fb618;
        border-color: #3fb618;

        &:hover,
        &:focus,
        &:active {
            color: #ffffff;
            background-color: #339213;
            border-color: #2c8011;
        }
    }

    &.power {
        background-image: url(${unsafeCSS(power_off)});
        background-size: 70% auto;

        &.on {
            background-image: url(${unsafeCSS(power_on)});
        }
    }
}
`;

export default class LightButton extends LitElement {
	@property({ attribute: "variant" })
	variant: "light" | "power" = "light";
	@property({ attribute: "topic" })
	topic = "";
	@state()
	isOn = false;

	render() {
		return html`
			<button
				class="${this.variant} ${this.isOn ? "on" : ""}"
				@click=${this._onClick}
			>
				<slot />
			</button>
		`;
	}

	_onClick() {
		LightButton.autoc4.sendByte(this.topic, this.isOn ? 0 : 1, true);
	}

	connectedCallback() {
		super.connectedCallback();
		LightButton.eventEmitter.on("lamp-update", this.onLampUpdate, this);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		LightButton.eventEmitter.off("lamp-update", this.onLampUpdate, this);
	}

	private onLampUpdate({
		topic,
		isOn,
	}: { topic: string; isOn: boolean }): void {
		if (topic !== this.topic) return;
		this.isOn = isOn;
	}

	static styles = [button, styles];

	static autoc4: AutoC4;
	static eventEmitter: EventEmitter;
}
