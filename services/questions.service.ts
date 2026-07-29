import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Difficulty } from "@/types/database";

export interface QuestionFilters {
  search?: string;
  pattern?: string;
  difficulty?: Difficulty;
  topic?: string;
  page?: number;
}

const PAGE_SIZE = 24;

export const getPatterns = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patterns")
    .select("*")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data;
});

export async function getQuestionLibrary(
  userId: string,
  filters: QuestionFilters,
) {
  const supabase = await createClient();
  const page = Math.max(filters.page ?? 1, 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("questions")
    .select(
      "id, title, slug, difficulty, topic, companies, tags, leetcode_url, estimated_time, pattern_id, patterns(name, slug)",
      { count: "exact" },
    )
    .order("difficulty", { ascending: true })
    .order("title", { ascending: true })
    .range(from, to);

  if (filters.search) {
    const search = filters.search.replace(/[%_,()]/g, " ").trim();
    if (search) {
      query = query.or(`title.ilike.%${search}%,topic.ilike.%${search}%`);
    }
  }
  if (filters.difficulty) {
    query = query.eq("difficulty", filters.difficulty);
  }
  if (filters.topic) {
    query = query.eq("topic", filters.topic);
  }
  if (filters.pattern) {
    const patterns = await getPatterns();
    const selected = patterns.find((pattern) => pattern.slug === filters.pattern);
    if (selected) query = query.eq("pattern_id", selected.id);
  }

  const [questionsResult, solvedResult] = await Promise.all([
    query,
    supabase
      .from("submissions")
      .select("question_id")
      .eq("user_id", userId)
      .eq("status", "accepted"),
  ]);

  if (questionsResult.error) throw new Error(questionsResult.error.message);
  if (solvedResult.error) throw new Error(solvedResult.error.message);

  return {
    questions: questionsResult.data,
    solvedIds: new Set(solvedResult.data.map((item) => item.question_id)),
    total: questionsResult.count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  };
}

export const getQuestionBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("questions")
    .select("*, patterns(name, slug)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
});

export async function getProblemLearningContext(
  userId: string,
  questionId: string,
) {
  const supabase = await createClient();
  const [submissionResult, recallResult, flashcardsResult] = await Promise.all([
    supabase
      .from("submissions")
      .select("id, created_at")
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .eq("status", "accepted")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("active_recall_questions")
      .select("id, prompt, sort_order")
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .order("sort_order"),
    supabase
      .from("flashcards")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("question_id", questionId),
  ]);

  const submission = submissionResult.data;
  const feedback = submission
    ? (
        await supabase
          .from("ai_feedback")
          .select(
            "feedback, mistakes, better_solution, time_complexity, space_complexity, interview_tips, similar_questions, provider, model, created_at",
          )
          .eq("submission_id", submission.id)
          .maybeSingle()
      ).data
    : null;

  return {
    feedback,
    recallQuestions: recallResult.data ?? [],
    flashcardCount: flashcardsResult.count ?? 0,
  };
}
