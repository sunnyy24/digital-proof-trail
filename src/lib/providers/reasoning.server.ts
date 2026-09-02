// ReasoningProvider — explains normalized evidence using Lovable AI.
// It never performs detection and never invents evidence: it only summarises
// the structured findings passed to it.

import type {
  DetectionOutcome,
  ForensicOutcome,
  FusionOutcome,
  ProvenanceOutcome,
  ReasoningOutcome,
} from "./types";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";

function fallback(fusion: FusionOutcome, message: string): ReasoningOutcome {
  return {
    available: false,
    summary: "",
    evidence: fusion.supporting,
    contradictions: fusion.contradicting,
    limitations: fusion.limitations,
    possibleSource: null,
    message,
  };
}

export async function explainEvidence(input: {
  fusion: FusionOutcome;
  detections: DetectionOutcome[];
  provenance: ProvenanceOutcome[];
  forensics: ForensicOutcome | null;
}): Promise<ReasoningOutcome> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return fallback(input.fusion, "AI reasoning unavailable — no AI key is configured.");

  const evidencePayload = {
    verdict: input.fusion.verdict,
    confidence: input.fusion.confidence,
    riskLevel: input.fusion.riskLevel,
    supporting: input.fusion.supporting,
    contradicting: input.fusion.contradicting,
    limitations: input.fusion.limitations,
    detections: input.detections.map((d) => ({
      provider: d.provider,
      status: d.status,
      aiGeneratedScore: d.aiGeneratedScore,
      deepfakeScore: d.deepfakeScore,
      sourceName: d.sourceName,
      message: d.message,
    })),
    provenance: input.provenance.map((p) => ({
      provider: p.provider,
      state: p.state,
      aiIndicated: p.aiIndicated,
      creationTool: p.creationTool,
      message: p.message,
    })),
    forensicIndicators: (input.forensics?.indicators ?? []).map((i) => ({
      title: i.title,
      status: i.status,
      certainty: i.certainty,
      category: i.category,
    })),
  };

  const system = [
    "You are a digital media forensics analyst.",
    "You must ONLY use the structured evidence provided. Never invent metadata, scores, tools, or provenance.",
    "If evidence is missing, say it is unavailable. Never claim certainty.",
    "Return strict JSON with keys: summary (string, 2-4 sentences, plain language),",
    "evidence (string[]), contradictions (string[]), limitations (string[]),",
    'possibleSource ({"name": string, "confidence": number} or null — only if a generator is named in the evidence).',
  ].join(" ");

  try {
    const response = await fetch(GATEWAY, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: JSON.stringify(evidencePayload) },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (response.status === 429) {
      return fallback(input.fusion, "AI reasoning temporarily rate limited. Please retry shortly.");
    }
    if (response.status === 402) {
      return fallback(input.fusion, "AI reasoning unavailable — AI credits are exhausted.");
    }
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return fallback(input.fusion, `AI reasoning unavailable (${response.status}). ${text.slice(0, 200)}`);
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return fallback(input.fusion, "AI reasoning returned no content.");

    const parsed = JSON.parse(content) as Partial<ReasoningOutcome>;
    return {
      available: true,
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence : input.fusion.supporting,
      contradictions: Array.isArray(parsed.contradictions)
        ? parsed.contradictions
        : input.fusion.contradicting,
      limitations: Array.isArray(parsed.limitations) ? parsed.limitations : input.fusion.limitations,
      possibleSource:
        parsed.possibleSource && typeof parsed.possibleSource === "object"
          ? (parsed.possibleSource as { name: string; confidence: number })
          : null,
      message: "Explanation generated from the structured forensic evidence only.",
    };
  } catch (error) {
    return fallback(input.fusion, `AI reasoning unavailable. ${(error as Error).message}`);
  }
}
