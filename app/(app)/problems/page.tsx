import {
  ArrowRight,
  Check,
  Clock3,
  ExternalLink,
  LibraryBig,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Pagination } from "@/components/problems/pagination";
import { QuestionFilters } from "@/components/problems/question-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/services/auth.service";
import {
  getPatterns,
  getQuestionLibrary,
} from "@/services/questions.service";
import type { Difficulty } from "@/types/database";

export const metadata: Metadata = { title: "Problems" };

function validDifficulty(value?: string): Difficulty | undefined {
  return value === "Easy" || value === "Medium" || value === "Hard"
    ? value
    : undefined;
}

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    pattern?: string;
    difficulty?: string;
    topic?: string;
    page?: string;
  }>;
}) {
  const [user, params, patterns] = await Promise.all([
    requireUser(),
    searchParams,
    getPatterns(),
  ]);

  const filters = {
    search: params.search?.slice(0, 80),
    pattern: params.pattern,
    difficulty: validDifficulty(params.difficulty),
    topic: params.topic,
    page: Math.max(Number(params.page) || 1, 1),
  };
  const { questions, solvedIds, total, page, pageSize } =
    await getQuestionLibrary(user.id, filters);
  const pageCount = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <div className="page-shell problems-page">
      <header className="page-header">
        <div>
          <span className="page-kicker">NEETCODE 150</span>
          <h1>Problem library</h1>
          <p>Practice by pattern. Keep what you learn.</p>
        </div>
        <div className="library-count">
          <strong>{total}</strong>
          <span>{total === 1 ? "problem" : "problems"}</span>
        </div>
      </header>

      <QuestionFilters patterns={patterns} values={params} />

      {questions.length ? (
        <>
          <div className="problem-list">
            <div className="problem-list-head" aria-hidden="true">
              <span>Status</span>
              <span>Problem</span>
              <span>Pattern</span>
              <span>Difficulty</span>
              <span>Time</span>
              <span />
            </div>
            {questions.map((question, index) => {
              const solved = solvedIds.has(question.id);
              const relationship = question.patterns;
              const pattern = Array.isArray(relationship)
                ? relationship[0]
                : relationship;
              return (
                <article className="problem-row" key={question.id}>
                  <div
                    className={`problem-status ${
                      solved ? "problem-status-solved" : ""
                    }`}
                    aria-label={solved ? "Solved" : "Not solved"}
                  >
                    {solved ? <Check size={14} /> : index + 1 + (page - 1) * pageSize}
                  </div>
                  <div className="problem-title-cell">
                    <Link href={`/problems/${question.slug}`}>
                      {question.title}
                    </Link>
                    <span>{question.topic}</span>
                    <div>
                      {question.tags.slice(0, 3).map((tag) => (
                        <small key={tag}>{tag.replaceAll("-", " ")}</small>
                      ))}
                    </div>
                  </div>
                  <span className="problem-pattern">
                    {pattern?.name ?? "General"}
                  </span>
                  <span
                    className={`difficulty difficulty-${question.difficulty.toLowerCase()}`}
                  >
                    {question.difficulty}
                  </span>
                  <span className="problem-time">
                    <Clock3 size={15} />
                    {question.estimated_time}m
                  </span>
                  <div className="problem-row-actions">
                    <a
                      href={question.leetcode_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${question.title} on LeetCode`}
                    >
                      <ExternalLink size={16} />
                    </a>
                    <Link
                      href={`/problems/${question.slug}`}
                      aria-label={`Practice ${question.title}`}
                    >
                      <ArrowRight size={17} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
          <Pagination
            page={page}
            pageCount={pageCount}
            params={{
              search: filters.search,
              pattern: filters.pattern,
              difficulty: filters.difficulty,
              topic: filters.topic,
            }}
          />
        </>
      ) : (
        <EmptyState
          icon={LibraryBig}
          title="No problems match these filters"
          description="Clear a filter or try a broader search."
          action={{ label: "View all problems", href: "/problems" }}
        />
      )}
    </div>
  );
}
