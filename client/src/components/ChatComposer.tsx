import type { KeyboardEvent } from "react";

interface ChatComposerProps {
	readonly input: string;
	readonly loading: boolean;
	readonly onInputChange: (value: string) => void;
	readonly onSend: () => void;
}

export function ChatComposer({ input, loading, onInputChange, onSend }: ChatComposerProps) {
	const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			onSend();
		}
	};

	return (
		<div className="shrink-0">
			<div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-raised p-2 shadow-[0_10px_28px_-18px_rgba(12,27,51,0.4)] sm:flex-row sm:items-stretch">
				<textarea
					className="flex-1 min-h-12 max-h-40 w-full resize-y rounded-lg bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none sm:self-start"
					placeholder="Pergunte sobre políticas, cursos ou onboarding…"
					rows={2}
					value={input}
					disabled={loading}
					onChange={(e) => onInputChange(e.target.value)}
					onKeyDown={onKeyDown}
				/>
				<button
					type="button"
					className="shrink-0 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-muted disabled:opacity-50 sm:min-w-28 sm:self-stretch sm:flex sm:items-center sm:justify-center sm:py-0"
					disabled={loading || !input.trim()}
					onClick={onSend}
				>
					Enviar
				</button>
			</div>
		</div>
	);
}
