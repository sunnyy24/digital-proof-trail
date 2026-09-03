import { ConfidenceRing } from "@/components/aimd/ConfidenceRing";
import { VERDICT_LABEL } from "@/lib/forensics/fusion";
import { DETECTION_DISCLAIMER, type FusionOutcome } from "@/lib/providers/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, Info } from "lucide-react";

const TONE: Record<string, string> = {
  LIKELY_AI_GENERATED: "text-verdict-danger border-verdict-danger/40 bg-verdict-danger/10",
  LIKELY_HUMAN_CREATED: "text-verdict-safe border-verdict-safe/40 bg-verdict-safe/10",
  INCONCLUSIVE: "text-verdict-warn border-verdict-warn/40 bg-verdict-warn/10",
  ANALYSIS_UNAVAILABLE: "text-muted-foreground border-border bg-muted/30",
};

export function VerdictPanel({
  fusion,
  summary,
}: {
  fusion: FusionOutcome;
  summary?: string | null;
}) {
  return (
    <section className="panel p-6 sm:p-8">
      <div className="flex flex-col items-start gap-7 sm:flex-row sm:items-center">
        <ConfidenceRing value={fusion.confidence} />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
            Final assessment
          </p>
          <h2
            className={cn(
              "mt-2 inline-flex rounded-lg border px-3 py-1.5 font-display text-xl font-bold sm:text-2xl",
              TONE[fusion.verdict],
            )}
          >
            {VERDICT_LABEL[fusion.verdict]}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Risk level <span className="text-foreground">{fusion.riskLevel}</span> · Confidence{" "}
            <span className="text-foreground">{fusion.confidence}%</span>
          </p>
          {summary ? <p className="mt-4 text-sm leading-relaxed">{summary}</p> : null}
        </div>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <EvidenceList title="Supporting evidence" items={fusion.supporting} tone="safe" />
        <EvidenceList title="Contradicting evidence" items={fusion.contradicting} tone="warn" />
        <EvidenceList title="Limitations" items={fusion.limitations} tone="muted" />
      </div>

      <p className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        {DETECTION_DISCLAIMER}
      </p>
    </section>
  );
}

function EvidenceList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "safe" | "warn" | "muted";
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <h3 className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">None recorded.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-xs leading-relaxed">
              <AlertTriangle
                className={cn(
                  "mt-0.5 size-3.5 shrink-0",
                  tone === "safe" && "text-verdict-safe",
                  tone === "warn" && "text-verdict-warn",
                  tone === "muted" && "text-muted-foreground",
                )}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
