import { Link } from "react-router-dom";

const STEPS = [
	{
		title: "Base de conhecimento",
		body: "Documentos da Atlas Academy em data_source/ são lidos, fragmentados e convertidos em embeddings. Os trechos ficam no ChromaDB.",
	},
	{
		title: "Retrieval",
		body: "Sua pergunta busca os trechos mais parecidos. Filtros de distância descartam matches fracos para não inventar política.",
	},
	{
		title: "Geração",
		body: "O Ollama recebe o prompt do Atlas com o contexto recuperado e responde em stream (texto aparece aos poucos).",
	},
	{
		title: "Fontes",
		body: "Ao terminar, a UI mostra de quais arquivos vieram os trechos (ex.: politicas_rh.md#p0-c0), para você conferir.",
	},
] as const;

export function HowItWorksPage() {
	return (
		<div className="flex-1 overflow-y-auto px-4 py-10 lg:px-8">
			<article className="mx-auto max-w-2xl space-y-10">
				<header className="space-y-4 border-b border-border pb-8">
					<h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Como funciona</h1>
					<p className="text-base leading-relaxed text-ink-muted">
						Em uma empresa, políticas e cursos ficam espalhados em dezenas de arquivos. O Oracle usa RAG local
						para achar o trecho certo e responder com base só nessa base, sem depender de nuvem externa.
					</p>
				</header>

				<ol className="space-y-8">
					{STEPS.map((step, i) => (
						<li key={step.title} className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
							<span className="font-serif text-2xl text-accent leading-none pt-0.5 tabular-nums">
								{String(i + 1).padStart(2, "0")}
							</span>
							<div className="space-y-1.5">
								<h2 className="font-serif text-xl text-ink tracking-tight">{step.title}</h2>
								<p className="text-sm leading-relaxed text-ink-muted">{step.body}</p>
							</div>
						</li>
					))}
				</ol>

				<Link
					to="/"
					className="inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-muted"
				>
					Abrir o Oracle
				</Link>
			</article>
		</div>
	);
}
