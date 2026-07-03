import { structuredLogger } from "@hono/structured-logger";
import type { Hono } from "hono";
import type { AppEnv } from "../app.js";
import type { BaseLogger } from "@hono/structured-logger";

export type AppLogger = BaseLogger;

function logWithTag(fn: typeof console.info, tag: string, obj: unknown, msg?: string, ...args: unknown[]): void {
	if (typeof obj === "string" && msg === undefined) {
		fn(tag, obj, ...args);
		return;
	}
	if (msg !== undefined) {
		fn(tag, msg, obj, ...args);
		return;
	}
	fn(tag, obj, ...args);
}

function createReqLogger(req: { method: string; url: string }): AppLogger {
	const tag = `[${req.method} ${req.url}]`;
	return {
		info: (obj, msg, ...args) => logWithTag(console.info, tag, obj, msg, ...args),
		warn: (obj, msg, ...args) => logWithTag(console.warn, tag, obj, msg, ...args),
		error: (obj, msg, ...args) => logWithTag(console.error, tag, obj, msg, ...args),
		debug: (obj, msg, ...args) => logWithTag(console.debug, tag, obj, msg, ...args),
	};
}

export function registerLogger(app: Hono<AppEnv>): void {
	app.use(
		"*",
		structuredLogger({
			createLogger: (c) => createReqLogger({ method: c.req.method, url: c.req.path }),
		}),
	);
}
