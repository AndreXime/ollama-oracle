interface SourceItem {
	readonly source: string;
	readonly excerpt: string;
}

interface SourcesListProps {
	readonly sources: readonly SourceItem[];
}

export function SourcesList({ sources }: SourcesListProps) {
	if (sources.length === 0) return null;
	return (
		<div className="mt-3 rounded-xl border border-border bg-surface px-3 py-2.5">
			<p className="font-serif text-sm text-ink mb-2">Fontes</p>
			<ul className="space-y-2">
				{sources.map((s) => (
					<li key={`${s.source}::${s.excerpt}`} className="text-sm">
						<span className="font-medium text-accent">{s.source}</span>
						<p className="text-ink-faint mt-0.5 line-clamp-3 leading-relaxed">{s.excerpt}</p>
					</li>
				))}
			</ul>
		</div>
	);
}
