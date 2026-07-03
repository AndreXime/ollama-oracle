import type { Hono } from "hono";
import { runHealthChecks } from "../shared/health.js";
import type { AppEnv } from "../app.js";

export function registerRootRoutes(app: Hono<AppEnv>): void {
	app.get("/", (c) =>
		c.json({
			service: "ollama-oracle-api",
			endpoints: { chat: "POST /chat", health: "GET /health" },
		}),
	);

	app.get("/health", async (c) => {
		const report = await runHealthChecks();
		return c.json(report, report.ok ? 200 : 503);
	});
}
