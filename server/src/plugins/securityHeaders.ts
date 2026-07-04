import type { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import type { AppEnv } from "../app.js";

export function registerSecurityHeaders(app: Hono<AppEnv>): void {
	app.use(
		"*",
		secureHeaders({
			strictTransportSecurity: false,
			xFrameOptions: "DENY",
			referrerPolicy: "strict-origin-when-cross-origin",
			permissionsPolicy: {
				camera: [],
				microphone: [],
				geolocation: [],
			},
			contentSecurityPolicy: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'", "'unsafe-inline'"],
				styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
				fontSrc: ["'self'", "https://fonts.gstatic.com"],
				connectSrc: ["'self'"],
				imgSrc: ["'self'", "data:"],
			},
		}),
	);
}
