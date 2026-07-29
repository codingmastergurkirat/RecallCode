const DEFAULT_PISTON_URL = "https://emkc.org/api/v2/piston";

export const supportedLanguages = [
  { id: "javascript", label: "JavaScript", monaco: "javascript" },
  { id: "typescript", label: "TypeScript", monaco: "typescript" },
  { id: "python", label: "Python", monaco: "python" },
  { id: "java", label: "Java", monaco: "java" },
  { id: "cpp", label: "C++", monaco: "cpp" },
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number]["id"];

interface Runtime {
  language: string;
  version: string;
  aliases: string[];
}

interface PistonStage {
  stdout: string;
  stderr: string;
  output: string;
  code: number | null;
  signal: string | null;
}

export interface ExecutionResult {
  language: string;
  version: string;
  compile?: PistonStage;
  run: PistonStage;
  runtimeMs: number;
}

const runtimeAliases: Record<SupportedLanguage, string[]> = {
  javascript: ["javascript", "js", "node"],
  typescript: ["typescript", "ts"],
  python: ["python", "python3", "py"],
  java: ["java"],
  cpp: ["c++", "cpp", "gcc"],
};

function isRuntime(value: unknown): value is Runtime {
  if (!value || typeof value !== "object") return false;
  const runtime = value as Record<string, unknown>;
  return (
    typeof runtime.language === "string" &&
    typeof runtime.version === "string" &&
    Array.isArray(runtime.aliases)
  );
}

function normalizeStage(value: unknown): PistonStage {
  const stage =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  return {
    stdout: typeof stage.stdout === "string" ? stage.stdout : "",
    stderr: typeof stage.stderr === "string" ? stage.stderr : "",
    output: typeof stage.output === "string" ? stage.output : "",
    code: typeof stage.code === "number" ? stage.code : null,
    signal: typeof stage.signal === "string" ? stage.signal : null,
  };
}

export async function executeCode(input: {
  language: SupportedLanguage;
  code: string;
  stdin?: string;
}): Promise<ExecutionResult> {
  const baseUrl = (
    process.env.PISTON_API_URL ?? DEFAULT_PISTON_URL
  ).replace(/\/$/, "");
  const aliases = runtimeAliases[input.language];

  const runtimesResponse = await fetch(`${baseUrl}/runtimes`, {
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  if (!runtimesResponse.ok) {
    throw new Error("The code execution service is unavailable.");
  }
  const runtimesValue: unknown = await runtimesResponse.json();
  const runtimes = Array.isArray(runtimesValue)
    ? runtimesValue.filter(isRuntime)
    : [];
  const runtime = runtimes.find((candidate) => {
    const names = [candidate.language, ...candidate.aliases].map((name) =>
      name.toLowerCase(),
    );
    return aliases.some((alias) => names.includes(alias));
  });

  if (!runtime) {
    throw new Error(`${input.language} is not available on the executor.`);
  }

  const startedAt = performance.now();
  const response = await fetch(`${baseUrl}/execute`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      language: runtime.language,
      version: runtime.version,
      files: [{ name: `main.${extensionFor(input.language)}`, content: input.code }],
      stdin: input.stdin ?? "",
      compile_timeout: 10_000,
      run_timeout: 5_000,
      compile_memory_limit: 512_000_000,
      run_memory_limit: 256_000_000,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });

  const runtimeMs = Math.round(performance.now() - startedAt);
  if (!response.ok) {
    throw new Error("Code execution failed. Please try again.");
  }

  const value: unknown = await response.json();
  if (!value || typeof value !== "object") {
    throw new Error("The executor returned an invalid response.");
  }
  const result = value as Record<string, unknown>;

  return {
    language:
      typeof result.language === "string" ? result.language : runtime.language,
    version:
      typeof result.version === "string" ? result.version : runtime.version,
    compile: result.compile ? normalizeStage(result.compile) : undefined,
    run: normalizeStage(result.run),
    runtimeMs,
  };
}

function extensionFor(language: SupportedLanguage) {
  const extensions: Record<SupportedLanguage, string> = {
    javascript: "js",
    typescript: "ts",
    python: "py",
    java: "java",
    cpp: "cpp",
  };
  return extensions[language];
}

export function executionSucceeded(result: ExecutionResult) {
  return (
    (!result.compile || result.compile.code === 0) &&
    result.run.code === 0 &&
    !result.run.signal
  );
}
