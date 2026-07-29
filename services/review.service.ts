import { createClient } from "@/lib/supabase/server";

export type DeckFilter = "all" | "due" | "learning" | "mastered";

export async function getFlashcardDeck(
  userId: string,
  filter: DeckFilter = "all",
) {
  const supabase = await createClient();
  let query = supabase
    .from("flashcards")
    .select("*, questions(title, slug)")
    .eq("user_id", userId)
    .order("review_date", { ascending: true });

  if (filter === "due") query = query.lte("review_date", new Date().toISOString());
  if (filter === "learning") query = query.lt("repetitions", 4);
  if (filter === "mastered") query = query.gte("repetitions", 4);

  const [cardsResult, allResult] = await Promise.all([
    query,
    supabase
      .from("flashcards")
      .select("review_date, repetitions")
      .eq("user_id", userId),
  ]);

  if (cardsResult.error) throw new Error(cardsResult.error.message);
  if (allResult.error) throw new Error(allResult.error.message);

  const all = allResult.data;
  const now = Date.now();
  return {
    cards: cardsResult.data.map((card) => ({
      ...card,
      is_due: new Date(card.review_date).getTime() <= now,
    })),
    stats: {
      total: all.length,
      due: all.filter((card) => new Date(card.review_date).getTime() <= now)
        .length,
      learning: all.filter((card) => card.repetitions < 4).length,
      mastered: all.filter((card) => card.repetitions >= 4).length,
    },
  };
}

export async function getDueFlashcards(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("flashcards")
    .select("*, questions(title, slug)")
    .eq("user_id", userId)
    .lte("review_date", new Date().toISOString())
    .order("review_date")
    .limit(50);
  if (error) throw new Error(error.message);
  return data;
}

export async function getActiveRecallItems(userId: string) {
  const supabase = await createClient();
  const { data: questions, error } = await supabase
    .from("active_recall_questions")
    .select("id, prompt, question_id, sort_order, questions(title, slug)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .order("sort_order")
    .limit(50);
  if (error) throw new Error(error.message);

  if (!questions.length) return [];
  const { data: answers, error: answerError } = await supabase
    .from("active_recall_answers")
    .select("recall_question_id, answer, confidence, updated_at")
    .eq("user_id", userId)
    .in(
      "recall_question_id",
      questions.map((question) => question.id),
    );
  if (answerError) throw new Error(answerError.message);
  const answersById = new Map(
    answers.map((answer) => [answer.recall_question_id, answer]),
  );

  return questions.map((question) => ({
    ...question,
    answer: answersById.get(question.id) ?? null,
  }));
}
