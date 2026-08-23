import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE,
  formatBytes,
  validateFile,
} from "@/lib/forensics/fileAnalyzer";
import { Upload, FlaskConical, Lock, FileWarning } from "lucide-react";

export function UploadZone({
  onSelect,
  onDemo,
  error,
  onError,
}: {
  onSelect: (file: File) => void;
  onDemo: () => void;
  error: string | null;
  onError: (message: string | null) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      const err = validateFile(file);
      if (err) {
        onError(err);
        return;
      }
      onError(null);
      onSelect(file);
    },
    [onSelect, onError],
  );

  return (
    <div className="panel p-5 sm:p-8">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload media for forensic analysis"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
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
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all duration-200 sm:py-20",
          dragging
            ? "scale-[1.01] border-primary bg-primary/10 shadow-[0_0_40px_-16px_var(--color-primary)]"
            : "border-border hover:border-primary/60 hover:bg-primary/5",
        )}
      >
        <span className="mb-5 grid size-14 place-items-center rounded-full border border-primary/40 bg-primary/10">
          <Upload className="size-6 text-primary" />
        </span>
        <p className="font-display text-lg font-semibold sm:text-xl">Drop your media here</p>
        <p className="mt-1 text-sm text-muted-foreground">or click to browse</p>
        <p className="mt-6 font-mono text-[11px] tracking-[0.18em] text-primary/80 uppercase">
          Image • Video • Audio
        </p>
        <p className="mt-2 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
          {ACCEPTED_EXTENSIONS.join(" • ").toUpperCase()}
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(",")}
          onChange={(e) => handle(e.target.files?.[0])}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => inputRef.current?.click()}>
          <Upload className="size-4" /> Browse Files
        </Button>
        <Button variant="outline" onClick={onDemo}>
          <FlaskConical className="size-4" /> Try Demo
        </Button>
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3.5 text-verdict-safe" /> Your media is processed securely — maximum{" "}
        {formatBytes(MAX_FILE_SIZE)} per file.
      </p>

      {error ? (
        <p
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
        >
          <FileWarning className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
