import { jpegSegments, sampleAscii } from "./byteScan";
import type { FileInfo, ManipulationResult, MetadataResult, RiskLevel } from "./types";

const EDITOR_MARKERS = [
  "adobe photoshop",
  "photoshop",
  "lightroom",
  "gimp",
  "affinity photo",
  "pixelmator",
  "snapseed",
  "picsart",
  "facetune",
  "canva",
  "paint.net",
  "capcut",
];

/**
 * Structural manipulation analysis: metadata inconsistencies, editor
 * signatures and container/re-encode hints. No pixel-forensics model is
 * bundled, so region-level claims are never made.
 */
export function analyzeManipulation(
  bytes: Uint8Array,
  file: FileInfo,
  metadata: MetadataResult,
): ManipulationResult {
  const text = sampleAscii(bytes).toLowerCase();
  const evidence: string[] = [];
  let score = 0;

  const editor = EDITOR_MARKERS.find((m) => text.includes(m));
  if (editor) {
    evidence.push(`Editing software signature found in file: "${editor}"`);
    score += 2;
  }

  if (metadata.available) {
    const { capture, device, raw } = metadata;
    const modify = raw?.["ModifyDate"];
    if (capture.dateTimeOriginal && modify) {
      const a = new Date(capture.dateTimeOriginal).getTime();
      const b = new Date(String(modify)).getTime();
      if (Number.isFinite(a) && Number.isFinite(b) && Math.abs(b - a) > 60_000) {
        evidence.push("Capture timestamp and modification timestamp differ — file was re-saved after capture");
        score += 1;
      }
    }
    if (device.software && !device.manufacturer) {
      evidence.push("Software tag present without any camera make/model — typical of an exported/edited file");
      score += 1;
    }
    if (device.identified && !capture.dateTimeOriginal) {
      evidence.push("Camera model present but original capture timestamp missing — metadata inconsistency");
      score += 1;
    }
  } else if (file.kind === "image") {
    evidence.push("No metadata present — the file was re-encoded, exported or stripped at some point");
    score += 1;
  }

  if (file.extension === "jpg" || file.extension === "jpeg") {
    const seg = jpegSegments(bytes);
    if (seg.quantTables > 1) {
      evidence.push(`Multiple quantisation-table segments (${seg.quantTables}) — evidence of re-encoding`);
      score += 1;
    }
    if (!seg.hasEXIF && seg.app.length <= 1) {
      evidence.push("Minimal JPEG APP segments — consistent with a stripped re-encode");
      score += 1;
    }
  }

  if (file.width && file.height) {
    const exifDims = metadata.capture.dimensions;
    if (exifDims) {
      const [w, h] = exifDims.split("×").map((s) => Number(s.trim()));
      if (w && h && (w !== file.width || h !== file.height)) {
        evidence.push(
          `Decoded resolution (${file.width}×${file.height}) differs from EXIF-recorded resolution (${w}×${h}) — resizing or cropping likely`,
        );
        score += 2;
      }
    }
  }

  let risk: RiskLevel;
  if (score >= 4) risk = "HIGH";
  else if (score >= 2) risk = "MEDIUM";
  else if (score === 1) risk = "LOW";
  else risk = "LOW";

  const confidence = score === 0 ? 60 : Math.min(90, 55 + score * 8);

  return {
    risk,
    confidence,
    evidence,
    message:
      score === 0
        ? "No strong manipulation indicators detected. Structural analysis cannot rule out sophisticated edits."
        : "Indicators below are structural (metadata/container level). Copy-move, splicing and deepfake detection require a pixel-forensics model, which is not configured.",
  };
}
