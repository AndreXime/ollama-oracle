import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

function findMonorepoRoot(startDir: string): string {
	let d = resolve(startDir);
	for (let i = 0; i < 15; i++) {
		if (existsSync(resolve(d, "server/package.json")) && existsSync(resolve(d, "client/package.json"))) {
			return d;
		}
		const parent = dirname(d);
		if (parent === d) break;
		d = parent;
	}
	return resolve(process.cwd());
}

const startDir = dirname(fileURLToPath(import.meta.url));
export const repoRoot = findMonorepoRoot(startDir);
export const serverPackageDir = resolve(repoRoot, "server");

loadEnv({ path: resolve(serverPackageDir, ".env") });
