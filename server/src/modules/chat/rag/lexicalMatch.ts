import type { Document } from "@langchain/core/documents";

export function lexicalOverlapScore(question: string, doc: Document): number {
	const tokens = tokenizeForLexicalMatch(question);
	if (tokens.length === 0) return 0;
	const hay = doc.pageContent.toLowerCase();
	let n = 0;
	for (const t of tokens) {
		if (hay.includes(t)) n += 1;
	}
	return n;
}

export function pickLexicallyMatchingDocs(question: string, docs: readonly Document[]): Document[] {
	const tokens = tokenizeForLexicalMatch(question);
	if (tokens.length === 0) return [];
	const minHits = tokens.length >= 2 ? 2 : 1;
	const out: Document[] = [];
	for (const doc of docs) {
		const hay = doc.pageContent.toLowerCase();
		let hits = 0;
		for (const t of tokens) {
			if (hay.includes(t)) hits += 1;
			if (hits >= minHits) break;
		}
		if (hits >= minHits) out.push(doc);
	}
	return out;
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
	]);
	return s
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^\p{L}\p{N}\s]/gu, " ")
		.split(/\s+/)
		.map((t) => t.trim())
		.filter((t) => t.length >= 4 && !stop.has(t));
}
