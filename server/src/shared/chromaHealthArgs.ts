/** Args do ChromaClient compartilhados entre health check e vector store. */
export function chromaClientArgsFromUrl(urlString: string): { ssl: boolean; host: string; port: number } {
	const url = new URL(urlString);
	const ssl = url.protocol === "https:";
	const host = url.hostname;
	const port = url.port !== "" ? Number(url.port) : ssl ? 443 : 8000;
	if (!Number.isFinite(port) || port <= 0 || port > 65535) {
		throw new Error(`Invalid Chroma URL (port): ${urlString}`);
	}
	return { ssl, host, port };
}
