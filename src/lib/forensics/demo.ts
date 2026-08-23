import type { ForensicReport } from "./types";

/**
 * Clearly-labelled DEMO report. Not derived from a real upload — it exists so
 * reviewers can see the full dashboard without providing their own media.
 */
export const DEMO_REPORT: ForensicReport = {
  analyzedAt: new Date().toISOString(),
  isDemo: true,
  file: {
    name: "demo-ai-generated-sample.png",
    extension: "png",
    mimeType: "image/png",
    size: 1_842_113,
    sizeLabel: "1.76 MB",
    kind: "image",
    sha256: "9f2c1c1d4b0a6b1a5cd9d38a2c9d0e77bb31c1e7f4c53a2f5e8b90d3a1c7e402",
    lastModified: "2026-08-20T14:12:08.000Z",
    width: 1024,
    height: 1024,
    duration: null,
    frameRate: null,
    codec: null,
    bitrate: null,
    colorSpace: "sRGB",
    containerBrands: [],
  },
  metadata: {
    available: false,
    device: {
      identified: false,
      manufacturer: null,
      model: null,
      modelCode: null,
      lens: null,
      software: null,
      firmware: null,
    },
    capture: {
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
    },
    tagCount: 0,
    strippedIndicators: ["No camera make/model tags", "No original capture timestamp", "No GPS tags"],
    raw: null,
    message: "Metadata unavailable or removed.",
  },
  aiDetection: {
    state: "generated",
    probability: 91,
    confidence: 91,
    serviceName: "AIMD embedded-signal analysis (demo)",
    serviceConfigured: false,
    reasons: [
      "Content Credentials declare trained-algorithmic (AI) media",
      '"openai" string embedded in file metadata',
    ],
    message: "AI-generation indicators were found directly inside the file.",
  },
  possibleGenerator: {
    determined: true,
    generator: "OpenAI / ChatGPT",
    confidence: 88,
    evidence: [
      "Content Credentials name the producing application: OpenAI",
      '"openai" string embedded in file metadata',
    ],
    message:
      "Identification is based on evidence embedded in the file and is reported as a possibility, not a certainty.",
  },
  provenance: {
    state: "found_unverified",
    creator: "OpenAI",
    application: "OpenAI",
    action: "AI generated / trained-algorithmic media declared",
    aiIndicated: true,
    history: ["c2pa.created action present"],
    markers: ["c2pa", "jumbf", "c2pa.actions"],
    message:
      "Content Credentials structures were found, but the manifest signature could not be cryptographically verified in the browser.",
  },
  manipulation: {
    risk: "LOW",
    confidence: 63,
    evidence: ["No metadata present — the file was re-encoded, exported or stripped at some point"],
    message:
      "Indicators below are structural (metadata/container level). Copy-move, splicing and deepfake detection require a pixel-forensics model, which is not configured.",
  },
  socialMedia: {
    determined: false,
    platform: null,
    confidence: 55,
    indicators: [
      "All EXIF metadata stripped — typical of social-platform re-encoding",
      "Longest edge is exactly 1080 px — a common platform resize target",
    ],
    message:
      "Possible social-media processing detected, but no specific platform signature was found. Social-media origin could not be determined.",
  },
  evidence: [
    {
      category: "Metadata Evidence",
      items: [
        {
          status: "warning",
          title: "No camera model in metadata",
          explanation: "The file carries no camera make/model tags. Device cannot be identified.",
          confidence: null,
          source: "EXIF / TIFF tags",
          certainty: "unknown",
        },
        {
          status: "warning",
          title: "No capture timestamp",
          explanation: "No original date/time tag is present in the file.",
          confidence: null,
          source: "EXIF DateTimeOriginal",
          certainty: "unknown",
        },
      ],
    },
    {
      category: "AI Evidence",
      items: [
        {
          status: "negative",
          title: "AI-generation indicators found",
          explanation: "Provenance manifest declares generative media.",
          confidence: 91,
          source: "C2PA + embedded strings",
          certainty: "inferred",
        },
        {
          status: "warning",
          title: "Possible generator: OpenAI / ChatGPT",
          explanation: "Content Credentials name the producing application.",
          confidence: 88,
          source: "Embedded generator signatures",
          certainty: "inferred",
        },
      ],
    },
    {
      category: "Provenance Evidence",
      items: [
        {
          status: "warning",
          title: "Content Credentials found (unverified)",
          explanation: "Manifest present; signature not cryptographically validated in-browser.",
          confidence: 60,
          source: "C2PA / JUMBF structures",
          certainty: "inferred",
        },
      ],
    },
    {
      category: "Manipulation Evidence",
      items: [
        {
          status: "positive",
          title: "No strong manipulation indicators",
          explanation: "Structural analysis found no editing signatures.",
          confidence: 63,
          source: "Structural / metadata analysis",
          certainty: "inferred",
        },
      ],
    },
    {
      category: "Social Media Evidence",
      items: [
        {
          status: "warning",
          title: "Possible recompression",
          explanation: "All EXIF metadata stripped — typical of platform re-encoding.",
          confidence: 55,
          source: "Platform signature analysis",
          certainty: "inferred",
        },
      ],
    },
  ],
  timeline: [
    {
      date: null,
      title: "Content Credentials attached",
      detail: "Manifest references OpenAI",
      certainty: "inferred",
    },
    {
      date: null,
      title: "Metadata removed",
      detail: "No EXIF block is present — metadata was stripped by an editor, export or platform.",
      certainty: "inferred",
    },
    {
      date: "2026-08-20 14:12:08",
      title: "Filesystem timestamp",
      detail: "Last-modified time reported by the uploading device's filesystem.",
      certainty: "confirmed",
    },
  ],
  verdict: {
    kind: "LIKELY_AI_GENERATED",
    label: "Likely AI Generated",
    confidence: 91,
    explanation:
      "The file carries embedded indicators of AI generation, including Content Credentials declaring generative media. This is an evidence-based indication; complete certainty is not possible.",
  },
  technical: {
    note: "DEMO DATA — this technical block is illustrative and not derived from a real file.",
    c2paMarkers: ["c2pa", "jumbf", "c2pa.actions"],
    exif: null,
  },
};
