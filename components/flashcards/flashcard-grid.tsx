"use client";

import { LoaderCircle, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { getFlashcardDeck } from "@/services/review.service";
import { formatDate } from "@/lib/utils";

type CardItem = Awaited<ReturnType<typeof getFlashcardDeck>>["cards"][number];

export function FlashcardGrid({ cards: initialCards }: { cards: CardItem[] }) {
  const router = useRouter();
  const [cards, setCards] = useState(initialCards);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function toggle(id: string) {
    setFlipped((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function deleteCard(id: string) {
    setDeletingId(id);
    setDeleteError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("flashcards")
        .delete()
        .eq("id", id)
        .select("id");

      if (error) throw error;
      if (data.length !== 1) {
        throw new Error("This flashcard could not be deleted.");
      }

      setCards((current) => current.filter((card) => card.id !== id));
      setFlipped((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      setConfirmingId(null);
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to delete this flashcard.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flashcard-grid">
      {deleteError ? (
        <div className="flashcard-delete-error" role="alert">
          {deleteError}
        </div>
      ) : null}
      {cards.map((card) => {
        const relationship = card.questions;
        const question = Array.isArray(relationship)
          ? relationship[0]
          : relationship;
        const isFlipped = flipped.has(card.id);
        return (
          <article
            className={`flashcard-item ${isFlipped ? "flipped" : ""}`}
            key={card.id}
          >
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
              <div className="flashcard-footer-actions">
                <span className="flashcard-status">
                  {card.repetitions >= 4 ? "Mastered" : "Learning"}
                </span>
                {confirmingId === card.id ? (
                  <div className="flashcard-delete-confirm">
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      disabled={deletingId === card.id}
                    >
                      Cancel
                    </button>
                    <button
                      className="confirm-delete"
                      type="button"
                      onClick={() => deleteCard(card.id)}
                      disabled={deletingId === card.id}
                    >
                      {deletingId === card.id ? (
                        <LoaderCircle aria-hidden="true" size={13} />
                      ) : (
                        <Trash2 aria-hidden="true" size={13} />
                      )}
                      Delete
                    </button>
                  </div>
                ) : (
                  <button
                    className="flashcard-delete-trigger"
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setConfirmingId(card.id);
                    }}
                    aria-label={`Delete flashcard: ${card.front}`}
                    title="Delete flashcard"
                  >
                    <Trash2 aria-hidden="true" size={15} />
                  </button>
                )}
              </div>
            </footer>
          </article>
        );
      })}
    </div>
  );
}
