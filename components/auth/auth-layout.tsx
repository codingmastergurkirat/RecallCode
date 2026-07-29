import { Brain, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <aside className="auth-story">
        <BrandLogo />
        <div className="auth-story-copy">
          <span className="eyebrow">
            <Sparkles size={14} /> LEARN FOR RETENTION
          </span>
          <h2>Your practice deserves a memory system.</h2>
          <p>
            RecallCode turns each solution into the next right review, so
            patterns stay available when interviews get real.
          </p>
          <ul>
            <li>
              <CheckCircle2 size={19} /> Curated pattern-based practice
            </li>
            <li>
              <RotateCcw size={19} /> Adaptive spaced repetition
            </li>
            <li>
              <Brain size={19} /> Submission-aware AI coaching
            </li>
          </ul>
        </div>
        <p className="auth-story-foot">Solve → Reflect → Recall → Master</p>
      </aside>
      <section className="auth-content">
        <div className="auth-mobile-top">
          <BrandLogo />
          <ThemeToggle />
        </div>
        <div className="auth-theme">
          <ThemeToggle />
        </div>
        {children}
      </section>
    </main>
  );
}
