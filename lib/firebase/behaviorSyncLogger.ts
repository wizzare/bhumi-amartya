export type BehaviorSyncContext =
  | "recordRecommended"
  | "recordCompleted"
  | "loadMemory"
  | "ensureExists";

export interface BehaviorSyncFailure {
  context: BehaviorSyncContext;
  uid: string;
  timestamp: string;
  errorCode?: string;
  errorMessage: string;
}

const LOCAL_STORAGE_KEY = "bhumi.behaviorSyncFailures";
const MAX_STORED_FAILURES = 20;

function getErrorDetails(error: unknown): { errorCode?: string; errorMessage: string } {
  if (typeof error === "object" && error !== null) {
    const e = error as { code?: unknown; message?: unknown };
    return {
      errorCode: typeof e.code === "string" ? e.code : undefined,
      errorMessage: typeof e.message === "string" ? e.message : String(error),
    };
  }
  return { errorMessage: String(error) };
}

export function logBehaviorSyncFailure(
  context: BehaviorSyncContext,
  uid: string,
  error: unknown
): void {
  const { errorCode, errorMessage } = getErrorDetails(error);

  const failure: BehaviorSyncFailure = {
    context,
    uid,
    timestamp: new Date().toISOString(),
    errorCode,
    errorMessage,
  };

  console.warn("[BehaviorSync] Non-critical write failure", failure);

  if (
    process.env.NODE_ENV !== "production" &&
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  ) {
    try {
      const existing = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      const failures: BehaviorSyncFailure[] = existing ? JSON.parse(existing) : [];
      failures.push(failure);
      const bounded = failures.slice(-MAX_STORED_FAILURES);
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bounded));
    } catch {
      // silent
    }
  }
}
