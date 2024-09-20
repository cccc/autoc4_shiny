import { defineConfig } from "vite";
import injectHtml from "vite-plugin-html-inject";
import path from "path";

export default defineConfig({
	base: "./",
	plugins: [injectHtml()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		}
	}
});
