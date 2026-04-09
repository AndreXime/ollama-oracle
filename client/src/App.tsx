import { ChatWindow } from "./components/ChatWindow";

export function App() {
	return (
		<div className="h-dvh flex flex-col bg-surface overflow-hidden">
			<main className="flex-1 flex flex-col min-h-0">
				<ChatWindow />
			</main>
		</div>
	);
}
