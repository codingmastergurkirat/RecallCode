import { z } from "zod";
import {
  buildLearningPackPrompt,
  LEARNING_PACK_SYSTEM_PROMPT,
  TUTOR_SYSTEM_PROMPT,
} from "@/prompts/learning-pack";

const learningPackSchema = z.object({
  feedback: z.string().min(1),
  mistakes: z.array(z.string()).max(8),
  better_solution: z.string().min(1),
  time_complexity: z.string().min(1),
  space_complexity: z.string().min(1),
  interview_tips: z.array(z.string()).max(8),
  similar_questions: z.array(z.string()).max(8),
  flashcards: z
    .array(
      z.object({
        front: z.string().min(1),
        back: z.string().min(1),
        difficulty: z.number().int().min(1).max(5),
      }),
    )
    .min(5)
    .max(10),
  active_recall: z.array(z.string().min(1)).min(4).max(6),
});

export type LearningPack = z.infer<typeof learningPackSchema>;

export interface AIResult<T> {
  data: T;
  provider: "groq" | "gemini";
  model: string;
}

interface ProviderFailure {
  provider: string;
  message: string;
}

function parseJsonObject(text: string) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1) {
    throw new Error("AI response did not contain JSON.");
  }
  return JSON.parse(cleaned.slice(first, last + 1)) as unknown;
}

async function callGroq(
  system: string,
  prompt: string,
  jsonMode: boolean,
) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured.");
  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.25,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: AbortSignal.timeout(30_000),
    },
  );
  if (!response.ok) {
    throw new Error(`Groq returned ${response.status}.`);
  }
  const value: unknown = await response.json();
  const content =
    value &&
    typeof value === "object" &&
    "choices" in value &&
    Array.isArray(value.choices) &&
    value.choices[0] &&
    typeof value.choices[0] === "object" &&
    "message" in value.choices[0] &&
    value.choices[0].message &&
    typeof value.choices[0].message === "object" &&
    "content" in value.choices[0].message &&
    typeof value.choices[0].message.content === "string"
      ? value.choices[0].message.content
      : null;
  if (!content) throw new Error("Groq returned an empty response.");
  return { content, provider: "groq" as const, model };
}

async function callGemini(system: string, prompt: string, jsonMode: boolean) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model,
    )}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.25,
          ...(jsonMode ? { responseMimeType: "application/json" } : {}),
        },
      }),
      signal: AbortSignal.timeout(30_000),
    },
  );
  if (!response.ok) {
    throw new Error(`Gemini returned ${response.status}.`);
  }
  const value: unknown = await response.json();
  const content =
    value &&
    typeof value === "object" &&
    "candidates" in value &&
    Array.isArray(value.candidates) &&
    value.candidates[0] &&
    typeof value.candidates[0] === "object" &&
    "content" in value.candidates[0] &&
    value.candidates[0].content &&
    typeof value.candidates[0].content === "object" &&
    "parts" in value.candidates[0].content &&
    Array.isArray(value.candidates[0].content.parts) &&
    value.candidates[0].content.parts[0] &&
    typeof value.candidates[0].content.parts[0] === "object" &&
    "text" in value.candidates[0].content.parts[0] &&
    typeof value.candidates[0].content.parts[0].text === "string"
      ? value.candidates[0].content.parts[0].text
      : null;
  if (!content) throw new Error("Gemini returned an empty response.");
  return { content, provider: "gemini" as const, model };
}

async function withFallback(
  system: string,
  prompt: string,
  jsonMode: boolean,
) {
  const failures: ProviderFailure[] = [];
  if (process.env.GROQ_API_KEY) {
    try {
      return await callGroq(system, prompt, jsonMode);
    } catch (error) {
      failures.push({
        provider: "Groq",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  if (process.env.GEMINI_API_KEY) {
    try {
      return await callGemini(system, prompt, jsonMode);
    } catch (error) {
      failures.push({
        provider: "Gemini",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) {
    throw new Error("Configure GROQ_API_KEY or GEMINI_API_KEY to use the AI tutor.");
  }
  throw new Error(
    `AI providers failed: ${failures
      .map((failure) => `${failure.provider} (${failure.message})`)
      .join(", ")}`,
  );
}

export async function generateLearningPack(input: {
  title: string;
  pattern: string;
  topic: string;
  language: string;
  code: string;
  output: string;
}): Promise<AIResult<LearningPack>> {
  const result = await withFallback(
    LEARNING_PACK_SYSTEM_PROMPT,
    buildLearningPackPrompt(input),
    true,
  );
  return {
    data: learningPackSchema.parse(parseJsonObject(result.content)),
    provider: result.provider,
    model: result.model,
  };
}

export async function askTutor(input: {
  title: string;
  pattern: string;
  language: string;
  code: string;
  question: string;
}): Promise<AIResult<string>> {
  const prompt = `Problem: ${input.title}
Pattern: ${input.pattern}
Language: ${input.language}
Student code:
${input.code}

Student question: ${input.question}`;
  const result = await withFallback(TUTOR_SYSTEM_PROMPT, prompt, false);
  return {
    data: result.content.trim(),
    provider: result.provider,
    model: result.model,
  };
}
