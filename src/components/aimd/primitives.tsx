import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Certainty, EvidenceStatus } from "@/lib/forensics/types";
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle } from "lucide-react";

export function SectionCard({
  title,
  icon,
  subtitle,
  children,
  className,
  action,
}: {
  title: string;
  icon?: ReactNode;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn("panel p-5", className)}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {icon ? <div className="mt-0.5 text-primary">{icon}</div> : null}
          <div>
            <h3 className="text-sm font-semibold tracking-wide uppercase">{title}</h3>
            {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function CertaintyTag({ certainty }: { certainty: Certainty }) {
  const map: Record<Certainty, string> = {
    confirmed: "border-verdict-safe/40 text-verdict-safe bg-verdict-safe/10",
    inferred: "border-verdict-warn/40 text-verdict-warn bg-verdict-warn/10",
    unknown: "border-border text-muted-foreground bg-muted/40",
  };
  const label: Record<Certainty, string> = {
    confirmed: "CONFIRMED",
    inferred: "INFERRED",
    unknown: "UNKNOWN",
  };
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider whitespace-nowrap",
        map[certainty],
      )}
    >
      {label[certainty]}
    </span>
  );
}

export function StatusIcon({ status, className }: { status: EvidenceStatus; className?: string }) {
  const c = cn("size-4 shrink-0", className);
  if (status === "positive") return <CheckCircle2 className={cn(c, "text-verdict-safe")} />;
  if (status === "warning") return <AlertTriangle className={cn(c, "text-verdict-warn")} />;
  if (status === "negative") return <XCircle className={cn(c, "text-verdict-danger")} />;
  return <MinusCircle className={cn(c, "text-muted-foreground")} />;
}

export function DataRow({
  label,
  value,
  certainty,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  certainty?: Certainty;
  mono?: boolean;
}) {
  const missing = value === null || value === undefined || value === "";
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 text-right">
        <span
          className={cn(
            "text-sm",
            mono && !missing && "font-mono text-xs break-all",
            missing && "text-muted-foreground/70 italic",
          )}
        >
          {missing ? "Not available" : value}
        </span>
        {certainty ? <CertaintyTag certainty={missing ? "unknown" : certainty} /> : null}
      </span>
    </div>
  );
}

export function ConfidenceMeter({
  value,
  tone = "primary",
  label = "Confidence",
}: {
  value: number | null;
  tone?: "primary" | "safe" | "warn" | "danger";
  label?: string;
}) {
  const toneClass = {
    primary: "bg-primary",
    safe: "bg-verdict-safe",
    warn: "bg-verdict-warn",
    danger: "bg-verdict-danger",
  }[tone];
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-mono text-sm font-semibold">
          {value === null ? "N/A" : `${value}%`}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", toneClass)}
          style={{ width: `${value ?? 0}%` }}
        />
      </div>
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{children}</p>;
}
