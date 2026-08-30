/**
 * DEFECT-2A-1 — focused unit matrix for the REAL lib/firebase/sanitizeForFirestore.ts.
 *
 * Canonical non-finite policy (see the sanitizer source):
 *   - object property holding NaN / Infinity / -Infinity  -> OMITTED (like undefined)
 *   - non-finite array element                            -> coerced to null
 *     (array length, index positions and ordering preserved; never sparse)
 *   - bare non-finite scalar (degenerate top-level call)  -> null
 * Finite numbers (incl. 0, -0, negatives, large finite) are byte/semantic-equivalent.
 * undefined-stripping and Firebase-native passthrough (Date/Timestamp) are unchanged.
 *
 * No duplicate sanitizer implementation here. Hard-fail (assert throws -> exit 1).
 */
import assert from "node:assert/strict";
import { Timestamp } from "firebase/firestore";
import { sanitizeForFirestore } from "../../lib/firebase/sanitizeForFirestore";

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log(`  PASS: ${name}`);
}

/** Recursively report every non-finite JS number path in a sanitized value. */
function nonFinitePaths(value: unknown, p = "$", acc: string[] = []): string[] {
  if (typeof value === "number" && !Number.isFinite(value)) acc.push(p);
  else if (Array.isArray(value)) value.forEach((v, i) => nonFinitePaths(v, `${p}[${i}]`, acc));
  else if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) nonFinitePaths(v, `${p}.${k}`, acc);
  }
  return acc;
}

try {
  // ---------------------------------------------------------------- finite ----
  check("finite integer preserved", () => {
    assert.deepEqual(sanitizeForFirestore({ n: 42 }), { n: 42 });
  });
  check("finite decimal preserved", () => {
    assert.deepEqual(sanitizeForFirestore({ n: 3.14159 }), { n: 3.14159 });
  });
  check("zero preserved", () => {
    assert.deepEqual(sanitizeForFirestore({ n: 0 }), { n: 0 });
  });
  check("negative zero preserved as -0", () => {
    const out = sanitizeForFirestore({ n: -0 }) as { n: number };
    assert.ok(Object.is(out.n, -0), `expected -0, got ${out.n}`);
  });
  check("negative number preserved", () => {
    assert.deepEqual(sanitizeForFirestore({ n: -7.5 }), { n: -7.5 });
  });
  check("large finite numbers preserved", () => {
    assert.deepEqual(
      sanitizeForFirestore({ a: 1e308, b: Number.MAX_SAFE_INTEGER, c: -1e308 }),
      { a: 1e308, b: Number.MAX_SAFE_INTEGER, c: -1e308 },
    );
  });

  // ------------------------------------------------ non-finite object props ---
  check("NaN object property omitted", () => {
    assert.deepEqual(sanitizeForFirestore({ ok: 1, nan: Number.NaN }), { ok: 1 });
  });
  check("Infinity object property omitted", () => {
    assert.deepEqual(sanitizeForFirestore({ ok: 1, inf: Number.POSITIVE_INFINITY }), { ok: 1 });
  });
  check("-Infinity object property omitted", () => {
    assert.deepEqual(sanitizeForFirestore({ ok: 1, ninf: Number.NEGATIVE_INFINITY }), { ok: 1 });
  });
  check("undefined object property still omitted (unchanged)", () => {
    assert.deepEqual(sanitizeForFirestore({ ok: 1, u: undefined }), { ok: 1 });
  });
  check("null object property preserved (unchanged)", () => {
    assert.deepEqual(sanitizeForFirestore({ ok: 1, z: null }), { ok: 1, z: null });
  });
  check("string / boolean preserved (unchanged)", () => {
    assert.deepEqual(sanitizeForFirestore({ s: "x", b: false, t: true }), { s: "x", b: false, t: true });
  });

  // -------------------------------------------------------- nested objects ---
  check("nested object non-finite property omitted, siblings kept", () => {
    assert.deepEqual(
      sanitizeForFirestore({ outer: { inf: Infinity, ok: 2 }, keep: 3 }),
      { outer: { ok: 2 }, keep: 3 },
    );
  });
  check("deeply nested non-finite fully removed", () => {
    const out = sanitizeForFirestore({ x: { y: { z: Number.NaN, w: 1 } } });
    assert.deepEqual(out, { x: { y: { w: 1 } } });
    assert.deepEqual(nonFinitePaths(out), []);
  });

  // ---------------------------------------------------------------- arrays ---
  check("array [1, NaN, 3] -> [1, null, 3] (length & order preserved)", () => {
    const out = sanitizeForFirestore([1, Number.NaN, 3]);
    assert.deepEqual(out, [1, null, 3]);
    assert.equal(out.length, 3);
  });
  check("array [Infinity] -> [null]", () => {
    assert.deepEqual(sanitizeForFirestore([Number.POSITIVE_INFINITY]), [null]);
  });
  check("array [-Infinity] -> [null]", () => {
    assert.deepEqual(sanitizeForFirestore([Number.NEGATIVE_INFINITY]), [null]);
  });
  check("array undefined element still dropped (unchanged)", () => {
    assert.deepEqual(sanitizeForFirestore([1, undefined, 3]), [1, 3]);
  });
  check("array is not sparse after non-finite coercion", () => {
    const out = sanitizeForFirestore([Number.NaN, 2, Infinity]) as unknown[];
    assert.deepEqual(out, [null, 2, null]);
    assert.equal(Object.keys(out).length, 3, "no holes");
    assert.ok(out.every((_, i) => i in out), "every index present");
  });

  // --------------------------------------------- nested array/object combos --
  check("object -> array -> object with mixed non-finite", () => {
    const out = sanitizeForFirestore({
      a: [{ b: Number.NaN, c: 2 }, 5, Number.POSITIVE_INFINITY],
      d: { e: [Number.NEGATIVE_INFINITY, 9] },
    });
    assert.deepEqual(out, { a: [{ c: 2 }, 5, null], d: { e: [null, 9] } });
    assert.deepEqual(nonFinitePaths(out), []);
  });

  // ------------------------------------------------- Firebase-native types ---
  check("Date instance preserved by reference", () => {
    const d = new Date("2026-08-30T00:00:00.000Z");
    const out = sanitizeForFirestore({ when: d }) as { when: Date };
    assert.equal(out.when, d);
  });
  check("Timestamp instance preserved by reference", () => {
    const ts = Timestamp.fromMillis(1_756_512_000_000);
    const out = sanitizeForFirestore({ at: ts }) as { at: Timestamp };
    assert.equal(out.at, ts);
  });

  // ------------------------------------------------------- non-mutation ------
  check("input object is not mutated", () => {
    const input = { keep: 1, nan: Number.NaN, arr: [1, Infinity, 3], nest: { inf: -Infinity, ok: 2 } };
    const snapshot = JSON.stringify(input, (_k, v) =>
      typeof v === "number" && !Number.isFinite(v) ? `__nf:${String(v)}` : v,
    );
    sanitizeForFirestore(input);
    const after = JSON.stringify(input, (_k, v) =>
      typeof v === "number" && !Number.isFinite(v) ? `__nf:${String(v)}` : v,
    );
    assert.equal(after, snapshot, "sanitizeForFirestore must not mutate its argument");
    assert.ok(Number.isNaN(input.nan) && input.arr[1] === Infinity && input.nest.inf === -Infinity);
  });

  // ------------------------------------------------- degenerate top-level ----
  check("bare finite scalar unchanged", () => {
    assert.equal(sanitizeForFirestore(5), 5);
    assert.equal(sanitizeForFirestore("s"), "s");
    assert.equal(sanitizeForFirestore(null), null);
    assert.equal(sanitizeForFirestore(undefined), undefined);
  });
  check("bare non-finite scalar -> null", () => {
    assert.equal(sanitizeForFirestore(Number.NaN), null);
    assert.equal(sanitizeForFirestore(Number.POSITIVE_INFINITY), null);
    assert.equal(sanitizeForFirestore(Number.NEGATIVE_INFINITY), null);
  });

  console.log(`\nFIRESTORE_SANITIZER_UNIT_PASS assertions=${passed}`);
} catch (err) {
  console.error("FIRESTORE_SANITIZER_UNIT_FAIL", err instanceof Error ? err.stack || err.message : String(err));
  process.exitCode = 1;
}
