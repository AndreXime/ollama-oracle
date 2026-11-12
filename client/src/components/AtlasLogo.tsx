interface AtlasLogoProps {
	readonly className?: string;
	readonly compact?: boolean;
}

export function AtlasLogo({ className, compact = false }: AtlasLogoProps) {
	return (
		<div
			className={`flex flex-col items-center text-center${className ? ` ${className}` : ""}${compact ? " gap-2" : " gap-4"}`}
		>
			<div
				className={`flex items-center justify-center rounded-full border border-border bg-surface-raised text-accent shadow-[0_8px_24px_-12px_rgba(12,27,51,0.35)] ${
					compact ? "h-11 w-11" : "h-16 w-16"
				}`}
				aria-hidden
			>
				<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={compact ? "h-6 w-6" : "h-8 w-8"}>
					<title>Atlas Academy</title>
					<path
						d="M10 36V14.5L24 8l14 6.5V36"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinejoin="round"
					/>
					<path d="M16 36V20h16v16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
					<path d="M16 28h16M24 20v16" stroke="currentColor" strokeWidth="2" />
				</svg>
			</div>
			<div className={compact ? "space-y-0.5" : "space-y-2"}>
				<h1
					className={`font-serif font-semibold tracking-tight text-ink ${
						compact ? "text-xl sm:text-2xl" : "text-3xl sm:text-4xl"
					}`}
				>
					Ollama Oracle
				</h1>
				<p className={`text-ink-muted ${compact ? "text-xs" : "text-sm"}`}>
					Atlas — assistente da Atlas Academy
				</p>
			</div>
		</div>
	);
}
