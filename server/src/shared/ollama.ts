import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { config } from "../config/env.js";

export function createEmbeddings(): OllamaEmbeddings {
	return new OllamaEmbeddings({
		baseUrl: config.ollamaBaseUrl,
		model: config.ollamaEmbedModel,
		keepAlive: config.ollamaKeepAlive,
	});
}

export function createChatModel(): ChatOllama {
	return new ChatOllama({
		baseUrl: config.ollamaBaseUrl,
		model: config.ollamaChatModel,
		temperature: 0.2,
		numCtx: 4096,
		keepAlive: config.ollamaKeepAlive,
	});
}
