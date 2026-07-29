"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { getFlashcardDeck } from "@/services/review.service";
import { formatDate } from "@/lib/utils";

type CardItem = Awaited<ReturnType<typeof getFlashcardDeck>>["cards"][number];

export function FlashcardGrid({ cards }: { cards: CardItem[] }) {
  const [flipped, setFlipped] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setFlipped((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flashcard-grid">
      {cards.map((card) => {
        const relationship = card.questions;
        const question = Array.isArray(relationship)
          ? relationship[0]
          : relationship;
        const isFlipped = flipped.has(card.id);
        return (
          <article className={`flashcard-item ${isFlipped ? "flipped" : ""}`} key={card.id}>
            <button
              className="flashcard-face"
              type="button"
              onClick={() => toggle(card.id)}
              aria-label={isFlipped ? "Show question" : "Reveal answer"}
            >
              <span className="flashcard-label">
                {isFlipped ? "ANSWER" : "ACTIVE RECALL"}
              </span>
              <p>{isFlipped ? card.back : card.front}</p>
              <span className="flip-hint">
                <RotateCcw size={14} />
                {isFlipped ? "Show prompt" : "Reveal answer"}
              </span>
            </button>
            <footer>
              <div>
                {question ? (
                  <Link href={`/problems/${question.slug}`}>{question.title}</Link>
                ) : (
                  <span>RecallCode</span>
                )}
                <small>
                  {card.is_due
                    ? "Due now"
                    : `Review ${formatDate(card.review_date)}`}
                </small>
              </div>
              <span>{card.repetitions >= 4 ? "Mastered" : "Learning"}</span>
            </footer>
          </article>
        );
      })}
    </div>
  );
}
