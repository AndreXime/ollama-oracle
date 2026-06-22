import { useCallback, useEffect, useRef, useState } from "react";
import { isNdjsonEvent, readNdjsonStream } from "../lib/ndjsonStream";
import type { ChatMessage } from "../stores/chatMessagesStore";
import { useChatMessagesStore } from "../stores/chatMessagesStore";
import { ChatComposer } from "./ChatComposer";
import { MessageBubble } from "./MessageBubble";
import { NexusLogo } from "./NexusLogo";
import { SourcesList } from "./SourcesList";

const apiBase = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:3001";

function isAbortError(e: unknown): boolean {
	return e instanceof Error && e.name === "AbortError";
}

export function ChatWindow() {
	const messages = useChatMessagesStore((s) => s.messages);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const abortRef = useRef<AbortController | null>(null);

	useEffect(() => {
		return () => {
			abortRef.current?.abort();
		};
	}, []);

	const scrollToBottom = useCallback(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	const send = useCallback(async () => {
		const q = input.trim();
		if (!q || loading) return;
		setInput("");
		setError(null);

		abortRef.current?.abort();
		const abort = new AbortController();
		abortRef.current = abort;

		const {
			addMessages,
			appendAssistantText,
			setAssistantSources,
			removeEmptyAssistantPlaceholder,
			completeAssistantPendingStart,
		} = useChatMessagesStore.getState();

		const history = messages
			.filter((m) => m.content.trim().length > 0)
			.map((m) => ({ role: m.role, content: m.content }));

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
				body: JSON.stringify({ question: q, history }),
				signal: abort.signal,
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

			await readNdjsonStream(
				reader,
				(ev) => {
					if (!isNdjsonEvent(ev)) return;
					if (ev.type === "delta") {
						appendAssistantText(assistantId, ev.text);
						requestAnimationFrame(scrollToBottom);
					} else if (ev.type === "done") {
						setAssistantSources(assistantId, ev.sources);
					} else {
						throw new Error(ev.message);
					}
				},
				abort.signal,
			);
		} catch (e) {
			if (isAbortError(e)) return;
			setError((e as Error).message);
			removeEmptyAssistantPlaceholder(assistantId);
		} finally {
			if (abortRef.current === abort) {
				abortRef.current = null;
			}
			completeAssistantPendingStart(assistantId);
			setLoading(false);
			requestAnimationFrame(scrollToBottom);
		}
	}, [input, loading, messages, scrollToBottom]);

	const hasMessages = messages.length > 0;

	const composerBlock = (
		<>
			<ChatComposer input={input} loading={loading} onInputChange={setInput} onSend={() => void send()} />
			<p className="text-center text-xs leading-snug text-slate-500 px-1 pt-2.5">
				A IA pode errar ou inventar detalhes. Confira respostas importantes nas fontes e na base indexada.
			</p>
			<p className="text-center text-xs leading-snug text-slate-500 px-1">
				As respostas usam apenas o contexto indexado da pasta <code className="text-slate-500">data_source</code>.
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
										isPending={msg.role === "assistant" && msg.isStarted === false && loading}
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
