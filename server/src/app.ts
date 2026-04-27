import express from "express";
import pino from "pino";
import { pinoHttp } from "pino-http";
import { config } from "./config/index.js";
import { appLoggerOptions } from "./lib/loggerOptions.js";
import { registerChatRoutes } from "./modules/chat/index.js";
import { registerCors } from "./plugins/cors.js";
import { registerRootRoutes } from "./routes/root.js";
import { getVectorStore } from "./shared/chroma.js";
import { createChatModel, createEmbeddings } from "./shared/ollama.js";

export async function buildApp() {
	const app = express();
	const logger = pino(appLoggerOptions);
	app.use(pinoHttp({ logger }));
	registerCors(app, config);

	const embeddings = createEmbeddings();
	const vectorStore = await getVectorStore(embeddings);
	const chatModel = createChatModel();

	app.use(express.json({ limit: "1mb" }));
	registerRootRoutes(app);
	registerChatRoutes(app, { vectorStore, chatModel });
	return app;
}
