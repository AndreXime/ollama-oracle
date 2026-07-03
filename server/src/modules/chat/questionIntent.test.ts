import { describe, expect, test } from "bun:test";
import {
	buildNoChunksUserMessage,
	isConversationalQuestion,
	isLikelyIncompleteFollowUp,
} from "./questionIntent.js";

describe("isConversationalQuestion", () => {
	test("saudações", () => {
		expect(isConversationalQuestion("Olá")).toBe(true);
		expect(isConversationalQuestion("Bom dia!")).toBe(true);
		expect(isConversationalQuestion("Obrigado")).toBe(true);
	});

	test("perguntas factuais não são conversacionais", () => {
		expect(isConversationalQuestion("Como funciona home office?")).toBe(false);
		expect(isConversationalQuestion("e para PJ?")).toBe(false);
	});
});

describe("isLikelyIncompleteFollowUp", () => {
	test("follow-ups curtos", () => {
		expect(isLikelyIncompleteFollowUp("e para PJ?")).toBe(true);
		expect(isLikelyIncompleteFollowUp("e o prazo?")).toBe(true);
	});

	test("pergunta completa não é follow-up", () => {
		expect(isLikelyIncompleteFollowUp("Como funciona home office para PJ?")).toBe(false);
	});
});

describe("buildNoChunksUserMessage", () => {
	test("follow-up pede pergunta completa", () => {
		const msg = buildNoChunksUserMessage("e para PJ?");
		expect(msg).toContain("histórico");
		expect(msg).toContain("pergunta completa");
	});

	test("pergunta completa sem match sugere reformular", () => {
		const msg = buildNoChunksUserMessage("Qual o código do imposto intergaláctico?");
		expect(msg).toContain("Não encontrei");
		expect(msg).toContain("Reformule");
	});
});
