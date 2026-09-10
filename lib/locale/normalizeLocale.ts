export type CanonicalLocale = "id-ID" | "en-US" | "ms-MY";

export const DEFAULT_LOCALE: CanonicalLocale = "id-ID";

export function resolveEffectiveLocale(...sources: unknown[]): CanonicalLocale {
  for (const source of sources) {
    if (typeof source === "string" && /^(id|en|ms)(?:[-_][a-z0-9]+)*$/i.test(source.trim())) {
      return normalizeLocale(source);
    }
  }
  return DEFAULT_LOCALE;
}

export function normalizeLocale(input: unknown): CanonicalLocale {
  if (typeof input !== "string" || !input.trim()) {
    return DEFAULT_LOCALE;
  }

  const clean = input.trim();

  // Direct canonical matches
  if (clean === "id-ID") return "id-ID";
  if (clean === "en-US") return "en-US";
  if (clean === "ms-MY") return "ms-MY";

  // Legacy short codes & variations
  const lower = clean.toLowerCase();
  if (lower === "id" || lower.startsWith("id-") || lower.startsWith("id_")) return "id-ID";
  if (lower === "en" || lower.startsWith("en-") || lower.startsWith("en_")) return "en-US";
  if (lower === "ms" || lower.startsWith("ms-") || lower.startsWith("ms_")) return "ms-MY";

  return DEFAULT_LOCALE;
}

/**
 * Backwards compatibility helper for accessing lib/data/translations.ts.
 * Supports "id", "en", and "ms" keys.
 */
export function getDictionaryKey(locale: CanonicalLocale | string): "id" | "en" | "ms" {
  const canonical = normalizeLocale(locale);
  if (canonical === "en-US") {
    return "en";
  }
  if (canonical === "ms-MY") {
    return "ms";
  }
  return "id";
}
