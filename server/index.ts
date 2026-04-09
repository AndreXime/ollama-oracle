import { buildApp } from "./src/app.js";
import { config } from "./src/config.js";

const app = await buildApp();

try {
	await app.listen({ port: config.port, host: "0.0.0.0" });
	console.info(`API em http://0.0.0.0:${config.port} (POST /chat)`);
} catch (err) {
	app.log.error(err);
	process.exit(1);
}
