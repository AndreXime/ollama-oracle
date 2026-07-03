import { describe, expect, test } from "bun:test";
import { parseChatPromptMaxChunks, parseCorsOrigins, parseOptionalNonNegativeNumber } from "./env-parser.js";

describe("parseOptionalNonNegativeNumber", () => {
	test("retorna null para vazio", () => {
		expect(parseOptionalNonNegativeNumber(undefined)).toBeNull();
		expect(parseOptionalNonNegativeNumber("")).toBeNull();
		expect(parseOptionalNonNegativeNumber("   ")).toBeNull();
	});

	test("parseia número válido", () => {
		expect(parseOptionalNonNegativeNumber("0.55")).toBe(0.55);
		expect(parseOptionalNonNegativeNumber("0")).toBe(0);
	});

	test("retorna null para inválido", () => {
		expect(parseOptionalNonNegativeNumber("abc")).toBeNull();
		expect(parseOptionalNonNegativeNumber("-1")).toBeNull();
	});
});

describe("parseChatPromptMaxChunks", () => {
	test("default 3", () => {
		expect(parseChatPromptMaxChunks(undefined)).toBe(3);
		expect(parseChatPromptMaxChunks("")).toBe(3);
	});

	test("clamp entre 1 e 24", () => {
		expect(parseChatPromptMaxChunks("0")).toBe(1);
		expect(parseChatPromptMaxChunks("99")).toBe(24);
		expect(parseChatPromptMaxChunks("8")).toBe(8);
	});
});

describe("parseCorsOrigins", () => {
	test("asterisco libera tudo", () => {
		expect(parseCorsOrigins("*")).toBeNull();
		expect(parseCorsOrigins("  *  ")).toBeNull();
	});

	test("vazio libera tudo", () => {
		expect(parseCorsOrigins(undefined)).toBeNull();
		expect(parseCorsOrigins("")).toBeNull();
	});

	test("lista CSV de URLs", () => {
		expect(parseCorsOrigins("http://a.com, http://b.com")).toEqual(["http://a.com", "http://b.com"]);
	});
});
