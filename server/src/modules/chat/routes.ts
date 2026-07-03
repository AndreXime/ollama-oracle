import type { Chroma } from "@langchain/community/vectorstores/chroma";
import type { ChatOllama } from "@langchain/ollama";
import type { Hono } from "hono";
import { stream } from "hono/streaming";
import { z } from "zod";
import { config } from "../../config/env.js";
import type { AppEnv } from "../../app.js";
import { normalizeChatHistory } from "./chatHistory.js";
import { appendRagConversationLog } from "./ragConversationLog.js";
import type { RagTurnStats } from "./rag/turnStats.js";
import { streamRagChat } from "./ragChat.js";

const MAX_BODY_BYTES = 1024 * 1024;

const historyEntrySchema = z.object({
	role: z.enum(["user", "assistant"]),
	content: z.string().min(1).max(8000),
});

const bodySchema = z.object({
	question: z.string().min(1).max(8000),
	history: z.array(historyEntrySchema).max(20).optional(),
});

function isAbortError(e: unknown): boolean {
	if (e instanceof Error) {
		if (e.name === "AbortError") return true;
		if (/aborted|abort/i.test(e.message)) return true;
	}
	return false;
}

interface ChatDeps {
	readonly vectorStore: Chroma;
	readonly chatModel: ChatOllama;
}

export function registerChatRoutes(app: Hono<AppEnv>, deps: ChatDeps): void {
	app.post("/chat", async (c) => {
		const contentLength = c.req.header("content-length");
		if (contentLength !== undefined && Number(contentLength) > MAX_BODY_BYTES) {
			return c.json({ error: "Payload too large" }, 413);
		}

		const rawBody: unknown = await c.req.json().catch(() => null);
		const parsed = bodySchema.safeParse(rawBody);
		if (!parsed.success) {
			return c.json(
				{
					error: "Payload inválido",
					details: parsed.error.flatten(),
				},
				400,
			);
		}

		const { question, history: rawHistory } = parsed.data;
		const history = normalizeChatHistory(rawHistory ?? [], config.chatHistoryMaxMessages);
		const log = c.var.logger;
		const requestId = c.var.requestId;

		try {
			log.info({ qLen: question.length, historyTurns: history.length }, "chat: start");

			c.header("Content-Type", "application/x-ndjson; charset=utf-8");
			c.header("Cache-Control", "no-cache");

			return stream(c, async (s) => {
				const abort = new AbortController();
				const onAbort = () => abort.abort();

				c.req.raw.signal.addEventListener("abort", onAbort);
				s.onAbort(onAbort);

				let answer = "";
				let turnStats: RagTurnStats | undefined;
				let streamError: string | undefined;
				const aborted = () => abort.signal.aborted || s.aborted;

				try {
					for await (const ev of streamRagChat(
						deps.vectorStore,
						deps.chatModel,
						question,
						config.chatTopK,
						history,
						log,
						abort.signal,
						(s) => {
							turnStats = s;
						},
					)) {
						if (aborted()) break;
						if (ev.type === "delta") answer += ev.text;
						await s.write(`${JSON.stringify(ev)}\n`);
					}
				} catch (e) {
					if (aborted() && (c.req.raw.signal.aborted || s.aborted)) {
						log.info("chat: client disconnected — abort stream");
					} else if (isAbortError(e)) {
						log.warn("chat: stream aborted");
					} else {
						log.error(e);
						streamError = e instanceof Error ? e.message : "Erro ao gerar resposta";
						await s.write(
							`${JSON.stringify({
								type: "error",
								message: streamError,
							})}\n`,
						);
					}
				} finally {
					c.req.raw.signal.removeEventListener("abort", onAbort);
					if (turnStats !== undefined) {
						void appendRagConversationLog({
							requestId,
							at: new Date().toISOString(),
							question,
							answer,
							historyTurns: history.length,
							aborted: aborted(),
							error: streamError,
							rag: turnStats,
						}).catch((err) => log.error(err, "rag: falha ao gravar log de conversa"));
					}
				}
			});
		} catch (e) {
			if (isAbortError(e)) {
				log.warn("chat: timeout (Ollama)");
				return c.json(
					{
						error: "Tempo esgotado ao falar com o Ollama. Verifique se o serviço está ativo.",
					},
					504,
				);
			}
			log.error(e);
			return c.json(
				{
					error: e instanceof Error ? e.message : "Erro interno no chat",
				},
				500,
			);
		}
	});
}
