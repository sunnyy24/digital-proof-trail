import type { SegmentOutcome } from "@/lib/providers/types";
import { cn } from "@/lib/utils";

const LABEL_TONE: Record<string, string> = {
  AI: "bg-verdict-danger",
  SUSPICIOUS: "bg-verdict-warn",
  HUMAN: "bg-verdict-safe",
};

export function SegmentTimeline({
  segments,
  duration,
}: {
  segments: SegmentOutcome[];
  duration: number | null;
}) {
  if (segments.length === 0) return null;
  const total =
    duration ?? Math.max(...segments.map((s) => s.end ?? s.start + 1), 1);

  return (
    <section className="panel p-6">
      <h3 className="font-display text-base font-semibold">Segment-level detection</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Per-segment detector output across the media timeline.
      </p>

      <div className="mt-5 flex h-8 w-full overflow-hidden rounded-lg border border-border bg-muted/30">
        {segments.map((s, i) => {
          const end = s.end ?? Math.min(total, s.start + total / segments.length);
          const width = Math.max(1, ((end - s.start) / total) * 100);
          return (
            <span
              key={i}
              title={`${s.start.toFixed(1)}s — ${s.label}${s.confidence !== null ? ` (${s.confidence}%)` : ""}`}
              className={cn("h-full", LABEL_TONE[s.label] ?? "bg-muted")}
              style={{ width: `${width}%` }}
            />
          );
        })}
      </div>

      <ul className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
        {segments.slice(0, 12).map((s, i) => (
          <li key={i} className="flex items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-2">
            <span className="font-mono tabular-nums">
              {s.start.toFixed(1)}s{s.end !== null ? `–${s.end.toFixed(1)}s` : ""}
            </span>
            <span className="text-muted-foreground">{s.detector}</span>
            <span className={cn("font-mono", s.label === "AI" && "text-verdict-danger", s.label === "SUSPICIOUS" && "text-verdict-warn", s.label === "HUMAN" && "text-verdict-safe")}>
              {s.label}
              {s.confidence !== null ? ` ${s.confidence}%` : ""}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
