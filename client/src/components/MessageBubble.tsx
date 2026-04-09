import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
	readonly role: "user" | "assistant";
	readonly content: string;
	readonly isPending?: boolean;
}

function AssistantTypingDots() {
	return (
		<span
			className="inline-flex items-end gap-1.5 min-h-[1.25em] py-0.5"
			aria-hidden
		>
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
				className={`max-w-[min(100%,42rem)] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
					isUser
						? "bg-accent text-white rounded-br-md"
						: "bg-surface-raised text-slate-100 border border-surface-border rounded-bl-md"
				}`}
			>
				{isUser ? (
					<p className="whitespace-pre-wrap">{content}</p>
				) : showAssistantPending ? (
					<p className="m-0" aria-live="polite" aria-label="Assistente está respondendo">
						<AssistantTypingDots />
					</p>
				) : (
					<div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-headings:mt-3 prose-headings:mb-1 prose-ul:my-2 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-surface-border">
						<ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
					</div>
				)}
			</div>
		</div>
	);
}
