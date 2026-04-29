import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
type Ctx = { theme: Theme; resolved: "light" | "dark"; setTheme: (t: Theme) => void };

const ThemeContext = createContext<Ctx | null>(null);
const KEY = "umineko-theme";

function applyTheme(t: "light" | "dark") {
  const root = document.documentElement;
  if (t === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  root.style.colorScheme = t;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = (localStorage.getItem(KEY) as Theme | null) ?? "system";
    setThemeState(stored);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const compute = () => {
      const r: "light" | "dark" = theme === "system" ? (mq.matches ? "dark" : "light") : theme;
      setResolved(r);
      applyTheme(r);
    };
    compute();
    mq.addEventListener("change", compute);
    return () => mq.removeEventListener("change", compute);
  }, [theme]);

  const setTheme = (t: Theme) => {
    localStorage.setItem(KEY, t);
    setThemeState(t);
  };

  return <ThemeContext.Provider value={{ theme, resolved, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
