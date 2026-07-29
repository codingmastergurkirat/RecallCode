import {
  ArrowRight,
  Brain,
  Code2,
  Layers3,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { PublicNavbar } from "@/components/public-navbar";

const patternRows = [
  ["Sliding window", "88%", "+12"],
  ["Hash map", "76%", "+8"],
  ["Dynamic programming", "61%", "+16"],
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
              <div className="streak-pill">🔥 12 day streak</div>
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

        <section className="value-strip" aria-label="RecallCode outcomes">
          <div>
            <strong>Practice with purpose</strong>
            <span>Every solve becomes a learning loop.</span>
          </div>
          <div>
            <strong>Review at the right time</strong>
            <span>SM-2 schedules recall before you forget.</span>
          </div>
          <div>
            <strong>Master reusable patterns</strong>
            <span>See progress beyond an accepted count.</span>
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="section-heading">
            <span className="eyebrow">THE RECALL LOOP</span>
            <h2>A study system that closes the gap between solving and knowing.</h2>
          </div>
          <div className="feature-grid">
            <article className="feature-card feature-card-large">
              <div className="feature-icon">
                <Code2 size={20} />
              </div>
              <span>01 · SOLVE</span>
              <h3>Write and run real code.</h3>
              <p>
                Work through curated interview problems in a focused editor
                with instant execution feedback.
              </p>
              <div className="code-window">
                <div>
                  <i />
                  <i />
                  <i />
                  <span>two-sum.ts</span>
                </div>
                <pre>
                  <code>
                    <em>function</em> twoSum(nums, target) {"{"}
                    {"\n  "}
                    <em>const</em> seen = <em>new</em> Map();
                    {"\n  "}
                    <span>{"// recall the invariant"}</span>
                    {"\n}"}
                  </code>
                </pre>
              </div>
            </article>
            <article className="feature-card">
              <div className="feature-icon">
                <Brain size={20} />
              </div>
              <span>02 · REFLECT</span>
              <h3>Explain the why.</h3>
              <p>
                Answer generated recall prompts and get concise feedback on
                gaps in your reasoning.
              </p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">
                <RotateCcw size={20} />
              </div>
              <span>03 · REVIEW</span>
              <h3>Return before forgetting.</h3>
              <p>
                Flashcards adapt to your confidence, moving strong concepts
                farther out and weak ones closer.
              </p>
            </article>
          </div>
        </section>

        <section className="patterns-section" id="patterns">
          <div className="patterns-copy">
            <span className="eyebrow">PATTERN FIRST</span>
            <h2>Learn the moves behind the problems.</h2>
            <p>
              RecallCode organizes practice around reusable decisions—not
              isolated answers.
            </p>
            <ul>
              <li>
                <Target size={18} /> Weak-pattern detection
              </li>
              <li>
                <Layers3 size={18} /> Progress across 12 core patterns
              </li>
              <li>
                <Sparkles size={18} /> Feedback grounded in your submission
              </li>
            </ul>
          </div>
          <div className="pattern-orbit">
            {[
              "Arrays",
              "Graphs",
              "DP",
              "Trees",
              "Greedy",
              "Heaps",
              "Tries",
              "Backtracking",
            ].map((pattern, index) => (
              <span key={pattern} style={{ "--i": index } as React.CSSProperties}>
                {pattern}
              </span>
            ))}
            <div>
              <strong>12</strong>
              <small>core patterns</small>
            </div>
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
