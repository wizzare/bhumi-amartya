/**
 * Runtime guard for fact payloads crossing legacy Blueprint data into Arsip
 * Akashi. The canonical fact contract is text; objects and arrays are not
 * meaningful prose evidence and are deliberately represented as unavailable.
 */
export function normalizeArsipFactValue(value: unknown): string {
  if (typeof value === "string") return value.trim() || "unknown";
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);
  return "unknown";
}

/** Safe only for deterministic signatures; it must never throw on legacy data. */
export function factSignatureToken(value: unknown, maxLength: number): string {
  return normalizeArsipFactValue(value).slice(0, maxLength);
}
