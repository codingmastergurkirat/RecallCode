import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProblemWorkspace } from "@/components/problems/problem-workspace";
import { requireUser } from "@/services/auth.service";
import {
  getProblemLearningContext,
  getQuestionBySlug,
} from "@/services/questions.service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const question = await getQuestionBySlug(slug);
  return { title: question?.title ?? "Problem" };
}

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, user] = await Promise.all([params, requireUser()]);
  const question = await getQuestionBySlug(slug);
  if (!question) notFound();
  const context = await getProblemLearningContext(user.id, question.id);

  return (
    <ProblemWorkspace
      question={question}
      existingFeedback={context.feedback}
      recallCount={context.recallQuestions.length}
      flashcardCount={context.flashcardCount}
    />
  );
}
