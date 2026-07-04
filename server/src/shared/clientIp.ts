import type { Context } from "hono";

export function clientIp(c: Context): string {
	const forwarded = c.req.header("x-forwarded-for");
	if (forwarded) {
		const first = forwarded.split(",")[0]?.trim();
		if (first) return first;
	}
	const realIp = c.req.header("x-real-ip")?.trim();
	if (realIp) return realIp;
	return "127.0.0.1";
}
