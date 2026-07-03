import { buildApp } from "./src/app.js";
import { config } from "./src/config/env.js";

const app = await buildApp();

const server = Bun.serve({
	fetch: app.fetch,
	port: config.port,
	hostname: "0.0.0.0",
});

console.info(`API em http://${server.hostname}:${server.port}`);
