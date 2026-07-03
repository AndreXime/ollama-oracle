import type { Chroma } from "@langchain/community/vectorstores/chroma";
import { type BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { ChatOllama } from "@langchain/ollama";
import type { AppLogger } from "../../plugins/logger.js";
import { config } from "../../config/index.js";
import { buildRetrievalQuery, type ChatTurn, chatHistoryToMessages } from "./chatHistory.js";
import {
	buildConversationalUserMessage,
	buildRagUserMessage,
	CORPORATE_CONVERSATIONAL_PROMPT,
	CORPORATE_SYSTEM_PROMPT,
} from "./prompts.js";
import { lexicalOverlapScore, pickLexicallyMatchingDocs } from "./rag/lexicalMatch.js";
import { extractTextFromMessageContent } from "./rag/llmContent.js";
import { contentKey, dedupeScoredByContent, minDistanceByContent, type ScoredDoc } from "./rag/scoredDocuments.js";
import { mapDocumentsToSources, type RagSource } from "./rag/sources.js";

type RagStreamEvent =
	| { readonly type: "delta"; readonly text: string }
	| { readonly type: "done"; readonly sources: readonly RagSource[] };

function buildLlmMessages(systemPrompt: string, history: readonly ChatTurn[], userContent: string): BaseMessage[] {
	return [new SystemMessage(systemPrompt), ...chatHistoryToMessages(history), new HumanMessage(userContent)];
}

export async function* streamRagChat(
	vectorStore: Chroma,
	chatModel: ChatOllama,
	question: string,
	topK: number,
	history: readonly ChatTurn[] = [],
	log?: AppLogger,
	signal?: AbortSignal,
): AsyncGenerator<RagStreamEvent, void, undefined> {
	const promptChunks = Math.min(topK, config.chatPromptMaxChunks);
	const retrievalLimit = Math.min(36, Math.max(Math.max(topK, config.chatPromptMaxChunks) * 3, 12));
	const retrievalQuery = buildRetrievalQuery(question, history);
	log?.info(
		{ retrievalLimit, promptChunks, topK, historyTurns: history.length },
		"rag: similaritySearchWithScore (embed + Chroma)",
	);
	const scored = await vectorStore.similaritySearchWithScore(retrievalQuery, retrievalLimit);
	const maxD = config.chromaMaxRetrievalDistance;
	const maxBest = config.chromaMaxBestDistance;
	const bestDistance = scored[0]?.[1];

	const bestTooWeak = maxBest !== null && typeof bestDistance === "number" && bestDistance > maxBest;

	let ranked: ScoredDoc[];
	let sortLexicalFirst = false;
	if (bestTooWeak) {
		log?.info({ bestDistance, maxBest }, "rag: best match above max-best — skip RAG");
		const distByContent = minDistanceByContent(scored);
		const lexicalDocs = pickLexicallyMatchingDocs(
			question,
			scored.map(([d]) => d),
		);
		if (lexicalDocs.length > 0) {
			log?.info(
				{ picked: lexicalDocs.length, scoredCount: scored.length, bestDistance, maxBest },
				"rag: best match above max-best — keep lexical matches",
			);
			sortLexicalFirst = true;
			ranked = lexicalDocs.map((doc) => {
				const d = distByContent.get(contentKey(doc)) ?? Number.POSITIVE_INFINITY;
				return [doc, d] as const;
			});
		} else {
			ranked = [];
		}
	} else {
		ranked = maxD === null ? [...scored] : scored.filter(([, distance]) => distance <= maxD);
	}

	ranked = dedupeScoredByContent(ranked);
	if (sortLexicalFirst) {
		ranked.sort((a, b) => {
			const oa = lexicalOverlapScore(question, a[0]);
			const ob = lexicalOverlapScore(question, b[0]);
			if (ob !== oa) return ob - oa;
			return a[1] - b[1];
		});
	} else {
		ranked.sort((a, b) => a[1] - b[1]);
	}
	ranked = ranked.slice(0, promptChunks);
	const docs = ranked.map(([d]) => d);

	if (scored.length > 0 && maxD !== null && !bestTooWeak) {
		const best = scored[0]?.[1];
		log?.info(
			{ bestDistance: best, maxDistance: maxD, kept: docs.length, promptChunks },
			"rag: distance filter + prompt chunk cap",
		);
	}

	if (docs.length === 0) {
		log?.info({ scoredCount: scored.length, maxDistance: maxD }, "rag: no chunks after filter — conversational");
		const userContent = buildConversationalUserMessage(question);
		const messages = buildLlmMessages(CORPORATE_CONVERSATIONAL_PROMPT, history, userContent);
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
	const messages = buildLlmMessages(CORPORATE_SYSTEM_PROMPT, history, userContent);

	const stream = await chatModel.stream(messages, { signal });
	for await (const chunk of stream) {
		const text = extractTextFromMessageContent(chunk);
		if (text) yield { type: "delta", text };
	}

	log?.info("rag: stream done");
	yield { type: "done", sources: mapDocumentsToSources(docs) };
}
