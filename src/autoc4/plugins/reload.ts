import type { AutoC4Module } from "../autoc4";

class Module implements AutoC4Module {
	public onMessage(): void {
		window.location.reload();
	}
}

export default function AutoC4Reload(): AutoC4Module {
	return new Module();
}
