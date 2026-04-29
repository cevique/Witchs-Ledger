import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore, lastNDays, sumDay, actions } from "@/lib/store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — Witch's Ledger" },
      { name: "description", content: "Your last 14 days of MCQs, study hours, reviews and past papers." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const goals = useStore((s) => s.globalGoals);
  useStore((s) => s.logs);
  const days = lastNDays(14);

  const maxMcq = Math.max(goals.mcqs, ...days.map((d) => sumDay(d, "mcqs")));
  const maxHours = Math.max(goals.hours, ...days.map((d) => sumDay(d, "hours")));

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">History</h1>
          <p className="mt-1 text-muted-foreground">Last 14 days, all scopes summed.</p>
        </div>
        <Button variant="outline" onClick={() => { if (confirm("Reset all data?")) actions.reset(); }}>Reset all data</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>MCQs per day</CardTitle>
          <CardDescription>Goal line: {goals.mcqs}</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart data={days.map((d) => ({ date: d.date, value: sumDay(d, "mcqs") }))} max={maxMcq} goal={goals.mcqs} accent="bg-crimson" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Study hours per day</CardTitle>
          <CardDescription>Goal line: {goals.hours}</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart data={days.map((d) => ({ date: d.date, value: sumDay(d, "hours") }))} max={maxHours} goal={goals.hours} accent="bg-sapphire" decimals={1} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detail</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">MCQs</th>
                <th className="py-2 pr-4">Hours</th>
                <th className="py-2 pr-4">Reviews</th>
                <th className="py-2 pr-4">Papers</th>
              </tr>
            </thead>
            <tbody>
              {[...days].reverse().map((d) => (
                <tr key={d.date} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium">{d.date}</td>
                  <td className="py-2 pr-4 tabular-nums">{sumDay(d, "mcqs")}</td>
                  <td className="py-2 pr-4 tabular-nums">{sumDay(d, "hours").toFixed(2)}</td>
                  <td className="py-2 pr-4 tabular-nums">{sumDay(d, "reviews")}</td>
                  <td className="py-2 pr-4 tabular-nums">{sumDay(d, "papers")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function BarChart({ data, max, goal, accent, decimals = 0 }: { data: { date: string; value: number }[]; max: number; goal: number; accent: string; decimals?: number }) {
  const safeMax = Math.max(1, max);
  const goalPct = (goal / safeMax) * 100;
  return (
    <div className="relative h-48">
      <div className="absolute inset-x-0" style={{ bottom: `${goalPct}%` }}>
        <div className="border-t border-dashed border-gold" />
      </div>
      <div className="flex h-full items-end gap-1">
        {data.map((d) => {
          const h = (d.value / safeMax) * 100;
          return (
            <div key={d.date} className="group flex flex-1 flex-col items-center gap-1">
              <div className="text-[10px] tabular-nums text-muted-foreground opacity-0 group-hover:opacity-100">{d.value.toFixed(decimals)}</div>
              <div className={`w-full rounded-t ${accent} transition-all`} style={{ height: `${h}%`, minHeight: d.value > 0 ? 2 : 0 }} />
              <div className="text-[10px] text-muted-foreground">{d.date.slice(5)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
