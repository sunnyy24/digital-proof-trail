import { Check, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepState } from "@/lib/forensics/types";

export function AnalysisSteps({ steps }: { steps: StepState[] }) {
  const done = steps.filter((s) => s.status === "done").length;
  const pct = Math.round((done / steps.length) * 100);
  return (
    <div className="panel p-5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold tracking-wide uppercase">Analyzing media forensics…</h3>
        <span className="font-mono text-sm text-primary">{pct}%</span>
      </div>
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <ol className="space-y-2.5">
        {steps.map((s, i) => (
          <li key={s.id} className="flex items-center gap-3 text-sm">
            {s.status === "done" ? (
              <Check className="size-4 text-verdict-safe" />
            ) : s.status === "running" ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <Circle className="size-4 text-muted-foreground/50" />
            )}
            <span
              className={cn(
                s.status === "pending" && "text-muted-foreground",
                s.status === "running" && "text-foreground",
                s.status === "done" && "text-muted-foreground",
              )}
            >
              <span className="mr-2 font-mono text-xs text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
