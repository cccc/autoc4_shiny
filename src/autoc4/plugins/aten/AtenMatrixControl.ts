import type EventEmitter from "eventemitter3";
import { css, html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";

import type { AutoC4 } from "@/autoc4/autoc4";
import { button } from "@/styles/button";

const OUTPUTS = ["01", "02", "03", "04"] as const;
const INPUTS = ["01", "02", "03", "04"] as const;

export default class AtenMatrixControl extends LitElement {
	@property({ attribute: "topic" })
	topic = "";

	@state()
	private connected = false;

	@state()
	private routingState: Record<string, string[]> = {};

	connectedCallback() {
		super.connectedCallback();
		const ee = AtenMatrixControl.eventEmitter;
		ee.on("aten-connection", this.onConnection, this);
		ee.on("aten-state", this.onState, this);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		const ee = AtenMatrixControl.eventEmitter;
		ee.off("aten-connection", this.onConnection, this);
		ee.off("aten-state", this.onState, this);
	}

	private onConnection({
		topic,
		online,
	}: { topic: string; online: boolean }): void {
		if (topic !== this.topic) return;
		this.connected = online;
	}

	private onState({
		topic,
		state,
	}: { topic: string; state: Record<string, string[]> }): void {
		if (topic !== this.topic) return;
		this.routingState = state;
	}

	private onButtonClick(inputIndex: string, outputIndex: string) {
		AtenMatrixControl.autoc4.sendData(
			`${this.topic}/cmd`,
			`sw i${inputIndex} o${outputIndex}`,
			false,
		);
	}

	private isActive(inputIndex: string, outputIndex: string): boolean {
		return (
			outputIndex in this.routingState &&
			this.routingState[outputIndex][0] === inputIndex
		);
	}

	render() {
		const disabled = !this.connected;

		return html`
			<div class="matrix ${this.connected ? "online" : "offline"}">
				<table>
					${OUTPUTS.map(
						(out, i) => html`
						<tr>
							<td class="row-label">OUT ${i + 1}</td>
							${INPUTS.map(
								(inp, j) => html`
								<td>
									<button
										class="${this.isActive(inp, out) ? "active" : ""}"
										?disabled=${disabled}
										title="Set output ${i + 1} to input ${j + 1}"
										@click=${() => this.onButtonClick(inp, out)}
									>IN ${j + 1}</button>
								</td>
							`,
							)}
						</tr>
					`,
					)}
					<tr class="spacer"><td colspan="5"></td></tr>
					<tr>
						<td class="row-label">Set all</td>
						${INPUTS.map(
							(inp, j) => html`
							<td>
								<button
									?disabled=${disabled}
									title="Set all outputs to input ${j + 1}"
									@click=${() => this.onButtonClick(inp, "*")}
								>IN ${j + 1}</button>
							</td>
						`,
						)}
					</tr>
				</table>
			</div>
		`;
	}

	static styles = [
		button,
		css`
			:host {
				display: block;
			}

			table {
				border-collapse: separate;
				border-spacing: 2px;
			}

			.row-label {
				font-size: 1rem;
				padding-right: 1em;
				white-space: nowrap;
			}

			.spacer td {
				height: 0.75rem;
			}

			button {
				width: 3.5em;
				height: 3.5em;
				margin: 0;
				font-size: 0.9rem;
				color: #fff;
				background-color: #666;
				border-color: #666;

				&:hover:not(:disabled) {
					background-color: #777;
					border-color: #777;
				}

				&.active {
					background-color: #ef4545;
					border-color: #ef4545;

					&:hover:not(:disabled) {
						background-color: #d63c3c;
						border-color: #d63c3c;
					}
				}

				&:disabled {
					opacity: 0.4;
					cursor: not-allowed;
				}
			}
		`,
	];

	static autoc4: AutoC4;
	static eventEmitter: EventEmitter;
}
