import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { actions, useStore, type ScopeKey } from "@/lib/store";
import { ENTRY_TESTS } from "@/lib/data";
import { toast } from "sonner";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";

export const Route = createFileRoute("/timer")({
  head: () => ({
    meta: [
      { title: "Pomodoro Timer — Witch's Ledger" },
      { name: "description", content: "Focus with a Pomodoro timer that automatically logs your study hours." },
    ],
  }),
  component: TimerPage,
});

type Mode = "focus" | "break";

function TimerPage() {
  const pomo = useStore((s) => s.pomodoro);
  const tests = useStore((s) => s.selectedTests);
  const subjects = useStore((s) => s.selectedSubjects);
  const fbiseEnabled = useStore((s) => s.fbiseEnabled);

  const scopes: { value: ScopeKey; label: string }[] = [
    { value: "global", label: "General" },
    ...tests.map((id) => {
      const t = ENTRY_TESTS.find((e) => e.id === id)!;
      return { value: `test:${id}` as ScopeKey, label: `Test · ${t.name}` };
    }),
    ...(fbiseEnabled ? subjects.map((s) => ({ value: `subj:${s}` as ScopeKey, label: `FBISE · ${s}` })) : []),
  ];

  const [scope, setScope] = useState<ScopeKey>("global");
  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(pomo.focusMin * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // reset duration when mode/setting changes (only if not running)
  useEffect(() => {
    if (!running) setSecondsLeft((mode === "focus" ? pomo.focusMin : pomo.breakMin) * 60);
  }, [mode, pomo.focusMin, pomo.breakMin, running]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // session ended
          if (mode === "focus") {
            actions.log(scope, "hours", pomo.focusMin / 60);
            toast.success(`Focus complete: +${(pomo.focusMin / 60).toFixed(2)} h logged`);
            setMode("break");
            return pomo.breakMin * 60;
          } else {
            toast("Break over — back to it.");
            setMode("focus");
            return pomo.focusMin * 60;
          }
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode, pomo.focusMin, pomo.breakMin, scope]);

  const total = (mode === "focus" ? pomo.focusMin : pomo.breakMin) * 60;
  const pct = total > 0 ? ((total - secondsLeft) / total) * 100 : 0;

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-semibold">Pomodoro</h1>
        <p className="mt-1 text-muted-foreground">Focus in cycles. Hours auto-log when each focus session completes.</p>
      </div>

      <Card>
        <CardContent className="grid gap-8 p-8 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-col items-center justify-center">
            <div className="relative h-64 w-64">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="46" fill="none" strokeWidth="6" className="stroke-muted" />
                <circle
                  cx="50" cy="50" r="46" fill="none" strokeWidth="6" strokeLinecap="round"
                  className={mode === "focus" ? "stroke-crimson" : "stroke-sapphire"}
                  strokeDasharray={`${(pct / 100) * 289} 289`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{mode === "focus" ? "Focus" : "Break"}</div>
                <div className="font-display text-6xl font-semibold tabular-nums">{mm}:{ss}</div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <Button size="lg" onClick={() => setRunning((r) => !r)}>
                {running ? <><Pause className="mr-2 h-4 w-4" /> Pause</> : <><Play className="mr-2 h-4 w-4" /> Start</>}
              </Button>
              <Button variant="outline" size="lg" onClick={() => { setRunning(false); setSecondsLeft(total); }}>
                <RotateCcw className="mr-2 h-4 w-4" /> Reset
              </Button>
              <Button variant="ghost" size="lg" onClick={() => { setMode(mode === "focus" ? "break" : "focus"); setRunning(false); }}>
                <SkipForward className="mr-2 h-4 w-4" /> Skip
              </Button>
            </div>
          </div>

          <div className="space-y-4 lg:w-72">
            <div>
              <Label className="text-xs text-muted-foreground">Logging scope</Label>
              <Select value={scope} onValueChange={(v) => setScope(v as ScopeKey)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {scopes.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Focus minutes</Label>
              <Input type="number" min={1} value={pomo.focusMin} onChange={(e) => actions.setPomodoro({ focusMin: Math.max(1, Number(e.target.value) || 1) })} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Break minutes</Label>
              <Input type="number" min={1} value={pomo.breakMin} onChange={(e) => actions.setPomodoro({ breakMin: Math.max(1, Number(e.target.value) || 1) })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
          <CardDescription>
            Each completed focus session adds its full duration in hours to the chosen scope's daily log.
            You can edit focus/break length any time; changes apply on the next session start.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
