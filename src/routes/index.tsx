import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ConfidenceRing } from "@/components/aimd/ConfidenceRing";
import {
  ArrowRight,
  Brain,
  Cpu,
  Fingerprint,
  Gauge,
  Layers,
  Lock,
  ScanEye,
  Share2,
  ShieldCheck,
  Sparkles,
  Zap,
  FileCheck2,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AIMD — Know Where Your Media Came From" },
      {
        name: "description",
        content:
          "AIMD is an AI media forensics and provenance platform: detect AI-generated content, uncover manipulation, identify device metadata and investigate digital media origin.",
      },
      { property: "og:title", content: "AIMD — Know Where Your Media Came From" },
      {
        property: "og:description",
        content:
          "Detect AI-generated content, uncover manipulation, identify device metadata and investigate media provenance — in one forensic analysis platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const TRUST = ["Image Analysis", "Video Analysis", "Audio Analysis", "Provenance Analysis"];

const FEATURES = [
  { icon: Brain, title: "AI Detection", text: "Identify potential AI-generated media." },
  { icon: Cpu, title: "Device Intelligence", text: "Extract available camera and device information." },
  { icon: ScanEye, title: "Metadata Analysis", text: "Inspect technical file metadata." },
  { icon: Fingerprint, title: "Provenance", text: "Check C2PA and Content Credentials." },
  { icon: Layers, title: "Manipulation Detection", text: "Identify potential editing and tampering." },
  { icon: Share2, title: "Social Signals", text: "Detect possible platform processing." },
];

const STEPS = [
  { n: "01", title: "Upload", text: "Upload your image, video or audio." },
  { n: "02", title: "Analyze", text: "AIMD examines multiple forensic signals." },
  { n: "03", title: "Understand", text: "Receive a confidence-based forensic report." },
];

const PRIVACY = [
  { icon: Lock, title: "Secure Analysis", text: "Files are validated, analyzed in your browser and never executed." },
  { icon: ShieldCheck, title: "Privacy First", text: "Nothing leaves your device unless you export a report." },
  { icon: FileCheck2, title: "Transparent Evidence", text: "Every finding is labelled verified, inferred or unknown." },
  { icon: Zap, title: "Fast Analysis", text: "A full multi-layer pass completes in seconds." },
];

function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
            <span className="size-1.5 rounded-full bg-primary" /> Digital Media Forensics
          </span>
          <h1 className="mt-6 font-display text-4xl leading-[1.05] font-bold sm:text-6xl">
            Know Where Your Media Came From.
          </h1>
          <p className="mt-4 font-display text-xl text-primary sm:text-2xl">
            Detect. Verify. Investigate.
          </p>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            AIMD analyzes digital media using metadata, AI detection, provenance signals and
            forensic evidence to help determine how content was created, modified and distributed.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/analyze">
                Analyze Media <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/technology">Explore Technology</Link>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {TRUST.map((t) => (
              <li key={t} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-verdict-safe" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <HeroVisual />
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="max-w-2xl font-display text-3xl font-bold sm:text-4xl">
          One File. Multiple Layers of Evidence.
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Each layer contributes independent signals. AIMD combines them into a single
          confidence-based verdict without overstating what the evidence supports.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="panel group p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40"
            >
              <span className="grid size-10 place-items-center rounded-lg border border-primary/30 bg-primary/10 transition-colors group-hover:bg-primary/15">
                <f.icon className="size-5 text-primary" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">How it works</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <article key={s.n} className="panel p-7 transition-colors hover:border-primary/40">
              <p className="font-mono text-sm text-primary">{s.n}</p>
              <h3 className="mt-3 font-display text-2xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Your Media. Your Control.</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRIVACY.map((p) => (
            <article key={p.title} className="panel p-6">
              <p.icon className="size-5 text-primary" />
              <h3 className="mt-4 text-sm font-semibold">{p.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{p.text}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          AIMD does not retain uploaded media longer than necessary unless you explicitly choose to
          save the analysis.
        </p>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="panel flex flex-col items-center gap-5 p-10 text-center">
          <Sparkles className="size-6 text-primary" />
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Upload media. Discover the evidence. Understand its origin.
          </h2>
          <Button asChild size="lg">
            <Link to="/analyze">
              Analyze Media <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_60%_20%,var(--color-primary),transparent_65%)] opacity-15 blur-2xl"
      />
      <div className="panel relative p-6">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Forensic analysis
          </p>
          <span className="flex items-center gap-2 font-mono text-[10px] tracking-wider text-verdict-safe uppercase">
            <span className="size-1.5 animate-pulse rounded-full bg-verdict-safe" /> Live
          </span>
        </div>

        <div className="mt-5 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <ConfidenceRing value={92} tone="primary" label="AI detection" size={150} />

          <dl className="space-y-3">
            <Row label="Device" value="Samsung Galaxy" tone="text-foreground" />
            <Row label="Provenance" value="Verified" tone="text-verdict-safe" />
            <Row label="Manipulation" value="Low risk" tone="text-verdict-safe" />
            <Row label="Social signals" value="Possible recompression" tone="text-verdict-warn" />
          </dl>
        </div>

        <div className="mt-6 rounded-lg border border-border/70 bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Gauge className="size-3.5 text-primary" />
            Sample visualization — run a real analysis for your own media.
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-2 last:border-0">
      <dt className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">{label}</dt>
      <dd className={`text-sm font-medium ${tone}`}>{value}</dd>
    </div>
  );
}
