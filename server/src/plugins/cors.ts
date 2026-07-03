import { cors } from "hono/cors";
import type { Hono } from "hono";
import type { AppConfig } from "../config/schema.js";
import type { AppEnv } from "../app.js";

export function registerCors(app: Hono<AppEnv>, cfg: AppConfig): void {
	app.use(
		"*",
		cors({
			origin: (origin) => {
				if (origin === "") return "*";
				if (cfg.corsOrigins === null) return origin;
				return cfg.corsOrigins.includes(origin) ? origin : "";
			},
		}),
	);
}
