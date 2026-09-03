import { CheckCircle2, XCircle } from "lucide-react";

export function ChainOfCustody({
  events,
  evidenceId,
  sha256,
}: {
  events: Array<{ event: string; status: string; detail: string | null; created_at: string }>;
  evidenceId: string;
  sha256: string;
}) {
  return (
    <section className="panel p-6">
      <h3 className="font-display text-base font-semibold">Chain of custody</h3>
      <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Evidence ID</dt>
          <dd className="font-mono break-all">{evidenceId}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">SHA-256</dt>
          <dd className="font-mono break-all">{sha256}</dd>
        </div>
      </dl>

      <ol className="mt-6 space-y-4">
        {events.map((e, i) => (
          <li key={i} className="flex gap-3">
            {e.status === "failed" ? (
              <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            ) : (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-verdict-safe" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium capitalize">{e.event}</p>
              {e.detail ? (
                <p className="mt-0.5 text-xs break-words text-muted-foreground">{e.detail}</p>
              ) : null}
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                {new Date(e.created_at).toISOString()}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
