import { NavLink, Outlet } from "react-router-dom";

export function AppShell() {
	return (
		<div className="h-dvh flex flex-col overflow-hidden">
			<header className="shrink-0 border-b border-border bg-surface/90 backdrop-blur-sm px-4 py-3.5 sm:px-6 flex items-center justify-between gap-4">
				<div className="min-w-0">
					<p className="font-serif text-lg leading-none tracking-tight text-ink sm:text-xl">Atlas Academy</p>
					<p className="mt-1 text-[11px] text-ink-faint">Universidade corporativa · Grupo Atlas</p>
				</div>
				<nav className="flex items-center gap-1 sm:gap-2 text-sm">
					<NavLink
						to="/"
						end
						className={({ isActive }) =>
							`rounded-md px-3 py-1.5 transition-colors ${
								isActive ? "bg-accent-soft text-accent-muted font-medium" : "text-ink-muted hover:text-ink hover:bg-surface-raised"
							}`
						}
					>
						Oracle
					</NavLink>
					<NavLink
						to="/como-funciona"
						className={({ isActive }) =>
							`rounded-md px-3 py-1.5 transition-colors ${
								isActive ? "bg-accent-soft text-accent-muted font-medium" : "text-ink-muted hover:text-ink hover:bg-surface-raised"
							}`
						}
					>
						Como funciona
					</NavLink>
				</nav>
			</header>
			<main className="flex-1 flex flex-col min-h-0">
				<Outlet />
			</main>
		</div>
	);
}
