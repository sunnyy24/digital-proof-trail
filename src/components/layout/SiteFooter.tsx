import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/analyze", label: "Analyze" },
  { to: "/investigations", label: "Investigations" },
  { to: "/reports", label: "Reports" },
  { to: "/technology", label: "Technology" },
  { to: "/about", label: "About" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/70 bg-background/60 backdrop-blur-sm">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg border border-primary/40 bg-primary/10">
              <ShieldCheck className="size-5 text-primary" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-lg font-bold">AIMD</span>
              <span className="mt-1 block text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                AI Media Intelligence
              </span>
            </span>
          </div>
          <p className="mt-4 font-display text-sm text-primary">Detect. Verify. Investigate.</p>
          <p className="mt-3 max-w-sm text-xs leading-relaxed text-muted-foreground">
            AIMD provides evidence-based analysis and confidence estimates. It does not guarantee
            absolute authenticity or name an AI generator when reliable evidence is unavailable.
          </p>
        </div>

        <div>
          <p className="text-xs tracking-wider text-muted-foreground uppercase">Platform</p>
          <ul className="mt-3 space-y-2">
            {LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs tracking-wider text-muted-foreground uppercase">Legal</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link
                to="/about"
                hash="privacy"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                hash="terms"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6">
          © 2026 AIMD — AI Media Intelligence. Forensic results are indications and should be
          corroborated with other evidence.
        </p>
      </div>
    </footer>
  );
}
