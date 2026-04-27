import type { Express } from "express";

export function registerRootRoutes(app: Express): void {
	app.get("/", (_req, res) => {
		res.json({
			service: "ollama-oracle-api",
			endpoints: { chat: "POST /chat", health: "GET /health" },
		});
	});

	app.get("/health", (_req, res) => {
		res.json({ ok: true });
	});
}
