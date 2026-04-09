import { Chroma } from "@langchain/community/vectorstores/chroma";
import type { OllamaEmbeddings } from "@langchain/ollama";
import { ChromaClient } from "chromadb";
import { config } from "../config.js";

/** chromadb v3 deprecates `path`; LangChain still forwards `url` as `path` unless we pass `index`. */
function chromaClientArgsFromUrl(urlString: string): { ssl: boolean; host: string; port: number } {
	const url = new URL(urlString);
	const ssl = url.protocol === "https:";
	const host = url.hostname;
	const port =
		url.port !== "" ? Number(url.port) : ssl ? 443 : 8000;
	if (!Number.isFinite(port) || port <= 0 || port > 65535) {
		throw new Error(`Invalid Chroma URL (port): ${urlString}`);
	}
	return { ssl, host, port };
}

function createChromaHttpClient(): ChromaClient {
	return new ChromaClient(chromaClientArgsFromUrl(config.chromaUrl));
}

function chromaStoreArgs() {
	return {
		index: createChromaHttpClient(),
		collectionName: config.chromaCollection,
	} as const;
}

export async function deleteCollectionIfExists(): Promise<void> {
	const client = createChromaHttpClient();
	try {
		await client.deleteCollection({ name: config.chromaCollection });
	} catch {
		// Coleção pode não existir na primeira execução
	}
}

export async function getVectorStore(embeddings: OllamaEmbeddings): Promise<Chroma> {
	return Chroma.fromExistingCollection(embeddings, chromaStoreArgs());
}

export function createEmptyChromaStore(embeddings: OllamaEmbeddings): Chroma {
	return new Chroma(embeddings, chromaStoreArgs());
}
