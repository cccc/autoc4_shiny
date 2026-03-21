import LightButton from "./LightButton";

export default class TasmotaButton extends LightButton {
	_onClick() {
		LightButton.autoc4.sendData(this.topic + "/cmnd/power", this.isOn ? "off" : "on", false);

	}
}
