import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  recallQuestionId: z.string().uuid(),
  answer: z.string().min(1).max(5_000),
  confidence: z.number().int().min(1).max(5),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const input = schema.parse(await request.json());
    const { data: ownedQuestion } = await supabase
      .from("active_recall_questions")
      .select("id")
      .eq("id", input.recallQuestionId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!ownedQuestion) {
      return NextResponse.json(
        { error: "Recall question not found." },
        { status: 404 },
      );
    }
    const { error } = await supabase.from("active_recall_answers").upsert(
      {
        recall_question_id: input.recallQuestionId,
        user_id: user.id,
        answer: input.answer,
        confidence: input.confidence,
      },
      { onConflict: "user_id,recall_question_id" },
    );
    if (error) throw new Error(error.message);
    return NextResponse.json({ saved: true });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message
        : error instanceof Error
          ? error.message
          : "Answer could not be saved.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
