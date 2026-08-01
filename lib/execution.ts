export const supportedLanguages = [
  { id: "javascript", label: "JavaScript", monaco: "javascript" },
  { id: "typescript", label: "TypeScript", monaco: "typescript" },
  { id: "python", label: "Python", monaco: "python" },
  { id: "java", label: "Java", monaco: "java" },
  { id: "cpp", label: "C++", monaco: "cpp" },
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number]["id"];

export interface ExecutionStage {
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
  compile?: ExecutionStage;
  run: ExecutionStage;
  runtimeMs: number;
}
