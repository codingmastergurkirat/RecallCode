import { Brain, CreditCard, Layers3, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { FlashcardGrid } from "@/components/flashcards/flashcard-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/services/auth.service";
import {
  getFlashcardDeck,
  type DeckFilter,
} from "@/services/review.service";

export const metadata: Metadata = { title: "Flashcards" };

const filters: { value: DeckFilter; label: string }[] = [
  { value: "all", label: "All cards" },
  { value: "due", label: "Due now" },
  { value: "learning", label: "Learning" },
  { value: "mastered", label: "Mastered" },
];

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const [user, params] = await Promise.all([requireUser(), searchParams]);
  const filter = filters.some((item) => item.value === params.filter)
    ? (params.filter as DeckFilter)
    : "all";
  const { cards, stats } = await getFlashcardDeck(user.id, filter);

  return (
    <div className="page-shell flashcards-page">
      <header className="page-header">
        <div>
          <span className="page-kicker">DURABLE KNOWLEDGE</span>
          <h1>Flashcards</h1>
          <p>Small prompts. Stronger retrieval.</p>
        </div>
        {stats.due ? (
          <Link className="button button-primary button-md" href="/reviews">
            Review {stats.due} due
          </Link>
        ) : null}
      </header>

      <section className="deck-stats">
        {[
          { label: "Total", value: stats.total, icon: CreditCard },
          { label: "Due now", value: stats.due, icon: Brain },
          { label: "Learning", value: stats.learning, icon: Sparkles },
          { label: "Mastered", value: stats.mastered, icon: Layers3 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label}>
              <Icon size={18} />
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          );
        })}
      </section>

      <nav className="filter-tabs" aria-label="Filter flashcards">
        {filters.map((item) => (
          <Link
            key={item.value}
            className={filter === item.value ? "active" : ""}
            href={
              item.value === "all"
                ? "/flashcards"
                : `/flashcards?filter=${item.value}`
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {cards.length ? (
        <FlashcardGrid cards={cards} />
      ) : (
        <EmptyState
          icon={CreditCard}
          title={stats.total ? "No cards in this view" : "Your deck is ready to grow"}
          description={
            stats.total
              ? "Choose another filter to see the rest of your deck."
              : "Submit a successful solution to generate persistent flashcards."
          }
          action={
            stats.total
              ? { label: "View all cards", href: "/flashcards" }
              : { label: "Solve a problem", href: "/problems" }
          }
        />
      )}
    </div>
  );
}
