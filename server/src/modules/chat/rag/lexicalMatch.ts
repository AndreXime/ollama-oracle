import type { Document } from "@langchain/core/documents";

export function lexicalOverlapScore(question: string, doc: Document): number {
	const tokens = tokenizeForLexicalMatch(question);
	if (tokens.length === 0) return 0;
	const hay = docSearchHaystack(doc);
	let n = 0;
	for (const t of tokens) {
		if (tokenMatchesHay(t, hay)) n += 1;
	}
	return n;
}

export function pickLexicallyMatchingDocs(question: string, docs: readonly Document[]): Document[] {
	const tokens = tokenizeForLexicalMatch(question);
	if (tokens.length === 0) return [];
	const minHits = tokens.length >= 2 ? 2 : 1;
	const out: Document[] = [];
	for (const doc of docs) {
		const hay = docSearchHaystack(doc);
		let hits = 0;
		for (const t of tokens) {
			if (tokenMatchesHay(t, hay)) hits += 1;
			if (hits >= minHits) break;
		}
		if (hits >= minHits) out.push(doc);
	}
	return out;
}

/** No fallback lexical, descarta trechos com overlap bem menor que o melhor (reduz ruído e prompt). */
export function pruneWeakLexicalMatches<T extends { readonly doc: Document; readonly distance: number }>(
	question: string,
	ranked: readonly T[],
): T[] {
	if (ranked.length === 0) return [];
	let bestLex = 0;
	for (const row of ranked) {
		bestLex = Math.max(bestLex, lexicalOverlapScore(question, row.doc));
	}
	if (bestLex <= 0) return [...ranked];
	const minLex = Math.max(2, bestLex - 1);
	return ranked.filter((row) => lexicalOverlapScore(question, row.doc) >= minLex);
}

function docSearchHaystack(doc: Document): string {
	const source = typeof doc.metadata?.source === "string" ? doc.metadata.source : "";
	return `${source}\n${doc.pageContent}`.toLowerCase();
}

function tokenMatchesHay(token: string, hay: string): boolean {
	if (hay.includes(token)) return true;
	if (token.length < 4) return false;
	for (const word of hay.split(/\s+/)) {
		const clean = word.replace(/[^\p{L}\p{N}]/gu, "");
		if (clean.length >= token.length && clean.startsWith(token)) return true;
	}
	return false;
}

function tokenizeForLexicalMatch(s: string): readonly string[] {
	const stop = new Set([
		"a",
		"o",
		"os",
		"as",
		"um",
		"uma",
		"de",
		"do",
		"da",
		"dos",
		"das",
		"qual",
		"quais",
		"quem",
		"cargo",
		"função",
		"funcao",
		"posição",
		"posicao",
		"é",
		"e",
		"como",
		"que",
	]);
	return s
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^\p{L}\p{N}\s]/gu, " ")
		.split(/\s+/)
		.map((t) => t.trim())
		.filter((t) => t.length >= 3 && !stop.has(t));
}
