// Build 106 DS-AI1 — small locale picker for deterministic user-facing prose in the
// daily-guidance synthesis and local fallback (R-PRD-31: AI-generated content renders
// in the user locale). i18next owns keyed UI copy; this is for the generated narrative
// strings those engines build inline.
//
// Canonical KEY chain (D-V5-35): active -> en -> id-ID. Callers SHOULD supply an `ms`
// value for CURRENT-scope Bahasa Melayu; when they do not, `ms` falls to `en` then `id`.
//
// D-V5-36 (RATIFIED 2026-09-02): for generated NARRATIVE PROSE, prose call sites MAY
// instead resolve `ms -> id` (pass no `ms` and rely on the surrounding `!== "en"` branch)
// because Bahasa Melayu / Bahasa Indonesia are mutually intelligible. Scoped bridge only;
// native `ms` prose is still required (Build 106 DS-AI1-themes).

export type GuidanceLocale = "id" | "en" | "ms";

export function normalizeGuidanceLocale(value: unknown): GuidanceLocale {
  if (typeof value === "string") {
    if (value.startsWith("en")) return "en";
    if (value.startsWith("ms")) return "ms";
  }
  return "id";
}

export function pickLocale(
  language: GuidanceLocale | string | null | undefined,
  variants: { id: string; en: string; ms?: string },
): string {
  const lang = normalizeGuidanceLocale(language);
  if (lang === "en") return variants.en;
  if (lang === "ms") return variants.ms ?? variants.en ?? variants.id;
  return variants.id;
}
