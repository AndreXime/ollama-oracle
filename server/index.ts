import { buildApp } from "./src/app.js";
import { config } from "./src/config/env.js";
import { withStartupRetry } from "./src/shared/startup.js";

const app = await withStartupRetry(() => buildApp());

let shuttingDown = false;

const server = Bun.serve({
	fetch: (req, serverInstance) => {
		if (shuttingDown) {
			return new Response("Servidor encerrando", { status: 503 });
		}
		return app.fetch(req, serverInstance);
	},
	port: config.port,
	hostname: "0.0.0.0",
	idleTimeout: 120,
});

console.info(`API em http://${server.hostname}:${server.port}`);

async function shutdown(signal: string): Promise<void> {
	if (shuttingDown) return;
	shuttingDown = true;
	console.info(`Encerrando (${signal})…`);
	await server.stop(true);
	process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
