import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

export interface DashboardStats {
  totalSolved: number;
  reviewsToday: number;
  flashcards: number;
  currentStreak: number;
  averageMastery: number;
}

export interface PatternMastery {
  name: string;
  slug: string;
  mastery: number;
  solved: number;
  attempted: number;
}

export interface ActivityPoint {
  date: string;
  solved: number;
  reviews: number;
}

function numberFromJson(value: Json | undefined) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

export async function getDashboardData(userId: string) {
  const supabase = await createClient();
  const [statsResult, progressResult, activityResult] = await Promise.all([
    supabase.rpc("get_dashboard_stats", { target_user_id: userId }),
    supabase
      .from("pattern_progress")
      .select("mastery_percentage, solved_count, attempted_count, patterns(name, slug)")
      .eq("user_id", userId)
      .order("mastery_percentage", { ascending: false }),
    supabase
      .from("daily_stats")
      .select("stat_date, problems_solved, reviews_completed")
      .eq("user_id", userId)
      .gte(
        "stat_date",
        new Date(Date.now() - 29 * 86_400_000).toISOString().slice(0, 10),
      )
      .order("stat_date", { ascending: true }),
  ]);

  const raw =
    statsResult.data &&
    typeof statsResult.data === "object" &&
    !Array.isArray(statsResult.data)
      ? statsResult.data
      : {};

  const stats: DashboardStats = {
    totalSolved: numberFromJson(raw.total_solved),
    reviewsToday: numberFromJson(raw.reviews_today),
    flashcards: numberFromJson(raw.flashcards),
    currentStreak: numberFromJson(raw.current_streak),
    averageMastery: numberFromJson(raw.average_mastery),
  };

  const progress: PatternMastery[] = (progressResult.data ?? []).flatMap(
    (item) => {
      const pattern = item.patterns;
      const value = Array.isArray(pattern) ? pattern[0] : pattern;
      if (!value) return [];
      return [
        {
          name: value.name,
          slug: value.slug,
          mastery: Number(item.mastery_percentage),
          solved: item.solved_count,
          attempted: item.attempted_count,
        },
      ];
    },
  );

  const activityMap = new Map(
    (activityResult.data ?? []).map((item) => [
      item.stat_date,
      {
        date: item.stat_date,
        solved: item.problems_solved,
        reviews: item.reviews_completed,
      },
    ]),
  );

  const activity: ActivityPoint[] = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(Date.now() - (13 - index) * 86_400_000)
      .toISOString()
      .slice(0, 10);
    return activityMap.get(date) ?? { date, solved: 0, reviews: 0 };
  });

  return { stats, progress, activity };
}
