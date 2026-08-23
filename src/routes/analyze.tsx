import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/aimd/UploadZone";
import { MediaPreviewCard, type SelectedMedia } from "@/components/aimd/MediaPreviewCard";
import { PipelineTimeline } from "@/components/aimd/PipelineTimeline";
import { ReportDashboard } from "@/components/aimd/ReportDashboard";
import { initialSteps, runForensicPipeline } from "@/lib/forensics/pipeline";
import { kindOf, sha256 } from "@/lib/forensics/fileAnalyzer";
import { DEMO_REPORT } from "@/lib/forensics/demo";
import { makeThumbnail, saveReport } from "@/lib/forensics/history";
import type { ForensicReport, StepState } from "@/lib/forensics/types";
import { AlertTriangle, FlaskConical, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze Media — AIMD Forensic Analysis" },
      {
        name: "description",
        content:
          "Upload an image, video or audio file and AIMD performs a multi-layer forensic analysis: metadata, provenance, AI detection, manipulation and social-media signals.",
      },
      { property: "og:title", content: "Analyze Media — AIMD Forensic Analysis" },
      {
        property: "og:description",
        content:
          "Multi-layer forensic analysis of images, video and audio with confidence-based, evidence-backed results.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyzePage,
});

function AnalyzePage() {
  const [media, setMedia] = useState<SelectedMedia | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [steps, setSteps] = useState<StepState[]>(initialSteps());
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<ForensicReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const reset = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setMedia(null);
    setReport(null);
    setHash(null);
    setError(null);
    setFailure(null);
    setSteps(initialSteps());
  }, []);

  const onSelect = useCallback((file: File) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    const kind = kindOf(file);
    setReport(null);
    setFailure(null);
    setSteps(initialSteps());
    setMedia({ file, previewUrl: url, kind, width: null, height: null });
    setHash(null);
    void file
      .arrayBuffer()
      .then(sha256)
      .then(setHash)
      .catch(() => setHash("unavailable"));

    if (kind === "image") {
      const img = new Image();
      img.onload = () =>
        setMedia((prev) =>
          prev && prev.previewUrl === url
            ? { ...prev, width: img.naturalWidth, height: img.naturalHeight }
            : prev,
        );
      img.src = url;
    } else if (kind === "video") {
      const vid = document.createElement("video");
      vid.onloadedmetadata = () =>
        setMedia((prev) =>
          prev && prev.previewUrl === url
            ? { ...prev, width: vid.videoWidth, height: vid.videoHeight }
            : prev,
        );
      vid.src = url;
    }
  }, []);

  const analyze = useCallback(async () => {
    if (!media) return;
    setBusy(true);
    setFailure(null);
    setReport(null);
    setSteps(initialSteps());
    try {
      const result = await runForensicPipeline(media.file, (stepId) => {
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
      const thumb = await makeThumbnail(media.file);
      saveReport(result, thumb);
      setTimeout(
        () => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        80,
      );
    } catch (e) {
      setFailure(
        e instanceof Error
          ? `We couldn't complete the analysis. ${e.message}`
          : "We couldn't complete the analysis. Please try another file.",
      );
      setSteps(initialSteps());
    } finally {
      setBusy(false);
    }
  }, [media]);

  const loadDemo = useCallback(() => {
    reset();
    setReport({ ...DEMO_REPORT, analyzedAt: new Date().toISOString() });
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }, [reset]);

  const running = busy || (steps.some((s) => s.status !== "pending") && !report);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <Toaster />

      <header className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-[11px] tracking-[0.22em] text-primary uppercase">
          Forensic workspace
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Analyze Your Media</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Upload an image, video or audio file and AIMD will perform a multi-layer forensic
          analysis.
        </p>
      </header>

      <div className="mx-auto mt-10 max-w-4xl space-y-6">
        {!media ? (
          <UploadZone onSelect={onSelect} onDemo={loadDemo} error={error} onError={setError} />
        ) : (
          <MediaPreviewCard
            media={media}
            hash={hash}
            busy={busy}
            onRemove={reset}
            onAnalyze={analyze}
          />
        )}

        {running ? <PipelineTimeline steps={steps} /> : null}

        {failure ? (
          <div
            role="alert"
            className="panel border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive"
          >
            <p className="flex items-start gap-2 font-medium">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              {failure}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={analyze} disabled={!media || busy}>
                <RotateCcw className="size-4" /> Retry
              </Button>
              <Button size="sm" variant="outline" onClick={reset}>
                New Analysis
              </Button>
            </div>
          </div>
        ) : null}

        {!media && !report && !running ? (
          <p className="text-center text-xs text-muted-foreground">
            Upload media to begin your first forensic analysis.
          </p>
        ) : null}
      </div>

      <div ref={resultRef} className="scroll-mt-24">
        {report ? (
          <section className="mt-14">
            {report.isDemo ? (
              <p className="panel mb-6 flex items-start gap-2 border-verdict-warn/40 bg-verdict-warn/10 p-4 text-sm text-verdict-warn">
                <FlaskConical className="mt-0.5 size-4 shrink-0" />
                <span>
                  <strong>DEMO ANALYSIS</strong> — this report is sample data, not a real user
                  upload. Upload your own media above for a genuine analysis.
                </span>
              </p>
            ) : null}
            <ReportDashboard report={report} previewUrl={media?.previewUrl ?? null} />
            <div className="mt-6 flex justify-center">
              <Button variant="outline" onClick={reset}>
                <RotateCcw className="size-4" /> New Analysis
              </Button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
