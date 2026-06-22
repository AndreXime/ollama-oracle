import { create } from "zustand";

export interface ChatMessage {
	readonly id: string;
	readonly role: "user" | "assistant";
	readonly content: string;
	readonly isStarted?: boolean;
	readonly sources?: readonly { source: string; excerpt: string }[];
}

export interface ChatSource {
	readonly source: string;
	readonly excerpt: string;
}

interface ChatMessagesState {
	readonly messages: readonly ChatMessage[];
	addMessage: (message: ChatMessage) => void;
	addMessages: (...messages: readonly ChatMessage[]) => void;
	appendAssistantText: (assistantId: string, text: string) => void;
	setAssistantSources: (assistantId: string, sources: readonly ChatSource[]) => void;
	removeEmptyAssistantPlaceholder: (assistantId: string) => void;
	completeAssistantPendingStart: (assistantId: string) => void;
}

export const useChatMessagesStore = create<ChatMessagesState>((set) => ({
	messages: [],

	addMessage: (message) =>
		set((s) => ({
			messages: [...s.messages, message],
		})),

	addMessages: (...incoming) =>
		set((s) => ({
			messages: [...s.messages, ...incoming],
		})),

	appendAssistantText: (assistantId, text) =>
		set((s) => ({
			messages: s.messages.map((msg) =>
				msg.id === assistantId ? { ...msg, content: msg.content + text, isStarted: true as const } : msg,
			),
		})),

	setAssistantSources: (assistantId, sources) =>
		set((s) => ({
			messages: s.messages.map((msg) => (msg.id === assistantId ? { ...msg, sources } : msg)),
		})),

	removeEmptyAssistantPlaceholder: (assistantId) =>
		set((s) => ({
			messages: s.messages.filter(
				(msg) => !(msg.id === assistantId && msg.role === "assistant" && msg.isStarted === false && msg.content === ""),
			),
		})),

	completeAssistantPendingStart: (assistantId) =>
		set((s) => ({
			messages: s.messages.map((msg) =>
				msg.id === assistantId && msg.role === "assistant" && msg.isStarted === false
					? { ...msg, isStarted: true as const }
					: msg,
			),
		})),
}));
