import { defineConfig } from "vite";
import injectHtml from "vite-plugin-html-inject";

export default defineConfig({
	base: "./",
	plugins: [injectHtml()],
});
