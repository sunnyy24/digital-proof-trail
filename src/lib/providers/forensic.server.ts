// ForensicProvider — metadata + structural analysis over the original bytes.

import { analyzeExif } from "@/lib/forensics/exifAnalyzer";
import { analyzeManipulation } from "@/lib/forensics/manipulationAnalyzer";
import { analyzeSocialMedia } from "@/lib/forensics/socialMediaAnalyzer";
import { readContainerBrands, formatBytes } from "@/lib/forensics/fileAnalyzer";
import type { FileInfo } from "@/lib/forensics/types";
import type { ForensicIndicator, ForensicOutcome, MediaKind } from "./types";

export interface ProbeInfo {
  width: number | null;
  height: number | null;
  duration: number | null;
}

export async function runForensics(
  bytes: Uint8Array,
  meta: {
    name: string;
    mimeType: string;
    size: number;
    sha256: string;
    kind: MediaKind;
    probe: ProbeInfo;
  },
): Promise<ForensicOutcome> {
  const brands = readContainerBrands(bytes);
  const fileInfo: FileInfo = {
    name: meta.name,
    extension: meta.name.includes(".") ? meta.name.split(".").pop()!.toLowerCase() : "",
    mimeType: meta.mimeType || "unknown",
    size: meta.size,
    sizeLabel: formatBytes(meta.size),
    kind: meta.kind === "unknown" ? "unknown" : meta.kind,
    sha256: meta.sha256,
    lastModified: null,
    width: meta.probe.width,
    height: meta.probe.height,
    duration: meta.probe.duration,
    frameRate: null,
    codec: brands.length ? `Container brands: ${brands.join(", ")}` : null,
    bitrate:
      meta.probe.duration && meta.probe.duration > 0
        ? Math.round((meta.size * 8) / meta.probe.duration)
        : null,
    colorSpace: null,
    containerBrands: brands,
  };

  const metadata = await analyzeExif(bytes, meta.kind);
  const manipulation = analyzeManipulation(bytes, fileInfo, metadata);
  const social = analyzeSocialMedia(bytes, fileInfo, metadata);

  const indicators: ForensicIndicator[] = [];

  indicators.push({
    status: metadata.available ? "positive" : "warning",
    title: metadata.available
      ? `Metadata present (${metadata.tagCount} tags)`
      : "No embedded metadata",
    explanation: metadata.message,
    certainty: "confirmed",
    confidence: null,
    source: "Metadata analysis",
    category: "Metadata",
  });

  if (metadata.device.identified) {
    indicators.push({
      status: "positive",
      title: `Capture device: ${metadata.device.model ?? metadata.device.manufacturer}`,
      explanation:
        "Camera identification fields are present in the file metadata. Metadata can be edited, so this supports but does not prove device capture.",
      certainty: "confirmed",
      confidence: null,
      source: "EXIF",
      category: "Device",
    });
  }
  if (metadata.device.software) {
    indicators.push({
      status: "warning",
      title: `Software trace: ${metadata.device.software}`,
      explanation:
        "Editing or processing software is named in the metadata. This indicates the file passed through software; it does not by itself indicate AI generation.",
      certainty: "confirmed",
      confidence: null,
      source: "EXIF",
      category: "Editing",
    });
  }

  for (const item of manipulation.evidence) {
    indicators.push({
      status: manipulation.risk === "HIGH" ? "negative" : "warning",
      title: item,
      explanation: manipulation.message,
      certainty: "inferred",
      confidence: manipulation.confidence,
      source: "Structural analysis",
      category: "Manipulation",
    });
  }

  if (social.determined) {
    indicators.push({
      status: "neutral",
      title: `Social-media processing: ${social.platform}`,
      explanation: social.indicators.join("; ") || social.message,
      certainty: "inferred",
      confidence: social.confidence,
      source: "Recompression analysis",
      category: "Distribution",
    });
  }

  return {
    mediaKind: meta.kind,
    metadata: {
      available: metadata.available,
      device: metadata.device,
      capture: metadata.capture,
      tagCount: metadata.tagCount,
      strippedIndicators: metadata.strippedIndicators,
      message: metadata.message,
      raw: metadata.raw,
    } as never,
    indicators,
    technical: {
      file: fileInfo,
      containerBrands: brands,
      manipulationRisk: manipulation.risk,
      manipulationConfidence: manipulation.confidence,
      socialMedia: social,
    } as never,
  };
}
