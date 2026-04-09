import cors from "@fastify/cors";
import Fastify from "fastify";
import { config } from "./config.js";

export async function buildApp() {
	const app = Fastify({ logger: true });
	await app.register(cors, {
		origin: (origin, cb) => {
			if (origin === undefined || origin === "") return cb(null, true);
			const allowlist = config.corsOrigins;
			if (allowlist === null) return cb(null, true);
			return cb(null, allowlist.includes(origin));
		},
	});

	app.get("/", async () => ({
		service: "ollama-oracle-api",
		endpoints: { health: "GET /health" },
	}));

	app.get("/health", async () => ({ ok: true }));

	return app;
}
