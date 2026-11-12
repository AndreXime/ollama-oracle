import { useCallback, useState } from "react";
import { ChatWindow } from "../components/ChatWindow";
import { PromptPanel } from "../components/PromptPanel";

interface AskRequest {
	readonly id: number;
	readonly question: string;
}

export function OraclePage() {
	const [askRequest, setAskRequest] = useState<AskRequest | null>(null);
	const [busy, setBusy] = useState(false);

	const ask = useCallback((question: string) => {
		const q = question.trim();
		if (!q) return;
		setAskRequest({ id: Date.now(), question: q });
	}, []);

	const handleAskHandled = useCallback((id: number) => {
		setAskRequest((prev) => (prev?.id === id ? null : prev));
	}, []);

	return (
		<div className="flex flex-1 min-h-0 flex-col">
			<div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
				<ChatWindow askRequest={askRequest} onAskHandled={handleAskHandled} onBusyChange={setBusy} />
			</div>
			<section className="shrink-0 border-t border-border bg-surface px-4 py-5 sm:px-6">
				<div className="mx-auto max-w-3xl">
					<PromptPanel onSelectPrompt={ask} disabled={busy} />
				</div>
			</section>
		</div>
	);
}
