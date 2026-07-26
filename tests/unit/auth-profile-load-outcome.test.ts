import assert from "node:assert";
import {
  isCurrentAuthEffect,
  isCurrentAuthInvocation,
  resolveCurrentAuthOperation,
  resolveProfileLoad,
} from "../../lib/auth/profileLoadOutcome.ts";

type Timer = { callback: () => void; cleared: boolean };

function createClock() {
  let now = 0;
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
      now: () => now,
    },
    advance(milliseconds: number) { now += milliseconds; },
    fireLatest() { timers[timers.length - 1]?.callback(); },
    latestCleared: () => timers[timers.length - 1]?.cleared ?? false,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

async function run() {
  const successClock = createClock();
  const success = await resolveProfileLoad(Promise.resolve({ uid: "u1" }), 5000, successClock.api);
  assert.deepStrictEqual(success.status, "success");
  assert.strictEqual(successClock.latestCleared(), true);

  const missingClock = createClock();
  const missing = await resolveProfileLoad(Promise.resolve(null), 5000, missingClock.api);
  assert.strictEqual(missing.status, "missing");
  assert.strictEqual(missingClock.latestCleared(), true);

  const rejectedClock = createClock();
  const rejected = await resolveProfileLoad(Promise.reject(new Error("permission-denied")), 5000, rejectedClock.api);
  assert.strictEqual(rejected.status, "error");
  assert.strictEqual(rejectedClock.latestCleared(), true);

  const timeoutClock = createClock();
  const slow = deferred<{ uid: string } | null>();
  const timed = resolveProfileLoad(slow.promise, 5000, timeoutClock.api);
  timeoutClock.advance(5000);
  timeoutClock.fireLatest();
  const timeout = await timed;
  assert.strictEqual(timeout.status, "timeout");
  let unhandledRejection = false;
  const onUnhandledRejection = () => { unhandledRejection = true; };
  process.once("unhandledRejection", onUnhandledRejection);
  slow.reject(new Error("late failure is consumed"));
  await new Promise((resolve) => setImmediate(resolve));
  assert.strictEqual(unhandledRejection, false);

  assert.strictEqual(isCurrentAuthEffect(2, 2, false), true);
  assert.strictEqual(isCurrentAuthEffect(1, 2, false), false);
  assert.strictEqual(isCurrentAuthEffect(2, 2, true), false);
  const strictModeUpdateCandidates = [1, 2].filter((effectId) => isCurrentAuthEffect(effectId, 2, false));
  assert.deepStrictEqual(strictModeUpdateCandidates, [2]);

  let activeInvocationId = 1;
  let currentUid: string | null = "uid-a";
  let cancelled = false;
  const isUidACurrent = () => isCurrentAuthInvocation(1, activeInvocationId, cancelled, "uid-a", currentUid);

  const uidALateRead = deferred<{ uid: string }>();
  const guardedUidARead = resolveCurrentAuthOperation(() => uidALateRead.promise, isUidACurrent);
  activeInvocationId = 2;
  currentUid = "uid-b";
  uidALateRead.resolve({ uid: "uid-a" });
  assert.strictEqual((await guardedUidARead).status, "stale");

  activeInvocationId = 3;
  currentUid = "uid-a";
  const uidALateError = deferred<{ uid: string }>();
  const guardedUidAError = resolveCurrentAuthOperation(() => uidALateError.promise, () =>
    isCurrentAuthInvocation(3, activeInvocationId, cancelled, "uid-a", currentUid));
  activeInvocationId = 4;
  currentUid = "uid-b";
  uidALateError.reject(new Error("stale uid-a error"));
  assert.strictEqual((await guardedUidAError).status, "stale");

  activeInvocationId = 5;
  currentUid = "uid-a";
  const uidALateSave = deferred<boolean>();
  const guardedUidASave = resolveCurrentAuthOperation(() => uidALateSave.promise, () =>
    isCurrentAuthInvocation(5, activeInvocationId, cancelled, "uid-a", currentUid));
  activeInvocationId = 6;
  currentUid = "uid-b";
  uidALateSave.resolve(true);
  assert.strictEqual((await guardedUidASave).status, "stale");

  activeInvocationId = 7;
  currentUid = "uid-a";
  const logoutPendingLoad = deferred<{ uid: string }>();
  const guardedLogoutLoad = resolveCurrentAuthOperation(() => logoutPendingLoad.promise, () =>
    isCurrentAuthInvocation(7, activeInvocationId, cancelled, "uid-a", currentUid));
  activeInvocationId = 8;
  currentUid = null;
  logoutPendingLoad.resolve({ uid: "uid-a" });
  assert.strictEqual((await guardedLogoutLoad).status, "stale");

  activeInvocationId = 9;
  currentUid = "uid-b";
  const uidBResult = await resolveCurrentAuthOperation(
    () => Promise.resolve({ uid: "uid-b" }),
    () => isCurrentAuthInvocation(9, activeInvocationId, cancelled, "uid-b", currentUid),
  );
  assert.strictEqual(uidBResult.status, "current");
  assert.deepStrictEqual(uidBResult.status === "current" ? uidBResult.value : null, { uid: "uid-b" });
  assert.strictEqual(isCurrentAuthInvocation(8, 8, false, "uid-a", "uid-b"), false);

  console.log("auth profile load outcome: 19 assertions passed");
}

void run();
