!function(window, $) {
    let $body = $("body"), prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    const LSKEY = "DARK_THEME_ENABLED";
    function useMediaQuery(initial) {
        prefersDark.matches ? ($body.addClass("dark"), $body.removeClass("light")) : window.matchMedia("(prefers-color-scheme: light)").matches && ($body.addClass("light"), 
        $body.removeClass("dark")), initial && prefersDark.addEventListener("change", updateMediaQuery);
    }
    let updateMediaQuery = useMediaQuery.bind(null, !1);
    try {
        let searchParams = new URLSearchParams(window.location.search);
        searchParams.has("dark") || searchParams.has("light") ? searchParams.has("dark") ? (localStorage.setItem(LSKEY, "true"), 
        $body.addClass("dark"), $body.removeClass("light")) : searchParams.get("light") && (localStorage.setItem(LSKEY, "false"), 
        $body.addClass("light"), $body.removeClass("dark")) : null !== localStorage.getItem(LSKEY) ? "true" === localStorage.getItem(LSKEY) ? ($body.addClass("dark"), 
        $body.removeClass("light")) : ($body.addClass("light"), $body.removeClass("dark")) : useMediaQuery(!0);
    } catch (_a) {
        useMediaQuery(!0);
    }
    $((function() {
        $body.on("click", "[data-toggle=theme]", (function(event) {
            event.preventDefault();
            try {
                localStorage.setItem("DARK_THEME_ENABLED", "true" === localStorage.getItem("DARK_THEME_ENABLED") ? "false" : "true"), 
                $body.toggleClass("dark"), $body.toggleClass("light"), function unuseMediaQuery() {
                    prefersDark.removeEventListener("change", updateMediaQuery);
                }();
            } catch (_a) {
                let searchParams = new URLSearchParams(window.location.search);
                $body.hasClass("dark") ? (searchParams.delete("dark"), searchParams.set("light", "")) : (searchParams.delete("light"), 
                searchParams.set("dark", "")), window.location.search = searchParams.toString();
            }
        }));
    }));
}(window, jQuery);
//# sourceMappingURL=dark_theme.js.map
