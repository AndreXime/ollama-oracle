import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const isWatch = process.argv.includes("--watch");

export default defineConfig({
	plugins: [react(), tailwindcss(), viteSingleFile()],
	build: {
		outDir: "../dist/client",
		emptyOutDir: true,
		minify: isWatch ? false : "esbuild",
		...(isWatch ? { watch: { exclude: "node_modules/**" } } : {}),
	},
});
