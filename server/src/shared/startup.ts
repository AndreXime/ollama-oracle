const DEFAULT_ATTEMPTS = 30;
const DEFAULT_DELAY_MS = 2000;

export async function withStartupRetry<T>(
	fn: () => Promise<T>,
	opts?: { readonly attempts?: number; readonly delayMs?: number },
): Promise<T> {
	const attempts = opts?.attempts ?? DEFAULT_ATTEMPTS;
	const delayMs = opts?.delayMs ?? DEFAULT_DELAY_MS;

	for (let i = 1; i <= attempts; i++) {
		try {
			return await fn();
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			console.warn(`Startup ${i}/${attempts} falhou: ${msg}`);
			if (i === attempts) throw e;
			await Bun.sleep(delayMs);
		}
	}

	throw new Error("Startup retry esgotado");
}
