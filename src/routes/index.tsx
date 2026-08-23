import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { UploadPanel, type SelectedFile } from "@/components/aimd/UploadPanel";
import { AnalysisSteps } from "@/components/aimd/AnalysisSteps";
import { ReportDashboard } from "@/components/aimd/ReportDashboard";
import { initialSteps, runForensicPipeline } from "@/lib/forensics/pipeline";
import { kindOf, sha256 } from "@/lib/forensics/fileAnalyzer";
import { DEMO_REPORT } from "@/lib/forensics/demo";
import type { ForensicReport, StepState } from "@/lib/forensics/types";
import {
  Fingerprint,
  Radar,
  ScanEye,
  ShieldCheck,
  Lock,
  FlaskConical,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AIMD — AI Media Forensics & Provenance Platform" },
      {
        name: "description",
        content:
          "AIMD analyzes images, video and audio using metadata, C2PA provenance, AI-generation signals and forensic indicators to reveal how digital media was created, modified and distributed.",
      },
      { property: "og:title", content: "AIMD — AI Media Forensics & Provenance Platform" },
      {
        property: "og:description",
        content:
          "Detect AI-generated media. Analyze digital evidence. Discover media provenance — with clearly separated verified, inferred and unknown findings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const CAPABILITIES = [
  { icon: ScanEye, title: "Metadata & EXIF", text: "Device, lens, capture settings and GPS read straight from the file." },
  { icon: Fingerprint, title: "Provenance & C2PA", text: "Content Credentials structures detected and reported honestly." },
  { icon: Radar, title: "AI & manipulation signals", text: "Embedded generator markers, re-encode and tampering indicators." },
];

function Index() {
  const [selected, setSelected] = useState<SelectedFile | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [steps, setSteps] = useState<StepState[]>(initialSteps());
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<ForensicReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => () => void (urlRef.current && URL.revokeObjectURL(urlRef.current)), []);

  const reset = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setSelected(null);
    setReport(null);
    setHash(null);
    setError(null);
    setSteps(initialSteps());
  }, []);

  const onSelect = useCallback((file: File) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    setReport(null);
    setError(null);
    setSteps(initialSteps());
    setSelected({ file, previewUrl: url, kind: kindOf(file) });
    setHash(null);
    void file.arrayBuffer().then(sha256).then(setHash).catch(() => setHash("unavailable"));
  }, []);

  const analyze = useCallback(async () => {
    if (!selected) return;
    setBusy(true);
    setError(null);
    setReport(null);
    setSteps(initialSteps());
    try {
      const result = await runForensicPipeline(selected.file, (stepId) => {
        setSteps((prev) => {
          const idx = prev.findIndex((s) => s.id === stepId);
          return prev.map((s, i) => ({
            ...s,
            status: i < idx ? "done" : i === idx ? "running" : s.status,
          }));
        });
      });
      setSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));
      setReport(result);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch (e) {
      setError(
        e instanceof Error
          ? `Analysis failed: ${e.message}`
          : "Analysis failed for an unknown reason. Please try another file.",
      );
      setSteps(initialSteps());
    } finally {
      setBusy(false);
    }
  }, [selected]);

  const loadDemo = useCallback(() => {
    reset();
    setReport({ ...DEMO_REPORT, analyzedAt: new Date().toISOString() });
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }, [reset]);

  return (
    <div className="min-h-screen">
      <Toaster />

      <header className="border-b border-border/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg border border-primary/40 bg-primary/10">
              <ShieldCheck className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-display text-lg leading-none font-bold tracking-tight">AIMD</p>
              <p className="text-[11px] tracking-wider text-muted-foreground uppercase">
                AI Media Forensics &amp; Provenance
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadDemo}>
            <FlaskConical className="size-4" /> Try demo report
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <section className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="border-primary/40 text-primary">
            Digital evidence analysis
          </Badge>
          <h1 className="mt-4 font-display text-3xl leading-tight font-bold sm:text-5xl">
            Detect AI-generated media. Analyze digital evidence. Discover media provenance.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            AIMD analyzes images, videos and audio using metadata, provenance, AI detection and
            forensic signals to help determine how digital media was created, modified and
            distributed. Findings are always labelled as verified, inferred or unknown — AIMD does not
            claim perfect detection accuracy.
          </p>
        </section>

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          {CAPABILITIES.map((c) => (
            <div key={c.title} className="panel p-4">
              <c.icon className="mb-2 size-5 text-primary" />
              <p className="text-sm font-semibold">{c.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.text}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 space-y-5" id="upload">
          <UploadPanel
            selected={selected}
            onSelect={onSelect}
            onClear={reset}
            onAnalyze={analyze}
            busy={busy}
            hashPreview={hash}
          />

          {busy || (steps.some((s) => s.status !== "pending") && !report) ? (
            <AnalysisSteps steps={steps} />
          ) : null}

          {error ? (
            <p className="panel flex items-start gap-2 border-destructive/40 p-4 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          ) : null}
        </section>

        <div ref={resultRef} className="scroll-mt-6">
          {report ? (
            <section className="mt-10">
              {report.isDemo ? (
                <p className="panel mb-5 flex items-start gap-2 border-verdict-warn/40 bg-verdict-warn/10 p-4 text-sm text-verdict-warn">
                  <FlaskConical className="mt-0.5 size-4 shrink-0" />
                  <span>
                    <strong>DEMO DATA</strong> — this report is a sample and is not based on an
                    uploaded file. Upload your own media above for a real analysis.
                  </span>
                </p>
              ) : null}
              <ReportDashboard report={report} previewUrl={selected?.previewUrl ?? null} />
            </section>
          ) : null}
        </div>

        <section className="panel mt-10 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
            <Lock className="size-4 text-primary" /> Privacy &amp; handling
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Your uploaded media is analyzed securely. AIMD does not retain uploaded files longer than
            necessary unless you explicitly choose to save the analysis. Analysis runs inside your
            browser: files are validated by type and size (maximum 200 MB), are never executed, and
            reports are only written to disk when you download them.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            AIMD reports evidence-based indications, not certainties. Unavailable capabilities are
            labelled rather than guessed, and no device, platform, generator, location, date or creator
            is ever invented.
          </p>
        </section>
      </main>

      <footer className="border-t border-border/70 py-6">
        <p className="mx-auto max-w-6xl px-4 text-xs text-muted-foreground">
          AIMD — AI Media Forensics &amp; Provenance Platform. Forensic results are indications and
          should be corroborated with other evidence.
        </p>
      </footer>
    </div>
  );
}
