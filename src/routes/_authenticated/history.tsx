import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { deleteScan, listScans } from "@/lib/scans.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBytes } from "@/lib/forensics/fileAnalyzer";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "Scan History — AIMD Media Forensics" },
      {
        name: "description",
        content:
          "Search, review and permanently delete your AIMD forensic scans, evidence records and stored media.",
      },
      { property: "og:title", content: "Scan History — AIMD Media Forensics" },
      {
        property: "og:description",
        content: "Complete searchable record of your AIMD forensic scans with delete controls.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const fetchScans = useServerFn(listScans);
  const remove = useServerFn(deleteScan);
  const qc = useQueryClient();
  const [query, setQuery] = useState("");

  const { data } = useQuery({ queryKey: ["scans"], queryFn: () => fetchScans({ data: undefined }) });
  const del = useMutation({
    mutationFn: (scanId: string) => remove({ data: { scanId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scans"] }),
  });

  const rows = (data ?? []).filter((r) =>
    `${r.file_name} ${r.evidence_id} ${r.case_id ?? ""} ${r.verdict ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.22em] text-primary uppercase">Records</p>
          <h1 className="mt-2 font-display text-3xl font-bold">Scan history</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Deleting a scan permanently removes the stored media and all derived evidence.
          </p>
        </div>
        <Input
          placeholder="Search file, evidence ID, case…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full sm:w-72"
        />
      </header>

      <div className="panel mt-8 overflow-x-auto p-2">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-border font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              <th className="p-3">File</th>
              <th className="p-3">Evidence ID</th>
              <th className="p-3">Type</th>
              <th className="p-3">Verdict</th>
              <th className="p-3">Date</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border/50 last:border-0">
                <td className="p-3">
                  <Link
                    to="/results/$scanId"
                    params={{ scanId: r.id }}
                    className="hover:text-primary"
                  >
                    {r.file_name}
                  </Link>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {formatBytes(Number(r.file_size))}
                  </span>
                </td>
                <td className="p-3 font-mono text-xs">{r.evidence_id}</td>
                <td className="p-3 text-xs">{r.media_kind}</td>
                <td className="p-3 font-mono text-xs">
                  {r.verdict ?? r.status}
                  {r.confidence !== null ? ` ${Number(r.confidence)}%` : ""}
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Delete ${r.file_name}`}
                    onClick={() => del.mutate(r.id)}
                    disabled={del.isPending}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                  No scans found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
