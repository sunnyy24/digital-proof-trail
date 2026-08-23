import type { ForensicReport } from "./types";
import { formatDuration } from "./fileAnalyzer";

function n(v: unknown, fallback = "Not available"): string {
  if (v === null || v === undefined || v === "") return fallback;
  return String(v);
}

export function reportToJson(report: ForensicReport): string {
  return JSON.stringify(report, null, 2);
}

export function reportToText(report: ForensicReport): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);
  const rule = () => line("-".repeat(72));

  line("AIMD — MEDIA FORENSIC REPORT");
  line(`Generated: ${new Date(report.analyzedAt).toUTCString()}`);
  if (report.isDemo) line("*** DEMO DATA — not based on an uploaded file ***");
  rule();
  line("LEGEND: [CONFIRMED] directly supported by metadata/provenance | [INFERRED] estimated by analysis | [UNKNOWN] could not be determined");
  rule();

  line("FINAL VERDICT");
  line(`  ${report.verdict.label} — confidence ${report.verdict.confidence}%`);
  line(`  ${report.verdict.explanation}`);
  rule();

  line("FILE INFORMATION [CONFIRMED]");
  line(`  Filename:      ${report.file.name}`);
  line(`  Extension:     ${report.file.extension || "unknown"}`);
  line(`  MIME type:     ${report.file.mimeType}`);
  line(`  Size:          ${report.file.sizeLabel} (${report.file.size} bytes)`);
  line(`  Resolution:    ${report.file.width && report.file.height ? `${report.file.width} x ${report.file.height}` : "Not available"}`);
  line(`  Duration:      ${report.file.duration ? formatDuration(report.file.duration) : "Not available"}`);
  line(`  Bitrate:       ${report.file.bitrate ? `${Math.round(report.file.bitrate / 1000)} kbps` : "Not available"}`);
  line(`  Codec/brands:  ${n(report.file.codec)}`);
  line(`  Modified:      ${n(report.file.lastModified)}`);
  line(`  SHA-256:       ${report.file.sha256}`);
  rule();

  line("DEVICE INFORMATION");
  if (report.metadata.device.identified) {
    line("  [CONFIRMED] Device identified from metadata");
    line(`  Manufacturer: ${n(report.metadata.device.manufacturer)}`);
    line(`  Device:       ${n(report.metadata.device.model)}`);
    line(`  Model code:   ${n(report.metadata.device.modelCode)}`);
    line(`  Lens:         ${n(report.metadata.device.lens)}`);
    line(`  Software:     ${n(report.metadata.device.software)}`);
    line(`  Firmware:     ${n(report.metadata.device.firmware)}`);
  } else {
    line("  [UNKNOWN] Device information unavailable. Device inference from pixels is not performed.");
  }
  rule();

  line("CAPTURE METADATA");
  if (report.metadata.available) {
    const c = report.metadata.capture;
    line(`  [CONFIRMED] Original date/time: ${n(c.dateTimeOriginal)}`);
    line(`  Dimensions:    ${n(c.dimensions)}`);
    line(`  Orientation:   ${n(c.orientation)}`);
    line(`  ISO:           ${n(c.iso)}`);
    line(`  Shutter:       ${n(c.shutterSpeed)}`);
    line(`  Aperture:      ${n(c.aperture)}`);
    line(`  Focal length:  ${n(c.focalLength)}`);
    line(`  Flash:         ${n(c.flash)}`);
    line(`  White balance: ${n(c.whiteBalance)}`);
    line(`  GPS:           ${c.gps ? `${c.gps.lat}, ${c.gps.lon}` : "Not available"}`);
  } else {
    line("  [UNKNOWN] Metadata unavailable or removed.");
  }
  rule();

  line("AI DETECTION [INFERRED]");
  line(`  State:       ${report.aiDetection.state.toUpperCase()}`);
  line(`  Probability: ${report.aiDetection.probability === null ? "Not available" : `${report.aiDetection.probability}%`}`);
  line(`  Confidence:  ${report.aiDetection.confidence === null ? "Not available" : `${report.aiDetection.confidence}%`}`);
  line(`  Service:     ${report.aiDetection.serviceName} (external model configured: ${report.aiDetection.serviceConfigured ? "yes" : "no"})`);
  line(`  ${report.aiDetection.message}`);
  report.aiDetection.reasons.forEach((r) => line(`   - ${r}`));
  rule();

  line("POSSIBLE AI SOURCE");
  if (report.possibleGenerator.determined) {
    line(`  [INFERRED] Generator: ${report.possibleGenerator.generator}`);
    line(`  Confidence: ${report.possibleGenerator.confidence}%`);
    report.possibleGenerator.evidence.forEach((e) => line(`   - ${e}`));
  } else {
    line("  [UNKNOWN] AI source could not be determined.");
  }
  rule();

  line("CONTENT CREDENTIALS (C2PA)");
  line(`  Status: ${report.provenance.state.replace("_", " ").toUpperCase()}`);
  line(`  Creator:     ${n(report.provenance.creator)}`);
  line(`  Application: ${n(report.provenance.application)}`);
  line(`  Action:      ${n(report.provenance.action)}`);
  line(`  ${report.provenance.message}`);
  rule();

  line("MANIPULATION ANALYSIS [INFERRED]");
  line(`  Risk: ${report.manipulation.risk} — confidence ${report.manipulation.confidence ?? "n/a"}%`);
  line(`  ${report.manipulation.message}`);
  report.manipulation.evidence.forEach((e) => line(`   - ${e}`));
  rule();

  line("SOCIAL MEDIA ANALYSIS [INFERRED]");
  line(`  Possible platform: ${n(report.socialMedia.platform, "Could not be determined")}`);
  line(`  Confidence: ${report.socialMedia.confidence === null ? "Not available" : `${report.socialMedia.confidence}%`}`);
  line(`  ${report.socialMedia.message}`);
  report.socialMedia.indicators.forEach((e) => line(`   - ${e}`));
  rule();

  line("PROVENANCE TIMELINE");
  if (report.timeline.length === 0) line("  [UNKNOWN] No timeline events could be established.");
  report.timeline.forEach((t) => line(`  [${t.certainty.toUpperCase()}] ${t.date ?? "date unknown"} — ${t.title}: ${t.detail}`));
  rule();

  line("EVIDENCE");
  report.evidence.forEach((g) => {
    line(`  ${g.category}`);
    g.items.forEach((i) =>
      line(
        `    [${i.certainty.toUpperCase()}] ${i.title}${i.confidence !== null ? ` (${i.confidence}%)` : ""} — ${i.explanation} (source: ${i.source})`,
      ),
    );
  });
  rule();
  line("AIMD reports evidence-based indications. No forensic result is a guarantee of authenticity.");
  return L.join("\n");
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function baseName(report: ForensicReport) {
  return `AIMD-report-${report.file.name.replace(/\.[^.]+$/, "").replace(/[^\w-]+/g, "_") || "media"}-${report.analyzedAt.slice(0, 10)}`;
}

export function downloadJsonReport(report: ForensicReport) {
  download(reportToJson(report), `${baseName(report)}.json`, "application/json");
}

export function downloadTextReport(report: ForensicReport) {
  download(reportToText(report), `${baseName(report)}.txt`, "text/plain");
}

/** Opens a print-ready report the user can save as PDF. */
export function printPdfReport(report: ForensicReport) {
  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(baseName(report))}</title>
<style>
 body{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:#111;padding:32px;line-height:1.5}
 h1{font-family:system-ui,sans-serif;font-size:20px;margin:0 0 4px}
 .sub{font-family:system-ui,sans-serif;color:#555;margin-bottom:16px;font-size:12px}
 pre{white-space:pre-wrap;word-break:break-word}
</style></head><body>
<h1>AIMD — Media Forensic Report</h1>
<div class="sub">AI Media Forensics &amp; Provenance Platform</div>
<pre>${esc(reportToText(report))}</pre>
<script>window.onload=function(){window.print()}</script>
</body></html>`;
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  return true;
}
