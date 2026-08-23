import { countMarkers, sampleAscii } from "./byteScan";
import type { ProvenanceResult } from "./types";

const C2PA_MARKERS = ["c2pa", "jumbf", "jumd", "contentcredentials", "c2pa.actions", "urn:c2pa"];
const CREATOR_HINTS: Array<{ marker: string; creator: string; app: string }> = [
  { marker: "openai", creator: "OpenAI", app: "OpenAI" },
  { marker: "dall-e", creator: "OpenAI", app: "DALL·E" },
  { marker: "midjourney", creator: "Midjourney", app: "Midjourney" },
  { marker: "gemini", creator: "Google", app: "Google Gemini" },
  { marker: "imagen", creator: "Google", app: "Google Imagen" },
  { marker: "adobe firefly", creator: "Adobe", app: "Adobe Firefly" },
  { marker: "stable diffusion", creator: "Stability AI", app: "Stable Diffusion" },
  { marker: "stability.ai", creator: "Stability AI", app: "Stable Diffusion" },
  { marker: "black forest labs", creator: "Black Forest Labs", app: "Flux" },
  { marker: "flux.1", creator: "Black Forest Labs", app: "Flux" },
];

const AI_ACTION_MARKERS = [
  "c2pa.created",
  "trainedalgorithmicmedia",
  "compositewithtrainedalgorithmicmedia",
  "digitalsourcetype",
];

/**
 * Detects C2PA / Content Credentials structures in the raw bytes.
 * Cryptographic validation of the manifest is NOT performed in-browser, so a
 * detected manifest is reported as "found but not verified" — never as valid.
 */
export function analyzeProvenance(bytes: Uint8Array): ProvenanceResult {
  const text = sampleAscii(bytes);
  const markers = countMarkers(text, C2PA_MARKERS);

  if (markers.length === 0) {
    return {
      state: "not_found",
      creator: null,
      application: null,
      action: null,
      aiIndicated: null,
      history: [],
      markers: [],
      message: "No Content Credentials found in this file.",
    };
  }

  const hint = CREATOR_HINTS.find((h) => text.toLowerCase().includes(h.marker));
  const aiMarkers = countMarkers(text, AI_ACTION_MARKERS);
  const history: string[] = [];
  if (countMarkers(text, ["c2pa.created"]).length) history.push("c2pa.created action present");
  if (countMarkers(text, ["c2pa.edited"]).length) history.push("c2pa.edited action present");
  if (countMarkers(text, ["c2pa.converted"]).length) history.push("c2pa.converted action present");
  if (countMarkers(text, ["c2pa.published"]).length) history.push("c2pa.published action present");

  return {
    state: "found_unverified",
    creator: hint?.creator ?? null,
    application: hint?.app ?? null,
    action: aiMarkers.length ? "AI generated / trained-algorithmic media declared" : null,
    aiIndicated: aiMarkers.length > 0 ? true : null,
    history,
    markers,
    message:
      "Content Credentials structures were found, but the manifest signature could not be cryptographically verified in the browser.",
  };
}
