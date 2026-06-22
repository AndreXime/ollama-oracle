import { useId } from "react";

interface NexusLogoProps {
	readonly className?: string;
}

export function NexusLogo({ className }: NexusLogoProps) {
	const gradId = `nexus-logo-grad-${useId().replace(/:/g, "")}`;

	return (
		<div className={`flex flex-col items-center gap-5 text-center${className ? ` ${className}` : ""}`}>
			<div className="relative h-[4.5rem] w-[4.5rem] shrink-0" aria-hidden>
				<svg
					viewBox="0 0 72 72"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="h-full w-full drop-shadow-lg"
				>
					<title>Ollama Oracle</title>
					<defs>
						<linearGradient id={gradId} x1="8" y1="12" x2="64" y2="60" gradientUnits="userSpaceOnUse">
							<stop stopColor="#60a5fa" />
							<stop offset="0.45" stopColor="#3b82f6" />
							<stop offset="1" stopColor="#a78bfa" />
						</linearGradient>
					</defs>
					<path d="M36 8L52 22L48 42L36 52L24 42L20 22L36 8Z" fill={`url(#${gradId})`} opacity="0.95" />
					<path d="M36 20L44 28L42 38L36 44L30 38L28 28L36 20Z" fill="#0f1419" opacity="0.35" />
				</svg>
			</div>
			<div className="space-y-1.5">
				<h1 className="text-[2rem] font-medium tracking-tight text-slate-100 sm:text-4xl">Ollama Oracle</h1>
				<p className="text-sm text-slate-500">Lumi — assistente interna da Lumina Tech (RAG local)</p>
			</div>
		</div>
	);
}
