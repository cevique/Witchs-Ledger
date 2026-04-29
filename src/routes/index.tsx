import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore, todayLog, sumDay, streak, getGoalsFor } from "@/lib/store";
import { ENTRY_TESTS } from "@/lib/data";
import { BookOpen, Clock, FileCheck2, FileText, Flame, Target } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Witch's Ledger" },
      {
        name: "description",
        content:
          "Today's MCQ, study hour, review and past paper progress across your entry tests.",
      },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  component: Dashboard,
});

function StatCard({ icon: Icon, label, value, goal, accent }: { icon: any; label: string; value: number; goal: number; accent: string }) {
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          <div className={`rounded-md p-2 ${accent}`}><Icon className="h-4 w-4" /></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="font-display text-3xl font-semibold tabular-nums">
          {value}
          <span className="ml-1 text-base font-normal text-muted-foreground">/ {goal}</span>
        </div>
        <Progress value={pct} className="mt-3 h-2" />
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  // subscribe to state
  const selected = useStore((s) => s.selectedTests);
  const fbiseEnabled = useStore((s) => s.fbiseEnabled);
  const subjects = useStore((s) => s.selectedSubjects);
  const globalGoals = useStore((s) => s.globalGoals);
  useStore((s) => s.logs); // re-render when logs change

  const day = todayLog();
  const s = streak();

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-umineko p-8 text-white shadow-elegant">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-white/70">Witch's Ledger</p>
            <h1 className="font-display text-4xl font-semibold md:text-5xl">Today's Inscription</h1>
            <p className="mt-2 max-w-xl text-white/85">
              Without my permission, no test shall be conquered. Set your goals, log your study, and let the night bear witness.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-black/25 px-4 py-3 backdrop-blur">
            <Flame className="h-6 w-6 text-gold" />
            <div>
              <div className="text-xs uppercase tracking-wider text-white/70">Streak</div>
              <div className="font-display text-2xl font-semibold">{s} day{s === 1 ? "" : "s"}</div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild variant="secondary"><Link to="/log">Log progress</Link></Button>
          <Button asChild variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"><Link to="/timer">Start timer</Link></Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="MCQs" value={sumDay(day, "mcqs")} goal={globalGoals.mcqs} accent="bg-crimson/15 text-crimson" />
        <StatCard icon={Clock} label="Study hours" value={sumDay(day, "hours")} goal={globalGoals.hours} accent="bg-sapphire/15 text-sapphire" />
        <StatCard icon={FileCheck2} label="Reviews" value={sumDay(day, "reviews")} goal={globalGoals.reviews} accent="bg-violet/15 text-violet" />
        <StatCard icon={FileText} label="Past papers" value={sumDay(day, "papers")} goal={globalGoals.papers} accent="bg-gold/20 text-foreground" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-crimson" /> Selected entry tests</CardTitle>
          </CardHeader>
          <CardContent>
            {selected.length === 0 ? (
              <EmptyHint to="/tests" label="Choose your tests" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {selected.map((id) => {
                  const t = ENTRY_TESTS.find((e) => e.id === id);
                  if (!t) return null;
                  const g = getGoalsFor(`test:${id}`);
                  const v = day.mcqs[`test:${id}`] ?? 0;
                  return (
                    <div key={id} className="rounded-lg border bg-card px-3 py-2">
                      <div className="font-display text-base font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{v}/{g.mcqs} MCQs today</div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-sapphire" /> FBISE subjects</CardTitle>
          </CardHeader>
          <CardContent>
            {!fbiseEnabled || subjects.length === 0 ? (
              <EmptyHint to="/tests" label="Enable FBISE & pick subjects" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {subjects.map((name) => {
                  const g = getGoalsFor(`subj:${name}`);
                  const v = day.mcqs[`subj:${name}`] ?? 0;
                  return (
                    <Badge key={name} variant="outline" className="px-3 py-1.5 text-sm">
                      {name} <span className="ml-2 text-muted-foreground">{v}/{g.mcqs}</span>
                    </Badge>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function EmptyHint({ to, label }: { to: "/tests"; label: string }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
      <p>Nothing selected yet.</p>
      <Button asChild size="sm"><Link to={to}>{label}</Link></Button>
    </div>
  );
}
