/** Client metadata never authorizes a new or changed Human Design result. */
export function isUnchangedStoredValue(incoming: unknown, stored: unknown): boolean {
  if (!incoming || !stored || typeof incoming !== "object" || typeof stored !== "object" || Array.isArray(incoming) || Array.isArray(stored)) return false;
  try {
    return JSON.stringify(incoming) === JSON.stringify(stored);
  } catch {
    return false;
  }
}

/** A missing result and this legacy placeholder both mean “pending”. */
export function isEmptyLegacyPending(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const allowed = new Set(["status", "type", "source", "calculatedAt"]);
  return Object.keys(record).every(key => allowed.has(key))
    && record.status === "pending" && record.type === null && record.source === "pending"
    && (record.calculatedAt === undefined || record.calculatedAt === null);
}
