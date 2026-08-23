import type { FileInfo, MediaKind } from "./types";

export const ACCEPTED_TYPES: Record<string, string[]> = {
  image: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
  video: ["video/mp4", "video/quicktime", "video/webm"],
  audio: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/mp4", "audio/x-m4a"],
};

export const ACCEPTED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
  "heif",
  "mp4",
  "mov",
  "webm",
  "mp3",
  "wav",
  "m4a",
];

export const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB

export function extensionOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

export function kindOf(file: File): MediaKind {
  const ext = extensionOf(file.name);
  if (file.type.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(ext))
    return "image";
  if (file.type.startsWith("video/") || ["mp4", "mov", "webm"].includes(ext)) return "video";
  if (file.type.startsWith("audio/") || ["mp3", "wav", "m4a"].includes(ext)) return "audio";
  return "unknown";
}

export function validateFile(file: File): string | null {
  const ext = extensionOf(file.name);
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    return `Unsupported file type ".${ext || "unknown"}". Accepted: ${ACCEPTED_EXTENSIONS.join(", ").toUpperCase()}.`;
  }
  if (file.size === 0) return "The selected file is empty.";
  if (file.size > MAX_FILE_SIZE) {
    return `File is too large (${formatBytes(file.size)}). Maximum upload size is ${formatBytes(MAX_FILE_SIZE)}.`;
  }
  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 ? 2 : 1)} ${units[i]}`;
}

export function formatDuration(seconds: number): string {
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export async function sha256(buffer: ArrayBuffer): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) return "unavailable";
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Reads ISO-BMFF `ftyp` brands (MP4/MOV/M4A/HEIC) — real container evidence. */
export function readContainerBrands(bytes: Uint8Array): string[] {
  const brands: string[] = [];
  const ascii = (o: number, n: number) =>
    String.fromCharCode(...bytes.slice(o, o + n)).replace(/\0/g, "");
  if (bytes.length > 16 && ascii(4, 4) === "ftyp") {
    const size = new DataView(bytes.buffer, bytes.byteOffset).getUint32(0);
    brands.push(ascii(8, 4).trim());
    for (let o = 16; o + 4 <= Math.min(size, bytes.length); o += 4) {
      const b = ascii(o, 4).trim();
      if (b) brands.push(b);
    }
  }
  return Array.from(new Set(brands.filter(Boolean)));
}

function probeMedia(
  file: File,
  kind: MediaKind,
): Promise<{ width: number | null; height: number | null; duration: number | null }> {
  return new Promise((resolve) => {
    if (typeof document === "undefined" || kind === "unknown") {
      resolve({ width: null, height: null, duration: null });
      return;
    }
    const url = URL.createObjectURL(file);
    const done = (r: { width: number | null; height: number | null; duration: number | null }) => {
      URL.revokeObjectURL(url);
      resolve(r);
    };
    const timer = setTimeout(() => done({ width: null, height: null, duration: null }), 8000);
    if (kind === "image") {
      const img = new Image();
      img.onload = () => {
        clearTimeout(timer);
        done({ width: img.naturalWidth, height: img.naturalHeight, duration: null });
      };
      img.onerror = () => {
        clearTimeout(timer);
        done({ width: null, height: null, duration: null });
      };
      img.src = url;
    } else {
      const el = document.createElement(kind === "video" ? "video" : "audio") as HTMLVideoElement;
      el.preload = "metadata";
      el.onloadedmetadata = () => {
        clearTimeout(timer);
        done({
          width: el.videoWidth || null,
          height: el.videoHeight || null,
          duration: Number.isFinite(el.duration) ? el.duration : null,
        });
      };
      el.onerror = () => {
        clearTimeout(timer);
        done({ width: null, height: null, duration: null });
      };
      el.src = url;
    }
  });
}

export async function analyzeFile(file: File, buffer: ArrayBuffer): Promise<FileInfo> {
  const kind = kindOf(file);
  const bytes = new Uint8Array(buffer);
  const [hash, probe] = await Promise.all([sha256(buffer), probeMedia(file, kind)]);
  const brands = readContainerBrands(bytes);
  const duration = probe.duration;
  return {
    name: file.name,
    extension: extensionOf(file.name),
    mimeType: file.type || "unknown",
    size: file.size,
    sizeLabel: formatBytes(file.size),
    kind,
    sha256: hash,
    lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : null,
    width: probe.width,
    height: probe.height,
    duration,
    frameRate: null, // not derivable reliably in-browser
    codec: brands.length ? `Container brands: ${brands.join(", ")}` : null,
    bitrate: duration && duration > 0 ? Math.round((file.size * 8) / duration) : null,
    colorSpace: null,
    containerBrands: brands,
  };
}
