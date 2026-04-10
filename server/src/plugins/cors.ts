import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import type { AppConfig } from "../config/schema.js";

export async function registerCors(app: FastifyInstance, cfg: AppConfig): Promise<void> {
	await app.register(cors, {
		origin: (origin, cb) => {
			if (origin === undefined || origin === "") return cb(null, true);
			const allowlist = cfg.corsOrigins;
			if (allowlist === null) return cb(null, true);
			return cb(null, allowlist.includes(origin));
		},
	});
}
