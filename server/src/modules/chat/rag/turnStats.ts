import type { RagSource } from "./sources.js";

export type RagTurnMode = "rag" | "conversational" | "lexical_fallback";

export interface RagChunkStat {
	readonly source: string;
	readonly distance: number;
}

export interface RagTurnStats {
	readonly mode: RagTurnMode;
	readonly retrievalQuery: string;
	readonly scoredCount: number;
	readonly bestDistance: number | null;
	readonly keptChunks: number;
	readonly sourceCount: number;
	readonly sources: readonly RagSource[];
	readonly chunks: readonly RagChunkStat[];
}
