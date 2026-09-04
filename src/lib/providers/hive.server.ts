// HiveProvider — DetectorProvider implementation (server-only).
// Never imported by client code. Returns "unavailable" when HIVE_API_KEY is
// not configured; it never fabricates scores.

import type { DetectionOutcome, MediaKind, SegmentOutcome } from "./types";

const HIVE_SYNC_URL = "https://api.thehive.ai/api/v2/task/sync";

function unavailable(mediaType: MediaKind, message: string): DetectionOutcome {
  return {
    provider: "Hive AI",
    status: "unavailable",
    mediaType,
    aiGeneratedScore: null,
    notAiGeneratedScore: null,
    deepfakeScore: null,
    sourceName: null,
    sourceConfidence: null,
    message,
    segments: [],
    raw: null,
  };
}

export function isHiveConfigured(): boolean {
  return Boolean(process.env["HIVE_API_KEY"]);
}

type ClassScore = { class: string; score: number };

function collectClasses(node: unknown, out: ClassScore[]): void {
  if (Array.isArray(node)) {
    for (const item of node) collectClasses(item, out);
    return;
  }
  if (!node || typeof node !== "object") return;
  const obj = node as Record<string, unknown>;
  if (typeof obj["class"] === "string" && typeof obj["score"] === "number") {
    out.push({ class: obj["class"], score: obj["score"] });
  }
  for (const value of Object.values(obj)) collectClasses(value, out);
}

function bestOf(classes: ClassScore[], match: (name: string) => boolean): ClassScore | null {
  let best: ClassScore | null = null;
  for (const c of classes) {
    if (!match(c.class.toLowerCase())) continue;
    if (!best || c.score > best.score) best = c;
  }
  return best;
}

/** Hive returns per-frame/per-segment outputs with a time field when available. */
function collectSegments(raw: unknown, track: "video" | "audio"): SegmentOutcome[] {
  const outputs =
    (raw as { status?: Array<{ response?: { output?: unknown[] } }> })?.status?.[0]?.response
      ?.output ?? [];
  const segments: SegmentOutcome[] = [];
  for (const entry of outputs as Array<Record<string, unknown>>) {
    const time = typeof entry["time"] === "number" ? entry["time"] : null;
    const start = typeof entry["start_time"] === "number" ? entry["start_time"] : time;
    if (start === null) continue;
    const classes: ClassScore[] = [];
    collectClasses(entry, classes);
    const ai = bestOf(classes, (n) => n.includes("ai_generated") || n === "ai");
    const deepfake = bestOf(classes, (n) => n.includes("deepfake") || n.includes("face_manip"));
    const score = Math.max(ai?.score ?? 0, deepfake?.score ?? 0);
    segments.push({
      track,
      start,
      end: typeof entry["end_time"] === "number" ? (entry["end_time"] as number) : null,
      label: score >= 0.7 ? "AI" : score >= 0.4 ? "SUSPICIOUS" : "HUMAN",
      confidence: Number.isFinite(score) ? Math.round(score * 100) : null,
      detector: deepfake && deepfake.score >= (ai?.score ?? 0) ? "Hive deepfake" : "Hive AI",
      detail: null,
    });
  }
  return segments;
}

async function callHive(
  bytes: Uint8Array,
  fileName: string,
  mimeType: string,
  model: string,
): Promise<unknown> {
  const key = process.env["HIVE_API_KEY"]!;
  const form = new FormData();
  form.append("media", new Blob([bytes as BlobPart], { type: mimeType || "application/octet-stream" }), fileName);
  const response = await fetch(HIVE_SYNC_URL, {
    method: "POST",
    headers: { Authorization: `Token ${key}`, "X-Hive-Model": model },
    body: form,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Hive responded ${response.status}. ${text.slice(0, 300)}`);
  }
  return response.json();
}

function normalizeHiveResult(raw: unknown, mediaType: MediaKind): DetectionOutcome {
  const classes: ClassScore[] = [];
  collectClasses(raw, classes);

  const ai = bestOf(classes, (n) => n === "ai_generated" || n.includes("ai_generated"));
  const notAi = bestOf(classes, (n) => n.includes("not_ai_generated") || n === "human");
  const deepfake = bestOf(classes, (n) => n.includes("deepfake") || n.includes("face_manip"));

  // Source attribution: Hive returns generator classes only when it identifies one.
  const generatorNoise = new Set(["ai_generated", "not_ai_generated", "none", "other"]);
  const source = bestOf(
    classes,
    (n) => !generatorNoise.has(n) && !n.includes("deepfake") && !n.includes("ai_generated"),
  );
  const strongSource = source && source.score >= 0.5 ? source : null;

  const segments =
    mediaType === "video"
      ? collectSegments(raw, "video")
      : mediaType === "audio"
        ? collectSegments(raw, "audio")
        : [];

  return {
    provider: "Hive AI",
    status: "ok",
    mediaType,
    aiGeneratedScore: ai ? Math.round(ai.score * 100) : null,
    notAiGeneratedScore: notAi ? Math.round(notAi.score * 100) : null,
    deepfakeScore: deepfake ? Math.round(deepfake.score * 100) : null,
    sourceName: strongSource ? strongSource.class : null,
    sourceConfidence: strongSource ? Math.round(strongSource.score * 100) : null,
    message:
      ai || deepfake
        ? "Hive detection completed."
        : "Hive responded but returned no AI-generation classes for this media.",
    segments,
    raw: raw as never,
  };
}

export async function detectImageVideo(
  bytes: Uint8Array,
  fileName: string,
  mimeType: string,
  mediaType: MediaKind,
): Promise<DetectionOutcome> {
  if (!isHiveConfigured()) {
    return unavailable(mediaType, "Hive detection unavailable — no Hive API key is configured.");
  }
  try {
    const raw = await callHive(bytes, fileName, mimeType, "ai_generated_detection");
    return normalizeHiveResult(raw, mediaType);
  } catch (error) {
    return {
      ...unavailable(mediaType, `Hive detection unavailable. ${(error as Error).message}`),
      status: "error",
    };
  }
}

export async function detectAudio(
  bytes: Uint8Array,
  fileName: string,
  mimeType: string,
): Promise<DetectionOutcome> {
  if (!isHiveConfigured()) {
    return unavailable("audio", "Hive detection unavailable — no Hive API key is configured.");
  }
  try {
    const raw = await callHive(bytes, fileName, mimeType, "ai_generated_audio_detection");
    return normalizeHiveResult(raw, "audio");
  } catch (error) {
    return {
      ...unavailable("audio", `Hive detection unavailable. ${(error as Error).message}`),
      status: "error",
    };
  }
}

export { normalizeHiveResult };
