import { Check, Loader2, Circle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepState } from "@/lib/forensics/types";

const LABELS: Record<string, string> = {
  read: "File received",
  metadata: "Metadata analysis",
  provenance: "Provenance check",
  ai: "AI detection",
  manipulation: "Manipulation analysis",
  social: "Social media analysis",
  report: "Final verdict",
};

export function PipelineTimeline({ steps }: { steps: StepState[] }) {
  const done = steps.filter((s) => s.status === "done").length;
  const pct = Math.round((done / steps.length) * 100);

  return (
    <div className="panel p-5 sm:p-7">
      <div className="mb-5 flex items-baseline justify-between">
        <h3 className="font-display text-base font-semibold">Forensic pipeline running</h3>
        <span className="font-mono text-sm text-primary tabular-nums">{pct}%</span>
      </div>
      <div className="mb-7 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ol className="relative">
        {steps.map((s, i) => {
          const last = i === steps.length - 1;
          const running = s.status === "running";
          return (
            <li key={s.id} className="relative flex gap-4 pb-6 last:pb-0">
              {!last ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-8 left-[15px] h-[calc(100%-2rem)] w-px",
                    s.status === "done" ? "bg-primary/50" : "bg-border",
                  )}
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border transition-colors",
                  s.status === "done" && "border-verdict-safe/50 bg-verdict-safe/15",
                  running && "border-primary bg-primary/15 shadow-[0_0_18px_-4px_var(--color-primary)]",
                  s.status === "pending" && "border-border bg-muted/40",
                  s.status === "skipped" && "border-verdict-warn/50 bg-verdict-warn/10",
                )}
              >
                {s.status === "done" ? (
                  <Check className="size-4 text-verdict-safe" />
                ) : running ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : s.status === "skipped" ? (
                  <AlertTriangle className="size-4 text-verdict-warn" />
                ) : (
                  <Circle className="size-3 text-muted-foreground/60" />
                )}
              </span>

              <div className="min-w-0 flex-1 pt-1">
                <p
                  className={cn(
                    "text-sm font-medium tracking-wide",
                    s.status === "pending" ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  <span className="mr-2 font-mono text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {LABELS[s.id] ?? s.label}
                </p>
                {running ? (
                  <div className="mt-2 h-1 w-40 max-w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-1/3 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-primary" />
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.status === "done" ? "Complete" : s.status === "skipped" ? "Warning" : "Waiting"}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
