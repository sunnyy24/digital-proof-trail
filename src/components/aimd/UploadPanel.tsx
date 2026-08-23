import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE,
  formatBytes,
  kindOf,
  validateFile,
} from "@/lib/forensics/fileAnalyzer";
import { Upload, X, ShieldCheck, FileWarning, Loader2 } from "lucide-react";

export interface SelectedFile {
  file: File;
  previewUrl: string;
  kind: string;
}

export function UploadPanel({
  selected,
  onSelect,
  onClear,
  onAnalyze,
  busy,
  hashPreview,
}: {
  selected: SelectedFile | null;
  onSelect: (f: File) => void;
  onClear: () => void;
  onAnalyze: () => void;
  busy: boolean;
  hashPreview: string | null;
}) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => void (timer.current && clearInterval(timer.current)), []);

  const handle = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      const err = validateFile(file);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      // Real read progress: the file is streamed into memory before analysis.
      setProgress(0);
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      reader.onload = () => setProgress(100);
      reader.onerror = () => setError("The file could not be read. Please try again.");
      reader.readAsArrayBuffer(file.slice(0, Math.min(file.size, 8 * 1024 * 1024)));
      onSelect(file);
    },
    [onSelect],
  );

  return (
    <div className="panel p-5 sm:p-6">
      {!selected ? (
        <>
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handle(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors",
              dragging
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/60 hover:bg-primary/5",
            )}
          >
            <Upload className="mb-4 size-8 text-primary" />
            <p className="text-base font-medium">Drop media here or browse files</p>
            <p className="mt-2 max-w-md text-xs text-muted-foreground">
              Supported: {ACCEPTED_EXTENSIONS.join(", ").toUpperCase()} · Max{" "}
              {formatBytes(MAX_FILE_SIZE)}
            </p>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept={ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(",")}
              onChange={(e) => handle(e.target.files?.[0])}
            />
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-verdict-safe" />
            Your media is analyzed locally in your browser. AIMD does not upload or retain your files
            longer than the analysis requires unless you explicitly save the report.
          </p>
        </>
      ) : (
        <div className="grid gap-5 md:grid-cols-[220px_1fr]">
          <div className="overflow-hidden rounded-lg border border-border bg-muted/40">
            {selected.kind === "image" ? (
              <img
                src={selected.previewUrl}
                alt={`Preview of ${selected.file.name}`}
                className="aspect-square w-full object-contain"
              />
            ) : selected.kind === "video" ? (
              <video src={selected.previewUrl} controls className="aspect-square w-full object-contain" />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center p-4">
                <audio src={selected.previewUrl} controls className="w-full" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{selected.file.name}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {selected.file.type || "unknown MIME"} · {formatBytes(selected.file.size)} ·{" "}
                  {kindOf(selected.file)}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClear} disabled={busy}>
                <X className="size-4" /> Remove
              </Button>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>File read</span>
                <span className="font-mono">{progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-border/70 bg-muted/30 p-3">
              <p className="text-[11px] tracking-wider text-muted-foreground uppercase">SHA-256</p>
              <p className="mono-xs mt-1 text-foreground/90">
                {hashPreview ?? "computing…"}
              </p>
            </div>

            <div className="mt-auto flex flex-wrap gap-2 pt-4">
              <Button onClick={onAnalyze} disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                {busy ? "Analyzing…" : "Run forensic analysis"}
              </Button>
              <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={busy}>
                Re-upload
              </Button>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(",")}
                onChange={(e) => handle(e.target.files?.[0])}
              />
            </div>
          </div>
        </div>
      )}

      {error ? (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive-foreground">
          <FileWarning className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
