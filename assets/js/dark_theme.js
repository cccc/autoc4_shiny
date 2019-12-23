(function (window, $) {
    let $body = $("body");
    try {
        if (localStorage.getItem("DARK_THEME_ENABLED") === "true")
            $body.addClass("dark");
    }
    catch (_a) {
        let searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('dark') != null)
            $body.addClass("dark");
    }
    $(function () {
        $body.on("click", "[data-toggle=theme]", function () {
            try {
                localStorage.setItem("DARK_THEME_ENABLED", localStorage.getItem("DARK_THEME_ENABLED") === "true" ? "false" : "true");
                $body.toggleClass("dark");
            }
            catch (_a) {
                let searchParams = new URLSearchParams(window.location.search);
                if ($body.hasClass("dark"))
                    searchParams.delete("dark");
                else
                    searchParams.set("dark", "");
                window.location.search = searchParams.toString();
            }
        });
    });
})(window, jQuery);

//# sourceMappingURL=dark_theme.js.map
