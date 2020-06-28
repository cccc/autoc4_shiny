$("body").on("click input change", "[data-toggle=value][data-target][data-value],[data-toggle=value][href][data-value]", function () {
    document.querySelectorAll(this.getAttribute("data-target") || this.getAttribute("href"))
        .forEach((e) => e.value = this.getAttribute("data-value"));
});
$("body").on("click input change", "[data-toggle=display][data-target],[data-toggle=display][href]", function () {
    document.querySelectorAll(this.getAttribute("data-target") || this.getAttribute("href"))
        .forEach((e) => $(e).toggle());
});

//# sourceMappingURL=extra_toggles.js.map
