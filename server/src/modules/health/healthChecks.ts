import { config } from "../../config/env.js";
import { createChromaHttpClient } from "../../shared/chroma.js";

const HEALTH_TIMEOUT_MS = 3_000;

interface DependencyHealth {
	readonly ok: boolean;
	readonly error?: string;
}

interface HealthReport {
	readonly ok: boolean;
	readonly ollama: DependencyHealth;
	readonly chroma: DependencyHealth;
}

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
	try {
		return await fetch(url, { ...init, signal: controller.signal });
	} finally {
		clearTimeout(timer);
	}
}

async function checkOllama(): Promise<DependencyHealth> {
	try {
		const res = await fetchWithTimeout(`${config.ollamaBaseUrl}/api/tags`);
		if (!res.ok) {
			return { ok: false, error: `HTTP ${res.status}` };
		}
		const body = (await res.json()) as { models?: unknown };
		if (!body.models || !Array.isArray(body.models)) {
			return { ok: false, error: "Resposta inesperada do Ollama" };
		}
		const names = body.models
			.map((m) => (m && typeof m === "object" && "name" in m ? String((m as { name: unknown }).name) : ""))
			.filter((n) => n.length > 0);
		const hasChat = names.some((n) => n.startsWith(config.ollamaChatModel));
		const hasEmbed = names.some((n) => n.startsWith(config.ollamaEmbedModel));
		if (!hasChat || !hasEmbed) {
			const missing: string[] = [];
			if (!hasChat) missing.push(config.ollamaChatModel);
			if (!hasEmbed) missing.push(config.ollamaEmbedModel);
			return { ok: false, error: `Modelos ausentes: ${missing.join(", ")}` };
		}
		return { ok: true };
	} catch (e) {
		const msg = e instanceof Error ? e.message : "Falha ao contactar Ollama";
		return { ok: false, error: msg };
	}
}

async function checkChroma(): Promise<DependencyHealth> {
	try {
		const client = createChromaHttpClient();
		await client.heartbeat();
		await client.getCollection({ name: config.chromaCollection });
		return { ok: true };
	} catch (e) {
		const msg = e instanceof Error ? e.message : "Falha ao contactar Chroma";
		return { ok: false, error: msg };
	}
}

export async function runHealthChecks(): Promise<HealthReport> {
	const [ollama, chroma] = await Promise.all([checkOllama(), checkChroma()]);
	return { ok: ollama.ok && chroma.ok, ollama, chroma };
}
