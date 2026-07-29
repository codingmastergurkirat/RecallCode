import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { askTutor } from "@/services/ai.service";

const schema = z.object({
  questionId: z.string().uuid(),
  language: z.enum(["javascript", "typescript", "python", "java", "cpp"]),
  code: z.string().max(50_000),
  question: z.string().min(2).max(1_000),
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
    const { data: problem, error } = await supabase
      .from("questions")
      .select("title, patterns(name)")
      .eq("id", input.questionId)
      .single();
    if (error || !problem) {
      return NextResponse.json({ error: "Problem not found." }, { status: 404 });
    }
    const relation = problem.patterns;
    const pattern = Array.isArray(relation) ? relation[0] : relation;
    const result = await askTutor({
      title: problem.title,
      pattern: pattern?.name ?? "General",
      language: input.language,
      code: input.code,
      question: input.question,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message
        : error instanceof Error
          ? error.message
          : "Tutor request failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
