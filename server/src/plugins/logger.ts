import { structuredLogger } from "@hono/structured-logger";
import type { BaseLogger } from "@hono/structured-logger";
import type { Hono } from "hono";
import { requestId } from "hono/request-id";
import type { AppEnv } from "../app.js";

export type AppLogger = BaseLogger;

const isOptionsRequest = (method: string) => method === "OPTIONS";

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

function createReqLogger(req: { requestId: string; method: string; url: string }): AppLogger {
	const tag = `[${req.requestId} ${req.method} ${req.url}]\n`;
	return {
		info: (obj, msg, ...args) => logWithTag(console.info, tag, obj, msg, ...args),
		warn: (obj, msg, ...args) => logWithTag(console.warn, tag, obj, msg, ...args),
		error: (obj, msg, ...args) => logWithTag(console.error, tag, obj, msg, ...args),
		debug: (obj, msg, ...args) => logWithTag(console.debug, tag, obj, msg, ...args),
	};
}

export function registerLogger(app: Hono<AppEnv>): void {
	app.use("*", requestId());
	app.use(
		"*",
		structuredLogger({
			createLogger: (c) =>
				createReqLogger({
					requestId: c.var.requestId,
					method: c.req.method,
					url: c.req.path,
				}),
			onRequest: (logger, c) => {
				if (isOptionsRequest(c.req.method)) return;
				logger.info({ method: c.req.method, path: c.req.path }, "request start");
			},
			onResponse: (logger, c, elapsedMs) => {
				if (isOptionsRequest(c.req.method)) return;
				logger.info({ method: c.req.method, path: c.req.path, status: c.res.status, elapsedMs }, "request end");
			},
			onError: (logger, err, c) => {
				if (isOptionsRequest(c.req.method)) return;
				logger.error({ err, method: c.req.method, path: c.req.path, status: c.res.status }, "request failed");
			},
		}),
	);
}
