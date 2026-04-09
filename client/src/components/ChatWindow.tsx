import { useCallback, useRef, useState } from "react";
import type { ChatMessage } from "../stores/chatMessagesStore";
import { useChatMessagesStore } from "../stores/chatMessagesStore";
import { ChatComposer } from "./ChatComposer";
import { MessageBubble } from "./MessageBubble";
import { NexusLogo } from "./NexusLogo";
import { SourcesList } from "./SourcesList";

type NdjsonEvent =
	| { type: "delta"; text: string }
	| { type: "done"; sources: { source: string; excerpt: string }[] }
	| { type: "error"; message: string };

const apiBase = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:3001";

function isNdjsonEvent(v: unknown): v is NdjsonEvent {
	if (!v || typeof v !== "object" || !("type" in v)) return false;
	const t = (v as { type: unknown }).type;
	if (t === "delta") {
		return "text" in v && typeof (v as { text?: unknown }).text === "string";
	}
	if (t === "done") {
		return "sources" in v && Array.isArray((v as { sources?: unknown }).sources);
	}
	if (t === "error") {
		return "message" in v && typeof (v as { message?: unknown }).message === "string";
	}
	return false;
}

export function ChatWindow() {
	const messages = useChatMessagesStore((s) => s.messages);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const bottomRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = useCallback(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	const send = useCallback(async () => {
		const q = input.trim();
		if (!q || loading) return;
		setInput("");
		setError(null);

		const {
			addMessages,
			appendAssistantText,
			setAssistantSources,
			removeEmptyAssistantPlaceholder,
			completeAssistantPendingStart,
		} = useChatMessagesStore.getState();

		const userMsg: ChatMessage = {
			id: crypto.randomUUID(),
			role: "user",
			content: q,
		};
		const assistantId = crypto.randomUUID();
		const assistantPlaceholder: ChatMessage = {
			id: assistantId,
			role: "assistant",
			content: "",
			isStarted: false,
		};
		addMessages(userMsg, assistantPlaceholder);
		setLoading(true);
		requestAnimationFrame(scrollToBottom);

		try {
			const res = await fetch(`${apiBase}/chat`, {
				method: "POST",
				headers: { "Content-Type": "application/json", Accept: "application/x-ndjson" },
				body: JSON.stringify({ question: q }),
			});

			if (!res.ok) {
				const errBody = (await res.json().catch(() => null)) as {
					error?: string;
				} | null;
				throw new Error(errBody?.error ?? `HTTP ${res.status}`);
			}

			const reader = res.body?.getReader();
			if (!reader) {
				throw new Error("Resposta sem corpo (stream)");
			}

			const dec = new TextDecoder();
			let buf = "";

			const appendAssistant = (text: string) => {
				appendAssistantText(assistantId, text);
				requestAnimationFrame(scrollToBottom);
			};

			const attachSources = (sources: readonly { source: string; excerpt: string }[]) => {
				setAssistantSources(assistantId, sources);
			};

			for (;;) {
				const { done, value } = await reader.read();
				if (done) break;
				buf += dec.decode(value, { stream: true });

				for (;;) {
					const nl = buf.indexOf("\n");
					if (nl < 0) break;
					const line = buf.slice(0, nl).trim();
					buf = buf.slice(nl + 1);
					if (!line) continue;

					let parsed: unknown;
					try {
						parsed = JSON.parse(line) as unknown;
					} catch {
						throw new Error("Linha NDJSON inválida na resposta");
					}
					if (!isNdjsonEvent(parsed)) {
						throw new Error("Evento de stream desconhecido");
					}
					if (parsed.type === "delta") {
						appendAssistant(parsed.text);
					} else if (parsed.type === "done") {
						attachSources(parsed.sources);
					} else {
						throw new Error(parsed.message);
					}
				}
			}

			buf += dec.decode();
			const tail = buf.trim();
			if (tail) {
				let parsed: unknown;
				try {
					parsed = JSON.parse(tail) as unknown;
				} catch {
					throw new Error("Resposta NDJSON incompleta");
				}
				if (isNdjsonEvent(parsed)) {
					if (parsed.type === "delta") {
						appendAssistant(parsed.text);
					} else if (parsed.type === "done") {
						attachSources(parsed.sources);
					} else {
						throw new Error(parsed.message);
					}
				}
			}
		} catch (e) {
			setError((e as Error).message);
			removeEmptyAssistantPlaceholder(assistantId);
		} finally {
			completeAssistantPendingStart(assistantId);
			setLoading(false);
			requestAnimationFrame(scrollToBottom);
		}
	}, [input, loading, scrollToBottom]);

	const hasMessages = messages.length > 0;

	const composerBlock = (
		<>
			<ChatComposer
				input={input}
				loading={loading}
				onInputChange={setInput}
				onSend={() => void send()}
			/>
			<p className="text-center text-xs leading-snug text-slate-500 px-1 pt-2.5">
				A IA pode errar ou inventar detalhes. Confira respostas importantes nas fontes e na base
				indexada.
			</p>
			<p className="text-center text-xs leading-snug text-slate-500 px-1">
				As respostas usam apenas o contexto indexado da pasta{" "}
				<code className="text-slate-500">data_source</code>.
			</p>
		</>
	);

	return (
		<div className="flex flex-col flex-1 w-full min-h-0 mx-auto px-4 pb-4 lg:px-8 max-w-3xl">
			<div className="flex flex-col flex-1 min-h-0">
				{!hasMessages ? (
					<div className="flex flex-1 flex-col items-center justify-center gap-8 min-h-0 py-8">
						<NexusLogo />
						<div className="w-full max-w-2xl shrink-0 space-y-1">{composerBlock}</div>
						{error && (
							<p className="text-sm text-red-400 text-center px-2 shrink-0" role="alert">
								{error}
							</p>
						)}
					</div>
				) : (
					<>
						<header className="shrink-0 border-b border-surface-border py-4">
							<NexusLogo />
						</header>
						<div className="h-[60dvh] min-h-0 shrink-0 overflow-y-auto py-3 space-y-4">
							{messages.map((msg) => (
								<div key={msg.id}>
									<MessageBubble
										role={msg.role}
										content={msg.content}
										isPending={
											msg.role === "assistant" && msg.isStarted === false && loading
										}
									/>
									{msg.role === "assistant" && msg.sources && <SourcesList sources={msg.sources} />}
								</div>
							))}
							{error && (
								<p className="text-sm text-red-400" role="alert">
									{error}
								</p>
							)}
							<div ref={bottomRef} />
						</div>
						<div className="shrink-0 border-t border-surface-border pt-3 pb-2">{composerBlock}</div>
					</>
				)}
			</div>
		</div>
	);
}
