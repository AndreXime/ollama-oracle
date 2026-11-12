import { useState } from "react";
import { DEMO_AREAS, type DemoAreaId } from "../lib/demoPrompts";

interface PromptPanelProps {
	readonly onSelectPrompt: (question: string) => void;
	readonly disabled?: boolean;
}

const DEFAULT_AREA = DEMO_AREAS[0];

export function PromptPanel({ onSelectPrompt, disabled = false }: PromptPanelProps) {
	const [activeId, setActiveId] = useState<DemoAreaId>(DEFAULT_AREA.id);
	const active = DEMO_AREAS.find((a) => a.id === activeId) ?? DEFAULT_AREA;

	return (
		<section className="flex flex-col gap-3" aria-label="Perguntas sugeridas">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h2 className="font-serif text-lg text-ink tracking-tight sm:text-xl">Pergunte ao Oracle</h2>
					<p className="mt-0.5 text-xs text-ink-faint leading-relaxed">
						Escolha uma área e clique numa pergunta pronta.
					</p>
				</div>
				<div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Áreas">
					{DEMO_AREAS.map((area) => {
						const selected = area.id === active.id;
						return (
							<button
								key={area.id}
								type="button"
								role="tab"
								aria-selected={selected}
								className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
									selected
										? "bg-ink text-surface-raised"
										: "text-ink-muted hover:bg-surface-raised hover:text-ink"
								}`}
								onClick={() => setActiveId(area.id)}
							>
								{area.label}
							</button>
						);
					})}
				</div>
			</div>
			<ul className="flex flex-col gap-1 sm:flex-row sm:flex-wrap" role="tabpanel">
				{active.prompts.map((prompt) => (
					<li key={prompt} className="sm:max-w-full">
						<button
							type="button"
							disabled={disabled}
							onClick={() => onSelectPrompt(prompt)}
							className="group w-full text-left rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-ink-muted transition-colors hover:border-accent/40 hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
						>
							<span className="mr-1.5 font-serif text-accent opacity-70 group-hover:opacity-100">→</span>
							{prompt}
						</button>
					</li>
				))}
			</ul>
		</section>
	);
}
