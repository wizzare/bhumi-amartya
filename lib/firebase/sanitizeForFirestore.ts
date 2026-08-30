import { Timestamp } from "firebase/firestore";

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (Object.prototype.toString.call(value) !== "[object Object]") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
};

// DEFECT-2A-1: the Firebase Web SDK silently persists non-finite JS numbers
// (NaN, Infinity, -Infinity) and readback returns them, so Firestore itself is
// not a backstop. Canonical policy: an object property holding a non-finite
// number is OMITTED (same as undefined); a non-finite array element is coerced
// to null (keeps array length / index positions / ordering; no sparse arrays).
const isNonFiniteNumber = (value: unknown): boolean =>
  typeof value === "number" && !Number.isFinite(value);

export function sanitizeForFirestore<T>(value: T): T {
  if (value === undefined) {
    return undefined as T;
  }

  // Reached for a non-finite array element (via the array map below) or a bare
  // non-finite scalar; object properties are dropped before recursion.
  if (isNonFiniteNumber(value)) {
    return null as T;
  }

  if (
    value === null ||
    value instanceof Date ||
    value instanceof Timestamp ||
    typeof value !== "object"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as T;
  }

  if (!isPlainObject(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, nestedValue]) => nestedValue !== undefined && !isNonFiniteNumber(nestedValue))
      .map(([key, nestedValue]) => [key, sanitizeForFirestore(nestedValue)]),
  ) as T;
}
