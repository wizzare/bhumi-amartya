export const HD_UPSTREAM_TIMEOUT_MS = 15_000;
export const HD_CLIENT_TIMEOUT_MS = 25_000;

export type HdFailureCode = "endpoint_not_found" | "unauthorized" | "rate_limited" | "service_unavailable" | "connection_error" | "timeout" | "invalid_input" | "invalid_response" | "cancelled";

export class HdCommunicationError extends Error {
  constructor(public readonly code: HdFailureCode) {
    super(code);
    this.name = "HdCommunicationError";
  }
}

export function hdHttpFailure(status: number): HdFailureCode {
  if (status === 404) return "endpoint_not_found";
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 429) return "rate_limited";
  return status >= 500 ? "service_unavailable" : "invalid_input";
}

export function isHdRetryable(codeOrStatus: string | number): boolean {
  if (typeof codeOrStatus === "number") {
    return ["rate_limited", "service_unavailable", "connection_error", "timeout"].includes(hdHttpFailure(codeOrStatus));
  }
  return ["rate_limited", "service_unavailable", "connection_error", "timeout"].includes(codeOrStatus)
    || codeOrStatus === "rate_limit_exceeded";
}

export async function withHdDeadline<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > 2_147_483_647) throw new RangeError("invalid_deadline");
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let cancel = () => {};
  const deadline = new Promise<never>((_, reject) => {
    cancel = () => {
      controller.abort();
      reject(new HdCommunicationError("cancelled"));
    };
    signal?.addEventListener("abort", cancel, { once: true });
    timer = setTimeout(() => {
      controller.abort();
      reject(new HdCommunicationError("timeout"));
    }, timeoutMs);
    if (signal?.aborted) cancel();
  });
  try {
    return await Promise.race([deadline, Promise.resolve().then(() => {
      if (controller.signal.aborted) throw new HdCommunicationError("cancelled");
      return operation(controller.signal);
    })]);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", cancel);
    controller.abort();
  }
}

export async function requestHdJson(
  url: string,
  body: Record<string, unknown>,
  options: { timeoutMs?: number; signal?: AbortSignal; token?: () => Promise<string | null>; fetch?: typeof fetch } = {},
): Promise<Record<string, unknown>> {
  return withHdDeadline(async signal => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (options.token) {
      let token: string | null;
      try { token = await options.token(); } catch { throw new HdCommunicationError("unauthorized"); }
      if (signal.aborted) throw new HdCommunicationError("cancelled");
      if (!token) throw new HdCommunicationError("unauthorized");
      headers.Authorization = `Bearer ${token}`;
    }
    let response: Response;
    try {
      response = await (options.fetch ?? fetch)(url, {
        method: "POST", headers, body: JSON.stringify(body), signal, cache: "no-store",
      });
    } catch { throw new HdCommunicationError("connection_error"); }
    if (!response.ok) {
      const code = response.headers?.get("X-HD-Failure-Code");
      if (response.status >= 500 && ["invalid_response", "timeout", "connection_error"].includes(code ?? "")) {
        throw new HdCommunicationError(code as HdFailureCode);
      }
      throw new HdCommunicationError(hdHttpFailure(response.status));
    }
    let data: unknown;
    try { data = await response.json(); } catch { throw new HdCommunicationError("invalid_response"); }
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new HdCommunicationError("invalid_response");
    return data as Record<string, unknown>;
  }, options.timeoutMs ?? HD_CLIENT_TIMEOUT_MS, options.signal);
}
