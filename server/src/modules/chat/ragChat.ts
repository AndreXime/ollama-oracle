import type { Chroma } from "@langchain/community/vectorstores/chroma";
import type { Document } from "@langchain/core/documents";
import type { BaseMessage } from "@langchain/core/messages";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { ChatOllama } from "@langchain/ollama";
import type { FastifyBaseLogger } from "fastify";
import { config } from "../../config.js";
import {
	buildConversationalUserMessage,
	buildRagUserMessage,
	CORPORATE_CONVERSATIONAL_PROMPT,
	CORPORATE_SYSTEM_PROMPT,
} from "./prompts.js";

export interface RagSource {
	readonly source: string;
	readonly excerpt: string;
}

export type RagStreamEvent =
	| { readonly type: "delta"; readonly text: string }
	| { readonly type: "done"; readonly sources: readonly RagSource[] };

function extractTextFromMessageContent(message: { content: BaseMessage["content"] }): string {
	const c = message.content;
	if (typeof c === "string") return c;
	if (Array.isArray(c)) {
		return c
			.map((part) => {
				if (typeof part === "string") return part;
				if (part && typeof part === "object" && "text" in part) {
					const t = (part as { text?: string }).text;
					return typeof t === "string" ? t : "";
				}
				return "";
			})
			.join("");
	}
	return "";
}

export async function* streamRagChat(
	vectorStore: Chroma,
	chatModel: ChatOllama,
	question: string,
	topK: number,
	log?: FastifyBaseLogger,
	signal?: AbortSignal,
): AsyncGenerator<RagStreamEvent, void, undefined> {
	const promptChunks = Math.min(topK, config.chatPromptMaxChunks);
	const retrievalLimit = Math.min(36, Math.max(Math.max(topK, config.chatPromptMaxChunks) * 3, 12));
	log?.info({ retrievalLimit, promptChunks, topK }, "rag: similaritySearchWithScore (embed + Chroma)");
	const scored = await vectorStore.similaritySearchWithScore(question.trim(), retrievalLimit);
	const maxD = config.chromaMaxRetrievalDistance;
	const maxBest = config.chromaMaxBestDistance;
	const bestDistance = scored[0]?.[1];

	const bestTooWeak = maxBest !== null && typeof bestDistance === "number" && bestDistance > maxBest;

	let docs =
		maxD === null
			? scored.map(([d]) => d)
			: scored.filter(([, distance]) => distance <= maxD).map(([d]) => d);

	if (bestTooWeak) {
		log?.info({ bestDistance, maxBest }, "rag: best match above max-best — skip RAG");
		const lexical = pickLexicallyMatchingDocs(question, scored.map(([d]) => d));
		if (lexical.length > 0) {
			log?.info(
				{ picked: lexical.length, scoredCount: scored.length, bestDistance, maxBest },
				"rag: best match above max-best — keep lexical matches",
			);
			docs = lexical;
		} else {
			docs = [];
		}
	}

	docs = dedupeDocumentsByContent(docs);
	docs = docs.slice(0, promptChunks);

	if (scored.length > 0 && maxD !== null && !bestTooWeak) {
		const best = scored[0]?.[1];
		log?.info(
			{ bestDistance: best, maxDistance: maxD, kept: docs.length, promptChunks },
			"rag: distance filter + prompt chunk cap",
		);
	}

	if (docs.length === 0) {
		log?.info(
			{ scoredCount: scored.length, maxDistance: maxD },
			"rag: no chunks after filter — conversational",
		);
		const userContent = buildConversationalUserMessage(question);
		const messages = [new SystemMessage(CORPORATE_CONVERSATIONAL_PROMPT), new HumanMessage(userContent)];
		const stream = await chatModel.stream(messages, { signal });
		for await (const chunk of stream) {
			const text = extractTextFromMessageContent(chunk);
			if (text) yield { type: "delta", text };
		}
		log?.info("rag: stream done");
		yield { type: "done", sources: [] };
		return;
	}

	log?.info({ docCount: docs.length }, "rag: llm stream");
	const contextBlocks = docs.map((d) => d.pageContent);
	const userContent = buildRagUserMessage(question, contextBlocks);
	const messages = [new SystemMessage(CORPORATE_SYSTEM_PROMPT), new HumanMessage(userContent)];

	const stream = await chatModel.stream(messages, { signal });
	for await (const chunk of stream) {
		const text = extractTextFromMessageContent(chunk);
		if (text) yield { type: "delta", text };
	}

	log?.info("rag: stream done");
	yield { type: "done", sources: mapDocumentsToSources(docs) };
}

function pickLexicallyMatchingDocs(question: string, docs: readonly Document[]): Document[] {
	const tokens = tokenizeForLexicalMatch(question);
	if (tokens.length < 2) return [];
	const out: Document[] = [];
	for (const doc of docs) {
		const hay = doc.pageContent.toLowerCase();
		let hits = 0;
		for (const t of tokens) {
			if (hay.includes(t)) hits += 1;
			if (hits >= 2) break;
		}
		if (hits >= 2) out.push(doc);
	}
	return out;
}

function tokenizeForLexicalMatch(s: string): readonly string[] {
	const stop = new Set([
		"a",
		"o",
		"os",
		"as",
		"um",
		"uma",
		"de",
		"do",
		"da",
		"dos",
		"das",
		"qual",
		"quais",
		"quem",
		"cargo",
		"função",
		"funcao",
		"posição",
		"posicao",
		"é",
		"e",
	]);
	return s
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^\p{L}\p{N}\s]/gu, " ")
		.split(/\s+/)
		.map((t) => t.trim())
		.filter((t) => t.length >= 4 && !stop.has(t));
}

function dedupeDocumentsByContent(docs: readonly Document[]): Document[] {
	const seen = new Set<string>();
	const out: Document[] = [];
	for (const doc of docs) {
		const key = doc.pageContent.replace(/\s+/g, " ").trim();
		if (!key) continue;
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(doc);
	}
	return out;
}

function mapDocumentsToSources(docs: Document[]): readonly RagSource[] {
	return docs.map((doc) => {
		const meta = doc.metadata as Record<string, unknown> | undefined;
		const source = typeof meta?.source === "string" ? meta.source : "desconhecido";
		const partIndex = typeof meta?.partIndex === "number" ? meta.partIndex : null;
		const chunkIndex = typeof meta?.chunkIndex === "number" ? meta.chunkIndex : null;
		const sourceWithLoc =
			partIndex !== null && chunkIndex !== null ? `${source}#p${partIndex}-c${chunkIndex}` : source;
		const excerpt = doc.pageContent.length > 320 ? `${doc.pageContent.slice(0, 317)}...` : doc.pageContent;
		return { source: sourceWithLoc, excerpt };
	});
}
