import { Link, useRouterState } from "@tanstack/react-router";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/tests", label: "Tests & Subjects" },
  { to: "/goals", label: "Goals" },
  { to: "/log", label: "Log" },
  { to: "/timer", label: "Timer" },
  { to: "/history", label: "History" },
] as const;

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-umineko shadow-gold" aria-hidden />
          <span className="font-display text-xl font-semibold tracking-tight">
            <span className="text-gold-gradient">Witch</span>'s Ledger
          </span>
        </Link>
        <nav className="ml-4 hidden flex-1 items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = path === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 md:hidden">
        {NAV.map((n) => {
          const active = path === n.to;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "shrink-0 rounded-md px-3 py-1 text-xs font-medium",
                active ? "bg-secondary text-foreground" : "text-muted-foreground",
              )}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
