import $ from "jquery";

declare global {
	interface Window {
		jQuery: typeof $;
		$: typeof $;
	}
}
window.jQuery = window.$ = $;
