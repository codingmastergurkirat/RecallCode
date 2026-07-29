"use client";

import {
  AlertCircle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Code2,
  ExternalLink,
  Lightbulb,
  MessageCircle,
  Play,
  Send,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import type { LearningPack } from "@/services/ai.service";
import {
  supportedLanguages,
  type ExecutionResult,
  type SupportedLanguage,
} from "@/services/piston.service";
import type { Json, Question } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CodeEditor } from "./code-editor";

const starters: Record<SupportedLanguage, string> = {
  javascript: `function solve(input) {
  // Parse input and implement your approach.
  return input;
}

const input = require("fs").readFileSync(0, "utf8").trim();
console.log(solve(input));`,
  typescript: `function solve(input: string): string {
  // Parse input and implement your approach.
  return input;
}

const input = require("fs").readFileSync(0, "utf8").trim();
console.log(solve(input));`,
  python: `import sys

def solve(data: str) -> str:
    # Parse input and implement your approach.
    return data

print(solve(sys.stdin.read().strip()))`,
  java: `import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        String input = new String(System.in.readAllBytes()).trim();
        // Parse input and implement your approach.
        System.out.println(input);
    }
}`,
  cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string input((istreambuf_iterator<char>(cin)), {});
    // Parse input and implement your approach.
    cout << input;
    return 0;
}`,
};

interface ExistingFeedback {
  feedback: string;
  mistakes: Json;
  better_solution: string;
  time_complexity: string;
  space_complexity: string;
  interview_tips: Json;
  similar_questions: Json;
  provider: string;
  model: string;
  created_at: string;
}

function outputFrom(result: ExecutionResult) {
  const compileOutput =
    result.compile?.output?.trim() || result.compile?.message?.trim();
  const runOutput = result.run.output?.trim() || result.run.message?.trim();
  if (compileOutput) return compileOutput;
  if (runOutput) return runOutput;
  return "Program finished with no output.";
}

function jsonStrings(value: Json): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function ProblemWorkspace({
  question,
  existingFeedback,
  recallCount,
  flashcardCount,
}: {
  question: Question;
  existingFeedback: ExistingFeedback | null;
  recallCount: number;
  flashcardCount: number;
}) {
  const [language, setLanguage] = useState<SupportedLanguage>("javascript");
  const [codeByLanguage, setCodeByLanguage] =
    useState<Record<SupportedLanguage, string>>(starters);
  const [stdin, setStdin] = useState("");
  const [running, setRunning] = useState<"run" | "submit" | null>(null);
  const [execution, setExecution] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [learningPack, setLearningPack] = useState<LearningPack | null>(null);
  const [leftTab, setLeftTab] = useState<"problem" | "feedback" | "tutor">(
    existingFeedback ? "feedback" : "problem",
  );
  const [tutorQuestion, setTutorQuestion] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorReply, setTutorReply] = useState<string | null>(null);
  const relationship = question.patterns;
  const pattern = Array.isArray(relationship)
    ? relationship[0]
    : relationship;
  const selectedLanguage = supportedLanguages.find(
    (item) => item.id === language,
  )!;
  const feedback = useMemo(() => {
    if (learningPack) {
      return {
        feedback: learningPack.feedback,
        mistakes: learningPack.mistakes,
        better_solution: learningPack.better_solution,
        time_complexity: learningPack.time_complexity,
        space_complexity: learningPack.space_complexity,
        interview_tips: learningPack.interview_tips,
      };
    }
    if (existingFeedback) {
      return {
        ...existingFeedback,
        mistakes: jsonStrings(existingFeedback.mistakes),
        interview_tips: jsonStrings(existingFeedback.interview_tips),
      };
    }
    return null;
  }, [existingFeedback, learningPack]);

  async function execute(mode: "run" | "submit") {
    setRunning(mode);
    setError(null);
    setWarning(null);
    try {
      const response = await fetch(
        mode === "run" ? "/api/execute" : "/api/submissions",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ...(mode === "submit" ? { questionId: question.id } : {}),
            language,
            code: codeByLanguage[language],
            stdin,
          }),
        },
      );
      const value: unknown = await response.json();
      if (!value || typeof value !== "object") {
        throw new Error("The server returned an invalid response.");
      }
      const result = value as {
        error?: string;
        result?: ExecutionResult;
        execution?: ExecutionResult;
        warning?: string | null;
        learningPack?: { data: LearningPack } | null;
        submission?: { status: string };
      };
      if (!response.ok) throw new Error(result.error ?? "Request failed.");
      const nextExecution = result.result ?? result.execution;
      if (nextExecution) setExecution(nextExecution);
      if (result.warning) setWarning(result.warning);
      if (result.learningPack?.data) {
        setLearningPack(result.learningPack.data);
        setLeftTab("feedback");
      } else if (mode === "submit" && result.submission?.status === "accepted") {
        setLeftTab("feedback");
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Request failed.",
      );
    } finally {
      setRunning(null);
    }
  }

  async function handleTutor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTutorLoading(true);
    setError(null);
    setTutorReply(null);
    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          language,
          code: codeByLanguage[language],
          question: tutorQuestion,
        }),
      });
      const value: unknown = await response.json();
      if (!value || typeof value !== "object") throw new Error("Invalid response.");
      const result = value as { data?: string; error?: string };
      if (!response.ok || !result.data) {
        throw new Error(result.error ?? "The tutor could not respond.");
      }
      setTutorReply(result.data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Tutor request failed.",
      );
    } finally {
      setTutorLoading(false);
    }
  }

  return (
    <div className="workspace-page">
      <header className="workspace-header">
        <div>
          <Link href="/problems" className="workspace-back">
            <ArrowLeft size={16} /> Problems
          </Link>
          <span className={`difficulty difficulty-${question.difficulty.toLowerCase()}`}>
            {question.difficulty}
          </span>
          <span>{pattern?.name ?? "General"}</span>
        </div>
        <div className="workspace-title">
          <h1>{question.title}</h1>
          <span>
            <Clock3 size={14} /> {question.estimated_time} min
          </span>
        </div>
        <a
          className="button button-secondary button-sm"
          href={question.leetcode_url}
          target="_blank"
          rel="noreferrer"
        >
          Original prompt <ExternalLink size={15} />
        </a>
      </header>

      <div className="workspace-grid">
        <section className="workspace-context">
          <div className="workspace-tabs" role="tablist">
            <button
              className={leftTab === "problem" ? "active" : ""}
              onClick={() => setLeftTab("problem")}
              type="button"
              role="tab"
            >
              Problem
            </button>
            <button
              className={leftTab === "feedback" ? "active" : ""}
              onClick={() => setLeftTab("feedback")}
              type="button"
              role="tab"
            >
              Feedback
              {feedback ? <i /> : null}
            </button>
            <button
              className={leftTab === "tutor" ? "active" : ""}
              onClick={() => setLeftTab("tutor")}
              type="button"
              role="tab"
            >
              AI Tutor
            </button>
          </div>

          <div className="workspace-panel">
            {leftTab === "problem" ? (
              <div className="problem-detail">
                <span className="page-kicker">{question.topic}</span>
                <h2>Practice the {pattern?.name ?? "core"} pattern.</h2>
                <p>
                  RecallCode stores metadata only. Read the licensed prompt at
                  the source, then solve here without copying the statement.
                </p>
                <a
                  className="problem-source-link"
                  href={question.leetcode_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open problem on LeetCode <ExternalLink size={16} />
                </a>

                <div className="problem-meta-grid">
                  <div>
                    <span>Pattern</span>
                    <strong>{pattern?.name ?? "General"}</strong>
                  </div>
                  <div>
                    <span>Target time</span>
                    <strong>{question.estimated_time} min</strong>
                  </div>
                  <div>
                    <span>Recall prompts</span>
                    <strong>{recallCount}</strong>
                  </div>
                  <div>
                    <span>Flashcards</span>
                    <strong>{flashcardCount}</strong>
                  </div>
                </div>

                <div className="problem-tags">
                  {question.tags.map((tag) => (
                    <span key={tag}>{tag.replaceAll("-", " ")}</span>
                  ))}
                </div>

                <div className="problem-hints">
                  <div>
                    <Lightbulb size={17} />
                    <strong>Recall before coding</strong>
                  </div>
                  <p>
                    Name the state you must maintain. Then state the invariant
                    that should remain true after each step.
                  </p>
                </div>
              </div>
            ) : null}

            {leftTab === "feedback" ? (
              feedback ? (
                <div className="feedback-panel">
                  <div className="feedback-success">
                    <CheckCircle2 size={20} />
                    <div>
                      <strong>Learning pack ready</strong>
                      <span>
                        Generated from your successful execution.
                      </span>
                    </div>
                  </div>
                  <section>
                    <span className="page-kicker">APPROACH FEEDBACK</span>
                    <p>{feedback.feedback}</p>
                  </section>
                  <div className="complexity-grid">
                    <div>
                      <span>Time</span>
                      <strong>{feedback.time_complexity}</strong>
                    </div>
                    <div>
                      <span>Space</span>
                      <strong>{feedback.space_complexity}</strong>
                    </div>
                  </div>
                  {feedback.mistakes.length ? (
                    <section>
                      <span className="page-kicker">WATCH FOR</span>
                      <ul>
                        {feedback.mistakes.map((mistake) => (
                          <li key={mistake}>{mistake}</li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                  <section>
                    <span className="page-kicker">BETTER SOLUTION</span>
                    <p>{feedback.better_solution}</p>
                  </section>
                  <section>
                    <span className="page-kicker">INTERVIEW TIPS</span>
                    <ul>
                      {feedback.interview_tips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </section>
                  <div className="feedback-actions">
                    <Link
                      className="button button-primary button-sm"
                      href="/flashcards"
                    >
                      Review flashcards
                    </Link>
                    <Link
                      className="button button-secondary button-sm"
                      href="/reviews"
                    >
                      Active recall
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="workspace-empty">
                  <Sparkles size={24} />
                  <h2>Your feedback starts after a successful run.</h2>
                  <p>
                    Submit working code to generate analysis, flashcards, and
                    recall questions.
                  </p>
                </div>
              )
            ) : null}

            {leftTab === "tutor" ? (
              <div className="tutor-panel">
                <div className="tutor-intro">
                  <div>
                    <Brain size={21} />
                  </div>
                  <h2>Ask for a nudge, not a giveaway.</h2>
                  <p>
                    The tutor reads your current code and starts with the
                    smallest useful hint.
                  </p>
                </div>
                <form onSubmit={handleTutor}>
                  <label>
                    <span>What are you stuck on?</span>
                    <textarea
                      value={tutorQuestion}
                      onChange={(event) => setTutorQuestion(event.target.value)}
                      placeholder="Why does my window fail when duplicates appear?"
                      minLength={2}
                      maxLength={1000}
                      required
                    />
                  </label>
                  <Button type="submit" disabled={tutorLoading}>
                    {tutorLoading ? <Spinner label="Asking tutor" /> : <Send size={16} />}
                    Ask tutor
                  </Button>
                </form>
                {tutorReply ? (
                  <div className="tutor-reply">
                    <span>
                      <MessageCircle size={16} /> Tutor
                    </span>
                    <p>{tutorReply}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {error ? (
              <div className="workspace-error">
                <AlertCircle size={17} />
                {error}
              </div>
            ) : null}
          </div>
        </section>

        <section className="workspace-editor">
          <div className="editor-toolbar">
            <label className="language-select">
              <Code2 size={16} />
              <select
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as SupportedLanguage)
                }
              >
                {supportedLanguages.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} />
            </label>
            <div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => execute("run")}
                disabled={Boolean(running)}
              >
                {running === "run" ? <Spinner label="Running code" /> : <Play size={15} />}
                Run
              </Button>
              <Button
                size="sm"
                onClick={() => execute("submit")}
                disabled={Boolean(running)}
              >
                {running === "submit" ? (
                  <Spinner label="Submitting code" />
                ) : (
                  <Sparkles size={15} />
                )}
                Submit & learn
              </Button>
            </div>
          </div>
          <div className="editor-surface">
            <CodeEditor
              language={selectedLanguage.monaco}
              value={codeByLanguage[language]}
              onChange={(value) =>
                setCodeByLanguage((current) => ({
                  ...current,
                  [language]: value,
                }))
              }
            />
          </div>
          <div className="console-panel">
            <div className="console-heading">
              <span>
                <TerminalSquare size={16} /> Console
              </span>
              {execution ? (
                <small>
                  {execution.language} {execution.version} · {execution.runtimeMs}ms
                </small>
              ) : null}
            </div>
            <div className="console-body">
              <label>
                <span>Standard input</span>
                <textarea
                  value={stdin}
                  onChange={(event) => setStdin(event.target.value)}
                  placeholder="Optional input passed to stdin"
                  maxLength={10_000}
                />
              </label>
              <div>
                <span>Output</span>
                <pre>
                  {running
                    ? "Running…"
                    : execution
                      ? outputFrom(execution)
                      : "Run your code to see output."}
                </pre>
              </div>
            </div>
            {warning ? (
              <div className="console-warning">
                <AlertCircle size={16} />
                Code was saved, but the learning pack needs attention: {warning}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
