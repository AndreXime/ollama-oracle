import type { Express, Request, Response } from "express";
import { runHealthChecks } from "../shared/health.js";

export function registerRootRoutes(app: Express): void {
	app.get("/", (_req, res) => {
		res.json({
			service: "ollama-oracle-api",
			endpoints: { chat: "POST /chat", health: "GET /health" },
		});
	});

	app.get("/health", async (_req: Request, res: Response) => {
		const report = await runHealthChecks();
		res.status(report.ok ? 200 : 503).json(report);
	});
}
