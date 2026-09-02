// Normalized, provider-agnostic contracts for the AIMD analysis pipeline.
// Every provider returns one of these shapes so the frontend never depends on
// a specific vendor and never has to invent values that were not returned.

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
  raw: unknown;
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
  metadata: Record<string, unknown> | null;
  indicators: ForensicIndicator[];
  technical: Record<string, unknown>;
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

export interface ScanResultBundle {
  scan: Record<string, unknown>;
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
