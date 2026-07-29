import type { Metadata } from "next";
import Link from "next/link";
import { RecallSession } from "@/components/reviews/recall-session";
import { ReviewSession } from "@/components/reviews/review-session";
import { requireUser } from "@/services/auth.service";
import {
  getActiveRecallItems,
  getDueFlashcards,
} from "@/services/review.service";

export const metadata: Metadata = { title: "Reviews" };

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const [user, params] = await Promise.all([requireUser(), searchParams]);
  const mode = params.mode === "recall" ? "recall" : "cards";
  const [cards, recallItems] = await Promise.all([
    getDueFlashcards(user.id),
    getActiveRecallItems(user.id),
  ]);

  return (
    <div className="page-shell reviews-page">
      <header className="page-header review-header">
        <div>
          <span className="page-kicker">SPACED REPETITION</span>
          <h1>Review room</h1>
          <p>Retrieve first. Reveal second.</p>
        </div>
        <div className="review-mode-tabs">
          <Link className={mode === "cards" ? "active" : ""} href="/reviews">
            Flashcards
            <span>{cards.length}</span>
          </Link>
          <Link
            className={mode === "recall" ? "active" : ""}
            href="/reviews?mode=recall"
          >
            Active recall
            <span>{recallItems.length}</span>
          </Link>
        </div>
      </header>

      {mode === "cards" ? (
        <ReviewSession cards={cards} />
      ) : (
        <RecallSession items={recallItems} />
      )}
    </div>
  );
}
