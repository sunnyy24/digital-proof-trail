# AIMD — AI Media Detection & Digital Forensics

AIMD analyzes uploaded **image, video and audio** files and produces an explainable,
confidence-based assessment of whether the media is likely AI-generated, manipulated,
or likely human-created. It never fabricates evidence: when a signal cannot be
verified, the report says so explicitly.

## Features

- **Authenticated forensic workspace** — email/password and Google sign-in.
- **Private evidence storage** — uploads land in a private bucket under `<user_id>/<scan_id>/`.
- **Server-side analysis pipeline** — metadata/EXIF, container brands, manipulation and
  social-media processing indicators, C2PA/Content Credentials, SynthID (when available),
  and third-party AI-generation detection.
- **Rule-based evidence fusion** — transparent thresholds instead of opaque score averaging;
  contradictory signals force an `INCONCLUSIVE` verdict.
- **AI reasoning layer** — plain-language explanation generated strictly from normalized
  evidence (no detection performed by the model).
- **Chain of custody** — append-only event log, evidence ID and SHA-256 integrity re-check.
- **Segment timeline** for video/audio, evidence explorer, technical details, downloadable
  JSON report and print/PDF court-style report.
- **Scan history and dashboard** with provider health and verdict distribution.

## Architecture

```text
src/
  routes/
    auth.tsx                     public sign-in / sign-up
    _authenticated/              gated workspace (scan, results, report, history, dashboard)
    index, analyze, reports, investigations, technology, about
  lib/
    scans.functions.ts           authenticated server functions (create/analyze/read/delete)
    providers/
      types.ts                   normalized provider contracts + disclaimer
      hive.server.ts             AI-generation / deepfake / AI-audio detection
      provenance.server.ts       C2PA + SynthID
      forensic.server.ts         byte-level metadata & manipulation forensics
      reasoning.server.ts        Lovable AI explanation layer
    forensics/                   shared analyzers, fusion engine, history helpers
  components/aimd/               verdict, consensus, custody, segments, upload, report UI
```

All provider calls run server-side only (`*.server.ts`). No API key ever reaches the browser.

## Data model

`profiles`, `scans`, `detection_results`, `provenance_results`, `forensic_results`,
`media_segments`, `evidence_items`, `chain_of_custody_events`, `reports`, `media_fingerprints`.
Every table has row-level security scoped to the owning user; storage policies restrict
access to the user's own prefix.

## Configuration

Backend, database, auth, storage and AI reasoning are provisioned automatically.
Optional keys (see `.env.example`) are server-side only:

- `HIVE_API_KEY` — enables AI-generation, deepfake and AI-audio detection.
  Without it, detection truthfully reports **unavailable** rather than guessing.
- `SYNTHID_API_URL` / `SYNTHID_API_KEY` — optional SynthID verification endpoint.

## Interpreting results

Detection is probabilistic. Verdicts are `LIKELY_HUMAN`, `LIKELY_AI_GENERATED`,
`LIKELY_MANIPULATED` or `INCONCLUSIVE`, each with a confidence value, supporting and
contradicting evidence, and stated limitations. Every field is labelled
**verified**, **inferred** or **unknown**.
