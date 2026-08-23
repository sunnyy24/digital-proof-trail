import exifr from "exifr";
import type { CaptureInfo, DeviceInfo, MetadataResult } from "./types";

const EMPTY_DEVICE: DeviceInfo = {
  identified: false,
  manufacturer: null,
  model: null,
  modelCode: null,
  lens: null,
  software: null,
  firmware: null,
};

const EMPTY_CAPTURE: CaptureInfo = {
  dateTimeOriginal: null,
  dimensions: null,
  orientation: null,
  iso: null,
  shutterSpeed: null,
  aperture: null,
  focalLength: null,
  flash: null,
  whiteBalance: null,
  gps: null,
};

const ORIENTATIONS: Record<number, string> = {
  1: "Normal (0°)",
  2: "Mirrored horizontal",
  3: "Rotated 180°",
  4: "Mirrored vertical",
  5: "Mirrored + rotated 270°",
  6: "Rotated 90° CW",
  7: "Mirrored + rotated 90°",
  8: "Rotated 270° CW",
};

function str(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v.toISOString();
  const s = String(v).trim();
  return s.length ? s : null;
}

function shutter(v: unknown): string | null {
  const n = typeof v === "number" ? v : null;
  if (n === null) return str(v);
  return n >= 1 ? `${n.toFixed(1)} s` : `1/${Math.round(1 / n)} s`;
}

/** Friendly device name from make + model, without inventing anything. */
function deviceName(make: string | null, model: string | null): string | null {
  if (!model) return make;
  if (!make) return model;
  const m = make.split(" ")[0]!;
  return model.toLowerCase().startsWith(m.toLowerCase()) ? model : `${make} ${model}`;
}

export async function analyzeExif(file: File, kind: string): Promise<MetadataResult> {
  if (kind !== "image") {
    return {
      available: false,
      device: EMPTY_DEVICE,
      capture: EMPTY_CAPTURE,
      tagCount: 0,
      strippedIndicators: [],
      raw: null,
      message: "EXIF analysis applies to images. Container metadata is reported under File Information.",
    };
  }

  let raw: Record<string, unknown> | null = null;
  try {
    raw = (await exifr.parse(file, {
      tiff: true,
      exif: true,
      gps: true,
      ifd0: true,
      xmp: true,
      icc: true,
      iptc: true,
      mergeOutput: true,
    })) as Record<string, unknown> | null;
  } catch {
    raw = null;
  }

  if (!raw || Object.keys(raw).length === 0) {
    return {
      available: false,
      device: EMPTY_DEVICE,
      capture: EMPTY_CAPTURE,
      tagCount: 0,
      strippedIndicators: ["No EXIF/XMP block present"],
      raw: null,
      message: "Metadata unavailable or removed.",
    };
  }

  const make = str(raw["Make"]);
  const model = str(raw["Model"]);
  const device: DeviceInfo = {
    identified: Boolean(make || model),
    manufacturer: make,
    model: deviceName(make, model),
    modelCode: model,
    lens: str(raw["LensModel"] ?? raw["LensMake"] ?? raw["Lens"]),
    software: str(raw["Software"] ?? raw["CreatorTool"]),
    firmware: str(raw["FirmwareVersion"] ?? raw["HostComputer"]),
  };

  const lat = typeof raw["latitude"] === "number" ? (raw["latitude"] as number) : null;
  const lon = typeof raw["longitude"] === "number" ? (raw["longitude"] as number) : null;
  const w = raw["ExifImageWidth"] ?? raw["ImageWidth"];
  const h = raw["ExifImageHeight"] ?? raw["ImageHeight"];

  const capture: CaptureInfo = {
    dateTimeOriginal: str(raw["DateTimeOriginal"] ?? raw["CreateDate"] ?? raw["ModifyDate"]),
    dimensions: w && h ? `${w} × ${h}` : null,
    orientation:
      typeof raw["Orientation"] === "number"
        ? (ORIENTATIONS[raw["Orientation"] as number] ?? String(raw["Orientation"]))
        : str(raw["Orientation"]),
    iso: str(raw["ISO"] ?? raw["ISOSpeedRatings"]),
    shutterSpeed: shutter(raw["ExposureTime"]),
    aperture: raw["FNumber"] ? `f/${Number(raw["FNumber"]).toFixed(1)}` : null,
    focalLength: raw["FocalLength"] ? `${Number(raw["FocalLength"]).toFixed(1)} mm` : null,
    flash: str(raw["Flash"]),
    whiteBalance: str(raw["WhiteBalance"]),
    gps: lat !== null && lon !== null ? { lat, lon } : null,
  };

  const stripped: string[] = [];
  if (!device.identified) stripped.push("No camera make/model tags");
  if (!capture.dateTimeOriginal) stripped.push("No original capture timestamp");
  if (!capture.gps) stripped.push("No GPS tags");

  return {
    available: true,
    device,
    capture,
    tagCount: Object.keys(raw).length,
    strippedIndicators: stripped,
    raw,
    message: `${Object.keys(raw).length} metadata tags read from the file.`,
  };
}
