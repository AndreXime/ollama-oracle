import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
	chunkSize: 900,
	chunkOverlap: 120,
	separators: ["\n\n", "\n", ". ", " ", ""],
});

export function getTextSplitter(): RecursiveCharacterTextSplitter {
	return splitter;
}
