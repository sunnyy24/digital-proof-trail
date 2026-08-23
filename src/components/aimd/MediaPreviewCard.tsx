import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/forensics/fileAnalyzer";
import { ArrowRight, Loader2, Trash2 } from "lucide-react";

export interface SelectedMedia {
  file: File;
  previewUrl: string;
  kind: string;
  width: number | null;
  height: number | null;
}

export function MediaPreviewCard({
  media,
  hash,
  busy,
  onRemove,
  onAnalyze,
}: {
  media: SelectedMedia;
  hash: string | null;
  busy: boolean;
  onRemove: () => void;
  onAnalyze: () => void;
}) {
  const resolution = media.width && media.height ? `${media.width} × ${media.height}` : null;

  return (
    <div className="panel p-5 sm:p-7">
      <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
        <div className="overflow-hidden rounded-xl border border-border bg-muted/40">
          {media.kind === "image" ? (
            <img
              src={media.previewUrl}
              alt={`Preview of ${media.file.name}`}
              className="aspect-square w-full object-contain"
            />
          ) : media.kind === "video" ? (
            <video src={media.previewUrl} controls className="aspect-square w-full object-contain" />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center p-5">
              <audio src={media.previewUrl} controls className="w-full" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          <p className="truncate font-display text-lg font-semibold">{media.file.name}</p>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
            <Meta label="File size" value={formatBytes(media.file.size)} />
            <Meta label="File type" value={media.file.type || "Unknown MIME"} />
            <Meta label="Media" value={media.kind} />
            <Meta label="Resolution" value={resolution ?? "Not available"} />
          </dl>

          <div className="mt-5 rounded-lg border border-border/70 bg-muted/30 p-3">
            <p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">SHA-256</p>
            <p className="mono-xs mt-1 text-foreground/90">{hash ?? "computing…"}</p>
          </div>

          <div className="mt-auto flex flex-wrap gap-2 pt-6">
            <Button variant="outline" onClick={onRemove} disabled={busy}>
              <Trash2 className="size-4" /> Remove
            </Button>
            <Button onClick={onAnalyze} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              {busy ? "Analyzing…" : "Start Analysis"}
              {busy ? null : <ArrowRight className="size-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-1 truncate text-sm">{value}</dd>
    </div>
  );
}
