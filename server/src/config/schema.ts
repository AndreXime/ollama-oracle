import { isAbsolute, resolve } from "node:path";
import { z } from "zod";
import { parseChatPromptMaxChunks, parseCorsOrigins, parseOptionalNonNegativeNumber } from "./parsers.js";
import { serverPackageDir } from "./paths.js";

const configSchema = z
	.looseObject({
		PORT: z.coerce.number().int().min(1).max(65535),
		OLLAMA_BASE_URL: z.string().url(),
		OLLAMA_CHAT_MODEL: z.string().min(1),
		OLLAMA_EMBED_MODEL: z.string().min(1),
		CHROMA_URL: z.string().url(),
		CHROMA_COLLECTION: z.string().min(1),
		CHROMA_MAX_RETRIEVAL_DISTANCE: z
			.string()
			.optional()
			.transform((v) => parseOptionalNonNegativeNumber(v))
			.pipe(z.number().min(0).nullable()),
		CHROMA_MAX_BEST_DISTANCE: z
			.string()
			.optional()
			.transform((v) => parseOptionalNonNegativeNumber(v))
			.pipe(z.number().min(0).nullable()),
		DATA_SOURCE_DIR: z
			.string()
			.min(1)
			.transform((v) => (isAbsolute(v) ? v : resolve(serverPackageDir, v))),
		MAX_FILE_BYTES: z.coerce.number().int().positive(),
		EMBED_BATCH_SIZE: z.coerce.number().int().positive(),
		CHAT_TOP_K: z.coerce.number().int().min(1).max(50),
		CHAT_PROMPT_MAX_CHUNKS: z
			.string()
			.optional()
			.transform((v) => parseChatPromptMaxChunks(v))
			.pipe(z.number().int().min(1).max(24)),
		CHAT_HISTORY_MAX_MESSAGES: z
			.string()
			.optional()
			.transform((v) => {
				if (v === undefined || v.trim() === "") return 6;
				const n = Number(v);
				if (!Number.isFinite(n)) return 6;
				return Math.min(20, Math.max(0, Math.floor(n)));
			})
			.pipe(z.number().int().min(0).max(20)),
		INGEST_ADD_CONCURRENCY: z.coerce.number().int().min(1).max(32),
		CORS_ORIGINS: z
			.string()
			.optional()
			.transform((v) => parseCorsOrigins(v))
			.pipe(z.array(z.string().url()).nullable()),
	})
	.transform((env) => {
		return {
			port: env.PORT,
			ollamaBaseUrl: env.OLLAMA_BASE_URL,
			ollamaChatModel: env.OLLAMA_CHAT_MODEL,
			ollamaEmbedModel: env.OLLAMA_EMBED_MODEL,
			chromaUrl: env.CHROMA_URL,
			chromaCollection: env.CHROMA_COLLECTION,
			chromaMaxRetrievalDistance: env.CHROMA_MAX_RETRIEVAL_DISTANCE,
			chromaMaxBestDistance: env.CHROMA_MAX_BEST_DISTANCE,
			dataSourceDir: env.DATA_SOURCE_DIR,
			maxFileBytes: env.MAX_FILE_BYTES,
			embedBatchSize: env.EMBED_BATCH_SIZE,
			chatTopK: env.CHAT_TOP_K,
			chatPromptMaxChunks: env.CHAT_PROMPT_MAX_CHUNKS,
			chatHistoryMaxMessages: env.CHAT_HISTORY_MAX_MESSAGES,
			ingestAddConcurrency: env.INGEST_ADD_CONCURRENCY,
			corsOrigins: env.CORS_ORIGINS,
		} as const;
	});

export type AppConfig = z.infer<typeof configSchema>;

export const config = configSchema.parse(process.env);
