import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/aimd/UploadZone";
import { MediaPreviewCard, type SelectedMedia } from "@/components/aimd/MediaPreviewCard";
import { PipelineTimeline } from "@/components/aimd/PipelineTimeline";
import { kindOf, sha256 } from "@/lib/forensics/fileAnalyzer";
import { supabase } from "@/integrations/supabase/client";
import { analyzeScan, createScan } from "@/lib/scans.functions";
import type { StepState } from "@/lib/forensics/types";
import { AlertTriangle, RotateCcw, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/scan")({
  head: () => ({
    meta: [
      { title: "New Scan — AIMD Media Forensics" },
      {
        name: "description",
        content:
          "Run a private, chain-of-custody forensic scan: metadata, C2PA provenance, AI-generation and deepfake detection with explainable evidence.",
      },
      { property: "og:title", content: "New Scan — AIMD Media Forensics" },
      {
        property: "og:description",
        content: "Upload image, video or audio evidence for a full AIMD forensic scan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScanPage,
});

const STEPS: Array<{ id: string; label: string }> = [
  { id: "hash", label: "Hashing evidence" },
  { id: "upload", label: "Uploading to private storage" },
  { id: "download", label: "Server integrity verification" },
  { id: "forensics", label: "Metadata & structural forensics" },
  { id: "provenance", label: "Provenance & watermark checks" },
  { id: "detection", label: "AI-generation & deepfake detection" },
  { id: "fusion", label: "Evidence fusion" },
  { id: "reasoning", label: "Explainable reasoning" },
];

function ScanPage() {
  const navigate = useNavigate();
  const create = useServerFn(createScan);
  const analyze = useServerFn(analyzeScan);

  const [media, setMedia] = useState<SelectedMedia | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [steps, setSteps] = useState<StepState[]>(
    STEPS.map((s) => ({ ...s, status: "pending" as const })),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const mark = useCallback((id: string) => {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      return prev.map((s, i) => ({
        ...s,
        status: i < idx ? "done" : i === idx ? "running" : s.status,
      }));
    });
  }, []);

  const reset = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setMedia(null);
    setHash(null);
    setDuration(null);
    setFailure(null);
    setDuplicate(null);
    setSteps(STEPS.map((s) => ({ ...s, status: "pending" as const })));
  }, []);

  const onSelect = useCallback((file: File) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    const kind = kindOf(file);
    setFailure(null);
    setDuplicate(null);
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
        setMedia((p) =>
          p && p.previewUrl === url ? { ...p, width: img.naturalWidth, height: img.naturalHeight } : p,
        );
      img.src = url;
    } else if (kind === "video" || kind === "audio") {
      const el = document.createElement(kind === "video" ? "video" : "audio");
      el.onloadedmetadata = () => {
        setDuration(Number.isFinite(el.duration) ? el.duration : null);
        if (kind === "video") {
          const v = el as HTMLVideoElement;
          setMedia((p) =>
            p && p.previewUrl === url ? { ...p, width: v.videoWidth, height: v.videoHeight } : p,
          );
        }
      };
      el.src = url;
    }
  }, []);

  const run = useCallback(async () => {
    if (!media) return;
    setBusy(true);
    setFailure(null);
    try {
      mark("hash");
      const digest = hash && hash !== "unavailable" ? hash : await sha256(await media.file.arrayBuffer());
      setHash(digest);

      const registered = await create({
        data: {
          fileName: media.file.name,
          fileType: media.file.type,
          fileSize: media.file.size,
          sha256: digest,
          mediaKind: media.kind,
          width: media.width,
          height: media.height,
          duration,
        },
      });
      if (registered.duplicateOf) {
        setDuplicate(
          `This exact file was already analysed on ${new Date(registered.duplicateOf.created_at).toLocaleString()} (verdict: ${registered.duplicateOf.verdict ?? "unknown"}).`,
        );
      }

      mark("upload");
      const upload = await supabase.storage
        .from("evidence")
        .upload(registered.storagePath, media.file, {
          contentType: media.file.type || "application/octet-stream",
          upsert: true,
        });
      if (upload.error) throw new Error(upload.error.message);

      mark("download");
      const analysis = analyze({
        data: { scanId: registered.scanId, width: media.width, height: media.height, duration },
      });

      // Drive the visible pipeline from the server-reported stage.
      const poll = window.setInterval(async () => {
        const { data } = await supabase
          .from("scans")
          .select("stage")
          .eq("id", registered.scanId)
          .single();
        if (data?.stage) mark(data.stage);
      }, 1200);

      try {
        await analysis;
      } finally {
        window.clearInterval(poll);
      }

      setSteps((prev) => prev.map((s) => ({ ...s, status: "done" as const })));
      await navigate({ to: "/results/$scanId", params: { scanId: registered.scanId } });
    } catch (e) {
      setFailure(
        e instanceof Error ? `We couldn't complete the scan. ${e.message}` : "We couldn't complete the scan.",
      );
      setSteps(STEPS.map((s) => ({ ...s, status: "pending" as const })));
    } finally {
      setBusy(false);
    }
  }, [analyze, create, duration, hash, mark, media, navigate]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="text-center">
        <p className="font-mono text-[11px] tracking-[0.22em] text-primary uppercase">
          Secure forensic scan
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">New Scan</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Evidence is stored privately, hashed for integrity and analysed server-side. Detection is
          probabilistic — results are supporting evidence, not proof.
        </p>
      </header>

      <div className="mt-10 space-y-6">
        {!media ? (
          <UploadZone onSelect={onSelect} onDemo={() => navigate({ to: "/analyze" })} error={error} onError={setError} />
        ) : (
          <MediaPreviewCard media={media} hash={hash} busy={busy} onRemove={reset} onAnalyze={run} />
        )}

        {duplicate ? (
          <p className="panel flex items-start gap-2 border-verdict-warn/40 bg-verdict-warn/10 p-4 text-sm text-verdict-warn">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            {duplicate}
          </p>
        ) : null}

        {busy ? <PipelineTimeline steps={steps} /> : null}

        {failure ? (
          <div role="alert" className="panel border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">
            <p className="flex items-start gap-2 font-medium">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              {failure}
            </p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={run} disabled={busy}>
                <RotateCcw className="size-4" /> Retry
              </Button>
              <Button size="sm" variant="outline" onClick={reset}>
                Start over
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
