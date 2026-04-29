import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { actions, useStore } from "@/lib/store";
import { ENTRY_TESTS, FBISE_CATEGORIES, COMPULSORY_SUBJECTS, FbiseCategoryId, subjectsForCategory } from "@/lib/data";

export const Route = createFileRoute("/tests")({
  head: () => ({
    meta: [
      { title: "Tests & Subjects — Witch's Ledger" },
      { name: "description", content: "Choose entry tests and FBISE subjects to track." },
    ],
  }),
  component: TestsPage,
});

function TestsPage() {
  const selected = useStore((s) => s.selectedTests);
  const fbiseEnabled = useStore((s) => s.fbiseEnabled);
  const category = useStore((s) => s.fbiseCategory);
  const subjects = useStore((s) => s.selectedSubjects);

  const available = category ? subjectsForCategory(category) : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-semibold">Tests & Subjects</h1>
        <p className="mt-1 text-muted-foreground">Pick what you're preparing for. You can change this any time.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entry Tests</CardTitle>
          <CardDescription>Select all the tests you intend to give.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ENTRY_TESTS.map((t) => {
            const checked = selected.includes(t.id);
            return (
              <label
                key={t.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                  checked ? "border-primary bg-primary/5 shadow-elegant" : "hover:border-border hover:bg-accent/40"
                }`}
              >
                <Checkbox checked={checked} onCheckedChange={() => actions.toggleTest(t.id)} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-lg font-semibold">{t.name}</span>
                    {checked && <Badge variant="secondary" className="text-xs">Selected</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">{t.fullName}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>
                </div>
              </label>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>FBISE (Federal Board)</CardTitle>
            <CardDescription>Track your board exam prep alongside entry tests.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="fbise-toggle" className="text-sm">Enable</Label>
            <Switch id="fbise-toggle" checked={fbiseEnabled} onCheckedChange={(v) => actions.setFbiseEnabled(!!v)} />
          </div>
        </CardHeader>
        {fbiseEnabled && (
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Category</Label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {FBISE_CATEGORIES.map((c) => {
                  const active = category === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => actions.setFbiseCategory(c.id as FbiseCategoryId)}
                      className={`rounded-lg border px-4 py-3 text-left transition-all ${
                        active ? "border-primary bg-primary/10" : "hover:bg-accent/40"
                      }`}
                    >
                      <div className="font-display text-base font-semibold">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.electives.join(" + ")}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {category && (
              <div>
                <Label className="text-sm font-medium">Subjects to track</Label>
                <p className="mb-2 text-xs text-muted-foreground">English, Urdu and Pakistan Studies are compulsory for all categories.</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {available.map((s) => {
                    const checked = subjects.includes(s);
                    const compulsory = COMPULSORY_SUBJECTS.includes(s);
                    return (
                      <label key={s} className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${checked ? "border-primary bg-primary/5" : ""}`}>
                        <Checkbox checked={checked} onCheckedChange={() => actions.toggleSubject(s)} />
                        <span className="text-sm font-medium">{s}</span>
                        {compulsory && <Badge variant="outline" className="ml-auto text-[10px]">Compulsory</Badge>}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
