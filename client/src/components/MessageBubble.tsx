import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
	readonly role: "user" | "assistant";
	readonly content: string;
	readonly isPending?: boolean;
}

function AssistantTypingDots() {
	return (
		<span className="inline-flex items-end gap-1.5 min-h-[1.25em] py-0.5" aria-hidden>
			<span className="assistant-typing-dot" />
			<span className="assistant-typing-dot" />
			<span className="assistant-typing-dot" />
		</span>
	);
}

export function MessageBubble({ role, content, isPending = false }: MessageBubbleProps) {
	const isUser = role === "user";
	const showAssistantPending = !isUser && isPending;

	return (
		<div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
			<div
				className={`max-w-[min(100%,42rem)] px-4 py-3 text-[15px] leading-relaxed ${
					isUser
						? "rounded-2xl rounded-br-md bg-accent text-white shadow-[0_6px_18px_-10px_rgba(15,107,107,0.65)]"
						: "rounded-2xl rounded-bl-md border border-border bg-surface-raised text-ink shadow-[0_8px_22px_-14px_rgba(12,27,51,0.35)]"
				}`}
			>
				{isUser ? (
					<p className="whitespace-pre-wrap">{content}</p>
				) : showAssistantPending ? (
					<div className="m-0" role="status" aria-live="polite" aria-label="Assistente está respondendo">
						<AssistantTypingDots />
					</div>
				) : (
					<div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-ink prose-p:text-ink prose-p:my-2 prose-headings:mt-3 prose-headings:mb-1 prose-ul:my-2 prose-a:text-accent prose-strong:text-ink prose-code:text-accent-muted prose-pre:bg-paper prose-pre:border prose-pre:border-border">
						<ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
					</div>
				)}
			</div>
		</div>
	);
}
