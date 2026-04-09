import { createReadStream } from "node:fs";
import { open } from "node:fs/promises";
import { extname } from "node:path";

export async function readTextFileWithStreamCap(absolutePath: string, maxBytes: number): Promise<string> {
	return new Promise((resolvePromise, reject) => {
		const chunks: Buffer[] = [];
		let total = 0;
		const stream = createReadStream(absolutePath, {
			encoding: "utf8",
			highWaterMark: 64 * 1024,
		});
		stream.on("data", (chunk: string | Buffer) => {
			const byteLen = typeof chunk === "string" ? Buffer.byteLength(chunk) : chunk.length;
			total += byteLen;
			if (total > maxBytes) {
				stream.destroy();
				reject(new Error(`Arquivo excede o limite de ${maxBytes} bytes (otimização de memória).`));
				return;
			}
			chunks.push(typeof chunk === "string" ? Buffer.from(chunk, "utf8") : chunk);
		});
		stream.on("end", () => {
			resolvePromise(Buffer.concat(chunks).toString("utf8"));
		});
		stream.on("error", reject);
	});
}

export function isSupportedExtension(filePath: string): boolean {
	const ext = extname(filePath).toLowerCase();
	return ext === ".md" || ext === ".txt" || ext === ".json" || ext === ".csv";
}

/** Lê no máximo `maxBytes` bytes sem carregar o arquivo inteiro. */
export async function readFileHeadUtf8(absolutePath: string, maxBytes: number): Promise<string> {
	const fh = await open(absolutePath, "r");
	try {
		const buf = Buffer.alloc(maxBytes + 1);
		const { bytesRead } = await fh.read(buf, 0, maxBytes + 1, 0);
		if (bytesRead > maxBytes) {
			throw new Error(`Arquivo excede o limite de ${maxBytes} bytes (otimização de memória).`);
		}
		return buf.subarray(0, bytesRead).toString("utf8");
	} finally {
		await fh.close();
	}
}
