/**
 * HOTFIX: Bounded retry metadata for Human Design generation (no scheduler).
 * Schedules the retry lifecycle (30s → 1m → 5m → 15m → 1h) so a future
 * scheduler/cron can consume `nextRetryAt` without changing the schema.
 * All fields are optional so existing records and old clients remain compatible.
 */
export const HD_RETRY_BACKOFF_MINUTES = [0.5, 1, 5, 15, 60] as const;
export const HD_RETRY_MAX_ATTEMPTS = HD_RETRY_BACKOFF_MINUTES.length;

export type HdRetryMetadata = {
  retryCount?: number;
  lastAttempt?: string;
  nextRetryAt?: string;
  lastError?: string | null;
  lastErrorCode?: string | null;
  retryReason?: string | null;
};

export function computeNextRetryMs(attemptIndex: number, nowMs = Date.now()): number {
  const index = Math.max(0, Math.min(attemptIndex, HD_RETRY_BACKOFF_MINUTES.length - 1));
  return nowMs + HD_RETRY_BACKOFF_MINUTES[index] * 60_000;
}

export function buildHdRetryMetadata(
  failure: { code?: string; reason?: string },
  attemptIndex: number,
  nowMs = Date.now(),
): HdRetryMetadata {
  const retryCount = Math.max(0, attemptIndex);
  const nextRetryAt = new Date(computeNextRetryMs(retryCount, nowMs)).toISOString();
  return {
    retryCount,
    lastAttempt: new Date(nowMs).toISOString(),
    nextRetryAt,
    lastError: failure.reason ?? null,
    lastErrorCode: failure.code ?? null,
    retryReason: failure.reason ?? "retriable_failure",
  };
}
