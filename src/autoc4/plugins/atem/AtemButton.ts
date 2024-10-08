import { button, buttonSecondary } from "@/styles/button";
import { LitElement, css, html } from "lit";
import { property, state } from "lit/decorators.js";

const styles = css`
button {
  width: 4em;
  aspect-ratio: 1/1;
  &.primary-active:not(.secondary-active) {
    background-color: rgba(0, 160, 0, 0.8);
    border-color: rgba(0, 160, 0, 0.8);
    &:hover {
      background-color: rgba(0, 160, 0, 0.7);
    }
  }
  &.secondary-active:not(.primary-active) {
    background-color: rgba(255, 0, 0, 0.8);
    border-color: rgba(255, 0, 0, 0.8);
    &:hover {
      background-color: rgba(255, 0, 0, 0.7);
    }
  }

  &.primary-active.secondary-active {
    background-color: transparent;
    background-image: linear-gradient(
      115deg,
      rgba(0, 160, 0, 0.8) 0%,
      rgba(0, 160, 0, 0.8) 50%,
      rgba(255, 0, 0, 0.8) 50%,
      rgba(255, 0, 0, 0.8) 100%
    );
    &:hover {
      background-image: linear-gradient(
        115deg,
        rgba(0, 160, 0, 0.7) 0%,
        rgba(0, 160, 0, 0.7) 50%,
        rgba(255, 0, 0, 0.7) 50%,
        rgba(255, 0, 0, 0.7) 100%
      );
    }
  }
}
`;

export default abstract class AtemButton extends LitElement {
	@property({ attribute: "name" })
	name = "";
	@property({ attribute: "short-name" })
	shortName = "";
	@property({ attribute: "topic" })
	topic = "";
	@property({ attribute: "source", type: Number })
	source = 0;
	@state()
	protected isPrimaryActive = false;
	@state()
	protected isSecondaryActive = false;

	render() {
		return html`
      <button
        class="${this.isPrimaryActive ? "primary-active" : ""} ${this.isSecondaryActive ? "secondary-active" : ""}"
        title="${this.name}"
        aria-label="${this.name}"
        @click=${this._onClick}
        @contextmenu=${this._onContextMenu}
      >
        ${this.shortName}
      </button>
    `;
	}

	static styles = [button, buttonSecondary, styles];

	abstract _onClick(): void;
	abstract _onContextMenu(): void;
}
