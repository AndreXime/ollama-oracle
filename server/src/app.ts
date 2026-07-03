import { Hono } from "hono";
import { config } from "./config/index.js";
import type { AppLogger } from "./plugins/logger.js";
import { registerChatRoutes } from "./modules/chat/routes.js";
import { registerCors } from "./plugins/cors.js";
import { registerLogger } from "./plugins/logger.js";
import { registerRootRoutes } from "./routes/root.js";
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

	registerRootRoutes(app);
	registerChatRoutes(app, { vectorStore, chatModel });
	return app;
}
