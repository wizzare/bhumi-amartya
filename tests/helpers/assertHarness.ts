/**
 * Minimal throwing-assertion harness for standalone `tsx` test files.
 *
 * Replaces non-fatal `console.assert(...)` so that a failed contract assertion
 * ALWAYS terminates the process with a non-zero exit code. Test-infra only —
 * no product behavior.
 */
import assertStrict from "node:assert/strict";

let checks = 0;
let failures = 0;

/** Hard assertion: throws on failure (propagates to a non-zero exit). */
export function check(condition: unknown, message: string): asserts condition {
  checks += 1;
  try {
    assertStrict.ok(condition, message);
  } catch (err) {
    failures += 1;
    throw err instanceof Error ? err : new Error(message);
  }
}

/** Equality assertion. */
export function checkEqual<T>(actual: T, expected: T, message: string): void {
  checks += 1;
  try {
    assertStrict.deepStrictEqual(actual, expected, message);
  } catch (err) {
    failures += 1;
    throw err instanceof Error ? err : new Error(message);
  }
}

export function assertionCount(): number {
  return checks;
}

/**
 * Wrap a suite's entrypoint so ANY thrown error (sync or async) or rejected
 * promise results in `process.exit(1)`, and a clean run prints a marker and
 * exits 0. stderr is never swallowed.
 */
export function runSuite(name: string, main: () => void | Promise<void>): void {
  Promise.resolve()
    .then(main)
    .then(() => {
      console.log(`\n${name} :: PASS (${checks} assertions)`);
      process.exit(0);
    })
    .catch((err: unknown) => {
      console.error(`\n${name} :: FAIL (${failures} failed / ${checks} checks)`);
      console.error(err instanceof Error ? err.stack || err.message : String(err));
      process.exit(1);
    });
}
