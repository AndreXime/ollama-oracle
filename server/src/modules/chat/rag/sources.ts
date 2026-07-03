import type { Document } from "@langchain/core/documents";

export interface RagSource {
	readonly source: string;
	readonly excerpt: string;
}

export function formatDocumentSource(doc: Document): string {
	const meta = doc.metadata as Record<string, unknown> | undefined;
	const source = typeof meta?.source === "string" ? meta.source : "desconhecido";
	const partIndex = typeof meta?.partIndex === "number" ? meta.partIndex : null;
	const chunkIndex = typeof meta?.chunkIndex === "number" ? meta.chunkIndex : null;
	if (partIndex !== null && chunkIndex !== null) return `${source}#p${partIndex}-c${chunkIndex}`;
	return source;
}

export function mapDocumentsToSources(docs: Document[]): readonly RagSource[] {
	return docs.map((doc) => {
		const sourceWithLoc = formatDocumentSource(doc);
		const excerpt = doc.pageContent.length > 320 ? `${doc.pageContent.slice(0, 317)}...` : doc.pageContent;
		return { source: sourceWithLoc, excerpt };
	});
}
