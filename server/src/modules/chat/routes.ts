import { Readable } from "node:stream";
import type { FastifyInstance } from "fastify";
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

export async function registerChatRoutes(app: FastifyInstance, deps: ChatDeps): Promise<void> {
	app.post("/chat", async (request, reply) => {
		const parsed = bodySchema.safeParse(request.body);
		if (!parsed.success) {
			return reply.status(400).send({
				error: "Payload inválido",
				details: parsed.error.flatten(),
			});
		}
		const { question } = parsed.data;

		try {
			request.log.info({ qLen: question.length }, "chat: start");
			const abort = new AbortController();
			const onAborted = () => abort.abort();
			const onResClose = () => {
				if (!reply.raw.writableEnded) abort.abort();
			};
			request.raw.on("aborted", onAborted);
			reply.raw.on("close", onResClose);

			const ndjson = Readable.from(
				(async function* () {
					try {
						for await (const ev of streamRagChat(
							deps.vectorStore,
							deps.chatModel,
							question,
							config.chatTopK,
							request.log,
							abort.signal,
						)) {
							if (abort.signal.aborted) return;
							yield Buffer.from(`${JSON.stringify(ev)}\n`, "utf8");
						}
					} catch (e) {
						if (abort.signal.aborted && (request.raw.aborted || reply.raw.destroyed)) {
							request.log.info("chat: client disconnected — abort stream");
							return;
						}
						if (isAbortError(e)) {
							request.log.warn("chat: stream aborted");
							return;
						}
						request.log.error(e);
						yield Buffer.from(
							`${JSON.stringify({
								type: "error",
								message: e instanceof Error ? e.message : "Erro ao gerar resposta",
							})}\n`,
							"utf8",
						);
					} finally {
						request.raw.off("aborted", onAborted);
						reply.raw.off("close", onResClose);
					}
				})(),
			);

			return reply
				.header("Content-Type", "application/x-ndjson; charset=utf-8")
				.header("Cache-Control", "no-cache")
				.send(ndjson);
		} catch (e) {
			if (isAbortError(e)) {
				request.log.warn("chat: timeout (Ollama)");
				return reply.status(504).send({
					error:
						"Tempo esgotado ao falar com o Ollama. Verifique se o serviço está ativo.",
				});
			}
			request.log.error(e);
			return reply.status(500).send({
				error: e instanceof Error ? e.message : "Erro interno no chat",
			});
		}
	});
}
