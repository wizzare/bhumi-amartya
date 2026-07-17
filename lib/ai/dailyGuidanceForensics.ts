import { AI_CONFIG } from "./config";

type ForensicPayload = Record<string, unknown>;

function nowMs(): number {
  return Date.now();
}

function serializeError(error: unknown): ForensicPayload {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(typeof (error as any).status !== "undefined" ? { httpStatus: (error as any).status } : {}),
      ...(typeof (error as any).code !== "undefined" ? { code: (error as any).code } : {}),
      ...(typeof (error as any).response !== "undefined" ? { response: (error as any).response } : {}),
    };
  }

  return {
    message: String(error),
    stack: new Error(String(error)).stack,
  };
}

function safeLength(value: unknown): number | null {
  if (typeof value === "string") return value.length;
  if (value === null || typeof value === "undefined") return null;
  try {
    return JSON.stringify(value).length;
  } catch {
    return null;
  }
}

export function dgStart(): number {
  return nowMs();
}

export function dgCheckpoint(
  checkpoint: string,
  startedAt: number,
  payload: ForensicPayload = {},
): void {
  console.log(`[${checkpoint}]`, {
    checkpoint,
    durationMs: nowMs() - startedAt,
    provider: "minimax",
    model: AI_CONFIG.providers.minimax.defaultModel,
    activeProvider: AI_CONFIG.activeProvider,
    minimaxEndpoint: AI_CONFIG.providers.minimax.baseUrl,
    ...payload,
  });
}

export function dgFailure(
  checkpoint: string,
  startedAt: number,
  details: {
    file: string;
    functionName: string;
    line?: number;
    error: unknown;
    input?: unknown;
    output?: unknown;
    extra?: ForensicPayload;
  },
): void {
  console.error(`[${checkpoint} FAILED]`, {
    checkpoint,
    durationMs: nowMs() - startedAt,
    file: details.file,
    function: details.functionName,
    line: details.line ?? null,
    stackTrace: serializeError(details.error).stack,
    error: serializeError(details.error),
    input: details.input,
    output: details.output,
    provider: "minimax",
    model: AI_CONFIG.providers.minimax.defaultModel,
    activeProvider: AI_CONFIG.activeProvider,
    minimaxEndpoint: AI_CONFIG.providers.minimax.baseUrl,
    inputLength: safeLength(details.input),
    outputLength: safeLength(details.output),
    ...(details.extra ?? {}),
  });
}

export function dgProviderFailure(
  checkpoint: string,
  startedAt: number,
  details: {
    file: string;
    functionName: string;
    line?: number;
    error: unknown;
    input?: unknown;
    output?: unknown;
    prompt?: string;
    rawResponse?: string;
    timeoutMs?: number;
    retryCount?: number;
    extra?: ForensicPayload;
  },
): void {
  const error = serializeError(details.error);
  console.error(`[${checkpoint} PROVIDER_FAILED]`, {
    checkpoint,
    durationMs: nowMs() - startedAt,
    file: details.file,
    function: details.functionName,
    line: details.line ?? null,
    stackTrace: error.stack,
    error,
    httpStatus: error.httpStatus ?? null,
    providerResponseBody: (error.response as any)?.body ?? (error.response as any)?.data ?? error.response ?? null,
    timeout: details.timeoutMs ?? null,
    retryCount: details.retryCount ?? null,
    input: details.input,
    output: details.output,
    rawResponse: details.rawResponse ?? null,
    provider: "minimax",
    model: AI_CONFIG.providers.minimax.defaultModel,
    activeProvider: AI_CONFIG.activeProvider,
    minimaxEndpoint: AI_CONFIG.providers.minimax.baseUrl,
    promptLength: safeLength(details.prompt),
    responseLength: safeLength(details.rawResponse),
    jsonLength: safeLength(details.rawResponse?.trim()),
    ...(details.extra ?? {}),
  });
}
