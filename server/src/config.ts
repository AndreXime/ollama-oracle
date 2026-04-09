import { existsSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { z } from "zod";

function findMonorepoRoot(startDir: string): string {
	let d = resolve(startDir);
	for (let i = 0; i < 15; i++) {
		if (existsSync(resolve(d, "server/package.json")) && existsSync(resolve(d, "client/package.json"))) {
			return d;
		}
		const parent = dirname(d);
		if (parent === d) break;
		d = parent;
	}
	return resolve(process.cwd());
}

const startDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = findMonorepoRoot(startDir);
const serverPackageDir = resolve(repoRoot, "server");

loadEnv({ path: resolve(serverPackageDir, ".env") });

/** Distância máxima no Chroma (menor = mais similar). `null` = não filtra (usa os top-K como antes). */
function parseOptionalNonNegativeNumber(raw: string | undefined): number | null {
	const v = raw?.trim();
	if (v === undefined || v === "") return null;
	const n = Number(v);
	return Number.isFinite(n) && n >= 0 ? n : null;
}

function parseCorsOrigins(raw: string | undefined): readonly string[] | null {
	const v = raw?.trim();
	if (v === undefined || v === "" || v === "*") return null;
	return v
		.split(",")
		.map((s) => s.trim())
		.filter((s) => s.length > 0);
}

const configSchema = z
	.object({
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
		INGEST_ADD_CONCURRENCY: z.coerce.number().int().min(1).max(32),
		CORS_ORIGINS: z
			.string()
			.optional()
			.transform((v) => parseCorsOrigins(v))
			.pipe(z.array(z.string().url()).nullable()),
	})
	.passthrough()
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
			ingestAddConcurrency: env.INGEST_ADD_CONCURRENCY,
			corsOrigins: env.CORS_ORIGINS,
		} as const;
	});

export const config = configSchema.parse(process.env);
