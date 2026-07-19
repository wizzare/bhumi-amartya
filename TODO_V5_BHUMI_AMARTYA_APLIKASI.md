# To Do V5 Bhumi Amartya Aplikasi

**Status:** Canonical Execution Checklist

**Product:** Bhumi Amartya

**Version:** V5

**Baseline:** V4 Production Stable

**Owner:** Founder Bhumi Amartya

**Source of Truth:** `SOT_V5_BHUMI_AMARTYA_APLIKASI.md`

**Related PRD:** `PRD_V5_BHUMI_AMARTYA_APLIKASI.md`

**Default locale:** `id-ID`

---

## Introduction

- The **Source of Truth (SoT)** defines the final product decisions for V5.
- The **PRD** defines functional requirements and acceptance criteria.
- This **To‑Do** defines the implementation order, validation gates, and reporting expectations.
- Any conflict between this checklist and the SoT or PRD must be returned to the **Founder Decision Gate**; do not guess.

---

## Working Principles

- **Strict SoT** – every implementation must honour the decisions in `SOT_V5_BHUMI_AMARTYA_APLIKASI.md`.
- **Minimal scope** – only the changes required for V5 localization.
- **Minimal diff** – avoid unrelated modifications.
- **Audit before implementation** – verify current state before each phase.
- **No over‑engineering** – use existing mechanisms where possible.
- **Preserve V4 production stability** – V4 must continue to work unchanged.
- **Do not proceed to a new phase before the previous validation gate passes**.
- **Calculation data remains language‑neutral**.
- **Interpretation and narrative data are locale‑dependent**.

**Canonical workflow**
```
Audit → Design → Implementation → Validation → Report → Founder Decision Gate (when required)
```

---

## Canonical Locale Scope

```ts
type SupportedLocale =
  | "id-ID"
  | "ms-MY"
  | "en"
  | "es"
  | "pt-BR"
  | "fr-FR"
  | "zh-TW"
  | "zh-HK"
```

**Visible selector labels** (text only, no flags)
```
ID
MS
EN
ES
PT
FR
中文
```

- `pt-BR` is the only Portuguese variant; **do not use `pt-PT`**.
- Traditional Chinese is used for Taiwan (`zh-TW`) and Hong Kong (`zh-HK`).
- Simplified Chinese (`zh-CN`) is **outside V5 priority** and must not be listed as a supported locale.
- Seven visible language options, eight technical locale codes.
- Existing V4 users without a saved locale default to `id-ID`.

---

## Checklist Format

All tasks are presented as Markdown checkboxes. A task may be marked **completed** only after:
1. Implementation is complete.
2. Validation has been run.
3. Result has been recorded.
4. Changed files have been reported.
5. Diagnostic delta has been reported.
6. No unexplained regression remains.

---

## Phase V5‑R0 – Baseline Freeze & Multilingual Audit

### Repository Safety
- [ ] Record V4 production branch.
- [ ] Record V4 production HEAD.
- [ ] Verify or create V4 release tag.
- [ ] Confirm working tree is clean (no uncommitted changes except documentation).
- [ ] Capture type‑check baseline.
- [ ] Capture lint baseline.
- [ ] Capture build baseline.
- [ ] Capture test baseline.
- [ ] Capture global diagnostic baseline.
- [ ] Create or verify V5 working branch.

### UI Surface Audit
Audit all user‑facing text in the following areas (checkbox per area):
- [ ] Onboarding
- [ ] Authentication
- [ ] Navigation
- [ ] Dashboard
- [ ] Profile
- [ ] Settings
- [ ] Blueprint pages
- [ ] Wellness
- [ ] Subscription
- [ ] Payment
- [ ] Toasts
- [ ] Modals
- [ ] Forms
- [ ] Validation messages
- [ ] Loading states
- [ ] Empty states
- [ ] Errors
- [ ] Notifications
- [ ] Share cards

### Narrative Runtime Audit
- [ ] Daily Guidance
- [ ] Weekly Guidance
- [ ] Catatan Hari Ini
- [ ] Identity Intelligence
- [ ] Wellness narrative
- [ ] Blueprint Synthesis
- [ ] Catatan Akashi
- [ ] Inner Work
- [ ] Relationship Reading
- [ ] Notification generators
- [ ] Share text generators
- [ ] Fallback generators
- [ ] Prompt registry entries
- [ ] Service‑level direct text producers
- [ ] Repository‑stored narratives

### Knowledge & Cache Audit
- [ ] Inventory all knowledge sources.
- [ ] Identify canonical knowledge owners.
- [ ] Identify duplicated knowledge.
- [ ] Identify orphan knowledge.
- [ ] Identify knowledge without stable IDs.
- [ ] Separate calculation from interpretation.
- [ ] Inventory all text‑bearing caches.
- [ ] Identify cache keys without locale.
- [ ] Audit Firestore text documents.
- [ ] Audit backward compatibility.
- [ ] Audit legacy user migration.

### Required R0 Deliverables
- [ ] Multilingual Surface Inventory
- [ ] Prompt & Narrative Inventory
- [ ] Knowledge Localization Inventory
- [ ] Cache Locale Impact Report
- [ ] Legacy User Migration Report
- [ ] Founder Decision Gate (sign‑off)

---

## Phase V5‑R1 – Internationalization Foundation

### Locale Contract
- [ ] Add `SupportedLocale` type (as defined above).
- [ ] Add `DEFAULT_LOCALE` constant (`"id-ID"`).
- [ ] Add locale metadata (display name, native name).
- [ ] Add visible labels for selector.
- [ ] Add readable language names.
- [ ] Add regional variants mapping.
- [ ] Add fallback map.
- [ ] Add locale resolver utility.

### i18n Runtime
- [ ] Identify existing i18n mechanism (e.g., `react‑i18next`).
- [ ] Add i18n provider at app root.
- [ ] Add namespace loader for each locale.
- [ ] Add translation resolver function.
- [ ] Add missing‑key handling (dev warning, prod fallback).
- [ ] Add production‑safe fallback to `id-ID`.
- [ ] Add development warnings for unused keys.
- [ ] Implement lazy‑loading of only active locale resources.

### Persistence
- [ ] Store selected locale locally (AsyncStorage / SecureStore).
- [ ] Add locale field to user profile schema.
- [ ] Migrate existing users safely to `id-ID` if locale missing.
- [ ] Restore account locale on login.
- [ ] Save onboarding locale after registration.
- [ ] Preserve device locale after logout.
- [ ] Preserve locale after app refresh and restart.

### Locale Resolution Priority (must be validated in this order)
1. Authenticated account locale.
2. Manually stored device locale.
3. Onboarding selection.
4. Browser or device locale.
5. Fallback `id-ID`.

### Regional Mapping
- [ ] Map English variants → `en`.
- [ ] Map Spanish variants → `es`.
- [ ] Map Brazilian Portuguese → `pt-BR`.
- [ ] Map Malaysian Malay → `ms-MY`.
- [ ] Map Traditional Chinese Taiwan → `zh‑TW`.
- [ ] Map Traditional Chinese Hong Kong → `zh‑HK`.
- [ ] Ensure no silent mapping to `zh‑CN`.

### R1 Validation Gate
- [ ] Verify Indonesian V4 experience unchanged.
- [ ] Verify legacy users retain previous language.
- [ ] Type‑check PASS.
- [ ] Lint PASS (where applicable).
- [ ] Build PASS.
- [ ] All unit tests PASS.
- [ ] Locale resolver tests PASS.
- [ ] Persistence tests PASS.
- [ ] No unexplained diagnostic increase.

---

## Phase V5‑R2 – Language Selector

### Onboarding Selector
- [ ] Add selector on first onboarding page, placed below “Saya sudah punya akun”.
- [ ] Use text‑only labels (ID, MS, EN, ES, PT, FR, 中文).
- [ ] Show active state for selected language.
- [ ] Add accessible `aria‑label` describing purpose.
- [ ] Allow selection before login.
- [ ] Apply language immediately to UI.
- [ ] Persist choice locally.
- [ ] Apply locale to all subsequent onboarding steps.
- [ ] Save locale to user account after registration.

### Traditional Chinese Region Resolution
- [ ] Selecting 中文 resolves to Taiwan (`zh‑TW`) or Hong Kong (`zh‑HK`).
- [ ] Use device region when reliable.
- [ ] When region unknown, present options:
  - 台灣
  - 香港
- [ ] Do **not** fallback to Simplified Chinese.

### Settings Selector
- [ ] Add “Bahasa dan Wilayah” section in Settings.
- [ ] Show current active language.
- [ ] Allow changing language without logout.
- [ ] Apply change immediately across UI.
- [ ] Persist to user profile and device storage.
- [ ] Do **not** recalculate blueprint or affect subscription/entitlement.

### R2 Validation Gate
Test the selector across scenarios (guest, new, existing, registration, login restore, logout‑login, refresh, restart, offline, small screens, accessibility) for **all eight locales**.

---

## Phase V5‑R3 – UI Translation Migration

### Translation Namespaces (create if missing)
- [ ] `common`
- [ ] `auth`
- [ ] `onboarding`
- [ ] `navigation`
- [ ] `dashboard`
- [ ] `profile`
- [ ] `settings`
- [ ] `blueprint`
- [ ] `wellness`
- [ ] `subscription`
- [ ] `payment`
- [ ] `errors`
- [ ] `validation`
- [ ] `notifications`
- [ ] `share`

### Controlled Migration Groups
#### Group 1 (Auth & Onboarding)
- [ ] Onboarding screens
- [ ] Login
- [ ] Registration
- [ ] Forgot password
- [ ] Verification
- [ ] Auth error messages

#### Group 2 (Core Navigation & Dashboard)
- [ ] Navbar & bottom navigation
- [ ] Dashboard main view
- [ ] “Panduan Minggu Ini”
- [ ] Dashboard loading / empty states

#### Group 3 (Profile & Settings)
- [ ] Profile page
- [ ] Identitas Jiwa
- [ ] Catatan Akashi
- [ ] Catatan Hari Ini
- [ ] Settings – account, privacy, subscription, language

#### Group 4 (Blueprint & Numerology)
- [ ] Numerology
- [ ] Human Design
- [ ] Natal Chart
- [ ] Destiny Matrix
- [ ] Weton, BaZi, Vedic, Tzolkin, other active blueprint routes

#### Group 5 (Feedback & Misc UI)
- [ ] Toasts
- [ ] Modals
- [ ] Form validation messages
- [ ] Error boundaries
- [ ] Empty states
- [ ] Paywall / subscription status UI
- [ ] Notifications
- [ ] Share cards
- [ ] Account deletion flow

### Additional Migration Tasks
- [ ] Add hard‑coded text audit script or lint guard.
- [ ] Define semantic translation key naming convention.
- [ ] Document any exceptions (e.g., brand names).
- [ ] Ensure no new untranslated user‑facing text is introduced.

---

## Phase V5‑R4 – AI Locale Runtime

### Propagation Chain
```
Client → API → Service → Engine → Prompt Registry → AI Gateway → Provider → Repository → Cache
```
- [ ] Ensure locale context is passed from client through each layer.
- [ ] Add locale field to API request payload.
- [ ] Extend service contracts to include `locale`.
- [ ] Tag engine prompts with locale.
- [ ] Store locale in prompt registry entries.
- [ ] Forward locale to AI gateway request headers.
- [ ] Record locale in provider logging.
- [ ] Tag repository writes with locale.
- [ ] Include locale in cache keys.

### Locale‑Specific Instruction Templates (one per supported locale)
- [ ] `id-ID`
- [ ] `ms-MY`
- [ ] `en`
- [ ] `es`
- [ ] `pt-BR`
- [ ] `fr-FR`
- [ ] `zh‑TW`
- [ ] `zh‑HK`

Each template must enforce:
- Target language only (no mixing).
- Natural grammar and rhythm.
- No literal Indonesian idioms in non‑Indonesian locales.
- Preserve blueprint facts and calculated values.
- Preserve Bhumi tone.
- No diagnosis, no unsupported claims, no deterministic prediction.

### Runtime Migration Checklists (for each narrative component)
- [ ] Daily Guidance
- [ ] Weekly Guidance
- [ ] Catatan Hari Ini
- [ ] Identity Intelligence
- [ ] Wellness narrative
- [ ] Blueprint Synthesis
- [ ] Catatan Akashi
- [ ] Inner Work
- [ ] Relationship Reading
- [ ] Notification generators
- [ ] Share text generators
- [ ] Fallback generators

### Wrong‑Language Handling
- [ ] Detect mismatched locale in AI output.
- [ ] Detect mixed‑language output.
- [ ] Retry once with stricter locale instruction.
- [ ] If still wrong, fall back to safe default (`id-ID`).
- [ ] Log the incident for analysis.

---

## Phase V5‑R5 – Cache & Repository Migration

### Canonical Cache Key Pattern
```
{feature}:{userId}:{date}:{locale}:{version}
```
- [ ] Update cache keys for all listed features to include `locale` and `version`.
- [ ] Ensure calculation caches remain language‑neutral (omit locale).
- [ ] Ensure switching language does **not** trigger blueprint recalculation.
- [ ] Prevent cross‑user cache contamination.
- [ ] Prevent cross‑locale cache contamination.
- [ ] Audit Firestore schemas for locale fields.
- [ ] Audit indexes for new locale columns.
- [ ] Monitor storage growth after migration.
- [ ] Validate cache integrity after each change.

#### Features to Update
- [ ] Daily Guidance cache
- [ ] Weekly Guidance cache
- [ ] Identity cache
- [ ] Wellness cache
- [ ] Blueprint Interpretation cache
- [ ] Catatan Hari Ini cache
- [ ] Catatan Akashi cache
- [ ] Relationship cache
- [ ] Notification cache
- [ ] Share card cache
- [ ] Fallback narrative cache

---

## Phase V5‑R6 – Knowledge Localization

### Knowledge Item Requirements
Every knowledge entry must include:
- Stable ID
- System name
- Canonical meaning
- Required facts
- Tone intent
- Prohibited distortions
- Localized content per supported locale
- Localization version

### Domain Sections
#### Numerology
- Life Path, Soul Urge, Expression, Personality, Personal Year, Pinnacle, Challenge
#### Human Design
- Type, Strategy, Authority, Profile, Definition, Signature, Not‑Self, Gates, Channels, Centers, Incarnation Cross
#### Natal Chart
- Signs, Planets, Houses, Aspects, Chiron, Nodes, Ascendant, Midheaven
#### Destiny Matrix
- Arcana, Center, Love line, Money line, Karmic tile, Lineage, Annual Arcana, Talents
#### Other Systems
- Weton, BaZi, Vedic, Tzolkin, Chakra, Relationship, Karma, Lineage, Inner Child, Inner Work, Catatan Akashi, Starseed, Ancient civilization, Akashic references
#### Traditional Chinese Architecture
- Shared base for `zh‑TW` and `zh‑HK`.
- Overlay terminology for Taiwan and Hong Kong.
- No Simplified Chinese vocabulary.
- No duplicated calculation data.

### Review Workflow
- [ ] First localization draft
- [ ] Linguistic review
- [ ] Meaning review
- [ ] Terminology review
- [ ] Cultural review
- [ ] Content‑owner approval
- [ ] Record localization version

---

## Phase V5‑R7 – Design, Typography, and Accessibility QA

### Text Expansion
- [ ] Verify UI accommodates longer strings for EN, ES, PT, FR, and Traditional Chinese.

### Layout Adjustments
- [ ] Button widths, card heights, navigation bar, modal heights, line wrapping, text truncation, onboarding selector, share cards, loading/empty states.

### Typography
- [ ] Latin Extended support, accented characters, Traditional Chinese glyphs, font fallback, CJK line height, Android rendering consistency.

### Accessibility
- [ ] Provide readable language names for screen readers.
- [ ] Ensure all selectable elements have `aria‑label`.
- [ ] Verify language metadata (`lang` attribute) on DOM/root.
- [ ] Touch target size ≥ 48 dp.
- [ ] Focus states visible.
- [ ] Contrast ratios meet WCAG AA.
- [ ] Keyboard navigation for selector where platform supports it.

---

## Phase V5‑R8 – Automated Testing

### Unit Tests
- [ ] Supported locale contract
- [ ] Default locale fallback
- [ ] Locale resolver logic
- [ ] Persistence (device & account)
- [ ] Legacy user migration
- [ ] Translation key existence per namespace
- [ ] Cache key includes locale
- [ ] Prompt generation respects locale
- [ ] Taiwan/Hong Kong region resolution

### Integration Tests
- [ ] Onboarding language switch persists.
- [ ] Registration stores locale.
- [ ] Login restores locale.
- [ ] Settings language change applies immediately.
- [ ] Daily Guidance rendered in selected locale.
- [ ] Weekly Guidance rendered in selected locale.
- [ ] Blueprint Interpretation respects locale.
- [ ] Cache separation per locale.
- [ ] Fallback locale behavior.
- [ ] Notifications localized.
- [ ] Share cards localized.

### Content Validation Tests
- [ ] No missing translation keys.
- [ ] No raw (un‑translated) strings.
- [ ] No Indonesian leakage in non‑ID locales.
- [ ] No English leakage in non‑EN locales.
- [ ] No mixed‑language output.
- [ ] No unsupported characters.
- [ ] Interpolation placeholders remain intact.
- [ ] Date & number formatting per locale.

---

## Phase V5‑R9 – Human Validation

### Participant Requirements
- Minimum **five** users per group: Indonesia, Malaysia, English, Spanish, Brazilian Portuguese, French, Taiwan, Hong Kong.
- **Total participants:** 40 users.

### Validation Checklist Items
- [ ] Natural language feel
- [ ] No machine‑translation artefacts
- [ ] Bhumi tone preserved
- [ ] Terminology clarity
- [ ] Cultural fit
- [ ] No mixed‑language output
- [ ] Meaning preservation
- [ ] Layout readability
- [ ] Typography correctness
- [ ] Locale persistence across sessions
- [ ] Language switching smoothness
- [ ] Blueprint calculations unchanged across locales

### Issue Categories
- Translation, Meaning, Terminology, Cultural, UI, Runtime locale, Cache, Prompt, Knowledge, V4 regression.

---

## Phase V5‑R10 – Release Hardening

### Final Validation Tasks
- [ ] Full type‑check
- [ ] Full lint
- [ ] Full build
- [ ] Full test suite
- [ ] Diagnostic delta analysis
- [ ] Security review
- [ ] Privacy compliance
- [ ] Cache safety audit
- [ ] Storage impact assessment
- [ ] Performance benchmarking
- [ ] AI token usage monitoring
- [ ] Logging & error monitoring
- [ ] V4 regression testing (core flows)
- [ ] Payment flow verification
- [ ] Subscription flow verification

### Feature‑Flag Strategy
- [ ] Global multilingual flag
- [ ] Per‑locale activation flags
- [ ] Internal tester flag
- [ ] Beta‑cohort flag
- [ ] Rollback switch
- [ ] Ability to disable a single locale without disabling the whole app

### Rollout Waves
**Wave 1** – `id-ID`, `en`, `ms-MY`
**Wave 2** – `es`, `pt-BR`, `fr-FR`
**Wave 3** – `zh‑TW`, `zh‑HK`

---

## Release Blockers
V5 cannot be released while any of the following remain unresolved:
- Login failure
- Registration failure
- Onboarding selector failure
- Locale persistence failure
- Locale profile corruption
- Cross‑user cache contamination
- Cross‑locale cache contamination
- Blueprint calculation mismatch across locales
- Frequent wrong‑language AI output
- Broken Traditional Chinese typography
- Indonesian V4 regression
- Payment regression
- Subscription regression
- Critical security issue
- Critical privacy issue
- Unresolved P0 bug
- Major unresolved P1 bug

---

## Agent Reporting Format (to be used in all future implementation reports)
```
## Yang Sudah Dilakukan
* ...

## Yang Belum Dilakukan
* ...

## Validation Result
* ...

## Diagnostic Delta
* ...

## Files Changed
* ...

## Current Branch and HEAD
* ...

## Next
* ...
```

---

*Document created on 2026‑07‑20.*
