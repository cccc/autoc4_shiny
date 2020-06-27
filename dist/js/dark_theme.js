(function (window, $) {
    let $body = $("body");
    const LSKEY = "DARK_THEME_ENABLED";
    try {
        let searchParams = new URLSearchParams(window.location.search);
        if (searchParams.has('dark') || searchParams.has('light')) {
            if (searchParams.has('dark')) {
                localStorage.setItem(LSKEY, "true");
                $body.addClass("dark");
                $body.removeClass("light");
            }
            else if (searchParams.get('light')) {
                localStorage.setItem(LSKEY, "false");
                $body.addClass("light");
                $body.removeClass("dark");
            }
        }
        else if (localStorage.getItem(LSKEY) !== null) {
            if (localStorage.getItem(LSKEY) === "true") {
                $body.addClass("dark");
                $body.removeClass("light");
            }
            else {
                $body.addClass("light");
                $body.removeClass("dark");
            }
        }
        else {
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                $body.addClass("dark");
                $body.removeClass("light");
            }
            else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
                $body.addClass("light");
                $body.removeClass("dark");
            }
        }
    }
    catch (_a) {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            $body.addClass("dark");
            $body.removeClass("light");
        }
        else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
            $body.addClass("light");
            $body.removeClass("dark");
        }
    }
    $(function () {
        $body.on("click", "[data-toggle=theme]", function (event) {
            event.preventDefault();
            try {
                localStorage.setItem("DARK_THEME_ENABLED", localStorage.getItem("DARK_THEME_ENABLED") === "true" ? "false" : "true");
                $body.toggleClass("dark");
                $body.toggleClass("light");
            }
            catch (_a) {
                let searchParams = new URLSearchParams(window.location.search);
                if ($body.hasClass("dark")) {
                    searchParams.delete("dark");
                    searchParams.set("light", "");
                }
                else {
                    searchParams.delete("light");
                    searchParams.set("dark", "");
                }
                window.location.search = searchParams.toString();
            }
        });
    });
})(window, jQuery);
