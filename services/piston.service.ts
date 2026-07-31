const DEFAULT_PISTON_URL = "http://127.0.0.1:2000/api/v2";
const DEFAULT_RUN_TIMEOUT_MS = 3_000;

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
  status: string | null;
  message: string;
  cpuTime: number | null;
  wallTime: number | null;
  memory: number | null;
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

export class PistonServiceError extends Error {
  constructor(
    message: string,
    public readonly httpStatus = 503,
  ) {
    super(message);
    this.name = "PistonServiceError";
  }
}

function getPistonHeaders(includeJson = false): Record<string, string> {
  const headerName = process.env.PISTON_AUTH_HEADER?.trim();
  const headerValue = process.env.PISTON_AUTH_VALUE?.trim();

  if (Boolean(headerName) !== Boolean(headerValue)) {
    throw new PistonServiceError(
      "Piston authentication is incomplete. Set both PISTON_AUTH_HEADER and PISTON_AUTH_VALUE.",
      500,
    );
  }

  return {
    ...(includeJson ? { "content-type": "application/json" } : {}),
    ...(headerName && headerValue ? { [headerName]: headerValue } : {}),
  };
}

function getRunTimeoutMs() {
  const configured = process.env.PISTON_RUN_TIMEOUT_MS?.trim();
  if (!configured) return DEFAULT_RUN_TIMEOUT_MS;

  const value = Number(configured);
  if (!Number.isInteger(value) || value < 100 || value > 5_000) {
    throw new PistonServiceError(
      "PISTON_RUN_TIMEOUT_MS must be an integer from 100 to 5000.",
      500,
    );
  }

  return value;
}

function assertExecutorConfigured(baseUrl: string) {
  let host = "";
  try {
    host = new URL(baseUrl).hostname.toLowerCase();
  } catch {
    throw new PistonServiceError(
      "PISTON_API_URL must be a valid URL that ends at the Piston API base.",
      500,
    );
  }

  if (
    (host === "emkc.org" || host.endsWith(".emkc.org")) &&
    !process.env.PISTON_AUTH_VALUE?.trim()
  ) {
    throw new PistonServiceError(
      "The EMKC Piston API requires authorization as of February 15, 2026. Point PISTON_API_URL at your self-hosted Piston instance or add the exact authorization header supplied by the endpoint operator.",
      503,
    );
  }
}

async function pistonResponseError(
  response: Response,
  action: string,
): Promise<PistonServiceError> {
  let detail = "";
  try {
    const body: unknown = await response.json();
    if (body && typeof body === "object") {
      const record = body as Record<string, unknown>;
      const candidate = record.message ?? record.error;
      if (typeof candidate === "string") detail = candidate;
    }
  } catch {
    // A non-JSON upstream response is still represented by its HTTP status.
  }

  const status = `${response.status}${
    response.statusText ? ` ${response.statusText}` : ""
  }`;
  const suffix = detail ? ` ${detail.slice(0, 240)}` : "";
  return new PistonServiceError(
    `Piston ${action} failed (${status}).${suffix}`,
    response.status === 429 ? 429 : 503,
  );
}

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
    status: typeof stage.status === "string" ? stage.status : null,
    message: typeof stage.message === "string" ? stage.message : "",
    cpuTime: typeof stage.cpu_time === "number" ? stage.cpu_time : null,
    wallTime: typeof stage.wall_time === "number" ? stage.wall_time : null,
    memory: typeof stage.memory === "number" ? stage.memory : null,
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
  assertExecutorConfigured(baseUrl);
  const headers = getPistonHeaders();
  const runTimeoutMs = getRunTimeoutMs();
  const aliases = runtimeAliases[input.language];

  let runtimesResponse: Response;
  try {
    runtimesResponse = await fetch(`${baseUrl}/runtimes`, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
  } catch (error) {
    throw new PistonServiceError(
      error instanceof Error && error.name === "TimeoutError"
        ? "Piston did not return its runtime list within 12 seconds."
        : "RecallCode could not reach the configured Piston service.",
    );
  }
  if (!runtimesResponse.ok) {
    throw await pistonResponseError(runtimesResponse, "runtime lookup");
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
    throw new PistonServiceError(
      `${input.language} is not installed on the configured executor.`,
      422,
    );
  }

  const startedAt = performance.now();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/execute`, {
      method: "POST",
      headers: getPistonHeaders(true),
      body: JSON.stringify({
        language: runtime.language,
        version: runtime.version,
        files: [
          {
            name: filenameFor(input.language),
            content: input.code,
          },
        ],
        stdin: input.stdin ?? "",
        compile_timeout: 10_000,
        run_timeout: runTimeoutMs,
        compile_cpu_time: 10_000,
        run_cpu_time: runTimeoutMs,
        compile_memory_limit: 512_000_000,
        run_memory_limit: 256_000_000,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    throw new PistonServiceError(
      error instanceof Error && error.name === "TimeoutError"
        ? "Code execution exceeded the 20-second upstream limit."
        : "RecallCode could not reach the configured Piston service.",
    );
  }

  if (!response.ok) {
    throw await pistonResponseError(response, "execution");
  }

  const value: unknown = await response.json();
  if (!value || typeof value !== "object") {
    throw new Error("The executor returned an invalid response.");
  }
  const result = value as Record<string, unknown>;
  const run = normalizeStage(result.run);
  const measuredRuntimeMs = Math.round(performance.now() - startedAt);

  return {
    language:
      typeof result.language === "string" ? result.language : runtime.language,
    version:
      typeof result.version === "string" ? result.version : runtime.version,
    compile: result.compile ? normalizeStage(result.compile) : undefined,
    run,
    runtimeMs:
      run.wallTime !== null ? Math.max(0, Math.round(run.wallTime)) : measuredRuntimeMs,
  };
}

function filenameFor(language: SupportedLanguage) {
  const extensions: Record<SupportedLanguage, string> = {
    javascript: "js",
    typescript: "ts",
    python: "py",
    java: "java",
    cpp: "cpp",
  };
  return language === "java" ? "Main.java" : `main.${extensions[language]}`;
}

export function executionSucceeded(result: ExecutionResult) {
  return (
    (!result.compile || result.compile.code === 0) &&
    result.run.code === 0 &&
    !result.run.signal
  );
}
