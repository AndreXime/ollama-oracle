import { describe, expect, test } from "bun:test";
import { Document } from "@langchain/core/documents";
import { contentKey, dedupeScoredByContent, minDistanceByContent } from "./scoredDocuments.js";

describe("contentKey", () => {
	test("normaliza espaços", () => {
		const doc = new Document({ pageContent: "  foo   bar  \n baz " });
		expect(contentKey(doc)).toBe("foo bar baz");
	});
});

describe("dedupeScoredByContent", () => {
	test("mantém menor distância por conteúdo", () => {
		const d1 = new Document({ pageContent: "mesmo texto" });
		const d2 = new Document({ pageContent: "mesmo   texto" });
		const d3 = new Document({ pageContent: "outro" });
		const out = dedupeScoredByContent([
			[d1, 0.9],
			[d2, 0.3],
			[d3, 0.5],
		]);
		expect(out).toHaveLength(2);
		const same = out.find(([doc]) => contentKey(doc) === "mesmo texto");
		expect(same?.[1]).toBe(0.3);
	});
});

describe("minDistanceByContent", () => {
	test("mapeia menor distância por chave", () => {
		const d1 = new Document({ pageContent: "abc" });
		const d2 = new Document({ pageContent: "abc" });
		const m = minDistanceByContent([
			[d1, 0.8],
			[d2, 0.2],
		]);
		expect(m.get("abc")).toBe(0.2);
	});
});
