import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { actions, useStore, getGoalsFor, type Goals, type ScopeKey } from "@/lib/store";
import { ENTRY_TESTS } from "@/lib/data";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Goals — Witch's Ledger" },
      { name: "description", content: "Set daily targets for MCQs, study hours, reviews and past papers — globally or per test/subject." },
    ],
  }),
  component: GoalsPage,
});

function GoalRow({ scope, goals, onChange, onClear, label, sub }: {
  scope: ScopeKey;
  goals: Goals;
  onChange: (g: Partial<Goals>) => void;
  onClear?: () => void;
  label: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <div>
          <div className="font-display text-lg font-semibold">{label}</div>
          {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
        </div>
        {onClear && <Button variant="ghost" size="sm" onClick={onClear}>Use global</Button>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="MCQs" value={goals.mcqs} onChange={(v) => onChange({ mcqs: v })} />
        <Field label="Study hours" value={goals.hours} onChange={(v) => onChange({ hours: v })} step={0.5} />
        <Field label="Reviews" value={goals.reviews} onChange={(v) => onChange({ reviews: v })} />
        <Field label="Past papers" value={goals.papers} onChange={(v) => onChange({ papers: v })} />
      </div>
    </div>
  );
}

function Field({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        min={0}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="mt-1"
      />
    </div>
  );
}

function GoalsPage() {
  const global = useStore((s) => s.globalGoals);
  const tests = useStore((s) => s.selectedTests);
  const subjects = useStore((s) => s.selectedSubjects);
  const fbiseEnabled = useStore((s) => s.fbiseEnabled);
  useStore((s) => s.perScopeGoals);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-semibold">Daily Goals</h1>
        <p className="mt-1 text-muted-foreground">Set tonight's targets. Defaults: 200 MCQs, 4 hours, 1 review session, 1 past paper.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global goal</CardTitle>
          <CardDescription>Applies to any test/subject without its own override.</CardDescription>
        </CardHeader>
        <CardContent>
          <GoalRow
            scope="global"
            goals={global}
            onChange={(g) => actions.setGlobalGoals(g)}
            label="Today / Tonight"
          />
        </CardContent>
      </Card>

      {(tests.length > 0 || (fbiseEnabled && subjects.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle>Per test & subject</CardTitle>
            <CardDescription>Optional overrides. Empty rows fall back to the global goal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tests.map((id) => {
              const t = ENTRY_TESTS.find((e) => e.id === id);
              if (!t) return null;
              const scope: ScopeKey = `test:${id}`;
              const g = getGoalsFor(scope);
              return (
                <GoalRow
                  key={scope}
                  scope={scope}
                  goals={g}
                  label={t.name}
                  sub={t.fullName}
                  onChange={(p) => actions.setScopeGoals(scope, p)}
                  onClear={() => actions.clearScopeGoals(scope)}
                />
              );
            })}
            {fbiseEnabled && subjects.map((name) => {
              const scope: ScopeKey = `subj:${name}`;
              const g = getGoalsFor(scope);
              return (
                <GoalRow
                  key={scope}
                  scope={scope}
                  goals={g}
                  label={name}
                  sub="FBISE subject"
                  onChange={(p) => actions.setScopeGoals(scope, p)}
                  onClear={() => actions.clearScopeGoals(scope)}
                />
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
