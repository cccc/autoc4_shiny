$("body").on(
	"click input change",
	"[data-toggle=value][data-target][data-value],[data-toggle=value][href][data-value]",
	function (this: HTMLElement) {
		for (const target of document.querySelectorAll<HTMLInputElement>(
			(this.getAttribute("data-target") || this.getAttribute("href"))!,
		)) {
			target.value = this.getAttribute("data-value") || "";
		}
	},
);

$("body").on(
	"click input change",
	"[data-toggle=display][data-target],[data-toggle=display][href]",
	function (this: HTMLElement) {
		for (const target of document.querySelectorAll<HTMLInputElement>(
			(this.getAttribute("data-target") || this.getAttribute("href"))!,
		)) {
			target.classList.toggle("d-none");
		}
	},
);
