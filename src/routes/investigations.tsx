import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useReports, verdictTone } from "./reports";
import { Activity, AlertTriangle, Brain, ShieldCheck, FolderSearch } from "lucide-react";

export const Route = createFileRoute("/investigations")({
  head: () => ({
    meta: [
      { title: "Investigations Dashboard — AIMD" },
      {
        name: "description",
        content:
          "Track your AIMD forensic investigations: total analyses, AI-detected media, suspicious files and authentic results in one dashboard.",
      },
      { property: "og:title", content: "Investigations Dashboard — AIMD" },
      {
        property: "og:description",
        content: "Statistics and recent activity across all of your AIMD forensic investigations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InvestigationsPage,
});

function InvestigationsPage() {
  const records = useReports();

  const stats = useMemo(
    () => [
      { icon: Activity, label: "Total analyses", value: records.length, tone: "text-primary" },
      {
        icon: Brain,
        label: "AI detected",
        value: records.filter((r) => r.verdictKind === "LIKELY_AI_GENERATED").length,
        tone: "text-verdict-danger",
      },
      {
        icon: AlertTriangle,
        label: "Suspicious",
        value: records.filter(
          (r) => r.verdictKind === "LIKELY_MANIPULATED" || r.verdictKind === "INCONCLUSIVE",
        ).length,
        tone: "text-verdict-warn",
      },
      {
        icon: ShieldCheck,
        label: "Authentic",
        value: records.filter((r) => r.verdictKind === "LIKELY_AUTHENTIC").length,
        tone: "text-verdict-safe",
      },
    ],
    [records],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.22em] text-primary uppercase">Overview</p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Investigations</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            A live summary of every forensic analysis performed in this browser.
          </p>
        </div>
        <Button asChild>
          <Link to="/analyze">Start investigation</Link>
        </Button>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <article key={s.label} className="panel p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                {s.label}
              </p>
              <s.icon className={cn("size-4", s.tone)} />
            </div>
            <p className="mt-4 font-display text-4xl font-bold tabular-nums">{s.value}</p>
          </article>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Recent investigations</h2>

        {records.length === 0 ? (
          <div className="panel mt-5 flex flex-col items-center gap-3 p-14 text-center">
            <FolderSearch className="size-8 text-muted-foreground" />
            <p className="font-display text-lg font-semibold">
              Your investigations will appear here.
            </p>
            <Button asChild className="mt-2">
              <Link to="/analyze">Analyze media</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="panel mt-5 hidden overflow-hidden md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border/70 bg-muted/30">
                  <tr className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                    <th className="px-4 py-3 font-medium">File</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Verdict</th>
                    <th className="px-4 py-3 font-medium">Confidence</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-b border-border/50 last:border-0">
                      <td className="max-w-[220px] truncate px-4 py-3">{r.name}</td>
                      <td className="px-4 py-3 text-muted-foreground uppercase">
                        {r.extension || r.kind}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase",
                            verdictTone(r.verdictKind),
                          )}
                        >
                          {r.verdictLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums">{r.confidence}%</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(r.analyzedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {r.isDemo ? "Demo" : "Complete"}
                      </td>
                      <td className="px-4 py-3">
                        <Button asChild size="sm" variant="outline">
                          <Link to="/reports">Open</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="mt-5 grid gap-3 md:hidden">
              {records.map((r) => (
                <article key={r.id} className="panel p-4">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground uppercase">
                    {r.extension || r.kind} · {new Date(r.analyzedAt).toLocaleDateString()}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase",
                        verdictTone(r.verdictKind),
                      )}
                    >
                      {r.verdictLabel}
                    </span>
                    <span className="font-mono text-xs tabular-nums">{r.confidence}%</span>
                  </div>
                  <Button asChild size="sm" variant="outline" className="mt-4 w-full">
                    <Link to="/reports">Open report</Link>
                  </Button>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
