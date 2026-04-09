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
		<div className="mt-3 rounded-xl border border-surface-border bg-slate-900/40 px-3 py-2">
			<p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Fontes</p>
			<ul className="space-y-2">
				{sources.map((s, i) => (
					<li key={`${s.source}-${i}`} className="text-sm">
						<span className="text-accent font-medium">{s.source}</span>
						<p className="text-slate-400 mt-0.5 line-clamp-3">{s.excerpt}</p>
					</li>
				))}
			</ul>
		</div>
	);
}
