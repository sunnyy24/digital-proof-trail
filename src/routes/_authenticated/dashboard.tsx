import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProviderHealth, listScans } from "@/lib/scans.functions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Activity, ArrowRight, ScanLine, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AIMD Forensic Workspace" },
      {
        name: "description",
        content:
          "Your AIMD forensic workspace: recent scans, verdict distribution and live detection provider status.",
      },
      { property: "og:title", content: "Dashboard — AIMD Forensic Workspace" },
      {
        property: "og:description",
        content: "Recent AIMD scans, verdict breakdown and provider availability at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const fetchScans = useServerFn(listScans);
  const fetchHealth = useServerFn(getProviderHealth);
  const scans = useQuery({ queryKey: ["scans"], queryFn: () => fetchScans({ data: undefined }) });
  const health = useQuery({
    queryKey: ["provider-health"],
    queryFn: () => fetchHealth({ data: undefined }),
  });

  const rows = scans.data ?? [];
  const count = (verdict: string) => rows.filter((r) => r.verdict === verdict).length;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-12 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.22em] text-primary uppercase">Workspace</p>
          <h1 className="mt-2 font-display text-3xl font-bold">Dashboard</h1>
        </div>
        <Button asChild>
          <Link to="/scan">
            <ScanLine className="size-4" /> New scan
          </Link>
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total scans" value={rows.length} />
        <Stat label="Likely AI-generated" value={count("LIKELY_AI_GENERATED")} tone="danger" />
        <Stat label="Likely human-created" value={count("LIKELY_HUMAN_CREATED")} tone="safe" />
        <Stat label="Inconclusive" value={count("INCONCLUSIVE")} tone="warn" />
      </section>

      <section className="panel p-6">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold">
          <Activity className="size-4 text-primary" /> Provider status
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(health.data ?? []).map((p) => (
            <div key={p.name} className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{p.name}</p>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase",
                    p.configured
                      ? "border-verdict-safe/40 text-verdict-safe"
                      : "border-verdict-warn/40 text-verdict-warn",
                  )}
                >
                  {p.configured ? "Configured" : "Unavailable"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{p.role}</p>
              <p className="mt-2 text-xs text-muted-foreground">{p.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold">
            <ShieldCheck className="size-4 text-primary" /> Recent scans
          </h2>
          <Link to="/history" className="text-xs text-primary hover:underline">
            View all <ArrowRight className="inline size-3" />
          </Link>
        </div>
        {rows.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No scans yet. Start with your first forensic scan.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border/60">
            {rows.slice(0, 8).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <Link
                  to="/results/$scanId"
                  params={{ scanId: r.id }}
                  className="min-w-0 flex-1 truncate text-sm hover:text-primary"
                >
                  {r.file_name}
                </Link>
                <span className="font-mono text-[11px] text-muted-foreground">{r.status}</span>
                <span className="font-mono text-[11px]">
                  {r.verdict ?? "—"}
                  {r.confidence !== null ? ` ${Number(r.confidence)}%` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "safe" | "warn" | "danger";
}) {
  return (
    <div className="panel p-5">
      <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">{label}</p>
      <p
        className={cn(
          "mt-2 font-display text-3xl font-bold tabular-nums",
          tone === "safe" && "text-verdict-safe",
          tone === "warn" && "text-verdict-warn",
          tone === "danger" && "text-verdict-danger",
        )}
      >
        {value}
      </p>
    </div>
  );
}
