import { useCallback, useEffect, useRef, useState } from "react";
import { isNdjsonEvent, readNdjsonStream } from "../lib/ndjsonStream";
import type { ChatMessage } from "../stores/chatMessagesStore";
import { useChatMessagesStore } from "../stores/chatMessagesStore";
import { AtlasLogo } from "./AtlasLogo";
import { ChatComposer } from "./ChatComposer";
import { MessageBubble } from "./MessageBubble";
import { SourcesList } from "./SourcesList";

function isAbortError(e: unknown): boolean {
	return e instanceof Error && e.name === "AbortError";
}

export interface ChatAskRequest {
	readonly id: number;
	readonly question: string;
}

interface ChatWindowProps {
	readonly askRequest?: ChatAskRequest | null;
	readonly onAskHandled?: (id: number) => void;
	readonly onQuestionSent?: (question: string) => void;
	readonly onBusyChange?: (busy: boolean) => void;
}

export function ChatWindow({ askRequest = null, onAskHandled, onQuestionSent, onBusyChange }: ChatWindowProps) {
	const messages = useChatMessagesStore((s) => s.messages);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const abortRef = useRef<AbortController | null>(null);
	const inFlightRef = useRef(false);
	const handledAskIdRef = useRef<number | null>(null);

	useEffect(() => {
		return () => {
			abortRef.current?.abort();
		};
	}, []);

	useEffect(() => {
		onBusyChange?.(loading);
	}, [loading, onBusyChange]);

	const scrollToBottom = useCallback(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	const send = useCallback(
		async (questionOverride?: string) => {
			const q = (questionOverride ?? input).trim();
			if (!q || inFlightRef.current) return;
			inFlightRef.current = true;
			setInput("");
			setError(null);
			onQuestionSent?.(q);

			abortRef.current?.abort();
			const abort = new AbortController();
			abortRef.current = abort;

			const {
				messages: storeMessages,
				addMessages,
				appendAssistantText,
				setAssistantSources,
				removeEmptyAssistantPlaceholder,
				completeAssistantPendingStart,
			} = useChatMessagesStore.getState();

			const history = storeMessages
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
				const res = await fetch("/chat", {
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
						if (ev.type === "ping") return;
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
				inFlightRef.current = false;
				if (abortRef.current === abort) {
					abortRef.current = null;
				}
				completeAssistantPendingStart(assistantId);
				setLoading(false);
				requestAnimationFrame(scrollToBottom);
			}
		},
		[input, scrollToBottom, onQuestionSent],
	);

	useEffect(() => {
		if (!askRequest) return;
		if (handledAskIdRef.current === askRequest.id) return;
		handledAskIdRef.current = askRequest.id;
		void send(askRequest.question).finally(() => {
			onAskHandled?.(askRequest.id);
		});
	}, [askRequest, send, onAskHandled]);

	const hasMessages = messages.length > 0;

	const composerBlock = (
		<>
			<ChatComposer input={input} loading={loading} onInputChange={setInput} onSend={() => void send()} />
			<p className="text-center text-xs leading-snug text-ink-faint px-1 pt-2.5">
				A IA pode errar. Confira respostas importantes nas fontes e na base indexada.
			</p>
		</>
	);

	return (
		<div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-1 flex-col px-4 pb-4 pt-4 lg:px-8">
			{!hasMessages ? (
				<div className="empty-rise flex min-h-0 flex-1 flex-col items-center justify-center gap-7 py-8">
					<AtlasLogo />
					<p className="max-w-md text-center text-sm text-ink-muted leading-relaxed">
						Clique numa pergunta abaixo ou digite a sua. Respostas com base na Atlas Academy e fontes
						citadas.
					</p>
					<div className="w-full max-w-2xl space-y-1">{composerBlock}</div>
					{error && (
						<p className="text-sm text-danger text-center px-2" role="alert">
							{error}
						</p>
					)}
				</div>
			) : (
				<div className="flex min-h-0 flex-1 flex-col gap-3">
					<header className="shrink-0 border-b border-border pb-3">
						<AtlasLogo compact />
					</header>
					<div className="min-h-0 flex-1 overflow-y-auto space-y-4 py-1">
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
							<p className="text-sm text-danger" role="alert">
								{error}
							</p>
						)}
						<div ref={bottomRef} />
					</div>
					<div className="shrink-0 border-t border-border pt-3">{composerBlock}</div>
				</div>
			)}
		</div>
	);
}
