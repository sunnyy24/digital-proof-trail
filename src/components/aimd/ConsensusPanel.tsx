import type { DetectionOutcome, FusionOutcome, ProvenanceOutcome } from "@/lib/providers/types";
import { cn } from "@/lib/utils";

const LEVEL_TONE: Record<string, string> = {
  HIGH: "text-verdict-danger",
  MEDIUM: "text-verdict-warn",
  LOW: "text-verdict-safe",
  VERIFIED: "text-verdict-safe",
  FOUND: "text-verdict-warn",
  "NOT FOUND": "text-muted-foreground",
  UNAVAILABLE: "text-muted-foreground",
};

export function ConsensusPanel({
  fusion,
  detections,
  provenance,
}: {
  fusion: FusionOutcome;
  detections: DetectionOutcome[];
  provenance: ProvenanceOutcome[];
}) {
  return (
    <section className="panel p-6">
      <h3 className="font-display text-base font-semibold">Provider consensus</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Each signal is listed independently. Unavailable signals are never treated as evidence of
        authenticity.
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-border font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              <th className="pb-2">Signal</th>
              <th className="pb-2">Level</th>
              <th className="pb-2">Detail</th>
            </tr>
          </thead>
          <tbody>
            {fusion.consensus.map((row, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0">
                <td className="py-3 pr-4 font-medium">{row.label}</td>
                <td className={cn("py-3 pr-4 font-mono text-xs", LEVEL_TONE[row.level] ?? "")}>
                  {row.level}
                </td>
                <td className="py-3 text-xs text-muted-foreground">{row.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {detections.map((d, i) => (
          <div key={i} className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-sm font-medium">{d.provider}</p>
            <p className="mt-1 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              {d.status}
            </p>
            <dl className="mt-3 space-y-1 text-xs">
              <Row label="AI-generated" value={d.aiGeneratedScore} />
              <Row label="Deepfake" value={d.deepfakeScore} />
              <Row label="Possible source" text={d.sourceName} />
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">{d.message}</p>
          </div>
        ))}
        {provenance.map((p, i) => (
          <div key={`p-${i}`} className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-sm font-medium">{p.provider}</p>
            <p className="mt-1 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              {p.state.replace("_", " ")}
            </p>
            {p.creationTool ? (
              <p className="mt-2 text-xs">Tool: {p.creationTool}</p>
            ) : null}
            <p className="mt-3 text-xs text-muted-foreground">{p.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  text,
}: {
  label: string;
  value?: number | null;
  text?: string | null;
}) {
  const display = text ?? (value === null || value === undefined ? null : `${value}%`);
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={display ? "font-mono tabular-nums" : "text-muted-foreground italic"}>
        {display ?? "Unavailable"}
      </dd>
    </div>
  );
}
