import type { Hono } from "hono";
import { runHealthChecks } from "./healthChecks.js";
import type { AppEnv } from "../../app.js";

export function registerHeathRoutes(app: Hono<AppEnv>): void {
	app.get("/health", async (c) => {
		const report = await runHealthChecks();
		return c.json(report, report.ok ? 200 : 503);
	});
}
