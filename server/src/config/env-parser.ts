import { existsSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function findRepoRoot(): string {
	const startDir = dirname(fileURLToPath(import.meta.url));
	let d = resolve(startDir);
	for (let i = 0; i < 15; i++) {
		if (existsSync(resolve(d, "server/package.json")) && existsSync(resolve(d, "client/package.json"))) {
			return d;
		}
		const parent = dirname(d);
		if (parent === d) break;
		d = parent;
	}
	return process.cwd();
}

export function findServerPackageDir(): string {
	return resolve(findRepoRoot(), "server");
}

export function resolveRepoPath(path: string): string {
	return isAbsolute(path) ? path : resolve(findRepoRoot(), path);
}

/** Distância máxima no Chroma (menor = mais similar). `null` = não filtra (usa os top-K como antes). */
export function parseOptionalNonNegativeNumber(raw: string | undefined): number | null {
	const v = raw?.trim();
	if (v === undefined || v === "") return null;
	const n = Number(v);
	return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Teto de trechos no prompt do chat (evita saturar modelos locais). Vazio = 3. */
export function parseChatPromptMaxChunks(raw: string | undefined): number {
	const v = raw?.trim();
	if (v === undefined || v === "") return 3;
	const n = Number(v);
	if (!Number.isFinite(n)) return 3;
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
