// Shared types for the AIMD forensic analysis pipeline.

export type Certainty = "confirmed" | "inferred" | "unknown";
export type EvidenceStatus = "positive" | "warning" | "negative" | "neutral";
export type MediaKind = "image" | "video" | "audio" | "unknown";

export interface Field {
  label: string;
  value: string | null;
  certainty: Certainty;
  note?: string;
}

export interface FileInfo {
  name: string;
  extension: string;
  mimeType: string;
  size: number;
  sizeLabel: string;
  kind: MediaKind;
  sha256: string;
  lastModified: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  frameRate: number | null;
  codec: string | null;
  bitrate: number | null;
  colorSpace: string | null;
  containerBrands: string[];
}

export interface DeviceInfo {
  identified: boolean;
  manufacturer: string | null;
  model: string | null;
  modelCode: string | null;
  lens: string | null;
  software: string | null;
  firmware: string | null;
}

export interface CaptureInfo {
  dateTimeOriginal: string | null;
  dimensions: string | null;
  orientation: string | null;
  iso: string | null;
  shutterSpeed: string | null;
  aperture: string | null;
  focalLength: string | null;
  flash: string | null;
  whiteBalance: string | null;
  gps: { lat: number; lon: number } | null;
}

export interface MetadataResult {
  available: boolean;
  device: DeviceInfo;
  capture: CaptureInfo;
  tagCount: number;
  strippedIndicators: string[];
  raw: Record<string, unknown> | null;
  message: string;
}

export type AiState = "generated" | "authentic" | "inconclusive" | "unavailable";

export interface AiDetectionResult {
  state: AiState;
  probability: number | null;
  confidence: number | null;
  serviceName: string;
  serviceConfigured: boolean;
  reasons: string[];
  message: string;
}

export type GeneratorName =
  | "OpenAI / ChatGPT"
  | "DALL·E"
  | "Midjourney"
  | "Google Gemini"
  | "Adobe Firefly"
  | "Stable Diffusion"
  | "Flux"
  | "Other / Unknown";

export interface GeneratorResult {
  determined: boolean;
  generator: GeneratorName | null;
  confidence: number | null;
  evidence: string[];
  message: string;
}

export type ProvenanceState = "verified" | "found_unverified" | "not_found";

export interface ProvenanceResult {
  state: ProvenanceState;
  creator: string | null;
  application: string | null;
  action: string | null;
  aiIndicated: boolean | null;
  history: string[];
  markers: string[];
  message: string;
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";

export interface ManipulationResult {
  risk: RiskLevel;
  confidence: number | null;
  evidence: string[];
  message: string;
}

export interface SocialMediaResult {
  determined: boolean;
  platform: string | null;
  confidence: number | null;
  indicators: string[];
  message: string;
}

export interface EvidenceItem {
  status: EvidenceStatus;
  title: string;
  explanation: string;
  confidence: number | null;
  source: string;
  certainty: Certainty;
}

export interface EvidenceGroup {
  category: string;
  items: EvidenceItem[];
}

export interface TimelineEvent {
  date: string | null;
  title: string;
  detail: string;
  certainty: Certainty;
}

export type VerdictKind =
  | "LIKELY_AUTHENTIC"
  | "INCONCLUSIVE"
  | "LIKELY_AI_GENERATED"
  | "LIKELY_MANIPULATED";

export interface Verdict {
  kind: VerdictKind;
  label: string;
  confidence: number;
  explanation: string;
}

export interface ForensicReport {
  analyzedAt: string;
  isDemo: boolean;
  file: FileInfo;
  metadata: MetadataResult;
  aiDetection: AiDetectionResult;
  possibleGenerator: GeneratorResult;
  provenance: ProvenanceResult;
  manipulation: ManipulationResult;
  socialMedia: SocialMediaResult;
  evidence: EvidenceGroup[];
  timeline: TimelineEvent[];
  verdict: Verdict;
  technical: Record<string, unknown>;
}

export interface StepState {
  id: string;
  label: string;
  status: "pending" | "running" | "done" | "skipped";
}
