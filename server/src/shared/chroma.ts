import { Chroma } from "@langchain/community/vectorstores/chroma";
import type { OllamaEmbeddings } from "@langchain/ollama";
import { ChromaClient } from "chromadb";
import { config } from "../config/index.js";
import { chromaClientArgsFromUrl } from "./chromaHealthArgs.js";

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
