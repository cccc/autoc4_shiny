/**
 * @description A simple script adding a "dark" class to the body
 * if certain conditions are met. Can be used for creating a dark
 * mode based on SearchParams, LocalStorage, and the browsers prefered
 * color scheme.
 * @author Qb
 * @copyright Chaos Computer Club Cologne 2019-2020
 * @license MIT
 */

((window, $) => {
	const $body = $("body");
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
	const LSKEY = "DARK_THEME_ENABLED";

	function useMediaQuery(initial: boolean) {
		if (prefersDark.matches) {
			$body.addClass("dark");
			$body.removeClass("light");
		} else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
			$body.addClass("light");
			$body.removeClass("dark");
		}

		if (initial) {
			prefersDark.addEventListener("change", updateMediaQuery);
		}
	}

	function unuseMediaQuery() {
		prefersDark.removeEventListener("change", updateMediaQuery);
	}

	const updateMediaQuery = useMediaQuery.bind(null, false);

	try {
		const searchParams = new URLSearchParams(window.location.search);

		if (searchParams.has("dark") || searchParams.has("light")) {
			//URL Parameters

			if (searchParams.has("dark")) {
				localStorage.setItem(LSKEY, "true");
				$body.addClass("dark");
				$body.removeClass("light");
			} else if (searchParams.get("light")) {
				localStorage.setItem(LSKEY, "false");
				$body.addClass("light");
				$body.removeClass("dark");
			}
		} else if (localStorage.getItem(LSKEY) !== null) {
			//Local Storage

			if (localStorage.getItem(LSKEY) === "true") {
				$body.addClass("dark");
				$body.removeClass("light");
			} else {
				$body.addClass("light");
				$body.removeClass("dark");
			}
		} else {
			//Media Query
			useMediaQuery(true);
		}
	} catch {
		//Fallback to media query
		useMediaQuery(true);
	}

	$(() => {
		$body.on("click", "[data-toggle=theme]", (event) => {
			event.preventDefault();

			try {
				localStorage.setItem(
					"DARK_THEME_ENABLED",
					localStorage.getItem("DARK_THEME_ENABLED") === "true"
						? "false"
						: "true",
				);
				$body.toggleClass("dark");
				$body.toggleClass("light");
				unuseMediaQuery();
			} catch {
				const searchParams = new URLSearchParams(window.location.search);

				if ($body.hasClass("dark")) {
					searchParams.delete("dark");
					searchParams.set("light", "");
				} else {
					searchParams.delete("light");
					searchParams.set("dark", "");
				}

				window.location.search = searchParams.toString();
			}
		});
	});
})(window, jQuery);
