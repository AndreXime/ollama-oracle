import { existsSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import type { Hono } from "hono";
import { findServerPackageDir } from "../config/env-parser.js";
import type { AppEnv } from "../app.js";

function clientIndexPath(): string {
	const serverDir = findServerPackageDir();
	if (basename(dirname(serverDir)) === "dist") {
		return resolve(serverDir, "../client/index.html");
	}
	return resolve(serverDir, "../dist/client/index.html");
}

export function registerStaticClient(app: Hono<AppEnv>): void {
	app.get("*", async (c) => {
		const indexPath = clientIndexPath();
		if (!existsSync(indexPath)) {
			return c.text("Client não buildado. Rode `bun run build` ou aguarde o `vite build --watch`.", 503);
		}
		return new Response(Bun.file(indexPath), {
			status: 200,
			headers: { "Content-Type": "text/html; charset=utf-8" },
		});
	});
}
