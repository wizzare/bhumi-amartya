export type ProfileLoadOutcome<T> =
  | { status: "success"; value: T; elapsedMs: number }
  | { status: "missing"; elapsedMs: number }
  | { status: "timeout"; elapsedMs: number }
  | { status: "error"; error: unknown; elapsedMs: number };

type TimerApi = {
  setTimeout: (callback: () => void, delayMs: number) => ReturnType<typeof setTimeout>;
  clearTimeout: (timer: ReturnType<typeof setTimeout>) => void;
  now: () => number;
};

const defaultTimerApi: TimerApi = {
  setTimeout: (callback, delayMs) => globalThis.setTimeout(callback, delayMs),
  clearTimeout: (timer) => globalThis.clearTimeout(timer),
  now: () => Date.now(),
};

/**
 * Settles exactly once and consumes late completions. A null profile is a
 * normal missing-profile result; a rejected operation remains observable.
 */
export function resolveProfileLoad<T>(
  operation: Promise<T | null>,
  timeoutMs: number,
  timerApi: TimerApi = defaultTimerApi,
): Promise<ProfileLoadOutcome<T>> {
  const startedAt = timerApi.now();

  return new Promise((resolve) => {
    let settled = false;
    const finish = (outcome: ProfileLoadOutcome<T>) => {
      if (settled) return;
      settled = true;
      timerApi.clearTimeout(timer);
      resolve(outcome);
    };

    const timer = timerApi.setTimeout(() => {
      finish({ status: "timeout", elapsedMs: timerApi.now() - startedAt });
    }, timeoutMs);

    operation.then(
      (value) => {
        const elapsedMs = timerApi.now() - startedAt;
        if (value === null) {
          finish({ status: "missing", elapsedMs });
          return;
        }
        finish({ status: "success", value, elapsedMs });
      },
      (error) => {
        finish({ status: "error", error, elapsedMs: timerApi.now() - startedAt });
      },
    );
  });
}

export function isCurrentAuthEffect(effectId: number, activeEffectId: number, cancelled: boolean): boolean {
  return !cancelled && effectId === activeEffectId;
}

export function isCurrentAuthInvocation(
  invocationId: number,
  activeInvocationId: number,
  cancelled: boolean,
  expectedUid: string | null,
  currentUid: string | null,
): boolean {
  return isCurrentAuthEffect(invocationId, activeInvocationId, cancelled) && expectedUid === currentUid;
}

export type CurrentAuthOperationResult<T> =
  | { status: "current"; value: T }
  | { status: "stale" };

/**
 * Starts work only for the current auth invocation and re-checks the same
 * invocation after settlement. Errors from superseded work are consumed.
 */
export async function resolveCurrentAuthOperation<T>(
  operation: () => Promise<T>,
  isCurrent: () => boolean,
): Promise<CurrentAuthOperationResult<T>> {
  if (!isCurrent()) return { status: "stale" };

  try {
    const value = await operation();
    return isCurrent() ? { status: "current", value } : { status: "stale" };
  } catch (error) {
    if (!isCurrent()) return { status: "stale" };
    throw error;
  }
}
