/** Distância máxima no Chroma (menor = mais similar). `null` = não filtra (usa os top-K como antes). */
export function parseOptionalNonNegativeNumber(raw: string | undefined): number | null {
	const v = raw?.trim();
	if (v === undefined || v === "") return null;
	const n = Number(v);
	return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Teto de trechos no prompt do chat (evita saturar modelos locais). Vazio = 6. */
export function parseChatPromptMaxChunks(raw: string | undefined): number {
	const v = raw?.trim();
	if (v === undefined || v === "") return 6;
	const n = Number(v);
	if (!Number.isFinite(n)) return 6;
	return Math.min(24, Math.max(1, Math.floor(n)));
}

export function parseCorsOrigins(raw: string | undefined): readonly string[] | null {
	const v = raw?.trim();
	if (v === undefined || v === "" || v === "*") return null;
	return v
		.split(",")
		.map((s) => s.trim())
		.filter((s) => s.length > 0);
}
