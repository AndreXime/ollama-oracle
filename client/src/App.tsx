import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { OraclePage } from "./pages/OraclePage";

export function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<AppShell />}>
					<Route path="/" element={<OraclePage />} />
					<Route path="/como-funciona" element={<HowItWorksPage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
