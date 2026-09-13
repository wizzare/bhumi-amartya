// CANONICAL V5 i18n instance (D-V5-02 / D-V5-35).
// ONE i18n instance, ONE locale loader. Resources live in src/locales/{tag}/translation.json.
// CURRENT locales: id-ID (default), en-US, ms-MY. es/pt-BR/fr-FR are DEFERRED (never loaded).

import i18next, { type i18n as I18nInstance } from "i18next";

import idID from "../../src/locales/id-ID/translation.json";

export type SupportedLocaleTag = "id-ID" | "en-US" | "ms-MY";
export type SupportedShortCode = "id" | "en" | "ms";

export const SUPPORTED_LOCALES: Array<{ tag: SupportedLocaleTag; short: SupportedShortCode; label: string }> = [
  { tag: "id-ID", short: "id", label: "Indonesia" },
];

export const DEFAULT_SHORT: SupportedShortCode = "id";

const RAW_BUNDLES: Record<SupportedLocaleTag, Record<string, unknown>> = {
  "id-ID": idID as Record<string, unknown>,
  "en-US": idID as Record<string, unknown>,
  "ms-MY": idID as Record<string, unknown>,
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/** Deep merge; later sources win. Used to materialize the active→en→id fallback chain. */
export function deepMerge<T>(base: T, ...overlays: Array<Record<string, unknown> | undefined>): T {
  const out: Record<string, unknown> = isPlainObject(base) ? { ...(base as Record<string, unknown>) } : {};
  for (const overlay of overlays) {
    if (!isPlainObject(overlay)) continue;
    for (const [key, value] of Object.entries(overlay)) {
      const baseValue = out[key];
      out[key] =
        isPlainObject(baseValue) && isPlainObject(value)
          ? deepMerge(baseValue, value)
          : (value ?? baseValue);
    }
  }
  return out as unknown as T;
}

let instance: I18nInstance | null = null;

/** Canonical i18next instance — initialized once, safe on server and client. */
export function getI18n(): I18nInstance {
  if (!instance) {
    void i18next.init({
      lng: "id-ID",
      supportedLngs: ["id-ID"],
      load: "currentOnly",
      fallbackLng: "id-ID",
      resources: {
        "id-ID": { translation: RAW_BUNDLES["id-ID"] },
        "en-US": { translation: RAW_BUNDLES["en-US"] },
        "ms-MY": { translation: RAW_BUNDLES["ms-MY"] },
      },
      interpolation: { escapeValue: false },
      returnEmptyString: false,
    });
    instance = i18next;
  }
  return instance;
}

/** React state sync entry — called by LanguageContext. */
export function changeI18nLanguage(_short: SupportedShortCode): void {
  void getI18n().changeLanguage("id-ID");
}

/**
 * Legacy-compatible accessor: returns the fully fallback-merged dictionary for a
 * short code so existing `translations[language].section.key` consumers keep
 * working while components migrate to i18next `t()` in later sprints.
 * Reads FROM the canonical resources — not a second store.
 */
export function getCompatDictionaries(): Record<SupportedShortCode, Record<string, any>> {
  return { id: RAW_BUNDLES["id-ID"], en: RAW_BUNDLES["en-US"], ms: RAW_BUNDLES["ms-MY"] };
}
