export type SafeErrorMetadata = {
  errorClass: string;
  errorCode: string | null;
};

function boundedIdentifier(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const clean = value.replace(/[^A-Za-z0-9._/-]/g, "").slice(0, 80);
  return clean || fallback;
}

export function safeErrorMetadata(error: unknown): SafeErrorMetadata {
  if (!error || typeof error !== "object") return { errorClass: "Error", errorCode: null };
  const candidate = error as {
    name?: unknown;
    code?: unknown;
    message?: unknown;
    diagnostic?: { category?: unknown; code?: unknown; message?: unknown };
  };

  const errorClass = boundedIdentifier(candidate.name, "Error");
  const rawCode = candidate.code ?? candidate.diagnostic?.code;
  const errorCode = typeof rawCode === "string" || typeof rawCode === "number"
    ? boundedIdentifier(String(rawCode), "unknown")
    : null;

  return { errorClass, errorCode };
}

export function logSafeAuthError(event: string, error: unknown): void {
  console.error(event, safeErrorMetadata(error));
}

export function warnSafeAuthError(event: string, error: unknown): void {
  console.warn(event, safeErrorMetadata(error));
}
