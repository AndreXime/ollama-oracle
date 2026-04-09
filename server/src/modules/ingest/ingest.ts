import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { Document } from "@langchain/core/documents";
import { config } from "../../config.js";
import { createEmptyChromaStore, deleteCollectionIfExists } from "../../shared/chroma.js";
import { createEmbeddings } from "../../shared/ollama.js";
import { csvRawToTextParts } from "./csvText.js";
import { isSupportedExtension, readFileHeadUtf8, readTextFileWithStreamCap } from "./fileStreamReader.js";
import { getTextSplitter } from "./splitter.js";

async function* walkFiles(dir: string): AsyncGenerator<string> {
	const entries = await readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			yield* walkFiles(full);
		} else if (entry.isFile() && isSupportedExtension(full)) {
			yield full;
		}
	}
}

function parseJsonToTextParts(raw: string, source: string): string[] {
	let data: unknown;
	try {
		data = JSON.parse(raw) as unknown;
	} catch (e) {
		throw new Error(`JSON inválido em ${source}: ${(e as Error).message}`);
	}
	if (typeof data === "string") return [data];
	if (Array.isArray(data)) {
		return data.filter((x): x is string => typeof x === "string");
	}
	if (data && typeof data === "object") {
		const o = data as Record<string, unknown>;
		if (typeof o.content === "string") return [o.content];
		if (Array.isArray(o.documents)) {
			return o.documents.filter((x): x is string => typeof x === "string");
		}
	}
	return [JSON.stringify(data)];
}

async function loadRawTextsForFile(absolutePath: string, rel: string): Promise<string[]> {
	const lower = absolutePath.toLowerCase();
	if (lower.endsWith(".json")) {
		const raw = await readFileHeadUtf8(absolutePath, config.maxFileBytes);
		return parseJsonToTextParts(raw, rel);
	}
	if (lower.endsWith(".csv")) {
		const raw = await readTextFileWithStreamCap(absolutePath, config.maxFileBytes);
		try {
			return csvRawToTextParts(raw);
		} catch (e) {
			throw new Error(`CSV inválido em ${rel}: ${(e as Error).message}`);
		}
	}
	const raw = await readTextFileWithStreamCap(absolutePath, config.maxFileBytes);
	return [raw];
}

async function main(): Promise<void> {
	const splitter = getTextSplitter();
	const embeddings = createEmbeddings();

	console.info(`Fonte de dados: ${config.dataSourceDir}`);
	console.info(`Chroma: ${config.chromaUrl} | coleção: ${config.chromaCollection}`);

	await deleteCollectionIfExists();
	const store = createEmptyChromaStore(embeddings);
	await store.ensureCollection();

	let fileCount = 0;
	let chunkTotal = 0;
	const inflight: Promise<unknown>[] = [];

	async function drainIfNeeded(): Promise<void> {
		const limit = config.ingestAddConcurrency;
		if (inflight.length < limit) return;
		await Promise.all(inflight.splice(0, inflight.length));
	}

	for await (const absolutePath of walkFiles(config.dataSourceDir)) {
		const rel = relative(config.dataSourceDir, absolutePath) || absolutePath;
		const parts = await loadRawTextsForFile(absolutePath, rel);
		fileCount += 1;
		let fileChunkCount = 0;

		for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
			const text = parts[partIndex] ?? "";
			if (!text.trim()) continue;
			const parent = new Document({
				pageContent: text,
				metadata: { source: rel, partIndex },
			});
			const chunks = await splitter.splitDocuments([parent]);
			chunkTotal += chunks.length;
			fileChunkCount += chunks.length;

			const batchSize = config.embedBatchSize;
			for (let i = 0; i < chunks.length; i += batchSize) {
				const batch = chunks.slice(i, i + batchSize).map((chunk, j) => {
					const chunkIndex = i + j;
					return new Document({
						pageContent: chunk.pageContent,
						metadata: { ...(chunk.metadata as Record<string, unknown>), source: rel, partIndex, chunkIndex },
					});
				});
				inflight.push(store.addDocuments(batch));
				await drainIfNeeded();
			}
		}

		if (inflight.length > 0) {
			await Promise.all(inflight.splice(0, inflight.length));
		}
		console.info(`Indexado: ${rel} (partes=${parts.length}, chunks=${fileChunkCount})`);
	}

	console.info(`Concluído. Arquivos: ${fileCount}, chunks (aprox.): ${chunkTotal}.`);
}

main().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
