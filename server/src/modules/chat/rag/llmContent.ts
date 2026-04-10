import type { BaseMessage } from "@langchain/core/messages";

export function extractTextFromMessageContent(message: { content: BaseMessage["content"] }): string {
	const c = message.content;
	if (typeof c === "string") return c;
	if (Array.isArray(c)) {
		return c
			.map((part) => {
				if (typeof part === "string") return part;
				if (part && typeof part === "object" && "text" in part) {
					const t = (part as { text?: string }).text;
					return typeof t === "string" ? t : "";
				}
				return "";
			})
			.join("");
	}
	return "";
}
