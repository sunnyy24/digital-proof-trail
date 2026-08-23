import type { ForensicReport } from "./types";

export interface ReportRecord {
  id: string;
  name: string;
  kind: string;
  extension: string;
  sizeLabel: string;
  verdictKind: ForensicReport["verdict"]["kind"];
  verdictLabel: string;
  confidence: number;
  analyzedAt: string;
  isDemo: boolean;
  thumbnail: string | null;
  report: ForensicReport;
}

const KEY = "aimd.reports.v1";

function safeParse(raw: string | null): ReportRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ReportRecord[]) : [];
  } catch {
    return [];
  }
}

export function loadReports(): ReportRecord[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(KEY));
}

export function saveReport(report: ForensicReport, thumbnail: string | null): ReportRecord {
  const record: ReportRecord = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name: report.file.name,
    kind: report.file.kind,
    extension: report.file.extension,
    sizeLabel: report.file.sizeLabel,
    verdictKind: report.verdict.kind,
    verdictLabel: report.verdict.label,
    confidence: report.verdict.confidence,
    analyzedAt: report.analyzedAt,
    isDemo: report.isDemo,
    thumbnail,
    report,
  };
  if (typeof window === "undefined") return record;
  const next = [record, ...loadReports()].slice(0, 40);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or unavailable — history is a convenience, not a requirement.
  }
  window.dispatchEvent(new Event("aimd:reports"));
  return record;
}

export function deleteReport(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(loadReports().filter((r) => r.id !== id)));
  window.dispatchEvent(new Event("aimd:reports"));
}

export function clearReports() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("aimd:reports"));
}

/** Generates a small JPEG data URL preview for image files; returns null otherwise. */
export async function makeThumbnail(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/") || typeof document === "undefined") return null;
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode failed"));
      el.src = url;
    });
    const max = 160;
    const scale = Math.min(max / img.naturalWidth, max / img.naturalHeight, 1);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function useReportsSnapshot() {
  return loadReports();
}
