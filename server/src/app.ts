import { Hono } from "hono";
import type { RequestIdVariables } from "hono/request-id";
import type { AppLogger } from "./plugins/logger.js";
import { registerChatRoutes } from "./modules/chat/routes.js";
import { registerLogger } from "./plugins/logger.js";
import { registerSecurityHeaders } from "./plugins/securityHeaders.js";
import { registerHeathRoutes } from "./modules/health/route.js";
import { registerStaticClient } from "./plugins/staticClient.js";
import { getVectorStore } from "./shared/chroma.js";
import { createChatModel, createEmbeddings } from "./shared/ollama.js";

type AppVariables = RequestIdVariables & {
	readonly logger: AppLogger;
};

export type AppEnv = {
	Variables: AppVariables;
};

export async function buildApp() {
	const app = new Hono<AppEnv>();

	registerLogger(app);
	registerSecurityHeaders(app);

	const embeddings = createEmbeddings();
	const vectorStore = await getVectorStore(embeddings);
	const chatModel = createChatModel();

	registerHeathRoutes(app);
	registerChatRoutes(app, { vectorStore, chatModel });
	registerStaticClient(app);
	return app;
}
