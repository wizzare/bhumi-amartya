import assert from "node:assert/strict";
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
    allCleared: () => timers.every(t => t.cleared),
    timerCount: () => timers.length,
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
  let passed = 0;

  // Test: existing document resolves with data
  {
    const clock = createClock();
    const result = await settleWithTimeout(Promise.resolve({ uid: "test", type: "user_blueprint" }), 100, () => null, {}, clock.api);
    assert.deepEqual(result, { uid: "test", type: "user_blueprint" });
    assert.ok(clock.latestCleared(), "timer cleared on primary resolve");
    passed++;
    console.log("PASS: existing blueprint resolves with data");
  }

  // Test: missing document resolves as null (not timeout)
  {
    const clock = createClock();
    const result = await settleWithTimeout(Promise.resolve(null), 100, () => "fallback", {}, clock.api);
    assert.equal(result, null);
    assert.ok(clock.latestCleared(), "timer cleared on null resolve");
    passed++;
    console.log("PASS: missing blueprint resolves as null");
  }

  // Test: timeout produces one controlled outcome (fallback)
  {
    const clock = createClock();
    const slow = deferred<unknown>();
    const timed = settleWithTimeout(slow.promise, 100, () => null, {}, clock.api);
    clock.fireLatest();
    assert.equal(await timed, null);
    assert.ok(clock.latestCleared(), "timer cleared on timeout fallback");
    slow.resolve("late primary");
    await new Promise((r) => setImmediate(r));
    passed++;
    console.log("PASS: timeout produces fallback without hanging");
  }

  // Test: stale duplicate call emits no false timeout
  {
    let timeoutEvents = 0;
    const clock1 = createClock();
    const clock2 = createClock();
    const slow1 = deferred<string>();
    const slow2 = deferred<string>();

    const first = settleWithTimeout(slow1.promise, 100, () => "first fallback", { onTimeout: () => { timeoutEvents++; } }, clock1.api);
    const second = settleWithTimeout(slow2.promise, 100, () => "second fallback", { onTimeout: () => { timeoutEvents++; } }, clock2.api);

    clock1.fireLatest();
    clock2.fireLatest();
    clock1.fireLatest();

    assert.equal(await first, "first fallback");
    assert.equal(await second, "second fallback");
    assert.equal(timeoutEvents, 2, "each call fires timeout exactly once");
    slow1.resolve("late");
    slow2.resolve("late");
    await new Promise((r) => setImmediate(r));
    passed++;
    console.log("PASS: stale duplicate calls each fire timeout exactly once");
  }

  // Test: late resolve after timeout is consumed (no unhandled rejection)
  {
    let unhandledRejection = false;
    const onUnhandledRejection = () => { unhandledRejection = true; };
    process.once("unhandledRejection", onUnhandledRejection);

    const clock = createClock();
    const slow = deferred<string>();
    const timed = settleWithTimeout(slow.promise, 100, () => "fallback", {}, clock.api);
    clock.fireLatest();
    assert.equal(await timed, "fallback");
    slow.resolve("late resolve consumed");
    await new Promise((r) => setImmediate(r));

    process.removeListener("unhandledRejection", onUnhandledRejection);
    assert.equal(unhandledRejection, false);
    passed++;
    console.log("PASS: late resolve after timeout is consumed");
  }

  // Test: late reject after timeout is consumed (no unhandled rejection)
  {
    let unhandledRejection = false;
    const onUnhandledRejection = () => { unhandledRejection = true; };
    process.once("unhandledRejection", onUnhandledRejection);

    const clock = createClock();
    const slow = deferred<string>();
    const timed = settleWithTimeout(slow.promise, 100, () => "fallback", {}, clock.api);
    clock.fireLatest();
    assert.equal(await timed, "fallback");
    slow.reject(new Error("late rejection consumed"));
    await new Promise((r) => setImmediate(r));

    process.removeListener("unhandledRejection", onUnhandledRejection);
    assert.equal(unhandledRejection, false);
    passed++;
    console.log("PASS: late reject after timeout is consumed");
  }

  // Test: fallback that rejects propagates the fallback error
  {
    const clock = createClock();
    const slow = deferred<string>();
    const timed = settleWithTimeout(slow.promise, 100, async () => { throw new Error("fallback error"); }, {}, clock.api);
    clock.fireLatest();
    await assert.rejects(timed, /fallback error/);
    passed++;
    console.log("PASS: fallback rejection propagates correctly");
  }

  // Test: parallel blueprint+profile reads don't compound timeout
  {
    const clock = createClock();
    const [blueprint, profile] = await Promise.all([
      settleWithTimeout(Promise.resolve({ uid: "test" }), 100, () => null, {}, clock.api),
      settleWithTimeout(Promise.resolve({ uid: "test", name: "user" }), 100, () => null, {}, clock.api),
    ]);
    assert.ok(blueprint);
    assert.ok(profile);
    passed++;
    console.log("PASS: parallel blueprint+profile reads both settle");
  }

  // Test: account switch cancels stale operation cleanly
  {
    let timeoutEvents = 0;
    const clock = createClock();
    const oldUid = deferred<string>();
    const timed = settleWithTimeout(oldUid.promise, 100, () => "stale fallback", { onTimeout: () => { timeoutEvents++; } }, clock.api);
    clock.fireLatest();
    assert.equal(await timed, "stale fallback");
    assert.equal(timeoutEvents, 1, "stale operation fires exactly one timeout");
    oldUid.resolve("stale uid late resolve");
    await new Promise((r) => setImmediate(r));
    passed++;
    console.log("PASS: account switch stale operation produces exactly one timeout");
  }

  // Test: no repeated warning loop on consecutive timeouts
  {
    let timeoutEvents = 0;
    const clock1 = createClock();
    const clock2 = createClock();
    const slow1 = deferred<string>();
    const slow2 = deferred<string>();

    const first = settleWithTimeout(slow1.promise, 100, () => null, { onTimeout: () => { timeoutEvents++; } }, clock1.api);
    clock1.fireLatest();
    assert.equal(await first, null);

    const second = settleWithTimeout(slow2.promise, 100, () => null, { onTimeout: () => { timeoutEvents++; } }, clock2.api);
    clock2.fireLatest();
    assert.equal(await second, null);

    assert.equal(timeoutEvents, 2, "consecutive timeouts each fire once");
    slow1.resolve("late");
    slow2.resolve("late");
    await new Promise((r) => setImmediate(r));
    passed++;
    console.log("PASS: no repeated warning loop on consecutive timeouts");
  }

  // Test: no sensitive diagnostic logging in source
  const helperSource = await import("fs").then(fs => fs.readFileSync(new URL("../../lib/storage/settleWithTimeout.ts", import.meta.url), "utf8"));
  assert.equal(helperSource.includes("console."), false);
  assert.equal(/password|token|payload/i.test(helperSource), false);
  passed++;
  console.log("PASS: no sensitive logging in settleWithTimeout");

  console.log(`\nblueprint timeout settlement: ${passed} assertions passed`);
}

void run();
