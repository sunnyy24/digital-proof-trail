/** Utilities for scanning raw file bytes for ASCII markers. */

export function asciiWindow(bytes: Uint8Array, limit = 3_000_000): string {
  const end = Math.min(bytes.length, limit);
  let out = "";
  const CHUNK = 32768;
  for (let i = 0; i < end; i += CHUNK) {
    out += String.fromCharCode(...bytes.subarray(i, Math.min(i + CHUNK, end)));
  }
  return out;
}

/** Head + tail sample, so trailing metadata boxes are also covered. */
export function sampleAscii(bytes: Uint8Array, headBytes = 1_500_000, tailBytes = 500_000): string {
  const head = asciiWindow(bytes.subarray(0, headBytes));
  if (bytes.length <= headBytes) return head;
  const tail = asciiWindow(bytes.subarray(Math.max(headBytes, bytes.length - tailBytes)));
  return head + "\n" + tail;
}

export function countMarkers(haystack: string, needles: string[]): string[] {
  const lower = haystack.toLowerCase();
  return needles.filter((n) => lower.includes(n.toLowerCase()));
}

/** Counts JPEG Start-Of-Image / quantisation-table markers (re-encode hints). */
export function jpegSegments(bytes: Uint8Array): { app: number[]; hasEXIF: boolean; quantTables: number } {
  const app: number[] = [];
  let quantTables = 0;
  let hasEXIF = false;
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return { app, hasEXIF, quantTables };
  let i = 2;
  while (i < bytes.length - 3) {
    if (bytes[i] !== 0xff) break;
    const marker = bytes[i + 1]!;
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    if (marker === 0xda) break; // start of scan
    const len = (bytes[i + 2]! << 8) | bytes[i + 3]!;
    if (marker >= 0xe0 && marker <= 0xef) {
      app.push(marker - 0xe0);
      const tag = String.fromCharCode(...bytes.subarray(i + 4, i + 8));
      if (tag === "Exif") hasEXIF = true;
    }
    if (marker === 0xdb) quantTables++;
    i += 2 + len;
  }
  return { app, hasEXIF, quantTables };
}
