import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const TONES = {
  primary: "var(--color-primary)",
  safe: "var(--color-verdict-safe)",
  warn: "var(--color-verdict-warn)",
  danger: "var(--color-verdict-danger)",
} as const;

export function ConfidenceRing({
  value,
  tone = "primary",
  label = "Forensic confidence",
  size = 168,
  className,
}: {
  value: number;
  tone?: keyof typeof TONES;
  label?: string;
  size?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(0);
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  useEffect(() => {
    const id = window.setTimeout(() => setShown(clamped), 60);
    return () => window.clearTimeout(id);
  }, [clamped]);

  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${label}: ${clamped} percent`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-muted)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={TONES[tone]}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (c * shown) / 100}
            style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-display text-4xl font-bold tabular-nums">{clamped}</span>
          <span className="sr-only">percent</span>
        </div>
      </div>
      <p className="mt-3 text-[11px] tracking-[0.16em] text-muted-foreground uppercase">{label}</p>
    </div>
  );
}
