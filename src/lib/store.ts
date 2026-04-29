import { useSyncExternalStore } from "react";
import { todayKey, FbiseCategoryId, subjectsForCategory } from "./data";

export type Goals = {
  mcqs: number;
  hours: number;
  reviews: number;
  papers: number;
};

export type ScopeKey = string; // "global" | `test:${id}` | `subj:${name}`

export type DailyLog = {
  date: string;
  // counts per scope
  mcqs: Record<ScopeKey, number>;
  hours: Record<ScopeKey, number>;
  reviews: Record<ScopeKey, number>;
  papers: Record<ScopeKey, number>;
};

export type AppState = {
  selectedTests: string[];
  fbiseEnabled: boolean;
  fbiseCategory: FbiseCategoryId | null;
  selectedSubjects: string[]; // chosen from category's available
  globalGoals: Goals;
  perScopeGoals: Record<ScopeKey, Goals>; // optional override per test/subject
  logs: Record<string, DailyLog>; // by date
  pomodoro: { focusMin: number; breakMin: number };
};

const KEY = "umineko-tracker-v1";

const DEFAULT_GOALS: Goals = { mcqs: 200, hours: 4, reviews: 1, papers: 1 };

const DEFAULT_STATE: AppState = {
  selectedTests: [],
  fbiseEnabled: false,
  fbiseCategory: null,
  selectedSubjects: [],
  globalGoals: { ...DEFAULT_GOALS },
  perScopeGoals: {},
  logs: {},
  pomodoro: { focusMin: 25, breakMin: 5 },
};

let state: AppState = load();
const listeners = new Set<() => void>();

function load(): AppState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

export function getState(): AppState {
  return state;
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    (cb) => subscribe(cb),
    () => selector(state),
    () => selector(DEFAULT_STATE),
  );
}

export const actions = {
  toggleTest(id: string) {
    const has = state.selectedTests.includes(id);
    state = {
      ...state,
      selectedTests: has ? state.selectedTests.filter((t) => t !== id) : [...state.selectedTests, id],
    };
    emit();
  },
  setFbiseEnabled(v: boolean) {
    state = { ...state, fbiseEnabled: v };
    if (!v) state.selectedSubjects = [];
    emit();
  },
  setFbiseCategory(c: FbiseCategoryId | null) {
    state = { ...state, fbiseCategory: c, selectedSubjects: c ? subjectsForCategory(c) : [] };
    emit();
  },
  toggleSubject(name: string) {
    const has = state.selectedSubjects.includes(name);
    state = {
      ...state,
      selectedSubjects: has
        ? state.selectedSubjects.filter((s) => s !== name)
        : [...state.selectedSubjects, name],
    };
    emit();
  },
  setGlobalGoals(g: Partial<Goals>) {
    state = { ...state, globalGoals: { ...state.globalGoals, ...g } };
    emit();
  },
  setScopeGoals(scope: ScopeKey, g: Partial<Goals>) {
    const existing = state.perScopeGoals[scope] ?? { ...state.globalGoals };
    state = {
      ...state,
      perScopeGoals: { ...state.perScopeGoals, [scope]: { ...existing, ...g } },
    };
    emit();
  },
  clearScopeGoals(scope: ScopeKey) {
    const next = { ...state.perScopeGoals };
    delete next[scope];
    state = { ...state, perScopeGoals: next };
    emit();
  },
  log(scope: ScopeKey, kind: keyof Omit<DailyLog, "date">, amount: number) {
    const date = todayKey();
    const day: DailyLog = state.logs[date] ?? { date, mcqs: {}, hours: {}, reviews: {}, papers: {} };
    const bucket = { ...day[kind] };
    bucket[scope] = Math.max(0, (bucket[scope] ?? 0) + amount);
    const newDay: DailyLog = { ...day, [kind]: bucket };
    state = { ...state, logs: { ...state.logs, [date]: newDay } };
    emit();
  },
  setPomodoro(p: Partial<AppState["pomodoro"]>) {
    state = { ...state, pomodoro: { ...state.pomodoro, ...p } };
    emit();
  },
  reset() {
    state = { ...DEFAULT_STATE };
    emit();
  },
};

export function getGoalsFor(scope: ScopeKey): Goals {
  return state.perScopeGoals[scope] ?? state.globalGoals;
}

export function sumDay(day: DailyLog | undefined, kind: keyof Omit<DailyLog, "date">): number {
  if (!day) return 0;
  return Object.values(day[kind]).reduce((a, b) => a + b, 0);
}

export function todayLog(): DailyLog {
  const date = todayKey();
  return state.logs[date] ?? { date, mcqs: {}, hours: {}, reviews: {}, papers: {} };
}

export function lastNDays(n: number): DailyLog[] {
  const out: DailyLog[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = todayKey(d);
    out.push(state.logs[k] ?? { date: k, mcqs: {}, hours: {}, reviews: {}, papers: {} });
  }
  return out;
}

export function streak(): number {
  let s = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const log = state.logs[todayKey(d)];
    const met = log && (sumDay(log, "mcqs") >= state.globalGoals.mcqs * 0.5 || sumDay(log, "hours") >= state.globalGoals.hours * 0.5);
    if (met) s++;
    else if (i > 0) break;
    else break; // today not met -> 0
  }
  return s;
}
