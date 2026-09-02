// C2PAProvider + SynthIDProvider (server-only).
// C2PA detection reads real bytes; SynthID has no public verification API, so
// it reports "unavailable" instead of guessing.

import { analyzeProvenance } from "@/lib/forensics/provenanceAnalyzer";
import type { ProvenanceOutcome } from "./types";

export function checkC2PA(bytes: Uint8Array): ProvenanceOutcome {
  const result = analyzeProvenance(bytes);
  const state =
    result.state === "verified" ? "verified" : result.state === "found_unverified" ? "found" : "not_found";
  return {
    provider: "C2PA / Content Credentials",
    state,
    issuer: result.creator,
    creator: result.creator,
    creationTool: result.application,
    creationTime: null,
    aiIndicated: result.aiIndicated,
    history: result.history,
    message:
      state === "not_found"
        ? "No Content Credentials found. Missing C2PA does not mean the content is human-created."
        : result.message,
  };
}

export function checkSynthID(): ProvenanceOutcome {
  const configured = Boolean(process.env["SYNTHID_API_URL"] && process.env["SYNTHID_API_KEY"]);
  return {
    provider: "SynthID",
    state: "unavailable",
    issuer: null,
    creator: null,
    creationTool: null,
    creationTime: null,
    aiIndicated: null,
    history: [],
    message: configured
      ? "SynthID verification unavailable — the configured provider did not return a result."
      : "SynthID verification unavailable. A positive SynthID result can provide evidence of Google AI provenance. A negative or unavailable result does not prove human creation.",
  };
}
