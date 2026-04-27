import type { Express, Request, Response } from "express";
import { z } from "zod";
import type { Chroma } from "@langchain/community/vectorstores/chroma";
import type { ChatOllama } from "@langchain/ollama";
import { config } from "../../config/index.js";
import { streamRagChat } from "./ragChat.js";

const bodySchema = z.object({
	question: z.string().min(1).max(8000),
});

function isAbortError(e: unknown): boolean {
	if (e instanceof Error) {
		if (e.name === "AbortError") return true;
		if (/aborted|abort/i.test(e.message)) return true;
	}
	return false;
}

export interface ChatDeps {
	readonly vectorStore: Chroma;
	readonly chatModel: ChatOllama;
}

export function registerChatRoutes(app: Express, deps: ChatDeps): void {
	app.post("/chat", async (req: Request, res: Response) => {
		const parsed = bodySchema.safeParse(req.body);
		if (!parsed.success) {
			res.status(400).json({
				error: "Payload inválido",
				details: parsed.error.flatten(),
			});
			return;
		}
		const { question } = parsed.data;

		try {
			req.log.info({ qLen: question.length }, "chat: start");
			const abort = new AbortController();
			const onAborted = () => abort.abort();
			const onResClose = () => {
				if (!res.writableEnded) abort.abort();
			};
			req.on("aborted", onAborted);
			res.on("close", onResClose);

			res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
			res.setHeader("Cache-Control", "no-cache");

			try {
				for await (const ev of streamRagChat(
					deps.vectorStore,
					deps.chatModel,
					question,
					config.chatTopK,
					req.log,
					abort.signal,
				)) {
					if (abort.signal.aborted) break;
					res.write(`${JSON.stringify(ev)}\n`);
				}
			} catch (e) {
				if (abort.signal.aborted && (req.aborted || res.destroyed)) {
					req.log.info("chat: client disconnected — abort stream");
				} else if (isAbortError(e)) {
					req.log.warn("chat: stream aborted");
				} else {
					req.log.error(e);
					res.write(
						`${JSON.stringify({
							type: "error",
							message: e instanceof Error ? e.message : "Erro ao gerar resposta",
						})}\n`,
					);
				}
			} finally {
				req.off("aborted", onAborted);
				res.off("close", onResClose);
				if (!res.writableEnded) res.end();
			}
		} catch (e) {
			if (isAbortError(e)) {
				req.log.warn("chat: timeout (Ollama)");
				if (!res.headersSent) {
					res.status(504).json({
						error:
							"Tempo esgotado ao falar com o Ollama. Verifique se o serviço está ativo.",
					});
				}
				return;
			}
			req.log.error(e);
			if (!res.headersSent) {
				res.status(500).json({
					error: e instanceof Error ? e.message : "Erro interno no chat",
				});
			}
		}
	});
}
