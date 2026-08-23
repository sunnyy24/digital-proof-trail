import { jpegSegments, sampleAscii } from "./byteScan";
import type { FileInfo, MetadataResult, SocialMediaResult } from "./types";

interface PlatformSignature {
  platform: string;
  strings: string[];
  filenamePatterns: RegExp[];
  brands?: string[];
}

const SIGNATURES: PlatformSignature[] = [
  {
    platform: "WhatsApp",
    strings: ["whatsapp"],
    filenamePatterns: [/^(IMG|VID|AUD|PTT)-\d{8}-WA\d{4}/i],
  },
  {
    platform: "Instagram",
    strings: ["instagram"],
    filenamePatterns: [/^\d{9,}_\d{6,}_\d{6,}_n\./i],
  },
  { platform: "Facebook", strings: ["facebook", "fbcdn"], filenamePatterns: [/^FB_IMG_\d+/i] },
  { platform: "X", strings: ["twitter", "pbs.twimg"], filenamePatterns: [/^E[A-Za-z0-9_-]{9,}\./] },
  { platform: "TikTok", strings: ["tiktok", "musically"], filenamePatterns: [/tiktok/i] },
  { platform: "Telegram", strings: ["telegram"], filenamePatterns: [/^photo_\d+@\d{2}-\d{2}-\d{4}/i] },
  {
    platform: "YouTube",
    strings: ["youtube", "google/video"],
    filenamePatterns: [/^videoplayback/i],
    brands: ["iso6", "dash"],
  },
];

/**
 * Looks for platform recompression / handling patterns. Platform naming is
 * only reported when a concrete signature is present; generic recompression
 * alone is reported without naming a platform.
 */
export function analyzeSocialMedia(
  bytes: Uint8Array,
  file: FileInfo,
  metadata: MetadataResult,
): SocialMediaResult {
  const text = sampleAscii(bytes).toLowerCase();
  const indicators: string[] = [];
  let platform: string | null = null;
  let confidence: number | null = null;

  for (const sig of SIGNATURES) {
    const strHit = sig.strings.find((s) => text.includes(s));
    const nameHit = sig.filenamePatterns.some((r) => r.test(file.name));
    const brandHit = sig.brands?.some((b) => file.containerBrands.includes(b));
    if (strHit || nameHit || brandHit) {
      platform = sig.platform;
      confidence = strHit && nameHit ? 88 : nameHit ? 76 : strHit ? 70 : 58;
      if (strHit) indicators.push(`Platform string "${strHit}" embedded in the file`);
      if (nameHit) indicators.push(`Filename matches the ${sig.platform} naming convention`);
      if (brandHit) indicators.push(`Container brand consistent with ${sig.platform} delivery`);
      break;
    }
  }

  // Generic recompression indicators (no platform claim).
  if (file.kind === "image" && !metadata.available) {
    indicators.push("All EXIF metadata stripped — typical of social-platform re-encoding");
  }
  if (file.extension === "jpg" || file.extension === "jpeg") {
    const seg = jpegSegments(bytes);
    if (!seg.hasEXIF && seg.app.includes(0)) {
      indicators.push("Only a JFIF APP0 segment present — matches a generic pipeline re-encode");
    }
    if (file.width && file.height && [1080, 1440, 640, 720].includes(Math.max(file.width, file.height))) {
      indicators.push(
        `Longest edge is exactly ${Math.max(file.width, file.height)} px — a common platform resize target`,
      );
    }
  }

  if (platform) {
    return {
      determined: true,
      platform,
      confidence,
      indicators,
      message: `Possible ${platform} processing detected. This is an indication, not a definitive origin.`,
    };
  }

  if (indicators.length >= 2) {
    return {
      determined: false,
      platform: null,
      confidence: 55,
      indicators,
      message:
        "Possible social-media processing detected, but no specific platform signature was found. Social-media origin could not be determined.",
    };
  }

  return {
    determined: false,
    platform: null,
    confidence: null,
    indicators,
    message: "Social-media origin could not be determined.",
  };
}
