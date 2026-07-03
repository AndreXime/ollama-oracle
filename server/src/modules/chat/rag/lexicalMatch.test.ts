import { describe, expect, test } from "bun:test";
import { Document } from "@langchain/core/documents";
import { lexicalOverlapScore, pickLexicallyMatchingDocs } from "./lexicalMatch.js";

describe("lexicalOverlapScore", () => {
	test("conta tokens da pergunta presentes no doc", () => {
		const doc = new Document({ pageContent: "Política de reembolso corporativo para viagens" });
		expect(lexicalOverlapScore("reembolso viagens", doc)).toBeGreaterThan(0);
	});

	test("retorna zero para pergunta só com stopwords curtas", () => {
		const doc = new Document({ pageContent: "qualquer texto" });
		expect(lexicalOverlapScore("o que é", doc)).toBe(0);
	});

	test("aceita prefixo parcial (typo) e metadata source", () => {
		const doc = new Document({
			pageContent: "Perfil da empresa brasileira",
			metadata: { source: "institucional_nexuscloud.md" },
		});
		expect(lexicalOverlapScore("nome empres", doc)).toBeGreaterThan(0);
	});
});

describe("pickLexicallyMatchingDocs", () => {
	test("exige pelo menos dois hits quando há vários tokens", () => {
		const docs = [
			new Document({ pageContent: "reembolso de despesas" }),
			new Document({ pageContent: "reembolso viagens corporativas" }),
			new Document({ pageContent: "benefícios saúde" }),
		];
		const picked = pickLexicallyMatchingDocs("reembolso viagens", docs);
		expect(picked).toHaveLength(1);
		expect(picked[0]?.pageContent).toContain("viagens");
	});
});
