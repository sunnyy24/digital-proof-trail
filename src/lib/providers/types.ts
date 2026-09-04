// Normalized, provider-agnostic contracts for the AIMD analysis pipeline.
// Every provider returns one of these shapes so the frontend never depends on
// a specific vendor and never has to invent values that were not returned.

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type MediaKind = "image" | "video" | "audio" | "unknown";

export type ScanVerdict =
  | "LIKELY_AI_GENERATED"
  | "LIKELY_HUMAN_CREATED"
  | "INCONCLUSIVE"
  | "ANALYSIS_UNAVAILABLE";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "INCONCLUSIVE";

export type ProviderStatus = "ok" | "unavailable" | "error";

export interface SegmentOutcome {
  track: "video" | "audio";
  start: number;
  end: number | null;
  label: "AI" | "HUMAN" | "SUSPICIOUS";
  confidence: number | null;
  detector: string;
  detail: string | null;
}

/** DetectorProvider — AI-generation / deepfake detection. */
export interface DetectionOutcome {
  provider: string;
  status: ProviderStatus;
  mediaType: MediaKind;
  aiGeneratedScore: number | null;
  notAiGeneratedScore: number | null;
  deepfakeScore: number | null;
  sourceName: string | null;
  sourceConfidence: number | null;
  message: string;
  segments: SegmentOutcome[];
  raw: Json | null;
}

/** ProvenanceProvider — C2PA / Content Credentials, SynthID. */
export interface ProvenanceOutcome {
  provider: string;
  state: "verified" | "found" | "not_found" | "detected" | "unavailable";
  issuer: string | null;
  creator: string | null;
  creationTool: string | null;
  creationTime: string | null;
  aiIndicated: boolean | null;
  history: string[];
  message: string;
}

export interface ForensicIndicator {
  status: "positive" | "warning" | "negative" | "neutral";
  title: string;
  explanation: string;
  certainty: "confirmed" | "inferred" | "unknown";
  confidence: number | null;
  source: string;
  category: string;
}

/** ForensicProvider — metadata + structural analysis. */
export interface ForensicOutcome {
  mediaKind: MediaKind;
  metadata: Json | null;
  indicators: ForensicIndicator[];
  technical: Json;
}

/** Evidence fusion output. */
export interface FusionOutcome {
  verdict: ScanVerdict;
  confidence: number;
  riskLevel: RiskLevel;
  supporting: string[];
  contradicting: string[];
  limitations: string[];
  consensus: Array<{ label: string; level: string; detail: string }>;
}

/** ReasoningProvider — explanation over normalized evidence only. */
export interface ReasoningOutcome {
  available: boolean;
  summary: string;
  evidence: string[];
  contradictions: string[];
  limitations: string[];
  possibleSource: { name: string; confidence: number } | null;
  message: string;
}

export interface ScanRow {
  id: string;
  evidence_id: string;
  case_id: string | null;
  file_name: string;
  file_type: string;
  media_kind: string;
  file_size: number;
  sha256: string;
  storage_path: string | null;
  status: string;
  stage: string | null;
  error_message: string | null;
  verdict: string | null;
  confidence: number | null;
  risk_level: string | null;
  created_at: string;
  completed_at: string | null;
  mediaUrl: string | null;
}

export interface ScanResultBundle {
  scan: ScanRow;
  detections: DetectionOutcome[];
  provenance: ProvenanceOutcome[];
  forensics: ForensicOutcome | null;
  segments: SegmentOutcome[];
  fusion: FusionOutcome | null;
  reasoning: ReasoningOutcome | null;
  custody: Array<{
    event: string;
    status: string;
    provider: string | null;
    detail: string | null;
    created_at: string;
  }>;
}

export const DETECTION_DISCLAIMER =
  "AI-media detection is probabilistic and may produce false positives and false negatives. Results should be treated as supporting evidence rather than definitive proof.";
