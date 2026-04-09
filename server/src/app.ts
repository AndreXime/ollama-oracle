import cors from "@fastify/cors";
import Fastify from "fastify";
import { config } from "./config.js";
import { registerChatRoutes } from "./modules/chat/index.js";
import { getVectorStore } from "./shared/chroma.js";
import { createChatModel, createEmbeddings } from "./shared/ollama.js";

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

	const embeddings = createEmbeddings();
	const vectorStore = await getVectorStore(embeddings);
	const chatModel = createChatModel();

	app.get("/", async () => ({
		service: "ollama-oracle-api",
		endpoints: { chat: "POST /chat", health: "GET /health" },
	}));

	app.get("/health", async () => ({ ok: true }));

	await registerChatRoutes(app, { vectorStore, chatModel });
	return app;
}
