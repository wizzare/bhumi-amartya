# BUILD 108 ENL — OPERATIONAL HANDOFF
**Developer & Agent Execution Guide**

```text
STATUS                          = CORE DATA INTEGRITY GATE OPEN — CDI-108-01 DONE (SPRINT 5 BLOCKED)
CURRENT_BASELINE                = BUILD 107 (versionCode 107, versionName 5.0.7)
BASELINE_COMMIT                 = d2ecb5ed73b7bb5e95415be314305f3512533752
CURRENT_BRANCH                  = recovery/build106-product-continuity
INITIATIVE                      = BUILD 108 ENL
PURPOSE                         = Dedicated English-Language Edition of Bhumi Amartya
TOTAL_ROUTES_AUDITED            = 51
TOTAL_USER_FACING_PAGES         = 48
DERIVED_SPRINT_COUNT            = 8 SPRINTS
BUILD_108_ENL_IMPLEMENTATION_STATUS = PAUSED_FOR_CORE_DATA_INTEGRITY
GATE_108_CDI                    = IN_PROGRESS (CDI-108-01 + CDI-108-01A DONE · CDI-108-02 refined audit DONE/impl NOT STARTED · CDI-108-03 NOT STARTED)
NEXT_SAFE_ACTION                = FOUNDER_REVIEW_OF_CDI_108_01A_AND_HD_REFINED_AUDIT
RELEASE_GATE                    = FOUNDER_SIGN_OFF_REQUIRED
```

> **CORE DATA INTEGRITY GATE (2026-09-06).** Sprint 4 is complete. **Do NOT start Sprint 5.** The
> read-only root-cause audit (**`BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md`**) is **Founder-approved**;
> all three root causes CONFIRMED. `GATE_108_CDI` is IN_PROGRESS:
> - **CDI-108-01 (Chiron ephemeris) — DONE.** Linear Chiron + Equal-house-as-Placidus removed;
>   committed Swiss Ephemeris table (`lib/astrology/chironEphemeris.ts` + `data/chironEphemeris.json`);
>   `getAstrologyApiUrl()` + `app/api/humandesign/astrology` proxy; fail-closed, non-destructive.
> - **CDI-108-01A (timezone canonicalization) — DONE.** `longitude / 15` + browser-guess + `+07:00`
>   default removed; deterministic offline lat/lon → IANA (`lib/astrology/resolveIanaTimezone.ts`,
>   `tz-lookup@6.1.25`); luxon DST-correct wall-clock → UTC; a valid stored zone is never
>   overwritten; fail closed to pending. End-to-end Chiron residual 0.000420° (12/12 fixtures).
>   Test: `tests/unit/build108-cdi01a-timezone-canonicalization.test.ts`.
> - **CDI-108-02 (Human Design) — refined READ-ONLY live-contract audit DONE (audit §B.8);
>   implementation NOT STARTED.** Live engine returns `digestion/environment/motivation/cognition`;
>   the confirmed defects are a `perspective` adapter gap, a `variables.short_code` UI-key
>   mismatch, absent per-planet Color/Tone/Base, legacy blueprints needing migration/re-fetch,
>   and the `mass-recover-hd.ts` `centers` corruption.
> - **CDI-108-03 (Schumann source) — NOT STARTED.**
>
> No further `CDI-*` implementation, no production Firestore read/write or backfill, no backend
> deploy, and no version bump / build / sign / deploy / upload until the Founder reviews CDI-108-01A
> + the refined HD audit and rules on sequencing. `BUILD_106_RECOVERY_IN_PROGRESS` no longer applies.

---

## 1. Operating Rules for Incoming Agents

Any coding agent operating on Build 108 ENL MUST strictly adhere to the following invariants:

1. **Do NOT modify product code yet.**
   - Code modification, refactoring, or translation PRs may only begin AFTER explicit Founder sign-off.
   - The Build 108 ENL initiative is currently **PAUSED_FOR_CORE_DATA_INTEGRITY** with
     `GATE_108_CDI = IN_PROGRESS`. Sprint 5 is NOT started. **CDI-108-01 (Chiron) is done;**
     no further `CDI-*` fix (CDI-108-02 HD, CDI-108-03 Schumann) from
     `BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md` may be implemented until the Founder reviews
     CDI-108-01 and rules on sequencing.
2. **Do NOT bump version yet.**
   - `versionCode` remains `107` and `versionName` remains `"5.0.7"` until the sprint release stage.
3. **Do NOT build, sign, or upload artifacts yet.**
   - No APK, AAB, or web export generation is authorized at this time.
4. **Do NOT touch production data.**
   - No production Firestore read or write. No blueprint / Human Design / natal backfill or
     migration (incl. `scripts/mass-recover-hd.ts`) may be run.
5. **Preserve Untracked Files:**
   - `scripts/.build106-production-admin-provision.mjs` is an untracked credential utility and MUST NOT be staged or deleted.
6. **Honor Build 107 Continuity:**
   - You must verify that `tests/unit/build107-hd-existing-user-convergence.test.ts` and `tests/unit/build107-production-surface-guard.test.ts` stay completely GREEN at all times.
   - Every future `CDI-*` fix must leave the Build 107 inheritance checklist
     (`BUILD_108_ENL_MASTER_SOT.md §3`) 100% intact — in particular, no change may let a failed
     Human Design recalculation overwrite a CANONICAL stored `type`.

---

## 2. Worktree & Lineage Integrity

```text
WORKTREE PATH                   = c:\tmp\bhumi-build106-recovery
CURRENT BRANCH                  = recovery/build106-product-continuity
BASE PRODUCTION COMMIT          = d2ecb5e (docs: record production regression hotfix and Build 107 release provenance)
PARENT COMMIT                   = 4e6ca26 (chore: prepare Build 107 — versionCode 107 / versionName 5.0.7)
```

Before making any changes in future sprints, verify:
```bash
git branch --show-current
git rev-parse HEAD
git status --short
```

---

## 3. Sprint-by-Sprint Execution Roadmap

Detailed specifications for each sprint are in `BUILD_108_ENL_SPRINT_PLAN.md`:

- **Sprint 1: Onboarding, Authentication & Core Shell** (`app/page.tsx`, `app/login/page.tsx`, `app/setup/page.tsx`, `AppNav.tsx`, language switcher hiding).
- **Sprint 2: Dashboard & Core Identity** (`app/dashboard/page.tsx`, `app/dashboard/environment/page.tsx`, `CoreIdentity.tsx`, all 15 dashboard cards).
- **Sprint 3: The 11 Blueprint Presentation Engines** (`app/blueprint/*` and all 11 `lib/` engines).
- **Sprint 4: AI Daily Guidance, Prompts & Local Fallbacks** (`lib/prompts/*`, `unifiedBlueprintSynthesis.ts`, `localDailyGuidanceFallback.ts`).
- **Sprint 5: Profile, Journey & Journal Hubs** (`profile`, `journey`, `journal`, `insights`, `reports/weekly`).
- **Sprint 6: Wellness, Somatics, Healing & Innerwork** (`wellness`, `wellness-assessment`, `healing/*`, `innerwork/*`, `kenali-diri/aura`).
- **Sprint 7: Settings, Paywall, Legal & Static Pages** (`settings`, `premium-bhumi`, `upgrade`, `tentang`, `syarat-ketentuan`, `kebijakan-privasi`, `bantuan`, `kontak`).
- **Sprint 8: Final Regression, Build Verification & Release Protocol** (Full test suite, static surface guard, version bump to 108 / 5.0.8, signed AAB/APK build, Founder sign-off).

---

## 4. Quick Verification Commands

```powershell
# Set Node environment
$env:PATH = "C:\Users\shein\AppData\Local\nvm\v20.20.2;" + $env:PATH

# 1. Typecheck
npx tsc --noEmit

# 2. Production Surface Guard
node --import tsx tests/unit/build107-production-surface-guard.test.ts

# 3. Human Design Convergence Guard
node --import tsx tests/unit/build107-hd-existing-user-convergence.test.ts

# 4. Version Reconciliation Guard
node --import tsx tests/unit/version-reconciliation.test.ts
```

---

## 5. Current Task State & Handoff Action

```text
BUILD_108_ENL_IMPLEMENTATION_STATUS = PAUSED_FOR_CORE_DATA_INTEGRITY
GATE_108_CDI                    = IN_PROGRESS
LAST_COMPLETED_SPRINT           = SPRINT-108-04-AI-GUIDANCE
CDI_108_01_CHIRON              = DONE (commit dccaf08; test build108-cdi01-chiron-natal-accuracy EXIT 0)
CDI_108_01A_TIMEZONE          = DONE (test build108-cdi01a-timezone-canonicalization EXIT 0; CHIRON_END_TO_END_MAX_ERROR = 0.000420°)
CDI_108_02_HUMAN_DESIGN        = REFINED READ-ONLY AUDIT DONE (audit §B.8) — IMPLEMENTATION NOT_STARTED
CDI_108_03_SCHUMANN            = NOT_STARTED
SPRINT_5_STATUS                 = NOT_STARTED (BLOCKED behind GATE_108_CDI)
NEXT_SAFE_ACTION                = FOUNDER_REVIEW_OF_CDI_108_01A_AND_HD_REFINED_AUDIT
```

### 5.1 Core Data Integrity Gate — `GATE_108_CDI` (2026-09-06)

Read-only root-cause audit **Founder-approved**: **`BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md`**.
All three root causes CONFIRMED.

| Defect | Confirmed root cause | Status |
|---|---|---|
| **Chiron wrong** | Swiss Ephemeris `/calculate-astrology` unreachable; silent local fallback derived Chiron from a **linear** ephemeris; Equal House mislabelled `placidusHouses`; plus `longitude / 15` timezone inference. | **DONE — CDI-108-01 + CDI-108-01A.** Committed Swiss Ephemeris Chiron table; linear model + fake Placidus removed; `getAstrologyApiUrl()` + `app/api/humandesign/astrology` proxy; deterministic IANA timezone (`tz-lookup`) + luxon DST-correct conversion — no `longitude / 15`; Whole Sign / Placidus separate + labelled; fail-closed (`chironAccuracy` / `houseSystem`), non-destructive. `tsc` EXIT 0; CDI-01 13/13; CDI-01A 10/10 (residual 0.000420°); Build 107 19/19 + 131/131. Ops residual: deploy the ephemeris service for genuine Placidus (CDI-C1). |
| **HD advanced variables "Not stored"** | **Refined against the LIVE deployed contract (audit §B.8).** The deployed engine DOES return `digestion/environment/motivation/cognition`; adapter/normalizer/persistence/UI-grid-keys handle them. Confirmed defects: `perspective` adapter gap (reads absent key, not `variables.bottom_right`); `variables.short_code` UI-key mismatch (`HumanDesignBodygraphLite.tsx` reads `variable`/`value`); per-planet Color/Tone/Base absent from the engine (ignores `debug`); "Not stored" on real users = legacy blueprints (local migration from stored `variables`, else re-fetch); `mass-recover-hd.ts` still corrupts `centers` + drops activations; narratives Indonesian-only; "Story… being prepared." on CANONICAL types. | **REFINED READ-ONLY AUDIT DONE. IMPLEMENTATION NOT STARTED — CDI-108-02** (CDI-B1..B6, per-field). |
| **Schumann `Data belum tersedia`** | Provider endpoint `schumannresonancelive.com/api/data.php` → **HTTP 404** (API path removed). Client-only fetch; no proxy under static export. Pre-existing since ≥ Build 106 (DS-E1). No fabricated "healthy" values. | **NOT STARTED — CDI-108-03** (CDI-A1..A3). |

Cross-cutting: **CDI-D1** — post-fix, non-destructive, convergence-safe production backfill for
HD advanced variables + Chiron (Build 103–107 cohorts), Founder-authorised and separate.

**Handoff action:** STOP. Await Founder review of CDI-108-01A + the refined HD audit (§B.8), and the
Founder's ruling on whether to (a) proceed with CDI-108-02 implementation (per-field: UI fix /
adapter derive / migration / re-fetch) and CDI-108-03 before resuming ENL sprints, or (b) resume
Sprint 5 in parallel with a dedicated data-integrity track.

### 5.2 Prior Sprint 4 Accomplishments (for reference)

**Sprint 4 Accomplishments:**
- `dailyGuidancePrompt.ts`: Dynamic English synthesis rules, Companion/Coach archetypes, reasonEngine/advice rules, English greeting (`Hello {firstName}`) and closing (`Warm hugs from Bhumi.`), output schema per category.
- `bhumiSoulMirrorPrompt.ts`: Dual-language prompt with English role, philosophy, opening (`Hi {userName}, how are you feeling this {dayName}?`), and style rules.
- `bhumiManifestationPrompt.ts`: Dual-language prompt with English context awareness, first-person grounding, and schema.
- `bhumiDailyReflectionPrompt.ts`: Dual-language prompt with English preview (`...`) and full reflection (`TODAY'S FOCUS`).
- `soulIdentityPrompt.ts` & `lib/ai/prompts/registry.ts`: Complete English resonance narrative voice ("I notice...") and English registry prompt.
- `localDailyGuidanceFallback.ts`: Localized English personal note sections (`Current theme:`, `Daily focus:`, etc.), life path/HD/arcana/transit themes, English fallback categories, and fallback name resolution.
- `dailyGuidanceEngine.ts`: Dynamic influence builders (`buildDailyStateSentence`, `buildJourneySentence`, `buildWellnessSentence`, `buildAstroSentence`, etc.) with `isEn` support preventing Indonesian sentence leakage into `dailyNoteText` and category `reason`/`advice`.
- `normalizeUserFacingGuidance.ts`: English fallback categories, advice variations across all 11 themes, English blacklist deconfliction, and English time-aware closing.
- `mirrorDailyReflection.ts` & `birthdayMessage.ts`: Localized mirror reflection helper and English birthday message generator.
- `app/api/ai/daily-guidance/route.ts`: Default language resolves to `"en"` when `isEnlEdition()` is true.
- Unit and regression test suite `tests/unit/build108-sprint04-ai-guidance.test.ts` (11 sub-suites, 129 assertions) passing with exit code 0.
- All regression suites passing (Sprint 1, Sprint 2, Sprint 3, Build 107 Production Surface Guard, Build 107 HD Convergence) with 0 errors.
- Repository `npx tsc --noEmit` passing with 0 errors.

**Next Sprint (BLOCKED):** `SPRINT-108-05-PROFILE-JOURNEY-JOURNAL` (Profile Hub & Sections, Journey
Hub & Milestones, Journal Hub & Entries, Insights, Weekly Reports) — **not started; held pending
Founder review of `BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md` per §5.1.**

