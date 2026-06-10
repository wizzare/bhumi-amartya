import { Timestamp } from "firebase/firestore";

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (Object.prototype.toString.call(value) !== "[object Object]") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
};

export function sanitizeForFirestore<T>(value: T): T {
  if (value === undefined) {
    return undefined as T;
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
      .filter(([, nestedValue]) => nestedValue !== undefined)
      .map(([key, nestedValue]) => [key, sanitizeForFirestore(nestedValue)]),
  ) as T;
}
