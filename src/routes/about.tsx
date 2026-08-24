import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, BadgeCheck, HelpCircle, Info, ScanSearch, Scale } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About AIMD — Responsible Media Forensics" },
      {
        name: "description",
        content:
          "Why AIMD exists, the problem of synthetic media, our evidence-first approach, the technology behind it and our commitment to responsible detection.",
      },
      { property: "og:title", content: "About AIMD — Responsible Media Forensics" },
      {
        property: "og:description",
        content:
          "AIMD helps people understand the origin, authenticity and digital history of modern media — with evidence, not guesses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const SECTIONS = [
  {
    id: "why",
    title: "Why AIMD",
    body: "AIMD is designed to help users understand the origin, authenticity and digital history of modern media. A single image can travel through a camera, an editor, a generative model and several platforms before it reaches you — and almost none of that journey is visible by default.",
  },
  {
    id: "problem",
    title: "The Problem",
    body: "Synthetic media is now indistinguishable from real capture at a glance, while ordinary sharing strips the metadata that once made verification straightforward. Most detection tools respond with a single number and no explanation, which is worse than no answer at all when the stakes are real.",
  },
  {
    id: "approach",
    title: "Our Approach",
    body: "AIMD is evidence-first. Every finding names its source, carries a confidence value and is labelled verified, inferred or unknown. Contradictory or thin evidence produces an inconclusive verdict. We would rather say we do not know than tell you something we cannot support.",
  },
  {
    id: "technology",
    title: "Technology",
    body: "Analysis runs through eight stages: file structure, metadata and EXIF, C2PA provenance, AI-generation signals, manipulation indicators, social-platform processing, the evidence engine and the verdict engine. Each analyzer is modular and can be upgraded independently.",
  },
  {
    id: "responsible",
    title: "Responsible Detection",
    body: "AIMD never claims that media is one hundred percent authentic, and never names a generator unless the file itself carries cryptographic or embedded evidence for it. Detection results are investigative leads, not proof, and should be corroborated with other sources.",
  },
];

const BADGES = [
  {
    icon: BadgeCheck,
    label: "Verified",
    tone: "border-verdict-safe/40 bg-verdict-safe/10 text-verdict-safe",
    text: "Information directly supported by metadata or cryptographic provenance.",
  },
  {
    icon: ScanSearch,
    label: "Inferred",
    tone: "border-verdict-warn/40 bg-verdict-warn/10 text-verdict-warn",
    text: "Information estimated from technical signals.",
  },
  {
    icon: HelpCircle,
    label: "Unknown",
    tone: "border-border bg-muted/40 text-muted-foreground",
    text: "Information that cannot be determined from the file.",
  },
];

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <header>
        <p className="font-mono text-[11px] tracking-[0.22em] text-primary uppercase">About</p>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          Evidence, not assumptions.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          AIMD is designed to help users understand the origin, authenticity and digital history of
          modern media.
        </p>
      </header>

      <div className="mt-12 space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="panel scroll-mt-24 p-7">
            <h2 className="font-display text-xl font-semibold">{s.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">The certainty system</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {BADGES.map((b) => (
            <article key={b.label} className="panel p-5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] uppercase ${b.tone}`}
              >
                <b.icon className="size-3" /> {b.label}
              </span>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{b.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="privacy" className="panel mt-12 scroll-mt-24 p-7">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
          <Info className="size-5 text-primary" /> Privacy
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Analysis runs inside your browser. Files are validated by type and size, are never
          executed, and are not retained longer than the analysis requires unless you explicitly
          choose to save or export the report. Saved reports are stored locally on your own device.
        </p>
      </section>

      <section id="terms" className="panel mt-6 scroll-mt-24 p-7">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
          <Scale className="size-5 text-primary" /> Terms &amp; disclaimer
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          AIMD provides evidence-based analysis and confidence estimates. It does not guarantee
          absolute authenticity or identify an AI generator when reliable evidence is unavailable.
          Results are intended to support human judgement, not replace it, and should not be used as
          sole evidence in legal, journalistic or disciplinary decisions.
        </p>
      </section>

      <div className="mt-12 flex justify-center">
        <Button asChild size="lg">
          <Link to="/analyze">
            Analyze Media <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
