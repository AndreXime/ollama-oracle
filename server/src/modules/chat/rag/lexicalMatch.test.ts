import { describe, expect, test } from "bun:test";
import { Document } from "@langchain/core/documents";
import { lexicalOverlapScore, pickLexicallyMatchingDocs, pruneWeakLexicalMatches } from "./lexicalMatch.js";

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
			metadata: { source: "institucional_lumina.md" },
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

describe("pruneWeakLexicalMatches", () => {
	test("mantém só trechos com overlap próximo ao melhor", () => {
		const authGateway = new Document({
			pageContent:
				"NCS-AUTH-GATEWAY Auth Gateway Session Broker stack Node.js Fastify Redis OpenID Connect",
		});
		const userDir = new Document({
			pageContent: "NCS-USER-DIRECTORY integração com NCS-AUTH-GATEWAY em 60 segundos",
		});
		const audit = new Document({ pageContent: "NCS-AUDIT-SINK Go Kafka eventos ingest" });
		const ranked = [
			{ doc: authGateway, distance: 0.78 },
			{ doc: userDir, distance: 1.05 },
			{ doc: audit, distance: 1.02 },
		];
		const pruned = pruneWeakLexicalMatches(
			"Qual a stack do projeto Auth Gateway Session Broker?",
			ranked,
		);
		expect(pruned).toHaveLength(1);
		expect(pruned[0]?.doc.pageContent).toContain("NCS-AUTH-GATEWAY");
	});
});
