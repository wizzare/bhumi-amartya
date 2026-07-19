# PRD V5 Bhumi Amartya Aplikasi

**Status:** Draft

**Product:** Bhumi Amartya

**Version target:** V5

**Baseline:** V4 production stable

**Owner:** Founder Bhumi Amartya

**Source of Truth:** `SOT_V5_BHUMI_AMARTYA_APLIKASI.md`

**Related To‑Do:** `TODO_V5_BHUMI_AMARTYA_APLIKASI.md`

**Default locale:** `id-ID`

---

## 1. Objective

Deliver multilingual support for Bhumi Amartya V5 across eight locales (`id-ID`, `en`, `ms-MY`, `es`, `pt-BR`, `fr-FR`, `zh‑TW`, `zh‑HK`).

- Preserve existing V4 Indonesian experience.
- Enable seamless locale selection during onboarding and in Settings.
- Ensure all UI strings, AI prompts, and knowledge content are localized.
- Maintain calculation‑neutral data; only interpretation and UI are locale‑dependent.

---

## 2. Functional Requirements

### 2.1 Localization Strategy
- Define `SupportedLocale` type with the eight locale codes (see To‑Do).
- Provide `DEFAULT_LOCALE = "id-ID"` constant.
- Implement fallback hierarchy: missing locale → `en` → `id-ID`.
- Store locale metadata (display name, native name) and visible selector labels (text‑only, no flags).

### 2.2 Runtime i18n
- Use existing i18n mechanism (`react‑i18next` or equivalent).
- Add i18n provider at app root.
- Create translation namespaces: `common`, `auth`, `onboarding`, `navigation`, `dashboard`, `profile`, `settings`, `blueprint`, `wellness`, `subscription`, `payment`, `errors`, `validation`, `notifications`, `share`.
- Implement lazy‑loading of active locale resources.
- Provide missing‑key warning in dev and fallback to `id‑ID` in production.

### 2.3 Persistence
- Persist selected locale locally (AsyncStorage / SecureStore).
- Add `locale` field to user profile schema.
- Migrate existing users to `id-ID` if locale missing.
- Restore locale on login and after app restart.

### 2.4 Language Selector UI
- Onboarding selector: dropdown below “Saya sudah punya akun” with text labels `ID`, `MS`, `EN`, `ES`, `PT`, `FR`, `中文`.
- Settings selector: “Bahasa dan Wilayah” section, show current language, allow change without logout, persist immediately.
- Ensure accessibility (`aria‑label`) and immediate UI update.
- Traditional Chinese region resolution: present options for Taiwan (`zh‑TW`) and Hong Kong (`zh‑HK`).

### 2.5 AI Locale Runtime
- Propagate locale from client through API, service, engine, prompt registry, AI gateway, repository, cache.
- Add `locale` field to API request payload.
- Tag prompts with locale.
- Store locale in repository writes and cache keys.
- Implement wrong‑language detection and fallback.

### 2.6 Cache & Repository
- Update cache key pattern to `{feature}:{userId}:{date}:{locale}:{version}` for all locale‑aware features.
- Keep calculation caches language‑neutral.
- Ensure no cross‑locale contamination.

### 2.7 Knowledge Localization
- Every knowledge item must have localized content per supported locale, stable ID, version, and tone.
- Follow review workflow: draft → linguistic → meaning → terminology → cultural → owner approval.

### 2.8 Design, Typography, Accessibility
- Verify UI accommodates longer strings for EN, ES, PT, FR, Chinese.
- Use Inter for Latin scripts, Noto Sans families for Japanese, Chinese, Hindi.
- Ensure contrast, touch target size, focus states, `lang` attribute on root.

### 2.9 Testing
- Unit tests for locale contract, resolver, persistence, cache keys, AI locale flow.
- Integration tests for onboarding selector, settings change, language‑specific rendering, cache separation.
- Content validation tests for missing keys, raw strings, language leakage, placeholder integrity, formatting.

### 2.10 Release Checklist (high‑level)
- Verify all functional requirements are implemented.
- Run full type‑check, lint, build, test suite.
- Perform diagnostic delta analysis (no regressions).
- Conduct human validation with participants from all locales.
- Follow feature‑flag strategy and rollout waves (Wave 1: `id-ID`, `en`, `ms-MY`; Wave 2: `es`, `pt-BR`, `fr-FR`; Wave 3: `zh‑TW`, `zh‑HK`).

---

## 3. Acceptance Criteria
- All UI strings are present in each locale file and pass the localization lint.
- Language selector works on onboarding and settings, persists across sessions.
- AI prompts respect the active locale and fallback correctly.
- Cache keys include locale; no cross‑locale cache hits.
- Knowledge items have complete translations.
- No Indonesian UI text appears in non‑ID locales, and vice‑versa.
- Accessibility checks pass for language selection components.
- All automated tests pass.

---

## 4. Non‑Functional Requirements
- Minimal performance impact: lazy‑load only active locale resources.
- Security: locale data stored securely, not injectable.
- Privacy: locale does not affect user‑identifiable data.

---

## 5. Risks & Mitigations
- **Risk:** Missing translation keys causing runtime fallbacks. **Mitigation:** Localization lint and CI guard.
- **Risk:** Cache key mismatches leading to stale data. **Mitigation:** Automated cache‑key unit tests.
- **Risk:** Traditional Chinese region ambiguity. **Mitigation:** Explicit region selector when device locale is unknown.

---

*Document created on 2026‑07‑20.*
