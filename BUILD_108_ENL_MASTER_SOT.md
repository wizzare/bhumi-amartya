# BUILD 108 ENL — MASTER SOURCE OF TRUTH (SOT)
**Bhumi Amartya — Dedicated English-Language Edition & Architecture**

```text
STATUS                          = IN_PROGRESS (SPRINT-108-02-DASHBOARD COMPLETE)
CURRENT_BASELINE                = BUILD 107 (versionCode 107, versionName 5.0.7)
BASELINE_COMMIT                 = d2ecb5ed73b7bb5e95415be314305f3512533752
INITIATIVE                      = BUILD 108 ENL
PURPOSE                         = Dedicated English-Language Edition / Global Release
TOTAL_ROUTES_AUDITED            = 51
TOTAL_USER_FACING_PAGES         = 48
DEV_OR_DEPRECATED_SURFACES      = 3
BUILD_108_ENL_IMPLEMENTATION_STATUS = SPRINT_02_COMPLETE
NEXT_SAFE_ACTION                = SPRINT_03_BLUEPRINT_CORE
RELEASE_GATE                    = FOUNDER_SIGN_OFF_REQUIRED
```

---

## 1. Executive Summary & Production Baseline

### 1.1 Production Baseline: Build 107
The authoritative starting point and production baseline for all Build 108 work is **Build 107**:
- `versionCode` = `107`
- `versionName` = `"5.0.7"`
- Baseline Commit: `d2ecb5e` (`recovery/build106-product-continuity`)
- Release Status: **PRODUCTION**

Build 107 resolved three critical regressions discovered in Build 106:
1. **Human Design Identity Core convergence:** Existing/legacy users no longer hang on perpetual calculation states; recognized types resolve deterministically (`components/dashboard/CoreIdentity.tsx`). Failed recalculation can never destroy a recoverable historical type (`AccuracyUpgradeBanner.tsx`, `PendingHdRecoveryBanner.tsx`).
2. **Withdrawal of internal Admin Console from production UI:** `components/navigation/AppNav.tsx` dropped all admin/diagnostics menu items and role checks. All `app/admin/*` routes are hard-gated by `isAdminUiExposed()` which evaluates `NEXT_PUBLIC_ENABLE_ADMIN_UI === "true"` (pinned `false` in production exports).
3. **Orphan route elimination:** Stale dev routes (`/status`, `/test`, `/roadmap`, `/changelog`, `/onboarding`) were deleted and guarded by static route assertions.
4. **Administrative & Lifetime authorization continuity:** Preserved all 4 admin accounts, Lifetime entitlements, and Firestore rules.

### 1.2 The Build 108 ENL Mission
`BUILD 108 ENL` is the dedicated **English-Language Edition** of Bhumi Amartya.
The core product objectives:
1. **End-to-End English User Experience:** Every user-facing screen, prompt, narrative, card, button, error message, and legal page must speak native, elegant, dignified English.
2. **Complete Inheritance:** Inherit 100% of Build 107 fixes, calculations, engines, security rules, and architectural continuity. Nothing from Build 107 may regress or disappear.
3. **Verified Lineage:** Build 108 must be constructed strictly as a descendant of the verified Build 107 source.

---

## 2. Canonical Authority Hierarchy

For all Build 108 ENL activities, the authority conflict order is:
1. **Explicit Founder Instruction** for the current task.
2. **Authorized Repository & Runtime Evidence** from the recovery worktree.
3. **`BUILD_108_ENL_MASTER_SOT.md`** (this document) — Primary product & architectural authority.
4. **`BUILD_108_ENL_PAGE_AUDIT.md`** — Exhaustive 51-route read-only audit report and copy gap analysis.
5. **`BUILD_108_ENL_SCOPE_MATRIX.md`** — Surface-by-surface status & classification ledger.
6. **`BUILD_108_ENL_SPRINT_PLAN.md`** — Data-driven 8-sprint implementation sequence.
7. **`BUILD_108_ENL_HANDOFF.md`** — Operational handoff & task progression rules.
8. **`BUILD_108_ENL_RELEASE_PLAN.md`** — Release gates, verification suites, and deployment checklists.
9. **`BUILD_107_HOTFIX_RELEASE.md`** & **`BUILD_106_MASTER_SOT.md`** — Historical baseline lineage.
10. **Provenance-verified V5 documents** (`V5_*.md`).
11. Legacy documents (`SOT.md`, `PRD.md`, `TODO.md`, `BUILD_100_*.md`) remain historical and non-authoritative.

---

## 3. Build 107 Inheritance Guard & Invariants

Build 108 must explicitly guard and verify every element of Build 107:

### BUILD_107_INHERITANCE_CHECKLIST
- [ ] **Human Design Convergence:** Existing users with stored HD records must immediately resolve to their type in `CoreIdentity.tsx`. Perpetual "Menghitung..." / "Perlu kalkulasi ulang" must never return.
- [ ] **Failed Recalculation Safety:** A failed background recalculation must never overwrite or destroy a canonical stored Human Design type (`AccuracyUpgradeBanner.tsx`, `PendingHdRecoveryBanner.tsx`).
- [ ] **Admin UI Protection:** `isAdminUiExposed()` gate must remain active on `app/admin/page.tsx`, `app/admin/activity/page.tsx`, and `app/admin/diagnostics/page.tsx`. `scripts/run-prod-build.mjs` must pin `NEXT_PUBLIC_ENABLE_ADMIN_UI: 'false'`.
- [ ] **Clean AppNav Menu:** `components/navigation/AppNav.tsx` must never reintroduce Admin, Auth Diagnostics, or privileged role gating in production navigation.
- [ ] **Orphan Routes Stay Gone:** Routes `/status`, `/test`, `/roadmap`, `/changelog`, `/onboarding` and `AuditReadiness.tsx` must remain deleted.
- [ ] **Production Surface Guard:** `tests/unit/build107-production-surface-guard.test.ts` (131 assertions) must stay green.
- [ ] **Admin & Lifetime Entitlements:** Admin roles (`founder`, `admin`, `dev_admin`) and non-expiring Lifetime entitlements for the four canonical admin accounts must remain intact (`privilegedUser.ts`, `entitlementService.ts`).
- [ ] **Firestore Rules Security:** Owner-isolation, authenticated reads/writes, and zero unauthorized public mutations must remain intact.
- [ ] **Deterministic Export & Build:** Web export (`output: 'export'`) -> Capacitor sync -> Android signed bundle pipeline must remain intact.

---

## 4. Architecture Recommendation & Critical Decisions

### 4.1 Evaluation of Architecture Approaches

We audited four architectural approaches for Build 108 ENL:

| Option | Architecture | Description | Pros | Cons | Recommendation |
|---|---|---|---|---|---|
| **A** | Same App, Forced English | Lock locale to `"en"` in existing `com.bhumiamartya.app` binary; drop language switching. | Minimal code divergence; fast build. | **Disastrous for existing Indonesian users:** If released as update to Build 107 on Google Play, all Indonesian users are abruptly forced to English with no way back. | **REJECTED** |
| **B** | Completely Separate Flavor | Create a new Gradle flavor / package ID `com.bhumiamartya.en` with separate codebase or branch. | Absolute physical separation; zero risk to Indonesian users. | High maintenance overhead; diverged codebases; dual Firebase configs, Google OAuth client IDs, and keystores. | **REJECTED (for codebase branching)** |
| **C** | **Unified Codebase with First-Class English Edition & Build-Target Flag (RECOMMENDED)** | Single unified codebase where English is 100% implemented across all surfaces, engines, and prompts. An environment/build flag (`NEXT_PUBLIC_APP_EDITION=ENL`) governs whether the artifact is a dedicated English release (locked to English, hidden selectors) or a multilingual global release. | Zero codebase divergence; single source of truth; full regression protection; supports both dedicated ENL store listing or unified multi-language listing. | Requires thorough, disciplined dictionary & presentation layer completion. | **RECOMMENDED (OPTION C)** |
| **D** | Dynamic Server-Driven Remote Config | Download localized copy dynamically via Firestore or Cloud Storage at runtime. | Instant copy tweaks without app updates. | High latency, offline vulnerability, complex caching, and violation of Bhumi local-first philosophy. | **REJECTED** |

### 4.2 Explicit Global Architecture Policy Answers

```text
BUILD_108_ENL_LANGUAGE_MODEL        = OPTION_C_UNIFIED_EDITION_FLAGGED
VISIBLE_LANGUAGES                   = ["en"] (ENL mode) / ["en", "id", "ms"] (Multilingual mode)
INTERNAL_FALLBACK_LANGUAGES         = ["en", "id"]
EXISTING_USER_LOCALE_BEHAVIOR       = PRESERVE_PROFILE_INITIALIZE_ENL_SESSION
AI_OUTPUT_LANGUAGE_POLICY           = STRICT_ENGLISH_END_TO_END
API_OUTPUT_LANGUAGE_POLICY          = STRICT_ENGLISH_CANONICAL
INTENTIONALLY_UNTRANSLATED_TERMS    = CULTURAL_TERMS_CANONICAL_PRESERVED
```

#### Detailed Policy Breakdown:

1. **`BUILD_108_ENL_LANGUAGE_MODEL = OPTION_C_UNIFIED_EDITION_FLAGGED`**
   - Single unified codebase across all editions.
   - Build-time environment variable `NEXT_PUBLIC_APP_EDITION=ENL` controls visible language controls and default initialization.
   - All 51 routes, 11 blueprint engines, AI prompts, and legal documents provide 100% complete native English.

2. **`VISIBLE_LANGUAGES = ["en"]` (ENL Mode)**
   - When building the dedicated ENL artifact, language switchers on the Landing page (`app/page.tsx`) and Settings page (`app/settings/page.tsx`) are hidden.
   - The UI runs purely in English without displaying inactive language options.
   - In standard multilingual mode, the switcher remains functional across `id-ID`, `en-US`, and `ms-MY`.

3. **`INTERNAL_FALLBACK_LANGUAGES = ["en", "id"]`**
   - Fallback hierarchy: Keyed English (`translation.json`) -> Programmatic English semantic fallback -> `id-ID` dictionary (emergency safety net).
   - Under no circumstances will `id-ID` or `ms-MY` dictionary resources be deleted from source control.

4. **`EXISTING_USER_LOCALE_BEHAVIOR = PRESERVE_PROFILE_INITIALIZE_ENL_SESSION`**
   - Existing users upgrading from Build 107 retain their profile record (`users/{uid}.language`).
   - The ENL edition binary initializes the active session to `"en"`.
   - Calculations and blueprint views re-render in English. Historical user-created journal entries in Indonesian remain unaltered.

5. **`AI_OUTPUT_LANGUAGE_POLICY = STRICT_ENGLISH_END_TO_END`**
   - `buildDailyGuidancePrompt()` sets `outputLanguage = "en"`.
   - Indonesian boilerplate greetings (*"Halo {firstName}"*) become *"Welcome, {firstName}"* or natural time-of-day greetings.
   - Indonesian sign-offs (*"Peluk hangat dari Bhumi."*) become *"Warmly with you, Bhumi."*.
   - Deterministic local guidance fallback (`localDailyGuidanceFallback.ts`) returns 100% English strings when `language === "en"`.

6. **`API_OUTPUT_LANGUAGE_POLICY = STRICT_ENGLISH_CANONICAL`**
   - Internal API endpoints (`/api/ai/daily-guidance`, `/api/humandesign/calculate`, `/api/kenali-diri/aura`) return canonical English payloads and error messages.

7. **`INTENTIONALLY_UNTRANSLATED_TERMS = CULTURAL_TERMS_CANONICAL_PRESERVED`**
   - Authentic cosmological terms are preserved with clear English glosses:
     - **Weton:** *Dina*, *Pasaran* (*Legi, Pahing, Pon, Wage, Kliwon*), *Neptu*, *Pancasuda*.
     - **BaZi:** *Day Master*, *Yin/Yang Elements*, *Tian Gan*, *Di Zhi*.
     - **Tzolkin:** *Solar Seals* (*Imix, Ik, Akbal...*), *Galactic Tones*.
     - **Vedic:** *Nakshatras*, *Dashas*, *Rashi*.
     - **Human Design:** *Sacral*, *Ajna*, *Generator*, *Projector*, *Manifestor*, *Reflector*.
   - Surrounding explanations, summaries, and personality profiles must be rendered in fluent, native English.

---

## 5. Audit Results & Current Baseline Metrics

An exhaustive 51-route code audit (detailed in `BUILD_108_ENL_PAGE_AUDIT.md`) produced the following exact metrics:

```text
TOTAL_ROUTES                       = 51
TOTAL_USER_FACING_PAGES            = 48
DEV_OR_DEPRECATED_SURFACES         = 3 (app/admin/page, app/admin/activity, app/admin/diagnostics)
ENGLISH_READY_PAGES                = 0
PARTIAL_ENGLISH_PAGES              = 8
INDONESIAN_HARDCODED_PAGES         = 39
INTENTIONALLY_LOCAL_TERM_PAGES     = 1
ROUTE_LEVEL_HARDCODED_ID_FINDINGS  = 560
COMPONENT_LEVEL_HARDCODED_ID       = 389
TOTAL_HARDCODED_ID_FINDINGS        = 949+
MALAY_HARDCODED_FINDINGS           = 1
BACKEND_GENERATED_LANGUAGE_GAPS    = 11 (All 11 Blueprint presentation engines in lib/)
AI_LANGUAGE_GAPS                   = 5 (dailyGuidance, soulMirror, manifestation, reflection, identity prompts)
API_LANGUAGE_GAPS                  = 3 (ai, humandesign, aura routes)
FALLBACK_LANGUAGE_GAPS             = 6 (daily guidance fallback, CoreIdentity, timeOfDay, etc.)
LEGAL_COPY_GAPS                    = CRITICAL (5 of 5 legal/about/help pages are 100% hardcoded Indonesian)
BUILD_107_REGRESSION_RISKS         = FULLY IDENTIFIED & GUARDED
RECOMMENDED_SPRINT_COUNT           = 8 SPRINTS
ARCHITECTURE_RECOMMENDATION        = OPTION C (Unified First-Class English Edition Architecture)
```

---

## 6. Derived Sprint Roadmap Summary

The 8 implementation sprints (specified in detail in `BUILD_108_ENL_SPRINT_PLAN.md`):

1. **Sprint 1: Onboarding, Authentication & Core Shell** (`app/page.tsx`, `app/login/page.tsx`, `app/setup/page.tsx`, `AppNav.tsx`, language switcher hiding).
2. **Sprint 2: Dashboard & Core Identity** (`app/dashboard/page.tsx`, `app/dashboard/environment/page.tsx`, `CoreIdentity.tsx`, all 15 dashboard cards).
3. **Sprint 3: The 11 Blueprint Presentation Engines** (`app/blueprint/*` and all 11 `lib/` engines).
4. **Sprint 4: AI Daily Guidance, Prompts & Local Fallbacks** (`lib/prompts/*`, `unifiedBlueprintSynthesis.ts`, `localDailyGuidanceFallback.ts`).
5. **Sprint 5: Profile, Journey & Journal Hubs** (`profile`, `journey`, `journal`, `insights`, `reports/weekly`).
6. **Sprint 6: Wellness, Somatics, Healing & Innerwork** (`wellness`, `wellness-assessment`, `healing/*`, `innerwork/*`, `kenali-diri/aura`).
7. **Sprint 7: Settings, Paywall, Legal & Static Pages** (`settings`, `premium-bhumi`, `upgrade`, `tentang`, `syarat-ketentuan`, `kebijakan-privasi`, `bantuan`, `kontak`).
8. **Sprint 8: Final Regression, Build Verification & Release Protocol** (Full test suite, static surface guard, version bump to 108 / 5.0.8, signed AAB/APK build, Founder sign-off).

---

## 7. Governance Status & Next Steps

```text
BUILD_108_ENL_IMPLEMENTATION_STATUS = SPRINT_03_COMPLETE (Blueprint Hub + all 11 Blueprint Systems: Numerology, Human Design, Natal Chart, Destiny Matrix, Vedic, BaZi, Tzolkin, Weton, Whole Sign, Zi Wei, Astrocartography 100% English)
NEXT_SAFE_ACTION                = SPRINT-108-04-AI-GUIDANCE
```

**Guardrails:**
- NO product code edits may take place until the Founder approves this Master SOT, the Page Audit (`BUILD_108_ENL_PAGE_AUDIT.md`), and the Sprint Plan (`BUILD_108_ENL_SPRINT_PLAN.md`).
- NO version bump to 108 or 5.0.8.
- NO APK or AAB generation.
- NO deployment or publishing.
