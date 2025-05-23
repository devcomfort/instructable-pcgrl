import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		setupFiles: ["vitest-browser-svelte"],
		browser: {
			enabled: true,
			provider: "webdriverio",
			instances: [
				{
					browser: "chrome",
					headless: true,
				},
			],
		},
		workspace: [
			{
				extends: "./vite.config.ts",
				test: {
					name: "client",
					clearMocks: true,
					include: ["src/**/*.svelte.{test,spec}.{js,ts}"],
					exclude: ["src/lib/server/**"],
					setupFiles: ["./vitest-setup-client.ts"],
				},
			},
			{
				extends: "./vite.config.ts",
				test: {
					name: "server",
					environment: "node",
					include: ["src/**/*.{test,spec}.{js,ts}"],
					exclude: ["src/**/*.svelte.{test,spec}.{js,ts}"],
				},
			},
		],
	},
});
