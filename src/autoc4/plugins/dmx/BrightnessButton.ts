import type LampManager from "./LampManager";

export default function registerBrightnessButton(
	lampManager: LampManager,
): void {
	class BrightnessButton extends HTMLElement {
		connectedCallback(): void {
			const room = this.getAttribute("room")!;
			const value = Number(this.getAttribute("value"));
			const label = this.innerText;

			this.innerHTML = `
                <button class="btn btn-primary btn-sm">
					${label}
				</button>
            `;
			const button = this.querySelector("button")!;
			button.addEventListener("click", () => {
				for (const lamp of lampManager.getRoom(room)) {
					lamp.brightness(value);
				}
			});
		}
	}
	globalThis.customElements.define("brightness-button", BrightnessButton);
}
