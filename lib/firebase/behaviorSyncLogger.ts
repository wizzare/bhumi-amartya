export type BehaviorSyncContext =
  | "recordRecommended"
  | "recordCompleted"
  | "loadMemory"
  | "ensureExists";

export interface BehaviorSyncFailure {
  context: BehaviorSyncContext;
  timestamp: string;
  errorCode?: string;
  errorMessage?: string;
}

const LOCAL_STORAGE_KEY = "bhumi.behaviorSyncFailures";
const MAX_STORED_FAILURES = 20;
const MAX_MSG_LENGTH = 100;

function sanitizeErrorMessage(msg: string): string {
  if (!msg) return "";
  let clean = msg.split("\n")[0] || "";
  clean = clean.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED_EMAIL]");
  clean = clean.replace(/([a-zA-Z]:\\[^\s]+|\/[^\s]+\/[^\s]+)/g, "[REDACTED_PATH]");
  clean = clean.replace(/(?:token|key|secret|auth|bearer)=([^&\s]+)/gi, "token=[REDACTED_TOKEN]");
  if (clean.length > MAX_MSG_LENGTH) {
    clean = clean.slice(0, MAX_MSG_LENGTH) + "...";
  }
  return clean.trim();
}

function getErrorDetails(error: unknown): { errorCode?: string; errorMessage: string } {
  if (typeof error === "object" && error !== null) {
    const e = error as { code?: unknown; message?: unknown };
    const code = typeof e.code === "string" ? e.code : undefined;
    const rawMsg = typeof e.message === "string" ? e.message : String(error);
    return {
      errorCode: code,
      errorMessage: sanitizeErrorMessage(rawMsg),
    };
  }
  return { errorMessage: sanitizeErrorMessage(String(error)) };
}

export function logBehaviorSyncFailure(
  context: BehaviorSyncContext,
  _uid: string,
  error: unknown
): void {
  try {
    const isProd = process.env.NODE_ENV === "production";
    const { errorCode, errorMessage } = getErrorDetails(error);

    const failurePayload: BehaviorSyncFailure = {
      context,
      timestamp: new Date().toISOString(),
      errorCode,
      ...(isProd ? {} : { errorMessage }),
    };

    console.warn("[BehaviorSync] Non-critical write failure", failurePayload);

    if (
      !isProd &&
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    ) {
      try {
        const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        let failures: BehaviorSyncFailure[] = [];
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              failures = parsed;
            }
          } catch {
            failures = [];
          }
        }
        failures.push(failurePayload);
        const bounded = failures.slice(-MAX_STORED_FAILURES);
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bounded));
      } catch {
        // localStorage unavailable or threw error — silent
      }
    }
  } catch {
    // Failure isolation — never throw under any condition
  }
}
