import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ArrowRight,
  Brain,
  FileDigit,
  Fingerprint,
  Layers,
  ScanEye,
  Share2,
  Sparkles,
  Gavel,
  FileStack,
} from "lucide-react";

export const Route = createFileRoute("/technology")({
  head: () => ({
    meta: [
      { title: "Technology — How AIMD Analyzes Media" },
      {
        name: "description",
        content:
          "Inside AIMD's forensic pipeline: file analysis, metadata, provenance, AI detection, manipulation checks, social signals and the evidence engine behind every verdict.",
      },
      { property: "og:title", content: "Technology — How AIMD Analyzes Media" },
      {
        property: "og:description",
        content:
          "A stage-by-stage look at the AIMD forensic analysis architecture and the evidence engine behind each verdict.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TechnologyPage,
});

const STAGES = [
  {
    icon: FileDigit,
    title: "File analysis",
    text: "Type validation, byte-level container inspection, SHA-256 hashing and media probing for resolution, duration and codec.",
  },
  {
    icon: ScanEye,
    title: "Metadata",
    text: "EXIF, XMP and IPTC extraction: device make and model, lens, software, capture settings, timestamps and GPS where present.",
  },
  {
    icon: Fingerprint,
    title: "Provenance",
    text: "Detection of C2PA / Content Credentials structures, JUMBF boxes and declared creation actions embedded in the file.",
  },
  {
    icon: Brain,
    title: "AI detection",
    text: "Embedded generator markers, provenance-declared AI actions and structural signals. Unsupported cases are reported as unavailable.",
  },
  {
    icon: Layers,
    title: "Manipulation",
    text: "Editor signatures, re-encode traces, structural inconsistencies and metadata contradictions such as resolution mismatch.",
  },
  {
    icon: Share2,
    title: "Social signals",
    text: "Platform recompression fingerprints and stripped-metadata patterns typical of messaging and social distribution.",
  },
  {
    icon: FileStack,
    title: "Evidence engine",
    text: "Every signal is normalized into an evidence item with a source, a confidence value and a verified / inferred / unknown certainty label.",
  },
  {
    icon: Gavel,
    title: "Forensic verdict",
    text: "Weighted aggregation produces a confidence-based verdict. Weak or contradictory evidence yields an inconclusive result, never a guess.",
  },
];

function TechnologyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-2xl">
        <p className="font-mono text-[11px] tracking-[0.22em] text-primary uppercase">
          Analysis architecture
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          How AIMD reaches a verdict
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Media passes through eight independent stages. Each stage produces evidence rather than
          conclusions; only the final engine combines them, and it never invents a signal that the
          file does not contain.
        </p>
      </header>

      <div className="mt-12 flex items-center gap-3">
        <span className="rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
          Media in
        </span>
        <ArrowRight className="size-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Eight-stage forensic pipeline</span>
      </div>

      <ol className="mt-6 grid gap-4 md:grid-cols-2">
        {STAGES.map((s, i) => (
          <li key={s.title}>
            <article className="panel group h-full p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40">
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-10 place-items-center rounded-lg border border-primary/30 bg-primary/10">
                  <s.icon className="size-5 text-primary" />
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </article>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex items-center gap-3">
        <ArrowDown className="size-4 text-muted-foreground" />
        <span className="rounded-full border border-verdict-safe/40 bg-verdict-safe/10 px-4 py-1.5 font-mono text-[11px] tracking-[0.2em] text-verdict-safe uppercase">
          Forensic verdict out
        </span>
      </div>

      <section className="panel mt-12 flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="max-w-xl text-sm text-muted-foreground">
            The architecture is modular: each analyzer can be replaced with a stronger model or a
            server-side service without changing the evidence format or the verdict logic.
          </p>
        </div>
        <Button asChild>
          <Link to="/analyze">
            Analyze Media <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
