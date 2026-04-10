import Fastify from "fastify";
import { config } from "./config/index.js";
import { appLoggerOptions } from "./lib/loggerOptions.js";
import { registerChatRoutes } from "./modules/chat/index.js";
import { registerCors } from "./plugins/cors.js";
import { registerRootRoutes } from "./routes/root.js";
import { getVectorStore } from "./shared/chroma.js";
import { createChatModel, createEmbeddings } from "./shared/ollama.js";

export async function buildApp() {
	const app = Fastify({ logger: appLoggerOptions });
	await registerCors(app, config);

	const embeddings = createEmbeddings();
	const vectorStore = await getVectorStore(embeddings);
	const chatModel = createChatModel();

	registerRootRoutes(app);
	await registerChatRoutes(app, { vectorStore, chatModel });
	return app;
}
