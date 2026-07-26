export type TimeoutTimerApi = {
  setTimeout: (callback: () => void, delayMs: number) => ReturnType<typeof setTimeout>;
  clearTimeout: (timer: ReturnType<typeof setTimeout>) => void;
};

type TimeoutHooks = {
  onPrimaryResolved?: () => void;
  onPrimaryRejected?: (error: unknown) => void;
  onTimeout?: () => void;
};

const defaultTimerApi: TimeoutTimerApi = {
  setTimeout: (callback, delayMs) => globalThis.setTimeout(callback, delayMs),
  clearTimeout: (timer) => globalThis.clearTimeout(timer),
};

/** Settles once, clears its timer, and consumes late primary completions. */
export function settleWithTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  fallback: () => T | Promise<T>,
  hooks: TimeoutHooks = {},
  timerApi: TimeoutTimerApi = defaultTimerApi,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const timer = timerApi.setTimeout(() => {
      if (settled) return;
      settled = true;
      timerApi.clearTimeout(timer);
      hooks.onTimeout?.();
      Promise.resolve().then(fallback).then(resolve, reject);
    }, timeoutMs);

    operation.then(
      (value) => {
        if (settled) return;
        settled = true;
        timerApi.clearTimeout(timer);
        hooks.onPrimaryResolved?.();
        resolve(value);
      },
      (error) => {
        if (settled) return;
        settled = true;
        timerApi.clearTimeout(timer);
        hooks.onPrimaryRejected?.(error);
        reject(error);
      },
    );
  });
}
