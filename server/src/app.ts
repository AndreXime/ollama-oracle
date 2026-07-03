import { Hono } from "hono";
import { config } from "./config/env.js";
import type { AppLogger } from "./plugins/logger.js";
import { registerChatRoutes } from "./modules/chat/routes.js";
import { registerCors } from "./plugins/cors.js";
import { registerLogger } from "./plugins/logger.js";
import { registerHeathRoutes } from "./modules/health/route.js";
import { getVectorStore } from "./shared/chroma.js";
import { createChatModel, createEmbeddings } from "./shared/ollama.js";

type AppVariables = {
	readonly logger: AppLogger;
};

export type AppEnv = {
	Variables: AppVariables;
};

export async function buildApp() {
	const app = new Hono<AppEnv>();

	registerLogger(app);
	registerCors(app, config);

	const embeddings = createEmbeddings();
	const vectorStore = await getVectorStore(embeddings);
	const chatModel = createChatModel();

	registerHeathRoutes(app);
	registerChatRoutes(app, { vectorStore, chatModel });
	return app;
}
