import type { Document } from "@langchain/core/documents";

export type ScoredDoc = readonly [Document, number];

export function contentKey(doc: Document): string {
	return doc.pageContent.replace(/\s+/g, " ").trim();
}

export function dedupeScoredByContent(items: readonly ScoredDoc[]): ScoredDoc[] {
	const best = new Map<string, ScoredDoc>();
	for (const pair of items) {
		const [doc, dist] = pair;
		const k = contentKey(doc);
		if (!k) continue;
		const prev = best.get(k);
		if (prev === undefined || dist < prev[1]) best.set(k, pair);
	}
	return [...best.values()];
}

export function minDistanceByContent(scored: readonly ScoredDoc[]): Map<string, number> {
	const m = new Map<string, number>();
	for (const [doc, dist] of scored) {
		const k = contentKey(doc);
		if (!k) continue;
		const prev = m.get(k);
		if (prev === undefined || dist < prev) m.set(k, dist);
	}
	return m;
}
