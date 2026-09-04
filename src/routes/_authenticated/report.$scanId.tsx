import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getScanResult } from "@/lib/scans.functions";
import { Button } from "@/components/ui/button";
import { VERDICT_LABEL } from "@/lib/forensics/fusion";
import { DETECTION_DISCLAIMER, type ForensicIndicator } from "@/lib/providers/types";
import { formatBytes } from "@/lib/forensics/fileAnalyzer";
import { Download, Loader2, Printer } from "lucide-react";

export const Route = createFileRoute("/_authenticated/report/$scanId")({
  head: () => ({
    meta: [
      { title: "Forensic Report — AIMD" },
      {
        name: "description",
        content:
          "Court-style AIMD forensic report: evidence identifiers, hashes, provider results, findings, limitations and chain of custody.",
      },
      { property: "og:title", content: "Forensic Report — AIMD" },
      {
        property: "og:description",
        content: "Downloadable, printable AIMD media forensics report with full chain of custody.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const { scanId } = useParams({ from: "/_authenticated/report/$scanId" });
  const fetchResult = useServerFn(getScanResult);
  const { data, isLoading } = useQuery({
    queryKey: ["scan-result", scanId],
    queryFn: () => fetchResult({ data: { scanId } }),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Preparing report…
      </div>
    );
  }
  if (!data) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-sm text-muted-foreground">
        Report unavailable.{" "}
        <Link to="/history" className="text-primary hover:underline">
          Back to history
        </Link>
      </div>
    );
  }

  const scan = data.scan as Record<string, string | number | null>;
  const indicators = (data.forensics?.indicators ?? []) as ForensicIndicator[];

  const downloadJson = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            evidenceId: scan["evidence_id"],
            file: {
              name: scan["file_name"],
              type: scan["file_type"],
              size: scan["file_size"],
              sha256: scan["sha256"],
            },
            verdict: data.fusion,
            reasoning: data.reasoning,
            detections: data.detections,
            provenance: data.provenance,
            forensics: data.forensics,
            segments: data.segments,
            chainOfCustody: data.custody,
            disclaimer: DETECTION_DISCLAIMER,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${scan["evidence_id"]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex flex-wrap justify-end gap-2 print:hidden">
        <Button variant="outline" onClick={downloadJson}>
          <Download className="size-4" /> Download JSON
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="size-4" /> Print / PDF
        </Button>
      </div>

      <article className="panel space-y-8 p-8">
        <header className="border-b border-border pb-6">
          <h1 className="font-display text-2xl font-bold">AIMD Forensic Analysis Report</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            AI Media Detection &amp; Digital Forensics
          </p>
          <dl className="mt-5 grid gap-3 text-xs sm:grid-cols-2">
            <Field label="Evidence ID" value={String(scan["evidence_id"])} />
            <Field label="Case ID" value={String(scan["case_id"] ?? "—")} />
            <Field label="File name" value={String(scan["file_name"])} />
            <Field label="File size" value={formatBytes(Number(scan["file_size"] ?? 0))} />
            <Field label="Media type" value={String(scan["media_kind"])} />
            <Field
              label="Analysed"
              value={
                scan["completed_at"] ? new Date(String(scan["completed_at"])).toISOString() : "—"
              }
            />
            <Field label="SHA-256" value={String(scan["sha256"])} wide />
          </dl>
        </header>

        <Section title="1. Assessment">
          {data.fusion ? (
            <p className="text-sm">
              <strong>{VERDICT_LABEL[data.fusion.verdict]}</strong> — confidence{" "}
              {data.fusion.confidence}%, risk level {data.fusion.riskLevel}.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No fused verdict was recorded.</p>
          )}
          {data.reasoning?.summary ? (
            <p className="mt-3 text-sm leading-relaxed">{data.reasoning.summary}</p>
          ) : null}
        </Section>

        <Section title="2. Detection providers">
          <ul className="space-y-2 text-sm">
            {data.detections.map((d, i) => (
              <li key={i}>
                <strong>{d.provider}</strong> ({d.status}) — AI:{" "}
                {d.aiGeneratedScore ?? "unavailable"}
                {d.aiGeneratedScore !== null ? "%" : ""}, deepfake:{" "}
                {d.deepfakeScore ?? "unavailable"}
                {d.deepfakeScore !== null ? "%" : ""}. {d.message}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="3. Provenance">
          <ul className="space-y-2 text-sm">
            {data.provenance.map((p, i) => (
              <li key={i}>
                <strong>{p.provider}</strong> — {p.state.replace("_", " ")}. {p.message}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="4. Forensic findings">
          <ul className="space-y-2 text-sm">
            {indicators.map((i, idx) => (
              <li key={idx}>
                <strong>{i.title}</strong> ({i.certainty}, {i.source}) — {i.explanation}
              </li>
            ))}
            {indicators.length === 0 ? <li className="text-muted-foreground">None.</li> : null}
          </ul>
        </Section>

        <Section title="5. Limitations">
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {(data.fusion?.limitations ?? []).map((l, i) => (
              <li key={i}>{l}</li>
            ))}
            <li>{DETECTION_DISCLAIMER}</li>
          </ul>
        </Section>

        <Section title="6. Chain of custody">
          <ol className="space-y-2 text-xs">
            {data.custody.map((e, i) => (
              <li key={i} className="font-mono">
                {new Date(e.created_at).toISOString()} — {e.event} [{e.status}]
                {e.detail ? ` — ${e.detail}` : ""}
              </li>
            ))}
          </ol>
        </Section>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-base font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Field({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono break-all">{value}</dd>
    </div>
  );
}
