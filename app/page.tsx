import {
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { PublicNavbar } from "@/components/public-navbar";

const patternRows = [
  ["Sliding window", "88%", "+12"],
  ["Hash map", "76%", "+8"],
  ["Dynamic programming", "61%", "+16"],
];

const recallLoop = [
  ["01", "Solve", "Run real code in a focused workspace."],
  ["02", "Explain", "Turn the approach into clear recall prompts."],
  ["03", "Review", "Return on a schedule that protects retention."],
];

const patterns = [
  "Arrays",
  "Sliding window",
  "Trees",
  "Graphs",
  "Dynamic programming",
  "Backtracking",
];

export default function Home() {
  return (
    <div className="marketing-page">
      <PublicNavbar />
      <main>
        <section className="hero">
          <div className="hero-glow" aria-hidden="true" />
          <div className="hero-copy">
            <div className="eyebrow">
              <Sparkles size={15} />
              Active recall for algorithms
            </div>
            <h1>
              Solve once.
              <br />
              <span>Recall for good.</span>
            </h1>
            <p>
              Turn every coding problem into durable knowledge with smart
              flashcards, spaced reviews, and focused AI coaching.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary button-lg" href="/signup">
                Build your recall loop
                <ArrowRight size={18} />
              </Link>
              <Link className="button button-secondary button-lg" href="/login">
                Sign in
              </Link>
            </div>
            <div className="hero-proof">
              <span>150 curated problems</span>
              <i />
              <span>12 core patterns</span>
              <i />
              <span>Built for retention</span>
            </div>
          </div>

          <div className="hero-product" aria-label="RecallCode product preview">
            <div className="preview-top">
              <div>
                <span className="preview-kicker">TODAY&apos;S FOCUS</span>
                <strong>Keep the loop alive.</strong>
              </div>
              <div className="streak-pill">12 DAY STREAK</div>
            </div>
            <div className="preview-grid">
              <div className="preview-score">
                <span>Reviews due</span>
                <strong>08</strong>
                <small>14 min estimated</small>
                <div className="progress-track">
                  <i style={{ width: "64%" }} />
                </div>
              </div>
              <div className="preview-card-stack">
                <div className="mini-flashcard">
                  <span>ACTIVE RECALL</span>
                  <strong>
                    Why does a sliding window avoid repeated work?
                  </strong>
                  <button type="button">Reveal answer</button>
                </div>
              </div>
            </div>
            <div className="mastery-list">
              <div className="mastery-heading">
                <span>Pattern mastery</span>
                <span>Last 30 days</span>
              </div>
              {patternRows.map(([name, score, delta]) => (
                <div className="mastery-row" key={name}>
                  <span>{name}</span>
                  <div className="mastery-bar">
                    <i style={{ width: score }} />
                  </div>
                  <strong>{score}</strong>
                  <small>+{delta.replace("+", "")}%</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="section-heading">
            <span className="eyebrow">THE RECALL LOOP</span>
            <h2>From a finished solve to knowledge you can retrieve.</h2>
          </div>
          <div className="workflow-row">
            {recallLoop.map(([number, title, description]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="patterns-section" id="patterns">
          <div className="patterns-copy">
            <span className="eyebrow">PATTERN FIRST</span>
            <h2>Learn the moves behind the problems.</h2>
            <p>
              See which decisions are becoming automatic and which need
              another pass.
            </p>
          </div>
          <div className="pattern-index">
            {patterns.map((pattern, index) => (
              <div key={pattern}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{pattern}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="cta-section">
          <span className="eyebrow">YOUR NEXT SOLVE CAN STICK</span>
          <h2>Build recall, not just a streak.</h2>
          <Link className="button button-primary button-lg" href="/signup">
            Start learning
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
