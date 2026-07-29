"use client";

import { ArrowRight, CheckCircle2, Save } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { getActiveRecallItems } from "@/services/review.service";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type RecallItem = Awaited<ReturnType<typeof getActiveRecallItems>>[number];

export function RecallSession({ items }: { items: RecallItem[] }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState(items[0]?.answer?.answer ?? "");
  const [confidence, setConfidence] = useState(
    items[0]?.answer?.confidence ?? 3,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const item = items[index];

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/recall", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          recallQuestionId: item.id,
          answer,
          confidence,
        }),
      });
      const value: unknown = await response.json();
      const result =
        value && typeof value === "object"
          ? (value as { error?: string })
          : {};
      if (!response.ok) throw new Error(result.error ?? "Answer was not saved.");
      const nextIndex = index + 1;
      setIndex(nextIndex);
      setAnswer(items[nextIndex]?.answer?.answer ?? "");
      setConfidence(items[nextIndex]?.answer?.confidence ?? 3);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Answer was not saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!item) {
    return (
      <div className="review-complete">
        <div>
          <CheckCircle2 size={26} />
        </div>
        <span className="page-kicker">REFLECTION SAVED</span>
        <h2>{items.length ? "You explained the thinking." : "No recall prompts yet."}</h2>
        <p>
          {items.length
            ? "Your answers are stored so you can compare how your mental model changes."
            : "Submit a successful solution to create active recall questions."}
        </p>
        <Link className="button button-primary button-md" href="/problems">
          Browse problems <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const relationship = item.questions;
  const question = Array.isArray(relationship)
    ? relationship[0]
    : relationship;

  return (
    <form className="recall-session" onSubmit={save}>
      <div className="review-progress-row">
        <span>
          Prompt {index + 1} of {items.length}
        </span>
        {question ? (
          <Link href={`/problems/${question.slug}`}>{question.title}</Link>
        ) : null}
      </div>
      <div className="review-progress">
        <i style={{ width: `${((index + 1) / items.length) * 100}%` }} />
      </div>
      <article>
        <span className="page-kicker">EXPLAIN IT IN YOUR WORDS</span>
        <h2>{item.prompt}</h2>
        <label>
          <span>Your explanation</span>
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="State the core idea, invariant, and edge cases…"
            minLength={1}
            maxLength={5_000}
            required
          />
        </label>
        <fieldset>
          <legend>Confidence</legend>
          <div>
            {[
              [1, "Guessing"],
              [2, "Unsure"],
              [3, "Okay"],
              [4, "Strong"],
              [5, "Certain"],
            ].map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="confidence"
                  value={value}
                  checked={confidence === value}
                  onChange={() => setConfidence(value as number)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? <Spinner label="Saving answer" /> : <Save size={16} />}
          Save & continue
        </Button>
        {error ? <p className="review-error">{error}</p> : null}
      </article>
    </form>
  );
}
