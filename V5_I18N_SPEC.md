# V5 Internationalization (i18n) Specification

**Status:** Canonical
**Related:** [V5_SOURCE_OF_TRUTH.md](V5_SOURCE_OF_TRUTH.md), [V5_PRD.md](V5_PRD.md)

---

## 1. Target Locales (REVISED 2026-08-24 — D-V5-35)

V5 CURRENT scope standardizes on **THREE locales**:

1. `id-ID` (Bahasa Indonesia — DEFAULT)
2. `en-US` (English)
3. `ms-MY` (Bahasa Melayu)

FUTURE / DEFERRED — intentionally OUT of current V5 scope:

- `es-ES`
- `pt-BR`
- `fr-FR`

Fallback chain (unchanged): active locale → en-US → id-ID.

> **Narrative-prose exception (D-V5-36, ratified 2026-09-02):** the *translation-key* fallback
> above is `active → en → id-ID` and is unchanged. **Generated narrative prose** in the
> deterministic daily-guidance synthesis + local (non-AI) fallback MAY resolve `ms → id` (not
> `ms → en`) when a native Bahasa Melayu string is not yet authored, because Bahasa Melayu and
> Bahasa Indonesia are mutually intelligible. This is a scoped bridge, not a licence to skip
> `ms`; CURRENT-scope Bahasa Melayu remains required for V5 completion. Helper:
> `lib/i18n/pickLocale.ts`.

> **Revision history:** an earlier six-locale target (itself superseding an older 8-locale PRD) is revised by Founder decision D-V5-35. Deferred locales are not failed implementations; every reference must be labelled FUTURE / DEFERRED.

## 2. Architecture Decision

- **Library:** `react-i18next`
- **Resource structure:** Structured JSON bundles (`src/locales/{lang}/translation.json`).
- **Fallback hierarchy:** Active Locale → `en` → `id-ID`.
- **Locale persistence:** Device locale honored at first launch; user override persisted to `user.language`.
- **Locale Switcher:** Functional UI component wired to profile persistence.
- **AI Language Awareness:** AI prompt generation and output respect active locale.
- **Notification Localization:** FCM notification templates translated per locale.

## 3. Migration Path (Legacy → V5)

- **Retire:** Custom `LanguageContext.tsx`, flat `lib/data/translations.ts`, and `normalizeLocale.ts` (which caused the `ms-MY` runtime crash).
- **Adopt:** `react-i18next` resource loading, `useTranslation()` hook across all UI components.

## 4. Acceptance Criteria

- All six locale dictionaries exist and contain complete base keys.
- `ms-MY` dictionary exists and prevents runtime crash.
- Missing key fallback works (`active → en → id-ID`).
- Locale Switcher persists selection.
- Test suite: `v5-i18n-fallback.test.ts` passes.
