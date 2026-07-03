import type { Chroma } from "@langchain/community/vectorstores/chroma";
import { type BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { ChatOllama } from "@langchain/ollama";
import type { AppLogger } from "../../plugins/logger.js";
import { config } from "../../config/env.js";
import { buildRetrievalQuery, type ChatTurn, chatHistoryToMessages } from "./chatHistory.js";
import { buildNoChunksUserMessage, isConversationalQuestion } from "./questionIntent.js";
import {
	buildConversationalUserMessage,
	buildRagUserMessage,
	CORPORATE_CONVERSATIONAL_PROMPT,
	CORPORATE_SYSTEM_PROMPT,
} from "./prompts.js";
import { lexicalOverlapScore, pickLexicallyMatchingDocs, pruneWeakLexicalMatches } from "./rag/lexicalMatch.js";
import { extractTextFromMessageContent } from "./rag/llmContent.js";
import { contentKey, dedupeScoredByContent, minDistanceByContent, type ScoredDoc } from "./rag/scoredDocuments.js";
import { formatDocumentSource, mapDocumentsToSources, type RagSource } from "./rag/sources.js";
import type { RagTurnMode, RagTurnStats } from "./rag/turnStats.js";

type RagStreamEvent =
	| { readonly type: "ping" }
	| { readonly type: "delta"; readonly text: string }
	| { readonly type: "done"; readonly sources: readonly RagSource[] };

function buildLlmMessages(systemPrompt: string, history: readonly ChatTurn[], userContent: string): BaseMessage[] {
	return [new SystemMessage(systemPrompt), ...chatHistoryToMessages(history), new HumanMessage(userContent)];
}

function buildTurnStats(
	mode: RagTurnMode,
	retrievalQuery: string,
	scoredCount: number,
	bestDistance: number | undefined,
	ranked: readonly ScoredDoc[],
	sources: readonly RagSource[],
): RagTurnStats {
	return {
		mode,
		retrievalQuery,
		scoredCount,
		bestDistance: typeof bestDistance === "number" ? bestDistance : null,
		keptChunks: ranked.length,
		sourceCount: sources.length,
		sources,
		chunks: ranked.map(([doc, distance]) => ({
			source: formatDocumentSource(doc),
			distance,
		})),
	};
}

export async function* streamRagChat(
	vectorStore: Chroma,
	chatModel: ChatOllama,
	question: string,
	topK: number,
	history: readonly ChatTurn[] = [],
	log?: AppLogger,
	signal?: AbortSignal,
	onTurnComplete?: (stats: RagTurnStats) => void,
): AsyncGenerator<RagStreamEvent, void, undefined> {
	const promptChunks = Math.min(topK, config.chatPromptMaxChunks);
	const retrievalLimit = Math.min(36, Math.max(Math.max(topK, config.chatPromptMaxChunks) * 3, 12));
	const retrievalQuery = buildRetrievalQuery(question);
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
	let turnMode: RagTurnMode = "rag";
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
			turnMode = "lexical_fallback";
			ranked = lexicalDocs.map((doc) => {
				const d = distByContent.get(contentKey(doc)) ?? Number.POSITIVE_INFINITY;
				return [doc, d] as const;
			});
		} else {
			turnMode = "conversational";
			ranked = [];
		}
	} else {
		ranked = maxD === null ? [...scored] : scored.filter(([, distance]) => distance <= maxD);
	}

	ranked = dedupeScoredByContent(ranked);
	ranked.sort((a, b) => {
		const oa = lexicalOverlapScore(question, a[0]);
		const ob = lexicalOverlapScore(question, b[0]);
		if (ob !== oa) return ob - oa;
		return a[1] - b[1];
	});
	if (turnMode === "lexical_fallback") {
		const before = ranked.length;
		ranked = pruneWeakLexicalMatches(
			question,
			ranked.map(([doc, distance]) => ({ doc, distance })),
		).map(({ doc, distance }) => [doc, distance] as const);
		if (before !== ranked.length) {
			log?.info({ before, after: ranked.length }, "rag: lexical prune weak matches");
		}
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
		const useConversational = isConversationalQuestion(question);
		const noChunksMode: RagTurnMode = useConversational ? "conversational" : "limitation";
		log?.info(
			{ scoredCount: scored.length, maxDistance: maxD, noChunksMode },
			"rag: no chunks after filter",
		);
		const stats = buildTurnStats(noChunksMode, retrievalQuery, scored.length, bestDistance, ranked, []);
		onTurnComplete?.(stats);

		if (useConversational) {
			const userContent = buildConversationalUserMessage(question);
			const messages = buildLlmMessages(CORPORATE_CONVERSATIONAL_PROMPT, history, userContent);
			yield { type: "ping" };
			const stream = await chatModel.stream(messages, { signal });
			for await (const chunk of stream) {
				const text = extractTextFromMessageContent(chunk);
				if (text) yield { type: "delta", text };
			}
		} else {
			yield { type: "delta", text: buildNoChunksUserMessage(question) };
		}

		log?.info("rag: stream done");
		yield { type: "done", sources: [] };
		return;
	}

	log?.info({ docCount: docs.length }, "rag: llm stream");
	const sources = mapDocumentsToSources(docs);
	const stats = buildTurnStats(turnMode, retrievalQuery, scored.length, bestDistance, ranked, sources);
	onTurnComplete?.(stats);

	const contextBlocks = docs.map((d) => d.pageContent);
	const userContent = buildRagUserMessage(question, contextBlocks);
	const messages = buildLlmMessages(CORPORATE_SYSTEM_PROMPT, history, userContent);

	yield { type: "ping" };
	const stream = await chatModel.stream(messages, { signal });
	for await (const chunk of stream) {
		const text = extractTextFromMessageContent(chunk);
		if (text) yield { type: "delta", text };
	}

	log?.info("rag: stream done");
	yield { type: "done", sources };
}
