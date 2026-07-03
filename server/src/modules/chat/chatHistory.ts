import { AIMessage, type BaseMessage, HumanMessage } from "@langchain/core/messages";

export interface ChatTurn {
	readonly role: "user" | "assistant";
	readonly content: string;
}

export function normalizeChatHistory(history: readonly ChatTurn[], maxMessages: number): readonly ChatTurn[] {
	if (maxMessages <= 0 || history.length === 0) return [];
	const trimmed = history.filter((t) => t.content.trim().length > 0).slice(-maxMessages);
	return trimmed;
}

export function chatHistoryToMessages(history: readonly ChatTurn[]): BaseMessage[] {
	return history.map((turn) => (turn.role === "user" ? new HumanMessage(turn.content) : new AIMessage(turn.content)));
}

/** Enriquece a query de retrieval (sem histórico — modelos pequenos poluem o embed). */
export function buildRetrievalQuery(question: string): string {
	return enrichInstitutionalRetrievalQuery(question);
}

function enrichInstitutionalRetrievalQuery(question: string): string {
	const q = question
		.trim()
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "");
	const asksIdentity =
		/\b(nome|chama|denominacao)\b/.test(q) &&
		/\b(empresa|organizacao|companhia|instituicao|corporacao)\b/.test(q);
	if (!asksIdentity) return question.trim();
	return `${question.trim()}\nLumina Tech NexusCloud Solutions perfil institucional quem somos`;
}
