export function safeInternalPath(
  value: string | null | undefined,
  fallback = "/dashboard",
) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : fallback;
}
