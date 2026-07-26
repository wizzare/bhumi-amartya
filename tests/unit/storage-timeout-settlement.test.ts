import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { settleWithTimeout } from "../../lib/storage/settleWithTimeout.ts";

type Timer = { callback: () => void; cleared: boolean };

function createClock() {
  const timers: Timer[] = [];
  return {
    api: {
      setTimeout(callback: () => void) {
        const timer = { callback, cleared: false };
        timers.push(timer);
        return timer as unknown as ReturnType<typeof setTimeout>;
      },
      clearTimeout(timer: ReturnType<typeof setTimeout>) {
        (timer as unknown as Timer).cleared = true;
      },
    },
    fireLatest() { timers[timers.length - 1]?.callback(); },
    latestCleared: () => timers[timers.length - 1]?.cleared ?? false,
  };
}

function deferred<T>() {
  let resolvePromise!: (value: T) => void;
  let rejectPromise!: (reason: unknown) => void;
  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  return { promise, resolve: resolvePromise, reject: rejectPromise };
}

async function run() {
  const resolvedClock = createClock();
  const resolved = await settleWithTimeout(Promise.resolve("primary"), 100, () => "fallback", {}, resolvedClock.api);
  assert.equal(resolved, "primary");
  assert.equal(resolvedClock.latestCleared(), true);

  const rejectedClock = createClock();
  await assert.rejects(
    settleWithTimeout(Promise.reject(new Error("primary failure")), 100, () => "fallback", {}, rejectedClock.api),
    /primary failure/,
  );
  assert.equal(rejectedClock.latestCleared(), true);

  const timeoutClock = createClock();
  const slowResolve = deferred<string>();
  const timed = settleWithTimeout(slowResolve.promise, 100, () => "fallback", {}, timeoutClock.api);
  timeoutClock.fireLatest();
  assert.equal(await timed, "fallback");
  assert.equal(timeoutClock.latestCleared(), true);
  slowResolve.resolve("late primary");
  await new Promise((resolveImmediate) => setImmediate(resolveImmediate));

  let unhandledRejection = false;
  const onUnhandledRejection = () => { unhandledRejection = true; };
  process.once("unhandledRejection", onUnhandledRejection);
  const lateRejectClock = createClock();
  const slowReject = deferred<string>();
  const lateRejected = settleWithTimeout(slowReject.promise, 100, async () => "async fallback", {}, lateRejectClock.api);
  lateRejectClock.fireLatest();
  assert.equal(await lateRejected, "async fallback");
  slowReject.reject(new Error("late rejection is consumed"));
  await new Promise((resolveImmediate) => setImmediate(resolveImmediate));
  process.removeListener("unhandledRejection", onUnhandledRejection);
  assert.equal(unhandledRejection, false);

  const fallbackRejectClock = createClock();
  const never = deferred<string>();
  const fallbackRejected = settleWithTimeout(
    never.promise,
    100,
    async () => { throw new Error("fallback failure"); },
    {},
    fallbackRejectClock.api,
  );
  fallbackRejectClock.fireLatest();
  await assert.rejects(fallbackRejected, /fallback failure/);

  const missingClock = createClock();
  assert.equal(await settleWithTimeout(Promise.resolve(null), 100, () => "fallback", {}, missingClock.api), null);

  let timeoutEvents = 0;
  const duplicateClock = createClock();
  const duplicatePrimary = deferred<string>();
  const duplicate = settleWithTimeout(
    duplicatePrimary.promise,
    100,
    () => "single fallback",
    { onTimeout: () => { timeoutEvents += 1; } },
    duplicateClock.api,
  );
  duplicateClock.fireLatest();
  duplicateClock.fireLatest();
  duplicatePrimary.resolve("late duplicate");
  assert.equal(await duplicate, "single fallback");
  assert.equal(timeoutEvents, 1);

  const helperSource = readFileSync(resolve("lib/storage/settleWithTimeout.ts"), "utf8");
  assert.equal(helperSource.includes("console."), false);
  assert.equal(/password|token|payload/i.test(helperSource), false);

  console.log("storage timeout settlement: 14 assertions passed");
}

void run();
