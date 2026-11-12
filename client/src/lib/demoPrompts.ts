export type DemoAreaId = "onboarding" | "rh" | "cursos" | "ti";

export interface DemoArea {
	readonly id: DemoAreaId;
	readonly label: string;
	readonly prompts: readonly string[];
}

export const DEMO_AREAS = [
	{
		id: "onboarding",
		label: "Onboarding",
		prompts: [
			"O que preciso fazer nos primeiros 7 dias?",
			"Quais trilhas são obrigatórias no onboarding?",
			"Como peço acesso aos sistemas no início?",
		],
	},
	{
		id: "rh",
		label: "RH e benefícios",
		prompts: [
			"Como solicito férias?",
			"Quais benefícios a empresa oferece?",
			"O que faço se esquecer de bater o ponto?",
		],
	},
	{
		id: "cursos",
		label: "Cursos e trilhas",
		prompts: [
			"Quais cursos de Python existem no catálogo?",
			"Quando abrem as turmas de ATL-PY-101?",
			"Qual é o nome da Atlas Academy?",
		],
	},
	{
		id: "ti",
		label: "TI e acessos",
		prompts: [
			"Como reseto minha senha?",
			"Como peço VPN e notebook?",
			"Como solicito acesso a um sistema?",
		],
	},
] as const satisfies readonly [DemoArea, ...DemoArea[]];

export function listAllDemoPrompts(): readonly string[] {
	return DEMO_AREAS.flatMap((a) => a.prompts);
}
