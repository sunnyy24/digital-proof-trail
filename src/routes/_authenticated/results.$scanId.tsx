import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getScanResult } from "@/lib/scans.functions";
import { VerdictPanel } from "@/components/aimd/VerdictPanel";
import { ConsensusPanel } from "@/components/aimd/ConsensusPanel";
import { ChainOfCustody } from "@/components/aimd/ChainOfCustody";
import { SegmentTimeline } from "@/components/aimd/SegmentTimeline";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/forensics/fileAnalyzer";
import type { ForensicIndicator } from "@/lib/providers/types";
import { cn } from "@/lib/utils";
import { FileText, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/results/$scanId")({
  head: () => ({
    meta: [
      { title: "Scan Results — AIMD Media Forensics" },
      {
        name: "description",
        content:
          "Explainable AIMD forensic results: verdict, provider consensus, evidence explorer, segment detection and chain of custody.",
      },
      { property: "og:title", content: "Scan Results — AIMD Media Forensics" },
      {
        property: "og:description",
        content: "Full evidence breakdown for an AIMD media forensics scan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResultsPage,
});

const STATUS_TONE: Record<ForensicIndicator["status"], string> = {
  positive: "border-verdict-safe/40 bg-verdict-safe/10 text-verdict-safe",
  warning: "border-verdict-warn/40 bg-verdict-warn/10 text-verdict-warn",
  negative: "border-verdict-danger/40 bg-verdict-danger/10 text-verdict-danger",
  neutral: "border-border bg-muted/30 text-muted-foreground",
};

function ResultsPage() {
  const { scanId } = useParams({ from: "/_authenticated/results/$scanId" });
  const fetchResult = useServerFn(getScanResult);
  const { data, isLoading, error } = useQuery({
    queryKey: ["scan-result", scanId],
    queryFn: () => fetchResult({ data: { scanId } }),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading forensic results…
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">This scan could not be loaded.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/history">Back to history</Link>
        </Button>
      </div>
    );
  }

  const scan = data.scan;
  const indicators = (data.forensics?.indicators ?? []) as ForensicIndicator[];
  const categories = Array.from(new Set(indicators.map((i) => i.category)));
  const mediaUrl = scan["mediaUrl"] as string | null;
  const kind = String(scan.media_kind ?? "unknown");

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-12 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.22em] text-primary uppercase">
            Evidence {String(scan.evidence_id)}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold break-all sm:text-3xl">
            {String(scan.file_name)}
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            {kind} · {formatBytes(Number(scan.file_size ?? 0))} · analysed{" "}
            {scan.completed_at ? new Date(String(scan.completed_at)).toLocaleString() : "—"}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/report/$scanId" params={{ scanId }}>
            <FileText className="size-4" /> Forensic report
          </Link>
        </Button>
      </header>

      {mediaUrl ? (
        <section className="panel overflow-hidden p-4">
          {kind === "image" ? (
            <img src={mediaUrl} alt={String(scan.file_name)} className="mx-auto max-h-[420px] rounded-lg" />
          ) : kind === "video" ? (
            <video src={mediaUrl} controls className="mx-auto max-h-[420px] w-full rounded-lg" />
          ) : (
            <audio src={mediaUrl} controls className="w-full" />
          )}
        </section>
      ) : null}

      {data.fusion ? (
        <VerdictPanel fusion={data.fusion} summary={data.reasoning?.summary ?? null} />
      ) : null}

      {data.reasoning && !data.reasoning.available ? (
        <p className="panel p-4 text-xs text-muted-foreground">{data.reasoning.message}</p>
      ) : null}

      {data.fusion ? (
        <ConsensusPanel
          fusion={data.fusion}
          detections={data.detections}
          provenance={data.provenance}
        />
      ) : null}

      <SegmentTimeline segments={data.segments} duration={null} />

      <section className="panel p-6">
        <h3 className="font-display text-base font-semibold">Evidence explorer</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Every finding is labelled confirmed, inferred or unknown. Nothing here is invented.
        </p>
        <div className="mt-5 space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h4 className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {category}
              </h4>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {indicators
                  .filter((i) => i.category === category)
                  .map((i, idx) => (
                    <article
                      key={idx}
                      className={cn("rounded-xl border p-4", STATUS_TONE[i.status])}
                    >
                      <p className="text-sm font-medium text-foreground">{i.title}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{i.explanation}</p>
                      <p className="mt-3 font-mono text-[10px] tracking-wider uppercase">
                        {i.certainty} · {i.source}
                        {i.confidence !== null ? ` · ${i.confidence}%` : ""}
                      </p>
                    </article>
                  ))}
              </div>
            </div>
          ))}
          {indicators.length === 0 ? (
            <p className="text-sm text-muted-foreground">No forensic indicators were recorded.</p>
          ) : null}
        </div>
      </section>

      <ChainOfCustody
        events={data.custody}
        evidenceId={String(scan.evidence_id)}
        sha256={String(scan.sha256)}
      />

      <details className="panel p-6">
        <summary className="cursor-pointer font-display text-base font-semibold">
          Technical details
        </summary>
        <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-muted/40 p-4 font-mono text-[11px]">
          {JSON.stringify(
            { metadata: data.forensics?.metadata, technical: data.forensics?.technical },
            null,
            2,
          )}
        </pre>
      </details>
    </div>
  );
}
