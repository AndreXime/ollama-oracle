import { describe, expect, test } from "bun:test";
import { consumeNdjsonBuffer, isNdjsonEvent, parseNdjsonLine } from "./ndjsonStream.js";

describe("isNdjsonEvent", () => {
	test("valida delta, done e error", () => {
		expect(isNdjsonEvent({ type: "delta", text: "a" })).toBe(true);
		expect(isNdjsonEvent({ type: "done", sources: [] })).toBe(true);
		expect(isNdjsonEvent({ type: "error", message: "x" })).toBe(true);
		expect(isNdjsonEvent({ type: "unknown" })).toBe(false);
		expect(isNdjsonEvent(null)).toBe(false);
	});
});

describe("parseNdjsonLine", () => {
	test("parseia linha válida", () => {
		expect(parseNdjsonLine('{"type":"delta","text":"oi"}')).toEqual({
			type: "delta",
			text: "oi",
		});
	});

	test("ignora linha vazia", () => {
		expect(parseNdjsonLine("   ")).toBeNull();
	});

	test("rejeita evento desconhecido", () => {
		expect(() => parseNdjsonLine('{"type":"nope"}')).toThrow("Evento de stream desconhecido");
	});
});

describe("consumeNdjsonBuffer", () => {
	test("extrai eventos completos e deixa resto no buffer", () => {
		const buf = '{"type":"delta","text":"a"}\n{"type":"delta","text":"b"}\n{"type":"del';
		const { events, remaining } = consumeNdjsonBuffer(buf);
		expect(events).toHaveLength(2);
		expect(events[0]).toEqual({ type: "delta", text: "a" });
		expect(remaining).toBe('{"type":"del');
	});
});
