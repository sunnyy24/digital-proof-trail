// Transparent, rule-based evidence fusion. No score averaging: each signal is
// weighed explicitly and contradictions force INCONCLUSIVE.

import type {
  DetectionOutcome,
  ForensicOutcome,
  FusionOutcome,
  ProvenanceOutcome,
} from "@/lib/providers/types";

const STRONG = 75;
const WEAK = 55;

export function fuseEvidence(
  detections: DetectionOutcome[],
  provenance: ProvenanceOutcome[],
  forensics: ForensicOutcome | null,
): FusionOutcome {
  const supporting: string[] = [];
  const contradicting: string[] = [];
  const limitations: string[] = [];
  const consensus: FusionOutcome["consensus"] = [];

  const usable = detections.filter((d) => d.status === "ok");
  const ai = usable.find((d) => d.aiGeneratedScore !== null);
  const deepfake = usable.find((d) => d.deepfakeScore !== null);

  let aiSignal: "for" | "against" | "none" = "none";
  if (ai?.aiGeneratedScore != null) {
    const score = ai.aiGeneratedScore;
    consensus.push({
      label: `${ai.provider} — AI detection`,
      level: score >= STRONG ? "HIGH" : score >= WEAK ? "MEDIUM" : "LOW",
      detail: `${score}% AI-generated confidence`,
    });
    if (score >= STRONG) {
      aiSignal = "for";
      supporting.push(`${ai.provider} reported ${score}% confidence that the media is AI-generated.`);
    } else if (score <= 100 - STRONG) {
      aiSignal = "against";
      supporting.push(`${ai.provider} reported only ${score}% AI-generation confidence.`);
    } else {
      contradicting.push(`${ai.provider} returned an ambiguous AI-generation score (${score}%).`);
    }
  } else {
    consensus.push({
      label: "AI detection",
      level: "UNAVAILABLE",
      detail: detections[0]?.message ?? "No detector result.",
    });
    limitations.push("No AI-generation detector score was available for this media.");
  }

  if (deepfake?.deepfakeScore != null) {
    const score = deepfake.deepfakeScore;
    consensus.push({
      label: `${deepfake.provider} — Deepfake`,
      level: score >= STRONG ? "HIGH" : score >= WEAK ? "MEDIUM" : "LOW",
      detail: `${score}% deepfake confidence`,
    });
    if (score >= STRONG) {
      supporting.push(`${deepfake.provider} reported ${score}% deepfake confidence.`);
      if (aiSignal === "against") {
        contradicting.push("Deepfake signal is high while the AI-generation score is low.");
      }
    }
  } else {
    consensus.push({ label: "Deepfake detection", level: "UNAVAILABLE", detail: "No score returned." });
  }

  const c2pa = provenance.find((p) => p.provider.startsWith("C2PA"));
  if (c2pa) {
    consensus.push({
      label: "C2PA / Content Credentials",
      level:
        c2pa.state === "verified" ? "VERIFIED" : c2pa.state === "found" ? "FOUND" : "NOT FOUND",
      detail: c2pa.message,
    });
    if (c2pa.aiIndicated === true) {
      supporting.push("Content Credentials explicitly record an AI-generation action.");
    } else if (c2pa.state === "verified" && c2pa.aiIndicated === false) {
      if (aiSignal === "for") {
        contradicting.push(
          "A valid Content Credential describes non-AI capture while the detector indicates AI generation.",
        );
      } else {
        supporting.push("A valid Content Credential describes non-AI capture or editing.");
      }
    } else {
      limitations.push("No Content Credentials were found; provenance could not be verified.");
    }
  }

  const synthid = provenance.find((p) => p.provider === "SynthID");
  if (synthid) {
    consensus.push({ label: "SynthID", level: "UNAVAILABLE", detail: synthid.message });
    limitations.push("SynthID watermark verification was not available.");
  }

  const forensicIndicators = forensics?.indicators ?? [];
  const anomalies = forensicIndicators.filter((i) => i.status === "negative" || i.status === "warning");
  consensus.push({
    label: "Forensic evidence",
    level: anomalies.length >= 3 ? "HIGH" : anomalies.length >= 1 ? "MEDIUM" : "LOW",
    detail: `${anomalies.length} anomaly indicator(s) of ${forensicIndicators.length} checks`,
  });
  if (anomalies.length >= 2) {
    supporting.push(`Forensic analysis identified ${anomalies.length} anomaly indicators.`);
  }
  const deviceIdentified = forensicIndicators.some((i) => i.category === "Device");
  if (deviceIdentified) {
    if (aiSignal === "for") {
      contradicting.push(
        "Camera capture metadata is present while the detector indicates AI generation.",
      );
    } else {
      supporting.push("Camera capture metadata is present and consistent with device capture.");
    }
  }

  limitations.push(
    "Detection is probabilistic; absence of evidence is not evidence of authenticity.",
  );
  if (!forensics?.metadata) limitations.push("No embedded metadata was available to analyse.");

  // Verdict rules
  let verdict: FusionOutcome["verdict"];
  let confidence: number;
  let riskLevel: FusionOutcome["riskLevel"];

  const noEvidence = aiSignal === "none" && !c2pa?.aiIndicated && anomalies.length === 0;

  if (noEvidence) {
    verdict = usable.length === 0 ? "ANALYSIS_UNAVAILABLE" : "INCONCLUSIVE";
    confidence = 0;
    riskLevel = "INCONCLUSIVE";
  } else if (contradicting.length > 0) {
    verdict = "INCONCLUSIVE";
    confidence = 40;
    riskLevel = "INCONCLUSIVE";
  } else if (aiSignal === "for" || c2pa?.aiIndicated === true) {
    const base = ai?.aiGeneratedScore ?? 80;
    const boost = Math.min(10, anomalies.length * 3) + (c2pa?.aiIndicated ? 8 : 0);
    confidence = Math.min(97, base + boost);
    verdict = "LIKELY_AI_GENERATED";
    riskLevel = confidence >= STRONG ? "HIGH" : "MEDIUM";
  } else if (aiSignal === "against" && anomalies.length <= 1) {
    confidence = Math.min(95, (ai?.notAiGeneratedScore ?? 100 - (ai?.aiGeneratedScore ?? 20)) || 75);
    verdict = "LIKELY_HUMAN_CREATED";
    riskLevel = "LOW";
  } else {
    verdict = "INCONCLUSIVE";
    confidence = 45;
    riskLevel = anomalies.length >= 3 ? "MEDIUM" : "INCONCLUSIVE";
  }

  return { verdict, confidence: Math.round(confidence), riskLevel, supporting, contradicting, limitations, consensus };
}

export const VERDICT_LABEL: Record<FusionOutcome["verdict"], string> = {
  LIKELY_AI_GENERATED: "Likely AI-generated",
  LIKELY_HUMAN_CREATED: "Likely human-created",
  INCONCLUSIVE: "Inconclusive",
  ANALYSIS_UNAVAILABLE: "Analysis unavailable",
};
