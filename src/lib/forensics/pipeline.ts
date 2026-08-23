import { analyzeExif } from "./exifAnalyzer";
import { analyzeFile } from "./fileAnalyzer";
import { analyzeManipulation } from "./manipulationAnalyzer";
import { analyzeProvenance } from "./provenanceAnalyzer";
import { analyzeSocialMedia } from "./socialMediaAnalyzer";
import { detectAi, identifyGenerator, scanAiSignals } from "./aiDetectionService";
import { buildEvidence, buildTimeline, buildVerdict } from "./evidence";
import type { ForensicReport, StepState } from "./types";

export const PIPELINE_STEPS: Array<{ id: string; label: string }> = [
  { id: "read", label: "Reading file" },
  { id: "metadata", label: "Extracting metadata" },
  { id: "provenance", label: "Checking provenance" },
  { id: "ai", label: "Checking AI-generation indicators" },
  { id: "manipulation", label: "Checking manipulation indicators" },
  { id: "social", label: "Checking social-media processing" },
  { id: "report", label: "Generating forensic report" },
];

export function initialSteps(): StepState[] {
  return PIPELINE_STEPS.map((s) => ({ ...s, status: "pending" }));
}

type Progress = (stepId: string) => void;

const tick = () => new Promise((r) => setTimeout(r, 0));

export async function runForensicPipeline(file: File, onStep: Progress): Promise<ForensicReport> {
  onStep("read");
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const fileInfo = await analyzeFile(file, buffer);

  onStep("metadata");
  await tick();
  const metadata = await analyzeExif(file, fileInfo.kind);

  onStep("provenance");
  await tick();
  const provenance = analyzeProvenance(bytes);

  onStep("ai");
  await tick();
  const scan = scanAiSignals(bytes);
  const aiDetection = await detectAi(file, scan, provenance, metadata);
  const possibleGenerator = identifyGenerator(scan, provenance, metadata);

  onStep("manipulation");
  await tick();
  const manipulation = analyzeManipulation(bytes, fileInfo, metadata);

  onStep("social");
  await tick();
  const socialMedia = analyzeSocialMedia(bytes, fileInfo, metadata);

  onStep("report");
  await tick();
  const evidence = buildEvidence(
    fileInfo,
    metadata,
    aiDetection,
    possibleGenerator,
    provenance,
    manipulation,
    socialMedia,
  );
  const timeline = buildTimeline(fileInfo, metadata, provenance, manipulation, socialMedia);
  const verdict = buildVerdict(aiDetection, manipulation, metadata, provenance);

  return {
    analyzedAt: new Date().toISOString(),
    isDemo: false,
    file: fileInfo,
    metadata,
    aiDetection,
    possibleGenerator,
    provenance,
    manipulation,
    socialMedia,
    evidence,
    timeline,
    verdict,
    technical: {
      exif: metadata.raw,
      c2paMarkers: provenance.markers,
      aiSignals: scan,
      containerBrands: fileInfo.containerBrands,
      sha256: fileInfo.sha256,
      detectionService: {
        name: aiDetection.serviceName,
        configured: aiDetection.serviceConfigured,
      },
    },
  };
}
