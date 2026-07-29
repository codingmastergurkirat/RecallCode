"use client";

import {
  ArrowRight,
  Brain,
  CheckCircle2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { getDueFlashcards } from "@/services/review.service";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type DueCard = Awaited<ReturnType<typeof getDueFlashcards>>[number];

const qualities = [
  { value: 0, label: "Again", helper: "1 day" },
  { value: 3, label: "Hard", helper: "Shorter" },
  { value: 4, label: "Good", helper: "On track" },
  { value: 5, label: "Easy", helper: "Longer" },
];

export function ReviewSession({ cards }: { cards: DueCard[] }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(0);
  const card = cards[index];

  async function review(quality: number) {
    if (!card) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cardId: card.id, quality }),
      });
      const value: unknown = await response.json();
      const result =
        value && typeof value === "object"
          ? (value as { error?: string })
          : {};
      if (!response.ok) throw new Error(result.error ?? "Review failed.");
      setCompleted((value) => value + 1);
      setIndex((value) => value + 1);
      setRevealed(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Review failed.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!card) {
    return (
      <div className="review-complete">
        <div>
          <CheckCircle2 size={26} />
        </div>
        <span className="page-kicker">SESSION COMPLETE</span>
        <h2>{completed ? `${completed} memories reinforced.` : "You’re all caught up."}</h2>
        <p>
          The next review will appear when retrieval becomes worth practicing
          again.
        </p>
        <div>
          <Link className="button button-primary button-md" href="/problems">
            Solve another problem <ArrowRight size={16} />
          </Link>
          <Link className="button button-secondary button-md" href="/dashboard">
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const relationship = card.questions;
  const question = Array.isArray(relationship)
    ? relationship[0]
    : relationship;
  const progress = ((index + (revealed ? 0.5 : 0)) / cards.length) * 100;

  return (
    <div className="review-session">
      <div className="review-progress-row">
        <span>
          Card {index + 1} of {cards.length}
        </span>
        <strong>{Math.round(progress)}%</strong>
      </div>
      <div className="review-progress">
        <i style={{ width: `${progress}%` }} />
      </div>

      <article className={`review-card ${revealed ? "revealed" : ""}`}>
        <header>
          <span>{revealed ? "ANSWER" : "ACTIVE RECALL"}</span>
          {question ? (
            <Link href={`/problems/${question.slug}`}>{question.title}</Link>
          ) : null}
        </header>
        <div>
          {revealed ? <Sparkles size={22} /> : <Brain size={22} />}
          <p>{revealed ? card.back : card.front}</p>
        </div>
        {!revealed ? (
          <Button size="lg" onClick={() => setRevealed(true)}>
            Reveal answer
          </Button>
        ) : null}
      </article>

      {revealed ? (
        <div className="quality-panel">
          <span>How well did you recall it?</span>
          <div>
            {qualities.map((quality) => (
              <button
                type="button"
                key={quality.value}
                onClick={() => review(quality.value)}
                disabled={saving}
              >
                {saving ? null : <RotateCcw size={15} />}
                <strong>{quality.label}</strong>
                <small>{quality.helper}</small>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {saving ? (
        <div className="review-saving">
          <Spinner label="Saving review" /> Scheduling your next review…
        </div>
      ) : null}
      {error ? <p className="review-error">{error}</p> : null}
    </div>
  );
}
