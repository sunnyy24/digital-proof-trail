import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReportDashboard } from "@/components/aimd/ReportDashboard";
import { deleteReport, loadReports, type ReportRecord } from "@/lib/forensics/history";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  FileSearch,
  FileVideo,
  FileAudio,
  Image as ImageIcon,
  Search,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Forensic Reports — AIMD" },
      {
        name: "description",
        content:
          "Browse, search and filter your saved AIMD forensic reports by verdict, media type and file name.",
      },
      { property: "og:title", content: "Forensic Reports — AIMD" },
      {
        property: "og:description",
        content: "Your saved AIMD forensic analysis reports with verdicts, confidence and dates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

const FILTERS = [
  "All",
  "AI Generated",
  "Authentic",
  "Suspicious",
  "Video",
  "Image",
  "Audio",
] as const;
type Filter = (typeof FILTERS)[number];

export function useReports() {
  const [records, setRecords] = useState<ReportRecord[]>([]);
  useEffect(() => {
    const sync = () => setRecords(loadReports());
    sync();
    window.addEventListener("aimd:reports", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("aimd:reports", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return records;
}

function matches(r: ReportRecord, f: Filter) {
  switch (f) {
    case "All":
      return true;
    case "AI Generated":
      return r.verdictKind === "LIKELY_AI_GENERATED";
    case "Authentic":
      return r.verdictKind === "LIKELY_AUTHENTIC";
    case "Suspicious":
      return r.verdictKind === "LIKELY_MANIPULATED" || r.verdictKind === "INCONCLUSIVE";
    case "Video":
      return r.kind === "video";
    case "Image":
      return r.kind === "image";
    case "Audio":
      return r.kind === "audio";
  }
}

export function verdictTone(kind: ReportRecord["verdictKind"]) {
  if (kind === "LIKELY_AUTHENTIC") return "border-verdict-safe/40 bg-verdict-safe/10 text-verdict-safe";
  if (kind === "INCONCLUSIVE") return "border-verdict-warn/40 bg-verdict-warn/10 text-verdict-warn";
  return "border-verdict-danger/40 bg-verdict-danger/10 text-verdict-danger";
}

function KindIcon({ kind, className }: { kind: string; className?: string }) {
  if (kind === "video") return <FileVideo className={className} />;
  if (kind === "audio") return <FileAudio className={className} />;
  return <ImageIcon className={className} />;
}

function ReportsPage() {
  const records = useReports();
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      records.filter(
        (r) => matches(r, filter) && r.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [records, filter, query],
  );

  const open = records.find((r) => r.id === openId) ?? null;

  if (open) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <Button variant="outline" size="sm" onClick={() => setOpenId(null)}>
          <ArrowLeft className="size-4" /> Back to reports
        </Button>
        <div className="mt-6">
          <ReportDashboard report={open.report} previewUrl={open.thumbnail} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.22em] text-primary uppercase">Archive</p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Forensic Reports</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Reports you have run in this browser. Nothing is uploaded — the archive lives on your
            device only.
          </p>
        </div>
        <Button asChild>
          <Link to="/analyze">New analysis</Link>
        </Button>
      </header>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition-colors",
                filter === f
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search file name"
            aria-label="Search reports"
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="panel mt-10 flex flex-col items-center gap-3 p-14 text-center">
          <FileSearch className="size-8 text-muted-foreground" />
          <p className="font-display text-lg font-semibold">
            {records.length === 0 ? "No forensic reports yet." : "No reports match your filters."}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {records.length === 0
              ? "Run your first analysis and the report will appear here."
              : "Try a different filter or search term."}
          </p>
          {records.length === 0 ? (
            <Button asChild className="mt-2">
              <Link to="/analyze">Analyze media</Link>
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <article
              key={r.id}
              className="panel flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <div className="grid aspect-video place-items-center border-b border-border/70 bg-muted/40">
                {r.thumbnail ? (
                  <img
                    src={r.thumbnail}
                    alt={`Thumbnail of ${r.name}`}
                    className="size-full object-contain"
                  />
                ) : (
                  <KindIcon kind={r.kind} className="size-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  {r.isDemo ? (
                    <span className="rounded-full border border-verdict-warn/40 bg-verdict-warn/10 px-2 py-0.5 font-mono text-[9px] tracking-wider text-verdict-warn uppercase">
                      Demo
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground uppercase">
                  {r.extension || r.kind} · {r.sizeLabel}
                </p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase",
                      verdictTone(r.verdictKind),
                    )}
                  >
                    {r.verdictLabel}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {r.confidence}%
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(r.analyzedAt).toLocaleString()}
                </p>
                <div className="mt-4 flex gap-2 pt-1">
                  <Button size="sm" className="flex-1" onClick={() => setOpenId(r.id)}>
                    View Report
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label={`Delete report for ${r.name}`}
                    onClick={() => deleteReport(r.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
