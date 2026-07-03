import { describe, expect, test } from "bun:test";
import { buildRetrievalQuery, normalizeChatHistory } from "./chatHistory.js";

describe("normalizeChatHistory", () => {
	test("remove turnos vazios e limita quantidade", () => {
		const history = [
			{ role: "user" as const, content: "   " },
			{ role: "user" as const, content: "a" },
			{ role: "assistant" as const, content: "b" },
			{ role: "user" as const, content: "c" },
		];
		expect(normalizeChatHistory(history, 2)).toEqual([
			{ role: "assistant", content: "b" },
			{ role: "user", content: "c" },
		]);
	});

	test("retorna vazio quando max é zero", () => {
		expect(normalizeChatHistory([{ role: "user", content: "x" }], 0)).toEqual([]);
	});
});

describe("buildRetrievalQuery", () => {
	test("sem histórico retorna só a pergunta", () => {
		expect(buildRetrievalQuery("  reembolso?  ", [])).toBe("reembolso?");
	});

	test("inclui turnos recentes", () => {
		const q = buildRetrievalQuery("e o prazo?", [
			{ role: "user", content: "Como pedir reembolso?" },
			{ role: "assistant", content: "Via portal RH." },
		]);
		expect(q).toContain("Como pedir reembolso?");
		expect(q).toContain("Via portal RH.");
		expect(q).toContain("e o prazo?");
	});

	test("enriquece pergunta sobre nome da empresa", () => {
		const q = buildRetrievalQuery("Como é o nome da empresa?", []);
		expect(q).toContain("Lumina Tech");
		expect(q).toContain("institucional");
	});
});
