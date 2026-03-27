import type EventEmitter from "eventemitter3";
import { css, html, LitElement, nothing } from "lit";
import { state } from "lit/decorators.js";

import type { AutoC4 } from "@/autoc4/autoc4";
import { button } from "@/styles/button";

interface BusleisteModuleData {
	name: string;
	humanName: string;
	exists: boolean;
	enabled: boolean | undefined;
}

export default class BusleisteControl extends LitElement {
	@state()
	private modules: Map<string, BusleisteModuleData> = new Map();

	@state()
	private activeModule: string | undefined;

	@state()
	private activeInterrupt: string | undefined;

	connectedCallback() {
		super.connectedCallback();
		const ee = BusleisteControl.eventEmitter;
		ee.on("busleiste-modules", this.onModulesList, this);
		ee.on("busleiste-enabled", this.onModuleEnabled, this);
		ee.on("busleiste-active-module", this.onActiveModule, this);
		ee.on("busleiste-active-interrupt", this.onActiveInterrupt, this);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		const ee = BusleisteControl.eventEmitter;
		ee.off("busleiste-modules", this.onModulesList, this);
		ee.off("busleiste-enabled", this.onModuleEnabled, this);
		ee.off("busleiste-active-module", this.onActiveModule, this);
		ee.off("busleiste-active-interrupt", this.onActiveInterrupt, this);
	}

	private onModulesList(
		moduleMap: Record<string, [string, string]>,
	): void {
		for (const mod of this.modules.values()) {
			mod.exists = false;
		}

		for (const value of Object.values(moduleMap)) {
			const [name, humanName] = value;
			if (!this.modules.has(name)) {
				this.modules.set(name, {
					name,
					humanName,
					exists: true,
					enabled: undefined,
				});
			} else {
				const mod = this.modules.get(name)!;
				mod.humanName = humanName;
				mod.exists = true;
				mod.enabled = undefined;
			}
		}

		for (const [name, mod] of this.modules) {
			if (!mod.exists) this.modules.delete(name);
		}

		this.modules = new Map(this.modules);
	}

	private onModuleEnabled({
		name,
		enabled,
	}: { name: string; enabled: boolean }): void {
		if (!this.modules.has(name)) return;
		this.modules.get(name)!.enabled = enabled;
		this.modules = new Map(this.modules);
	}

	private onActiveModule(name: string): void {
		this.activeModule = name;
	}

	private onActiveInterrupt(name: string | undefined): void {
		this.activeInterrupt = name;
	}

	private onActivateClick(moduleName: string) {
		BusleisteControl.autoc4.sendData(
			"busleiste/change_module",
			moduleName,
			true,
		);
	}

	private onEnableClick(moduleName: string) {
		const mod = this.modules.get(moduleName);
		if (!mod) return;
		BusleisteControl.autoc4.sendByte(
			`busleiste/modules/${moduleName}/enabled`,
			mod.enabled ? 0 : 1,
			true,
		);
	}

	private onTextSubmit(e: Event) {
		e.preventDefault();
		const card = (e.target as HTMLElement).closest(".module-card");
		const textarea = card?.querySelector("textarea");
		if (!textarea) return;
		const text = textarea.value;
		if (text === "") {
			BusleisteControl.autoc4.sendData(
				"busleiste/modules/Text/settings",
				"",
				true,
			);
		} else {
			const lines = text.split("\n");
			while (lines.length < 4) lines.push("");
			BusleisteControl.autoc4.sendData(
				"busleiste/modules/Text/settings",
				JSON.stringify(lines),
				true,
			);
		}
	}

	private getModuleState(name: string): "active" | "paused" | "inactive" {
		if (this.activeModule === undefined) return "inactive";
		if (
			name === this.activeInterrupt ||
			(name === this.activeModule &&
				this.activeInterrupt === undefined)
		) {
			return "active";
		}
		if (
			name === this.activeModule &&
			this.activeInterrupt !== undefined
		) {
			return "paused";
		}
		return "inactive";
	}

	private getActivateClass(name: string): string {
		if (this.activeModule === undefined) return "unknown";
		return name === this.activeModule ? "active" : "inactive";
	}

	private getEnableClass(mod: BusleisteModuleData): string {
		if (mod.enabled === undefined) return "unknown";
		return mod.enabled ? "enabled" : "disabled";
	}

	render() {
		const existingModules = [...this.modules.values()].filter(
			(m) => m.exists,
		);

		if (existingModules.length === 0) {
			return html`<div class="empty">No modules available</div>`;
		}

		return html`
			<div class="modules">
				${existingModules.map((mod) => this.renderModule(mod))}
			</div>
		`;
	}

	private renderModule(mod: BusleisteModuleData) {
		const moduleState = this.getModuleState(mod.name);
		const activateClass = this.getActivateClass(mod.name);
		const enableClass = this.getEnableClass(mod);

		return html`
			<div class="module-card ${moduleState}">
				<h6>${mod.name}</h6>
				<div class="button-row">
					<button
						class="activate ${activateClass}"
						title="Set as active module"
						@click=${() => this.onActivateClick(mod.name)}
					>&#x23f5;</button>
					<button
						class="enable ${enableClass}"
						title="Enable as interrupt"
						@click=${() => this.onEnableClick(mod.name)}
					>&#x23fb;</button>
				</div>
				${mod.name === "Text"
					? html`
					<div class="text-input">
						<textarea rows="4"></textarea>
						<button class="submit" @click=${this.onTextSubmit}>Submit</button>
					</div>
				`
					: nothing}
			</div>
		`;
	}

	static styles = [
		button,
		css`
			:host {
				display: block;
			}

			.modules {
				display: flex;
				flex-direction: column;
				gap: 0.5rem;
			}

			.empty {
				color: #999;
				padding: 1rem;
			}

			.module-card {
				border: 2px solid #6c757d;
				border-radius: 0.5rem;
				padding: 0.5rem 0.75rem;
				display: flex;
				align-items: center;
				flex-wrap: wrap;
				gap: 0.5rem;

				&.active {
					border-color: #3fb618;
				}

				&.paused {
					border-color: #ff7518;
				}
			}

			.module-card h6 {
				margin: 0;
				font-size: 0.9rem;
				flex: 1;
			}

			.button-row {
				display: flex;
				gap: 0.25rem;
				flex-shrink: 0;
			}

			.activate,
			.enable {
				width: 2.5rem;
				height: 2.5rem;
				font-size: 1.2rem;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.activate.active {
				background-color: #3fb618;
				border-color: #3fb618;
				color: #fff;
			}

			.activate.inactive {
				background-color: #ff0039;
				border-color: #ff0039;
				color: #fff;
			}

			.activate.unknown {
				background-color: #333;
				border-color: #333;
				color: #fff;
			}

			.enable.enabled {
				background-color: #3fb618;
				border-color: #3fb618;
				color: #fff;
			}

			.enable.disabled {
				background-color: #ff0039;
				border-color: #ff0039;
				color: #fff;
			}

			.enable.unknown {
				background-color: #333;
				border-color: #333;
				color: #fff;
			}

			.text-input {
				display: flex;
				gap: 0.5rem;
				align-items: flex-start;
				width: 100%;
			}

			.text-input textarea {
				flex: 1;
				background: var(--bs-body-bg, #fff);
				color: var(--bs-body-color, #000);
				border: 1px solid #555;
				border-radius: 0.25rem;
				padding: 0.25rem 0.5rem;
				font-family: monospace;
				resize: vertical;
			}

			.submit {
				background-color: #0d6efd;
				border-color: #0d6efd;
				color: #fff;
				padding: 0.25rem 0.5rem;

				&:hover {
					background-color: #0b5ed7;
					border-color: #0a58ca;
				}
			}
		`,
	];

	static autoc4: AutoC4;
	static eventEmitter: EventEmitter;
}
