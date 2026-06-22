import type { Document } from "@langchain/core/documents";

export interface RagSource {
	readonly source: string;
	readonly excerpt: string;
}

export function mapDocumentsToSources(docs: Document[]): readonly RagSource[] {
	return docs.map((doc) => {
		const meta = doc.metadata as Record<string, unknown> | undefined;
		const source = typeof meta?.source === "string" ? meta.source : "desconhecido";
		const partIndex = typeof meta?.partIndex === "number" ? meta.partIndex : null;
		const chunkIndex = typeof meta?.chunkIndex === "number" ? meta.chunkIndex : null;
		const sourceWithLoc = partIndex !== null && chunkIndex !== null ? `${source}#p${partIndex}-c${chunkIndex}` : source;
		const excerpt = doc.pageContent.length > 320 ? `${doc.pageContent.slice(0, 317)}...` : doc.pageContent;
		return { source: sourceWithLoc, excerpt };
	});
}
