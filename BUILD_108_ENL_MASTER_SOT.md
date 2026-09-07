# BUILD 108 ENL — MASTER SOURCE OF TRUTH (SOT)
**Bhumi Amartya — Dedicated English-Language Edition & Architecture**

```text
STATUS                          = IN_PROGRESS (SPRINT 7 & ENV2 COMPLETE; SPRINT 8 PENDING FOUNDER REVIEW)
CURRENT_BASELINE                = BUILD 107 (versionCode 107, versionName 5.0.7)
BASELINE_COMMIT                 = d2ecb5ed73b7bb5e95415be314305f3512533752
NEXT_PRIMARY_AGENT              = CODEX
INITIATIVE                      = BUILD 108 ENL
PURPOSE                         = Dedicated English-Language Edition / Global Release
TOTAL_ROUTES_AUDITED            = 51
TOTAL_USER_FACING_PAGES         = 48
DEV_OR_DEPRECATED_SURFACES      = 3
BUILD_108_ENL_IMPLEMENTATION_STATUS = IN_PROGRESS
GATE_108_CDI                    = CLOSED
CDI_BLOCKERS_OPEN              = 0
SPRINT_108_05                  = COMPLETE
SPRINT_108_06                  = COMPLETE
SPRINT_108_07                  = COMPLETE
SPRINT_108_ENV2                 = COMPLETE
GATE_108_FRA                    = PLANNED
BUILD_108_CAN_PROCEED_TO_RELEASE = NO
NEXT_SAFE_ACTION                = STOP_FOR_FOUNDER_REVIEW
RELEASE_GATE                    = FOUNDER_SIGN_OFF_REQUIRED
```

> **CORE DATA INTEGRITY GATE — READY_TO_CLOSE (final disposition 2026-09-07).** Sprint 4 is
> complete; Sprint 5 unblocks the moment the Founder ratifies `GATE_108_CDI` closure. The Founder
> confirmed three production data-integrity defects from real users that Build 108 must not
> inherit: (1) Schumann data unavailable, (2) Human Design advanced variables not stored /
> incomplete, (3) Chiron position reported incorrect. The read-only root-cause audit is
> **Founder-approved** (`BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md`); all root causes CONFIRMED and
> **dispositioned in §G**.
>
> `GATE_108_CDI = READY_TO_CLOSE — FOUNDER RATIFICATION PENDING`, `CDI_BLOCKERS_OPEN = 0` (§7.1 /
> CDI audit §G). All four CDI defects (Chiron, timezone, HD advanced variables, Schumann) resolve
> to honest, non-fabricated states. The next primary agent is **CODEX**.
>
> Completed state: `SPRINT_108_01..04 = COMPLETE`, `SPRINT_108_05 = BLOCKED` (unblocks on
> ratification); `CDI_108_01_CHIRON_NATAL_ACCURACY = COMPLETE`, `CDI_C1 = DONE`, `CDI_C2 = DONE`,
> `CDI_C3 = DONE`, `CDI_108_01A_TIMEZONE = COMPLETE`, `CDI_108_02_HUMAN_DESIGN = DONE`,
> `CDI_108_03_SCHUMANN = D1 APPROVED — ACCEPTED_UNAVAILABLE / fail-closed PASS`.
>
> Important completed Chiron state: old linear Chiron approximation removed; Swiss Ephemeris-derived
> client-side Chiron table implemented; Chiron fixture accuracy 10/10; fail-closed persistence
> implemented; Whole Sign and Placidus explicitly separated; no production backfill performed.
>
> Final disposition (§G) — remaining items, none blocking gate closure:
> **ACCEPTED_DEFERRED** — HD Cognition legacy re-fetch (new-user PASS) · HD Color/Tone/Base (honest
> source-unavailable) · HD service runtime validation (Sprint 8 / FRA §3.8) · Schumann live-source
> restoration (→ `SPRINT-108-ENV2`).
> **REQUIRES_FOUNDER_OPS** — genuine Placidus service deployment (CDI-C1 residual) ·
> diagnostic-emitting HD engine for Color/Tone/Base.
> **POST_RELEASE_BACKFILL** (both CDI-D1, separately Founder-authorized only) — HD legacy
> advanced-variable backfill · legacy natal Chiron/timezone backfill.
>
> Founder approved CDI-108-01A / CDI-C3 and CDI-108-02 implementation. The CDI-108-02 code now
> preserves the proven live fields, safely derives Perspective, fixes Variables Arrows mapping, and
> hardens the unapproved recovery script. Recovery execution, deployment, and backfill remain
> Founder-gated.
>
> Important HD audit refinement: the LIVE deployed Human Design `/calculate` contract differs from
> repo `services/humandesign-api/main.py`. Observed live payload already includes `digestion`,
> `environment`, `motivation`, and `cognition`. Apparently absent / unresolved: `perspective` and
> diagnostic Color/Tone/Base. CODEX must **NOT** assume the HD engine is the primary defect.
>
> The obsolete marker `BUILD_106_RECOVERY_IN_PROGRESS` no longer applies to this work. No production
> Firestore mutation; no backend deploy; no version bump / build / sign / deploy / upload. Production
> read-only probes are not implicitly authorized beyond evidence already collected.

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
10. **`BUILD_108_FINAL_RELEASE_AUDIT.md`** — Mandatory whole-product final acceptance protocol,
    evidence reconciliation, and pre-version/build/sign gate; must be read before final acceptance.
11. **`BUILD_107_HOTFIX_RELEASE.md`** & **`BUILD_106_MASTER_SOT.md`** — Historical baseline lineage.
12. **Provenance-verified V5 documents** (`V5_*.md`).
13. Legacy documents (`SOT.md`, `PRD.md`, `TODO.md`, `BUILD_100_*.md`) remain historical and non-authoritative.

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

### 4.3 Environmental Intelligence v2 — Founder-approved scope (2026-09-07)

```text
SPRINT_ID                      = SPRINT-108-ENV2
SPRINT_108_ENV2                 = PLANNED
SPRINT_108_ENV2_STATUS          = PLANNED
ENV2_IMPLEMENTATION            = NOT AUTHORIZED
ENV2_SOURCE_RESEARCH_REQUIRED   = YES — BEFORE IMPLEMENTATION
ENV2_BACKEND_REQUIRED           = UNDETERMINED — SOURCE/ARCHITECTURE EVIDENCE REQUIRED
ENV2_RELEASE_RISK               = OPEN — DATA ACCESS, ATTRIBUTION, FRESHNESS, AND RUNTIME VALIDATION
POSITION                       = AFTER GATE_108_CDI CLOSES; BEFORE FINAL BUILD 108 RELEASE
NEXT_SAFE_ACTION               = FOUNDER_RATIFY_GATE_108_CDI_CLOSURE -> RESUME SPRINT-108-05
```

The Founder approved this product scope and documentation, not ENV2 implementation. ENV2 is an
additional named sprint; existing Sprints 5–8 retain their numbers and scope. Prefer ENV2 before
or alongside subsequent Environment-related product work after CDI closure. Completed Sprint 2
and completed CDI items are not reopened merely to schedule ENV2. Scheduling alongside other
work does not waive CDI closure or the separate implementation authorization.

**Product scope:** trustworthy environmental context for the user's location, presented in a
Dashboard **Atmosphere & Volcanic** card and an Environment detail section/page. A trend/timeline
is conditional on suitable historical observations. A map/plume visualization is conditional on
licensed, reliable spatial/plume data. No new route, source integration, or visualization is
claimed as implemented by this scope decision.

| Data domain | Planned fields | Scientific boundary |
|---|---|---|
| Air quality | AQI, PM2.5, PM10, NO2, O3, CO, surface SO2 concentration | Preserve pollutant units and the AQI standard/averaging period; distinguish measured, modelled, and forecast values. |
| Atmosphere | Total-column SO2 | Retain the original scientific unit and provenance; never treat a vertical column as surface inhalation concentration. |
| Wind | Speed, direction, movement relative to user location | Preserve height/level, time, direction convention, units, and spatial context; a local wind vector alone does not prove a plume trajectory. |
| Volcanic context | `plumeDetected`, `probableVolcanicOrigin`, `probableSource`, `attributionConfidence` | Unknown is explicit; positive plume/origin/source claims require supporting observations. |

`SURFACE_SO2`, `ATMOSPHERIC_COLUMN_SO2`, and `VOLCANIC_ATTRIBUTION` are separate domains. Never
transform one into another. SO2 alone cannot establish volcanic origin. Never name a volcano
without supported attribution using evidence such as plume location/geometry, wind trajectory,
source/volcano location, timing, and source observation provenance. If that evidence is
insufficient, `probableSource = null`; weak attribution remains unknown, not a named low-confidence
guess. `plumeDetected = false` must not be used as a default for missing observations.

Schumann Resonance, NOAA Kp, earthquakes, weather, and generic geomagnetic activity are not
substitutes for atmospheric SO2 or volcanic plume measurements. Keep cultural/spiritual
interpretation clearly separate from measured environmental facts.

**Canonical model design requirement (documentation contract, not an implemented schema):**

```text
EnvironmentalConditionPayload {
  airQuality: { aqi, pm25, pm10, no2, o3, co, surfaceSo2 }
  atmosphere: { totalColumnSo2 }
  wind: { speed, direction, movementRelativeToUserLocation }
  volcanic: {
    plumeDetected: boolean | null
    probableVolcanicOrigin: boolean | null
    probableSource: sourceReference | null
    attributionConfidence: evidenceBackedAssessment | null
    evidenceRefs: provenanceReference[]
  }
  provenance
  freshness
  updatedAt
}

Every datum carries or resolves through an explicit metadata reference to:
SOURCE, OBSERVED_AT, FETCHED_AT, FRESHNESS, QUALITY, PROVENANCE.
Numeric data also retains its original unit, measurement type, spatial coverage,
and applicable level/averaging interval. Forecast valid time is not observed time.
```

The payload timestamp must not replace per-datum observation times or make mixed-age data appear
fresh. Each datum can be available, unavailable, unknown, or stale independently; unavailable
values are null with a reason, never synthetic zeroes. Define dataset-specific freshness and
cache limits during source research; re-fetching never resets the age of an observation. Keep
gaps in history, and exclude unsupported/stale inputs from positive attribution or health advice.

**Fail closed and health copy:** render unavailable/unknown when data or attribution is
insufficient. Never fabricate “Normal”, “Stable”, “Safe”, “Volcanic plume detected”, or a source
volcano. Recommendations remain conservative. Atmospheric-column SO2 cannot directly support
personal exposure or health claims. Surface air-quality advice requires relevant surface
measurements or established AQI data. All ENL UI, copy, error, stale, and unknown states must be
native English; existing multilingual behavior remains compatible.

**Required research before implementation:** compare authoritative/measurement-backed providers
separately for surface air quality, atmospheric SO2 column, wind, and volcanic activity/plumes.
For every candidate record the following, using explicit unknown/unverified values where needed:

```text
SOURCE =
DATASET =
MEASUREMENT_TYPE =
SPATIAL_RESOLUTION =
TEMPORAL_RESOLUTION =
HISTORY_AVAILABLE =
HTTPS =
API =
CORS =
RATE_LIMIT =
LICENSING =
ANDROID_COMPATIBILITY =
PROVENANCE =
RELIABILITY =
VERDICT =
```

Windy screenshots and Windy visualization are not canonical Bhumi data sources. Evaluate
(A) direct client APIs, (B) a Bhumi environmental proxy, (C) scheduled ingestion/cache, and
(D) a hybrid. Prefer isolation of provider changes from the Android client; the final choice
must follow source evidence, static Next export/Capacitor constraints, HTTPS/CORS, access terms,
rate limits, freshness, provenance, replacement strategy, and failure behavior. A backend is
not yet proven necessary, selected, or authorized for deployment.

**Inheritance and release:** preserve HD convergence, completed Chiron/timezone CDI, Admin and
Auth Diagnostics removal, security/billing, Schumann fail-closed behavior, and existing
Environment provenance separation. ENV2 cannot close or bypass `GATE_108_CDI`. Its future
implementation must satisfy the ENV2 acceptance criteria in the sprint plan and the additional
evidence requirements within the existing seven release gates. Scope approval grants no
production reads/writes, provider commitment, deployment, version bump, build/sign, or upload.

---

### 4.4 Mandatory Build 108 Final Release Audit — 2026-09-07

```text
GATE_ID = GATE_108_FRA
GATE_NAME = FINAL_RELEASE_AUDIT
GATE_108_FRA = PLANNED
BUILD_108_CAN_PROCEED_TO_RELEASE = NO
```

[`BUILD_108_FINAL_RELEASE_AUDIT.md`](BUILD_108_FINAL_RELEASE_AUDIT.md) defines the mandatory
**complete-product** audit, not a changed-file review. It runs only after all Build 108
implementation sprints, `GATE_108_CDI`, ENV2, and all Founder-approved remediation are complete,
and must PASS **before** versionCode 108 / versionName 5.0.8, final production build, signing,
or Play upload. It is PLANNED only; do not execute it now or modify runtime code for this addition.

The audit covers new-user and Build 103–107 legacy journeys; auth; setup/timezone/DST;
billing/entitlements and separate admin authorization; every Sprint 1–7/ENV2/CDI/recovery requirement;
every production route and child surface; HD/natal/Environment data; actual generated and fallback
ENL output; security/privacy; and source ancestry/worktree/release provenance. Every requirement
must identify implementation, test evidence, runtime evidence, and PASS/PARTIAL/DEFERRED/FAIL.
Targets: UNKNOWN=0, UNACCOUNTED=0, FALSE_PASS=0, USER_VISIBLE_ID_LEAK=0,
USER_VISIBLE_MS_LEAK=0, RELEASE_CRITICAL_GAPS_OPEN=0. The full domain checklist, evidence rules,
provenance fields, and final report in that document are mandatory, not optional examples.

Within unchanged Sprint 8 numbering, pre-release verification/FRA precedes the release version/
artifact phase. Existing seven release gates remain mandatory: final artifact/signing proof and
publication approval occur afterward. FRA PASS cannot claim those future checks as executed or
authorize restricted actions. Completed CDI implementation is preserved; the final whole-product
regression audit only reopens fixes if evidence demonstrates regression.

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

**Additional sprint:** `SPRINT-108-ENV2 — Environmental Intelligence v2` is PLANNED after
`GATE_108_CDI` closes and before final release, preferably before/alongside subsequent
Environment-related work. Sprints 5–8 are not renumbered. See §4.3 and the sprint plan.
After all implementation/remediation, Sprint 8 must pass `GATE_108_FRA` (§4.4) before its
authorized version bump/build/sign phase. `BUILD_108_CAN_PROCEED_TO_RELEASE = NO` now.

---

## 7. Governance Status & Next Steps

```text
BUILD_108_ENL_IMPLEMENTATION_STATUS = PAUSED_FOR_CORE_DATA_INTEGRITY
GATE_108_CDI                    = READY_TO_CLOSE — FOUNDER RATIFICATION PENDING (CDI_BLOCKERS_OPEN = 0; see CDI audit §G)
LAST_COMPLETED_SPRINT           = SPRINT-108-04-AI-GUIDANCE
SPRINT_108_01                  = COMPLETE
SPRINT_108_02                  = COMPLETE
SPRINT_108_03                  = COMPLETE
SPRINT_108_04                  = COMPLETE
SPRINT_108_05                  = BLOCKED (unblocks on GATE_108_CDI closure ratification)
CDI_BLOCKERS_OPEN              = 0
CDI_108_01_CHIRON_NATAL_ACCURACY = COMPLETE
CDI_C1                         = DONE
CDI_C2                         = DONE
CDI_C3                         = DONE
CDI_108_01A_TIMEZONE           = COMPLETE
CDI_108_02_HUMAN_DESIGN        = DONE — CLIENT INTEGRITY / RECOVERY SAFETY; SERVICE EXTRAS SOURCE-DEPENDENT
CDI_108_03_SCHUMANN            = D1 APPROVED — ACCEPTED_UNAVAILABLE / FAIL-CLOSED PASS (2026-09-07)
ACCEPTED_DEFERRED_ITEMS       = HD Cognition (legacy re-fetch) · HD Color/Tone/Base · HD service runtime validation (Sprint 8 / FRA §3.8) · Schumann live source (→ SPRINT-108-ENV2)
OPS_GATED_ITEMS               = genuine Placidus service deployment (CDI-C1) · diagnostic-emitting HD engine for Color/Tone/Base
BACKFILL_GATED_ITEMS          = HD legacy advanced-variable backfill · legacy natal Chiron/timezone backfill (both CDI-D1)
CDI_D1_LEGACY_BACKFILL         = PENDING — NOT AUTHORIZED (POST_RELEASE_BACKFILL)
SPRINT_108_ENV2                 = PLANNED (also owns future Schumann live-source research)
GATE_108_FRA                    = PLANNED
BUILD_108_CAN_PROCEED_TO_RELEASE = NO
NEXT_SAFE_ACTION                = FOUNDER_RATIFY_GATE_108_CDI_CLOSURE -> RESUME SPRINT-108-05
PRODUCTION_FIRESTORE_WRITE      = NOT AUTHORIZED
PRODUCTION_BACKFILL             = NOT AUTHORIZED
BACKEND_DEPLOY                  = NOT AUTHORIZED
PLAY_UPLOAD                     = NOT AUTHORIZED
```

### 7.1 Core Data Integrity Gate — `GATE_108_CDI` (opened 2026-09-06)

Three production data-integrity defects confirmed by the Founder from real-user reports. Read-only
root-cause audit complete and **Founder-approved** (`BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md`); all
three root causes CONFIRMED.

| Defect | Root cause (confirmed) | Status |
|---|---|---|
| **Chiron placement wrong** | Swiss Ephemeris `/calculate-astrology` unreachable in production; local fallback used a hand-rolled **linear** Chiron (`astronomy-engine` has no Chiron); houses were Equal House mislabelled `placidusHouses`; CDI-108-01A timezone propagation is complete; genuine Placidus production deployment remains ops-gated. | **CDI-108-01 COMPLETE. CDI-108-01A COMPLETE. CDI-C1 DONE. CDI-C2 DONE. CDI-C3 DONE.** Committed Swiss Ephemeris-derived client-side Chiron table; old linear Chiron approximation removed; Chiron fixture accuracy 10/10; fail-closed persistence implemented; Whole Sign and Placidus explicitly separated. Genuine Placidus production service deployment remains ops-gated. No production backfill performed. |
| **HD advanced variables "Not stored"** | Adapter `perspective` gap; Variables-Arrows UI key mismatch; legacy blueprints predate fields; `mass-recover-hd` centers corruption; Indonesian-only narratives. Deployed `/calculate` returns `digestion`/`environment`/`motivation`/`cognition`; emits no `diagnostic` block and ignores `debug`. | **RESOLVED (client integrity / recovery safety) — CDI-108-02 (§B.11), Founder-approved.** Residual: HD Cognition legacy re-fetch → ACCEPTED_DEFERRED (new-user PASS); HD Color/Tone/Base → ACCEPTED_DEFERRED (honest source-unavailable) + REQUIRES_FOUNDER_OPS (diagnostic-emitting engine); HD service runtime validation → ACCEPTED_DEFERRED (Sprint 8 / FRA §3.8); HD legacy backfill → POST_RELEASE_BACKFILL (CDI-D1). No fabrication; Build 107 convergence intact. |
| **Schumann `Data belum tersedia`** | Upstream provider endpoint `schumannresonancelive.com/api/data.php` returns **HTTP 404**; no qualifying genuine SR source exists anywhere (`BUILD_108_CDI_108_03_SCHUMANN_SOURCE_RESTORATION.md` / CDI audit §A.6). Pre-existing since ≥ Build 106 (residual DS-E1). No fabricated "healthy" values. | **D1 APPROVED (2026-09-07) — ACCEPTED_UNAVAILABLE.** `CDI_108_03_RESEARCH = COMPLETE`, `CDI_108_03_DATA_INTEGRITY = PASS`, `CDI_108_03_FAIL_CLOSED = PASS`. `SCHUMANN_API_URL` unchanged; no proxy; no NOAA/USGS/weather inference; no JPEG-pixel derivation. CDI-A3 preserved + regression-locked. Future live-source research → **`SPRINT-108-ENV2`**. |

Cross-cutting: **CDI-D1** — legacy data backfill (HD advanced variables + legacy natal
Chiron/timezone) is **POST_RELEASE_BACKFILL**, separately Founder-authorized only, **not
authorized now**.

**Final CDI disposition (2026-09-07, CDI audit §G): `GATE_108_CDI = READY_TO_CLOSE`,
`CDI_BLOCKERS_OPEN = 0`.** All four CDI defects (Chiron, timezone, HD advanced variables, Schumann)
resolve to honest, non-fabricated states. Every open item is ACCEPTED_DEFERRED,
REQUIRES_FOUNDER_OPS, or POST_RELEASE_BACKFILL, and none prevents an honest release.
`SPRINT_108_05_CAN_RESUME = YES` upon Founder ratification of gate closure.

**Guardrails:**
- NEXT PRIMARY AGENT: CODEX.
- NEXT SAFE ACTION: `FOUNDER_RATIFY_GATE_108_CDI_CLOSURE -> RESUME SPRINT-108-05`.
- Closing `GATE_108_CDI` unblocks `SPRINT-108-05` only; it does **not** authorize release, ops
  deployment (CDI-C1 genuine Placidus service; diagnostic-emitting HD engine), or any backfill
  (CDI-D1). Those retain their own gates (`GATE_108_FRA`, ops, CDI-D1).
- Do not implement, deploy, or backfill anything under this disposition task. Do not reopen
  completed CDI work absent regression evidence. ENV2/FRA remain PLANNED only.
- NO Sprint 5 execution until the Founder ratifies `GATE_108_CDI` closure.
- NO production Firestore write; NO backfill of any kind.
- Production read-only probes are not implicitly authorized beyond evidence already collected.
- NO version bump to 108 or 5.0.8; NO APK/AAB; NO deployment or publishing.
- Every `CDI-*` fix preserves 100% of the Build 107 inheritance checklist (§3) — verified for
  CDI-108-01 (HD convergence 19/19, production-surface guard 131/131, `tsc` EXIT 0).
