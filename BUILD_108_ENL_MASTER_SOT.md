# BUILD 108 ENL — MASTER SOURCE OF TRUTH (SOT)
**Bhumi Amartya — Dedicated English-Language Edition & Architecture**

```text
STATUS                          = PAUSED (SPRINT 4 COMPLETE — HELD FOR CORE DATA INTEGRITY AUDIT)
CURRENT_BASELINE                = BUILD 107 (versionCode 107, versionName 5.0.7)
BASELINE_COMMIT                 = d2ecb5ed73b7bb5e95415be314305f3512533752
INITIATIVE                      = BUILD 108 ENL
PURPOSE                         = Dedicated English-Language Edition / Global Release
TOTAL_ROUTES_AUDITED            = 51
TOTAL_USER_FACING_PAGES         = 48
DEV_OR_DEPRECATED_SURFACES      = 3
BUILD_108_ENL_IMPLEMENTATION_STATUS = PAUSED_FOR_CORE_DATA_INTEGRITY
GATE_108_CDI                    = IN_PROGRESS (CDI-108-01 + CDI-108-01A DONE · CDI-108-02 refined audit DONE/impl NOT STARTED · CDI-108-03 NOT STARTED)
NEXT_SAFE_ACTION                = FOUNDER_REVIEW_OF_CDI_108_01A_AND_HD_REFINED_AUDIT
RELEASE_GATE                    = FOUNDER_SIGN_OFF_REQUIRED
```

> **CORE DATA INTEGRITY HOLD (2026-09-06).** Sprint 4 is complete. Sprint 5 is **NOT** started.
> The Founder confirmed three production data-integrity defects from real users that Build 108
> must not inherit: (1) Schumann data unavailable, (2) Human Design advanced variables not stored
> / incomplete, (3) Chiron position reported incorrect. The read-only root-cause audit is complete,
> **Founder-approved**, and recorded in **`BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md`** (mandatory
> reading order + authority hierarchy below). All three root causes CONFIRMED.
>
> `GATE_108_CDI` is **IN_PROGRESS** (§7.1):
> - **CDI-108-01 (Chiron ephemeris) — DONE.** Linear Chiron + Equal-house-as-Placidus removed;
>   committed Swiss Ephemeris table + canonical-service proxy route; fail-closed, non-destructive.
> - **CDI-108-01A (timezone canonicalization) — DONE.** `longitude / 15` + browser-guess + `+07:00`
>   default removed; deterministic offline lat/lon → IANA (`tz-lookup`); luxon DST-correct
>   wall-clock → UTC; a valid stored zone is never overwritten; fail closed to pending when
>   unresolved. End-to-end Chiron residual 0.000420° (12/12 fixtures).
> - **CDI-108-02 (Human Design) — refined READ-ONLY live-contract audit DONE; implementation NOT
>   started.** The *deployed* engine returns `digestion/environment/motivation/cognition`; the
>   confirmed defects are a `perspective` adapter gap, a `variables.short_code` UI-key mismatch,
>   the absence of per-planet Color/Tone/Base, legacy blueprints needing migration/re-fetch, and
>   the `mass-recover-hd.ts` `centers` corruption. See audit §B.8.
> - **CDI-108-03 (Schumann) — NOT started.**
> The obsolete marker `BUILD_106_RECOVERY_IN_PROGRESS` no longer applies to this work.
> No production Firestore mutation; no backend deploy; no version bump / build / sign / deploy / upload.

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
4. **`BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md`** — Canonical root-cause record for the three
   confirmed production data-integrity defects (Schumann, Human Design advanced variables, Chiron)
   that gate Sprint 5. Authoritative for the `CDI-*` blocker set.
5. **`BUILD_108_ENL_PAGE_AUDIT.md`** — Exhaustive 51-route read-only audit report and copy gap analysis.
6. **`BUILD_108_ENL_SCOPE_MATRIX.md`** — Surface-by-surface status & classification ledger.
7. **`BUILD_108_ENL_SPRINT_PLAN.md`** — Data-driven 8-sprint implementation sequence.
8. **`BUILD_108_ENL_HANDOFF.md`** — Operational handoff & task progression rules.
9. **`BUILD_108_ENL_RELEASE_PLAN.md`** — Release gates, verification suites, and deployment checklists.
10. **`BUILD_107_HOTFIX_RELEASE.md`** & **`BUILD_106_MASTER_SOT.md`** — Historical baseline lineage.
11. **Provenance-verified V5 documents** (`V5_*.md`).
12. Legacy documents (`SOT.md`, `PRD.md`, `TODO.md`, `BUILD_100_*.md`) remain historical and non-authoritative.

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
BUILD_108_ENL_IMPLEMENTATION_STATUS = PAUSED_FOR_CORE_DATA_INTEGRITY
GATE_108_CDI                    = IN_PROGRESS
LAST_COMPLETED_SPRINT           = SPRINT-108-04-AI-GUIDANCE
CDI_108_01_CHIRON              = DONE (2026-09-06, commit dccaf08)
CDI_108_01A_TIMEZONE          = DONE (2026-09-06)
CDI_108_02_HUMAN_DESIGN        = REFINED READ-ONLY AUDIT DONE (§B.8) — IMPLEMENTATION NOT_STARTED
CDI_108_03_SCHUMANN            = NOT_STARTED
SPRINT_5_STATUS                 = NOT_STARTED — BLOCKED behind GATE_108_CDI
NEXT_SAFE_ACTION                = FOUNDER_REVIEW_OF_CDI_108_01A_AND_HD_REFINED_AUDIT
```

### 7.1 Core Data Integrity Gate — `GATE_108_CDI` (opened 2026-09-06)

Three production data-integrity defects confirmed by the Founder from real-user reports. Read-only
root-cause audit complete and **Founder-approved** (`BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md`); all
three root causes CONFIRMED.

| Defect | Root cause (confirmed) | Status |
|---|---|---|
| **Chiron placement wrong** | Swiss Ephemeris `/calculate-astrology` unreachable in production; local fallback used a hand-rolled **linear** Chiron (`astronomy-engine` has no Chiron); houses were Equal House mislabelled `placidusHouses`; plus `longitude / 15` timezone inference. | **DONE — CDI-108-01 (§C.8) + CDI-108-01A (§C.9).** Committed Swiss Ephemeris Chiron table (12/12 fixtures correct sign); linear model + fake Placidus removed; `getAstrologyApiUrl()` + `app/api/humandesign/astrology` proxy for the canonical service; deterministic IANA timezone (`tz-lookup`) + luxon DST-correct conversion — no `longitude / 15`; Whole Sign / Placidus separate + labelled; fail-closed, non-destructive persistence. **CHIRON_END_TO_END_MAX_ERROR = 0.000420°.** Residual: deploy the ephemeris service for genuine Placidus houses (CDI-C1 ops step). |
| **HD advanced variables "Not stored"** | **Refined against the LIVE deployed contract (audit §B.8).** The deployed engine **does** return `digestion/environment/motivation/cognition`; adapter/normalizer/persistence/UI-grid-keys handle them. Confirmed defects: (a) `perspective` — adapter reads an absent top-level key instead of `variables.bottom_right` (derivable); (b) **Variables Arrows** — `HumanDesignBodygraphLite.tsx` reads `variables.variable/value` instead of the stored `variables.short_code` (UI-only); (c) per-planet **Color/Tone/Base** — deployed engine never emits them, ignores `debug` (needs another engine — CDI-B6); (d) "Not stored" for the present fields on real users = **legacy blueprints** (migrate from stored `variables`, else re-fetch); (e) `mass-recover-hd.ts` still corrupts `centers` + drops activations; (f) HD variable/style narratives Indonesian-only; (g) "Story for this section is being prepared." on CANONICAL types. HD **core** identity healthy. | **REFINED READ-ONLY AUDIT DONE (§B.8). IMPLEMENTATION NOT STARTED — CDI-108-02** (CDI-B1..B6, per-field). |
| **Schumann `Data belum tersedia`** | Upstream provider endpoint `schumannresonancelive.com/api/data.php` returns **HTTP 404**. Pre-existing since ≥ Build 106 (residual DS-E1). No fabricated "healthy" values. | **NOT STARTED — CDI-108-03** (CDI-A1..A3). |

Cross-cutting: **CDI-D1** — post-fix, non-destructive, convergence-safe production backfill for
HD advanced variables + Chiron across Build 103–107 cohorts (Founder-authorised, separate; NOT
authorised now).

**Guardrails:**
- CDI-108-02 / CDI-108-03 not started until the Founder rules on sequencing.
- NO Sprint 5 execution until `GATE_108_CDI` is closed / the Founder authorises a parallel track.
- NO production Firestore read or write; NO backfill of any kind.
- NO version bump to 108 or 5.0.8; NO APK/AAB; NO deployment or publishing.
- Every `CDI-*` fix preserves 100% of the Build 107 inheritance checklist (§3) — verified for
  CDI-108-01 (HD convergence 19/19, production-surface guard 131/131, `tsc` EXIT 0).
