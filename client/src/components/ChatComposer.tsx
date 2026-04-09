import type { KeyboardEvent } from "react";

interface ChatComposerProps {
	readonly input: string;
	readonly loading: boolean;
	readonly onInputChange: (value: string) => void;
	readonly onSend: () => void;
}

const textareaClass =
	"flex-1 min-h-[48px] max-h-40 w-full rounded-xl bg-transparent px-1 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-0 resize-y";

const buttonClass =
	"shrink-0 rounded-xl bg-accent hover:bg-accent-muted px-5 py-3 text-sm font-medium text-white disabled:opacity-50 lg:min-w-[112px] lg:self-stretch lg:flex lg:items-center lg:justify-center lg:py-0";

export function ChatComposer({ input, loading, onInputChange, onSend }: ChatComposerProps) {
	const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			onSend();
		}
	};

	return (
		<div className="shrink-0">
			<div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
				<textarea
					className={`${textareaClass} rounded-xl bg-surface-raised border border-surface-border px-4 focus:ring-2 focus:ring-accent/50 lg:self-start`}
					placeholder="Pergunte algo sobre a base em data_source…"
					rows={2}
					value={input}
					disabled={loading}
					onChange={(e) => onInputChange(e.target.value)}
					onKeyDown={onKeyDown}
				/>
				<button
					type="button"
					className={buttonClass}
					disabled={loading || !input.trim()}
					onClick={onSend}
				>
					Enviar
				</button>
			</div>
		</div>
	);
}
