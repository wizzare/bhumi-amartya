import { randomUUID } from "node:crypto";
import { mapSafeAuthError, type SafeAuthErrorMapping } from "./accessDiagnostics";

export type VerifierStage =
  | "VERIFY_ID_TOKEN"
  | "GOOGLE_AUTH"
  | "FETCH_SUBSCRIPTION"
  | "VOIDED_CHECK"
  | "PERSIST_ENTITLEMENT"
  | "ACKNOWLEDGE"
  | "TOTAL_DURATION";

export const VERIFY_ID_TOKEN_TIMEOUT_MS = 2500;
export const GOOGLE_AUTH_TIMEOUT_MS = 2500;
export const FETCH_ATTEMPT_TIMEOUT_MS = 4000;
export const FETCH_RETRY_DELAY_MS = 150;
export const FETCH_SUBSCRIPTION_MAX_MS = (2 * FETCH_ATTEMPT_TIMEOUT_MS) + FETCH_RETRY_DELAY_MS;
export const VOIDED_CHECK_TIMEOUT_MS = 2500;
export const PERSIST_ENTITLEMENT_TIMEOUT_MS = 4000;
export const ACKNOWLEDGE_TIMEOUT_MS = 3000;
export const ACK_MARK_TIMEOUT_MS = 2000;
export const TOTAL_REQUEST_BUDGET_MS = 26000;
export const WORST_CASE_REQUEST_MS = VERIFY_ID_TOKEN_TIMEOUT_MS + GOOGLE_AUTH_TIMEOUT_MS
  + FETCH_SUBSCRIPTION_MAX_MS + VOIDED_CHECK_TIMEOUT_MS
  + PERSIST_ENTITLEMENT_TIMEOUT_MS + ACKNOWLEDGE_TIMEOUT_MS + ACK_MARK_TIMEOUT_MS;

export type StageLogContext = { correlationId: string; totalStartedAt: number };

export class StageTimeoutError extends Error {
  constructor(public readonly stage: VerifierStage) { super(`${stage}_TIMEOUT`); this.name = "StageTimeoutError"; }
}

export function correlationId() { return randomUUID(); }

export function safeErrorCategory(error: unknown) {
  if (error instanceof StageTimeoutError) return "timeout";
  const message = error instanceof Error ? error.message : "";
  if (/^TOKEN_INVALID$|^PRODUCT_MISMATCH$/.test(message)) return "permanent_provider_error";
  if (/GOOGLE_API_FAILURE|ACKNOWLEDGMENT_FAILURE/.test(message)) return "provider_error";
  if (/AUTH_INVALID/.test(message)) return "auth_invalid";
  return "unexpected_error";
}

export function mapAuthVerificationError(error: unknown) {
  const mapped = mapSafeAuthError(error);
  return { status: mapped.status, error: mapped.code, retryable: mapped.retryable } as const;
}

export function logSafeAuthVerification(context: StageLogContext, stageStartedAt: number, mapped: SafeAuthErrorMapping) {
  console.info("[BILLING_VERIFIER_STAGE]", {
    correlationId: context.correlationId,
    stage: "VERIFY_ID_TOKEN",
    safeAuthCode: mapped.code,
    safeErrorNameCategory: mapped.safeErrorNameCategory,
    stageDurationMs: Date.now() - stageStartedAt,
    totalDurationMs: Date.now() - context.totalStartedAt,
  });
}

export async function withTimeout<T>(stage: VerifierStage, timeoutMs: number, work: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([work, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new StageTimeoutError(stage)), timeoutMs); })]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function logStage(context: StageLogContext, stage: VerifierStage, stageStartedAt: number, retryCount = 0, error?: unknown) {
  const payload = {
    correlationId: context.correlationId,
    stage,
    stageDurationMs: Date.now() - stageStartedAt,
    totalDurationMs: Date.now() - context.totalStartedAt,
    retryCount,
    safeErrorCategory: error ? safeErrorCategory(error) : "none",
  };
  if (error) console.error("[BILLING_VERIFIER_STAGE]", payload);
  else console.info("[BILLING_VERIFIER_STAGE]", payload);
}

export async function runStage<T>(context: StageLogContext, stage: VerifierStage, timeoutMs: number, work: Promise<T>, retryCount = 0) {
  const stageStartedAt = Date.now();
  try {
    const result = await withTimeout(stage, timeoutMs, work);
    logStage(context, stage, stageStartedAt, retryCount);
    return result;
  } catch (error) {
    logStage(context, stage, stageStartedAt, retryCount, error);
    throw error;
  }
}

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
