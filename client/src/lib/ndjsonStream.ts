export type NdjsonEvent =
	| { type: "ping" }
	| { type: "delta"; text: string }
	| { type: "done"; sources: { source: string; excerpt: string }[] }
	| { type: "error"; message: string };

export function isNdjsonEvent(v: unknown): v is NdjsonEvent {
	if (!v || typeof v !== "object" || !("type" in v)) return false;
	const t = (v as { type: unknown }).type;
	if (t === "ping") {
		return true;
	}
	if (t === "delta") {
		return "text" in v && typeof (v as { text?: unknown }).text === "string";
	}
	if (t === "done") {
		return "sources" in v && Array.isArray((v as { sources?: unknown }).sources);
	}
	if (t === "error") {
		return "message" in v && typeof (v as { message?: unknown }).message === "string";
	}
	return false;
}

export function parseNdjsonLine(line: string): NdjsonEvent | null {
	const trimmed = line.trim();
	if (!trimmed) return null;
	const parsed: unknown = JSON.parse(trimmed);
	if (!isNdjsonEvent(parsed)) {
		throw new Error("Evento de stream desconhecido");
	}
	return parsed;
}

interface NdjsonConsumeResult {
	readonly remaining: string;
	readonly events: readonly NdjsonEvent[];
}

/** Extrai linhas NDJSON completas de um buffer acumulado. */
export function consumeNdjsonBuffer(buffer: string): NdjsonConsumeResult {
	let buf = buffer;
	const events: NdjsonEvent[] = [];

	for (;;) {
		const nl = buf.indexOf("\n");
		if (nl < 0) break;
		const line = buf.slice(0, nl);
		buf = buf.slice(nl + 1);
		if (!line.trim()) continue;
		const event = parseNdjsonLine(line);
		if (event !== null) events.push(event);
	}

	return { remaining: buf, events };
}

export async function readNdjsonStream(
	reader: ReadableStreamDefaultReader<Uint8Array>,
	onEvent: (event: NdjsonEvent) => void,
	signal?: AbortSignal,
): Promise<void> {
	const dec = new TextDecoder();
	let buf = "";

	for (;;) {
		if (signal?.aborted) {
			await reader.cancel();
			return;
		}
		const { done, value } = await reader.read();
		if (done) break;
		buf += dec.decode(value, { stream: true });
		const consumed = consumeNdjsonBuffer(buf);
		buf = consumed.remaining;
		for (const ev of consumed.events) {
			onEvent(ev);
		}
	}

	buf += dec.decode();
	const tail = buf.trim();
	if (tail) {
		const event = parseNdjsonLine(tail);
		if (event !== null) onEvent(event);
	}
}
