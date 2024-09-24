/**
 * @copyright Chaos Computer Club Cologne 2014-2024
 * @license MIT
 */

import config from "./config.json" with { type: "json" };
import AutoC4Atem from "./plugins/atem/index.js";
import AutoC4Cyber from "./plugins/cyber.js";
import AutoC4DMX from "./plugins/dmx";
import AutoC4Heartbeat from "./plugins/heartbeat.js";
import AutoC4Interactivity from "./plugins/interactivity.js";
import AutoC4Kitchenlight from "./plugins/kitchenlight.js";
import AutoC4Light from "./plugins/light";
import AutoC4Music from "./plugins/music.js";
import AutoC4Notify from "./plugins/notify.js";
import AutoC4Presets from "./plugins/presets.js";
import AutoC4Reload from "./plugins/reload.js";
import AutoC4State from "./plugins/state.js";
import AutoC4Time from "./plugins/time.js";
import AutoC4Windows from "./plugins/windows.js";
import { generateUUID, mqtt_match_topic } from "./utils.js";

declare global {
	var autoc4: AutoC4;
}

export interface AutoC4ModuleConfig {
	type: string;
	options: any;
	subscribe: string[];
	instance: AutoC4Module;
}

export interface AutoC4DebugConfig {
	message: boolean;
	connect: boolean;
	disconnect: boolean;
	configLoaded: boolean;
	pluginLoaded: boolean;
	moduleLoaded: boolean;
	sentMessage: boolean;
}

export interface AutoC4Config {
	server?: string;
	port?: number;
	clientIdPrefix?: string;
	modules: AutoC4ModuleConfig[];
	debug?: AutoC4DebugConfig;
}

export interface AutoC4Module {
	onMessage?(autoc4: AutoC4, message: Paho.Message): void;
	onConnect?(autoc4: AutoC4, o: Paho.WithInvocationContext): void;
	onConnectionFailure?(autoc4: AutoC4, error: Paho.MQTTError): void;
}

function debugMQTTMessageContent(message: Paho.Message) {
	try {
		const payloadString = message.payloadString;
		if (["\u0000", "\u0001"].some((s) => payloadString.includes(s)))
			return message.payloadBytes;
		return { message: payloadString };
	} catch {
		return message.payloadBytes;
	}
}

export type AutoC4ModuleFactory = (
	AutoC4: AutoC4,
	options: any,
) => AutoC4Module;

export class AutoC4 {
	private config: AutoC4Config;
	private readonly modules: AutoC4Module[] = [];
	public readonly client: Paho.Client;

	public constructor(config: AutoC4Config) {
		this.config = config;

		this.client = new Paho.Client(
			config.server || window.location.hostname,
			config.port || 9000,
			(config.clientIdPrefix || "shiny_") + generateUUID(),
		);
		this.client.onMessageArrived = this.onMessage.bind(this);
		this.client.onConnectionLost = this.onConnectionFailure.bind(this);

		this.registerModuleType("interactivity", AutoC4Interactivity);
		this.registerModuleType("light", AutoC4Light);
		this.registerModuleType("dmx", AutoC4DMX);
		this.registerModuleType("state", AutoC4State);
		this.registerModuleType("heartbeat", AutoC4Heartbeat);
		this.registerModuleType("windows", AutoC4Windows);
		this.registerModuleType("presets", AutoC4Presets);
		this.registerModuleType("kitchenlight", AutoC4Kitchenlight);
		this.registerModuleType("music", AutoC4Music);
		this.registerModuleType("notify", AutoC4Notify);
		this.registerModuleType("time", AutoC4Time);
		this.registerModuleType("cyber", AutoC4Cyber);
		this.registerModuleType("atem", AutoC4Atem);
		this.registerModuleType("reload", AutoC4Reload);

		this.loadModules();
		this.connect();
	}

	public loadModules(): void {
		for (const moduleConfig of this.config.modules) {
			try {
				moduleConfig.instance = this.moduleConfigToModule(moduleConfig);
				this.modules.push(moduleConfig.instance);
				if (this.config.debug?.moduleLoaded)
					console.debug(
						`Successfully initialized module of type "${moduleConfig.type}".`,
						moduleConfig,
					);
			} catch (err) {
				console.error("An error occured while initializing a module.");
				console.error("Module Type: ", moduleConfig.type);
				console.error(err);
			}
		}
	}

	public connect(): void {
		this.client.connect({
			onSuccess: this.onConnect.bind(this),
			onFailure: this.client.onConnectionLost,
			mqttVersion: 3,
		});
	}

	public onMessage(message: Paho.Message) {
		if (this.config.debug?.message) {
			console.debug(
				`MQTT message received [${message.destinationName}]:`,
				debugMQTTMessageContent(message),
			);
		}
		for (const moduleConfig of this.config.modules) {
			try {
				if (
					moduleConfig.subscribe?.some((sub) =>
						mqtt_match_topic(sub, message.destinationName),
					)
				)
					moduleConfig.instance.onMessage?.(this, message);
			} catch (err) {
				console.error("An error occured while processing a message.");
				console.error("Module: ", moduleConfig.instance);
				console.error(err);
			}
		}
	}

	public onConnect(o: Paho.WithInvocationContext): void {
		if (this.config.debug?.connect)
			console.debug("MQTT connection successfull.", o);
		// Once a connection has been made, make subscriptions.
		for (const moduleConfig of this.config.modules) {
			if (!moduleConfig.subscribe) continue;
			for (const topic of moduleConfig.subscribe) {
				this.client.subscribe(topic);
			}
		}

		//call onConnect handler for all modules
		for (const module of this.modules) {
			try {
				module.onConnect?.(this, o);
			} catch (err) {
				console.error("An error occured while handling disconnect.");
				console.error("Module: ", module);
				console.error(err);
			}
		}
	}

	public onConnectionFailure(e: Paho.MQTTError): void {
		if (this.config.debug?.disconnect)
			console.warn("MQTT connection failure, retrying in 5 seconds..", e);
		setTimeout(
			(self: AutoC4) => {
				self.connect();
			},
			5000,
			this,
		);

		for (const module of this.modules) {
			try {
				module.onConnectionFailure?.(this, e);
			} catch (err) {
				console.error("An error occured while handling disconnect.");
				console.error("Module: ", module);
				console.error(err);
			}
		}
	}

	public sendData(
		topic: string,
		data: string | Uint8Array,
		retained = false,
	): void {
		const message = new Paho.Message(data);
		message.destinationName = topic;
		message.retained = retained;
		this.client.send(message);
		if (this.config.debug?.sentMessage) {
			console.debug(
				`MQTT message sent [${message.destinationName}]:`,
				debugMQTTMessageContent(message),
			);
		}
	}
	public sendByte(topic: string, data: number, retained = false): void {
		this.sendData(
			topic,
			new Uint8Array(data === undefined ? [0] : [data]),
			retained,
		);
	}

	private _moduleTypes: { [type: string]: AutoC4ModuleFactory } = {};
	public registerModuleType(type: string, factory: AutoC4ModuleFactory): void {
		this._moduleTypes[type] = factory;
	}
	public moduleConfigToModule(config: AutoC4ModuleConfig): AutoC4Module {
		if (config.type in this._moduleTypes)
			return this._moduleTypes[config.type](this, config.options);
		throw new Error(`Unknown module type: ${config.type}`);
	}
}

globalThis.autoc4 = new AutoC4(config as AutoC4Config);
