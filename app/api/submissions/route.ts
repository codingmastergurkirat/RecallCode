import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateLearningPack } from "@/services/ai.service";
import {
  executeCode,
  executionSucceeded,
} from "@/services/piston.service";
import type { Json, SubmissionStatus } from "@/types/database";

const schema = z.object({
  questionId: z.string().uuid(),
  language: z.enum(["javascript", "typescript", "python", "java", "cpp"]),
  code: z.string().min(1, "Write some code first.").max(50_000),
  stdin: z.string().max(10_000).optional(),
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
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("id, title, topic, patterns(name)")
      .eq("id", input.questionId)
      .single();
    if (questionError || !question) {
      return NextResponse.json({ error: "Problem not found." }, { status: 404 });
    }

    const execution = await executeCode(input);
    const status: SubmissionStatus = executionSucceeded(execution)
      ? "accepted"
      : execution.compile && execution.compile.code !== 0
        ? "compile_error"
        : execution.run.code !== 0 || execution.run.signal
          ? "runtime_error"
          : "failed";

    const output = execution.run.output || execution.compile?.output || "";
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert({
        user_id: user.id,
        question_id: input.questionId,
        language: input.language,
        code: input.code,
        status,
        runtime_ms: execution.runtimeMs,
        memory_kb: null,
        stdout: execution.run.stdout,
        stderr:
          execution.run.stderr || execution.compile?.stderr || null,
      })
      .select("id, status")
      .single();
    if (submissionError) throw new Error(submissionError.message);

    let learningPack: Awaited<ReturnType<typeof generateLearningPack>> | null =
      null;
    let learningPackWarning: string | null = null;
    if (status === "accepted") {
      try {
        const relation = question.patterns;
        const pattern = Array.isArray(relation) ? relation[0] : relation;
        learningPack = await generateLearningPack({
          title: question.title,
          pattern: pattern?.name ?? "General",
          topic: question.topic,
          language: input.language,
          code: input.code,
          output,
        });
        const { error: packError } = await supabase.rpc("store_learning_pack", {
          p_submission_id: submission.id,
          p_pack: learningPack.data as unknown as Json,
          p_provider: learningPack.provider,
          p_model: learningPack.model,
        });
        if (packError) throw new Error(packError.message);
      } catch (error) {
        learningPackWarning =
          error instanceof Error
            ? error.message
            : "Learning materials could not be generated.";
      }
    }

    return NextResponse.json({
      submission,
      execution,
      learningPack,
      warning: learningPackWarning,
    });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message
        : error instanceof Error
          ? error.message
          : "Submission failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
