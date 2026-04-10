import type { FastifyInstance } from "fastify";

export function registerRootRoutes(app: FastifyInstance): void {
	app.get("/", async () => ({
		service: "ollama-oracle-api",
		endpoints: { chat: "POST /chat", health: "GET /health" },
	}));

	app.get("/health", async () => ({ ok: true }));
}
