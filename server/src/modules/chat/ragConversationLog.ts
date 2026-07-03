import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { config } from "../../config/env.js";
import type { RagTurnStats } from "./rag/turnStats.js";

export interface RagConversationLogEntry {
	readonly requestId: string;
	readonly at: string;
	readonly question: string;
	readonly answer: string;
	readonly historyTurns: number;
	readonly aborted: boolean;
	readonly error?: string;
	readonly rag: RagTurnStats;
}

export async function appendRagConversationLog(entry: RagConversationLogEntry): Promise<void> {
	const dir = config.ragLogDir;
	await mkdir(dir, { recursive: true });
	const day = entry.at.slice(0, 10);
	const filePath = join(dir, `conversations-${day}.jsonl`);
	await appendFile(filePath, `${JSON.stringify(entry)}\n`, "utf8");
}
