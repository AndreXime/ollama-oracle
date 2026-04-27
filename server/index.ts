import { buildApp } from "./src/app.js";
import { config } from "./src/config/index.js";

const app = await buildApp();

const server = app.listen(config.port, "0.0.0.0", () => {
	console.info(`API em http://0.0.0.0:${config.port}`);
});

server.on("error", (err) => {
	console.error(err);
	process.exit(1);
});
