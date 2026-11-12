import { describe, expect, test } from "bun:test";
import { DEMO_AREAS, listAllDemoPrompts } from "./demoPrompts";

describe("demoPrompts", () => {
	test("tem as quatro áreas na ordem", () => {
		expect(DEMO_AREAS.map((a) => a.id)).toEqual(["onboarding", "rh", "cursos", "ti"]);
	});

	test("cada área tem ao menos 3 perguntas não vazias", () => {
		for (const area of DEMO_AREAS) {
			expect(area.prompts.length).toBeGreaterThanOrEqual(3);
			for (const p of area.prompts) {
				expect(p.trim().length).toBeGreaterThan(0);
			}
		}
	});

	test("listAllDemoPrompts agrega sem vazios", () => {
		const all = listAllDemoPrompts();
		expect(all.length).toBeGreaterThanOrEqual(12);
		expect(all.every((p) => p.trim().length > 0)).toBe(true);
	});
});
