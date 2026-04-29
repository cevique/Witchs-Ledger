import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { actions, useStore, getGoalsFor, todayLog, type ScopeKey } from "@/lib/store";
import { ENTRY_TESTS } from "@/lib/data";
import { toast } from "sonner";
import { BookOpen, Clock, FileCheck2, FileText } from "lucide-react";

export const Route = createFileRoute("/log")({
  head: () => ({
    meta: [
      { title: "Log progress — Witch's Ledger" },
      { name: "description", content: "Log MCQs solved, study hours, review sessions and past papers attempted today." },
    ],
  }),
  component: LogPage,
});

const KINDS = [
  { id: "mcqs", label: "MCQs solved", icon: BookOpen, step: 10, defaults: 25 },
  { id: "hours", label: "Study hours", icon: Clock, step: 0.25, defaults: 1 },
  { id: "reviews", label: "Review sessions", icon: FileCheck2, step: 1, defaults: 1 },
  { id: "papers", label: "Past / model papers", icon: FileText, step: 1, defaults: 1 },
] as const;

function LogPage() {
  const tests = useStore((s) => s.selectedTests);
  const subjects = useStore((s) => s.selectedSubjects);
  const fbiseEnabled = useStore((s) => s.fbiseEnabled);
  useStore((s) => s.logs);

  const scopes: { value: ScopeKey; label: string }[] = [
    { value: "global", label: "General (no specific test)" },
    ...tests.map((id) => {
      const t = ENTRY_TESTS.find((e) => e.id === id)!;
      return { value: `test:${id}` as ScopeKey, label: `Test · ${t.name}` };
    }),
    ...(fbiseEnabled ? subjects.map((s) => ({ value: `subj:${s}` as ScopeKey, label: `FBISE · ${s}` })) : []),
  ];

  const [scope, setScope] = useState<ScopeKey>("global");
  const day = todayLog();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-semibold">Log Progress</h1>
        <p className="mt-1 text-muted-foreground">Quickly add what you've done. Pick a scope, then tap an amount.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scope</CardTitle>
          <CardDescription>Where should this entry count toward?</CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="scope" className="text-xs text-muted-foreground">Test or subject</Label>
          <Select value={scope} onValueChange={(v) => setScope(v as ScopeKey)}>
            <SelectTrigger id="scope" className="mt-1 w-full sm:w-96"><SelectValue /></SelectTrigger>
            <SelectContent>
              {scopes.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {KINDS.map((k) => (
          <LogTile key={k.id} kindId={k.id} label={k.label} icon={k.icon} step={k.step} defaults={k.defaults} scope={scope} dayValue={day[k.id][scope] ?? 0} goal={getGoalsFor(scope)[k.id]} />
        ))}
      </div>
    </div>
  );
}

function LogTile({ kindId, label, icon: Icon, step, defaults, scope, dayValue, goal }: any) {
  const [amount, setAmount] = useState<number>(defaults);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2"><Icon className="h-4 w-4 text-crimson" /> {label}</span>
          <span className="text-sm font-normal text-muted-foreground tabular-nums">{dayValue} / {goal}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Input type="number" min={0} step={step} value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} className="w-28" />
          <Button onClick={() => { actions.log(scope, kindId, amount); toast.success(`+${amount} ${label.toLowerCase()}`); }}>Add</Button>
          <Button variant="ghost" onClick={() => { actions.log(scope, kindId, -amount); toast(`-${amount} ${label.toLowerCase()}`); }}>Subtract</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {[step, step * 4, step * 10].map((q) => (
            <Button key={q} size="sm" variant="secondary" onClick={() => { actions.log(scope, kindId, q); toast.success(`+${q} ${label.toLowerCase()}`); }}>+{q}</Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
