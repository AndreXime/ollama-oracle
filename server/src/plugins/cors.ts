import cors from "cors";
import type { Express } from "express";
import type { AppConfig } from "../config/schema.js";

export function registerCors(app: Express, cfg: AppConfig): void {
	app.use(
		cors({
			origin: (origin, cb) => {
				if (origin === undefined || origin === "") return cb(null, true);
				const allowlist = cfg.corsOrigins;
				if (allowlist === null) return cb(null, true);
				return cb(null, allowlist.includes(origin));
			},
		}),
	);
}
