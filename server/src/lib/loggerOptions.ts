import type { LoggerOptions } from "pino";

const OMIT_KEYS = new Set(["level", "pid", "hostname"]);

function stripPinoNoiseLine(line: string): string {
	const trimmed = line.endsWith("\n") ? line.slice(0, -1) : line;
	try {
		const o = JSON.parse(trimmed) as Record<string, unknown>;
		for (const k of OMIT_KEYS) delete o[k];
		return `${JSON.stringify(o)}\n`;
	} catch {
		return line;
	}
}

/** Repasse direto em `Fastify({ logger: appLoggerOptions })`. */
export const appLoggerOptions: LoggerOptions = {
	base: null,
	hooks: {
		streamWrite(s: string) {
			return stripPinoNoiseLine(s);
		},
	},
};
