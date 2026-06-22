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

/** Enriquece a query de retrieval com turnos recentes para follow-ups ambíguos. */
export function buildRetrievalQuery(question: string, history: readonly ChatTurn[]): string {
	const recent = history.slice(-4);
	if (recent.length === 0) return question.trim();
	const parts = recent.map((t) => t.content.trim()).filter((c) => c.length > 0);
	parts.push(question.trim());
	return parts.join("\n");
}
