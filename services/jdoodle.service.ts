import type {
  ExecutionResult,
  ExecutionStage,
  SupportedLanguage,
} from "@/lib/execution";

const JDOODLE_EXECUTE_URL = "https://api.jdoodle.com/v1/execute";
const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

interface JDoodleRuntime {
  language: string;
  versionIndex: string;
  version: string;
  compiled: boolean;
}

// JDoodle language codes and version indexes published on 2026-07-03.
const runtimes: Record<SupportedLanguage, JDoodleRuntime> = {
  javascript: {
    language: "nodejs",
    versionIndex: "7",
    version: "Node.js 25.8.1",
    compiled: false,
  },
  typescript: {
    language: "typescript",
    versionIndex: "1",
    version: "TypeScript 5.9.3",
    compiled: true,
  },
  python: {
    language: "python3",
    versionIndex: "6",
    version: "Python 3.14.3",
    compiled: false,
  },
  java: {
    language: "java",
    versionIndex: "6",
    version: "JDK 25.0.2",
    compiled: true,
  },
  cpp: {
    language: "cpp17",
    versionIndex: "3",
    version: "C++17 / GCC 15.2.1",
    compiled: true,
  },
};

export class JDoodleServiceError extends Error {
  constructor(
    message: string,
    public readonly httpStatus = 503,
  ) {
    super(message);
    this.name = "JDoodleServiceError";
  }
}

function getCredentials() {
  const clientId = process.env.JDOODLE_CLIENT_ID?.trim();
  const clientSecret = process.env.JDOODLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new JDoodleServiceError(
      "JDoodle is not configured. Set JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET on the server.",
      500,
    );
  }

  return { clientId, clientSecret };
}

function getRequestTimeoutMs() {
  const configured = process.env.JDOODLE_REQUEST_TIMEOUT_MS?.trim();
  if (!configured) return DEFAULT_REQUEST_TIMEOUT_MS;

  const value = Number(configured);
  if (!Number.isInteger(value) || value < 5_000 || value > 120_000) {
    throw new JDoodleServiceError(
      "JDOODLE_REQUEST_TIMEOUT_MS must be an integer from 5000 to 120000.",
      500,
    );
  }

  return value;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function booleanValue(value: unknown) {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return null;
}

function statusFor(upstreamStatus: number) {
  if (upstreamStatus === 429) return 429;
  if (upstreamStatus === 400) return 422;
  if (upstreamStatus === 401 || upstreamStatus === 403) return 500;
  if (upstreamStatus === 408) return 504;
  return 503;
}

function jdoodleError(
  upstreamStatus: number,
  detail = "",
): JDoodleServiceError {
  const safeDetail = detail.trim().slice(0, 240);
  let message = `JDoodle execution failed (${upstreamStatus}).`;

  if (upstreamStatus === 429) {
    message = "JDoodle's daily API credit limit has been reached.";
  } else if (upstreamStatus === 401 || upstreamStatus === 403) {
    message =
      "JDoodle rejected the API credentials. Verify the server-side client ID and secret.";
  } else if (upstreamStatus === 400) {
    message = "JDoodle rejected the execution request.";
  }

  return new JDoodleServiceError(
    safeDetail ? `${message} ${safeDetail}` : message,
    statusFor(upstreamStatus),
  );
}

function stage({
  output,
  succeeded,
  message,
  status,
  cpuTimeMs,
  wallTimeMs,
  memory,
}: {
  output: string;
  succeeded: boolean;
  message: string;
  status: string;
  cpuTimeMs: number | null;
  wallTimeMs: number;
  memory: number | null;
}): ExecutionStage {
  return {
    stdout: succeeded ? output : "",
    stderr: succeeded ? "" : output || message,
    output,
    code: succeeded ? 0 : 1,
    signal: null,
    status,
    message,
    cpuTime: cpuTimeMs,
    wallTime: wallTimeMs,
    memory,
  };
}

export async function executeCode(input: {
  language: SupportedLanguage;
  code: string;
  stdin?: string;
}): Promise<ExecutionResult> {
  const credentials = getCredentials();
  const runtime = runtimes[input.language];
  const requestTimeoutMs = getRequestTimeoutMs();
  const startedAt = performance.now();

  let response: Response;
  try {
    response = await fetch(JDOODLE_EXECUTE_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...credentials,
        script: input.code,
        stdin: input.stdin ?? "",
        language: runtime.language,
        versionIndex: runtime.versionIndex,
        compileOnly: false,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(requestTimeoutMs),
    });
  } catch (error) {
    throw new JDoodleServiceError(
      error instanceof Error && error.name === "TimeoutError"
        ? `JDoodle did not finish within ${requestTimeoutMs}ms.`
        : "RecallCode could not reach JDoodle.",
      error instanceof Error && error.name === "TimeoutError" ? 504 : 503,
    );
  }

  let value: unknown;
  try {
    value = await response.json();
  } catch {
    throw new JDoodleServiceError(
      `JDoodle returned a non-JSON response (${response.status}).`,
    );
  }

  const result =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : null;
  if (!result) {
    throw new JDoodleServiceError("JDoodle returned an invalid response.");
  }

  const detail = stringValue(result.error) || stringValue(result.message);
  const payloadStatus = numberValue(result.statusCode);
  const upstreamStatus =
    payloadStatus !== null ? Math.round(payloadStatus) : response.status;
  if (!response.ok || upstreamStatus >= 400) {
    throw jdoodleError(upstreamStatus, detail);
  }

  const output = stringValue(result.output);
  const timedOut = /JDoodle\s*-\s*Timeout/i.test(output);
  const compiled = booleanValue(result.isCompiled);
  const executionSuccess = booleanValue(result.isExecutionSuccess);
  const compilationStatus = numberValue(result.compilationStatus);
  const compilationFailed =
    !timedOut &&
    runtime.compiled &&
    ((compilationStatus !== null && compilationStatus !== 0) ||
      compiled === false);
  const succeeded =
    !timedOut &&
    !compilationFailed &&
    executionSuccess !== false &&
    !detail;
  const measuredRuntimeMs = Math.max(
    0,
    Math.round(performance.now() - startedAt),
  );
  const cpuSeconds = numberValue(result.cpuTime);
  const cpuTimeMs =
    cpuSeconds === null ? null : Math.max(0, Math.round(cpuSeconds * 1000));
  const memory = numberValue(result.memory);
  const message = timedOut
    ? "JDoodle timed out while running this program."
    : detail;

  return {
    language: runtime.language,
    version: runtime.version,
    compile: compilationFailed
      ? stage({
          output,
          succeeded: false,
          message,
          status: "compile_error",
          cpuTimeMs,
          wallTimeMs: measuredRuntimeMs,
          memory,
        })
      : undefined,
    run: stage({
      output: compilationFailed ? "" : output,
      succeeded,
      message,
      status: timedOut ? "timeout" : succeeded ? "completed" : "runtime_error",
      cpuTimeMs,
      wallTimeMs: measuredRuntimeMs,
      memory,
    }),
    runtimeMs: cpuTimeMs ?? measuredRuntimeMs,
  };
}

export function executionSucceeded(result: ExecutionResult) {
  return (
    (!result.compile || result.compile.code === 0) &&
    result.run.code === 0 &&
    !result.run.signal
  );
}
