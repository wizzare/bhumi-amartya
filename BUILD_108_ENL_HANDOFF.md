# BUILD 108 ENL — OPERATIONAL HANDOFF
**Developer & Agent Execution Guide**

```text
STATUS                          = CORE DATA INTEGRITY GATE OPEN — CDI-108-01 DONE (SPRINT 5 BLOCKED)
CURRENT_BASELINE                = BUILD 107 (versionCode 107, versionName 5.0.7)
BASELINE_COMMIT                 = d2ecb5ed73b7bb5e95415be314305f3512533752
CURRENT_BRANCH                  = recovery/build106-product-continuity
NEXT_PRIMARY_AGENT              = CODEX
INITIATIVE                      = BUILD 108 ENL
PURPOSE                         = Dedicated English-Language Edition of Bhumi Amartya
TOTAL_ROUTES_AUDITED            = 51
TOTAL_USER_FACING_PAGES         = 48
DERIVED_SPRINT_COUNT            = 8 SPRINTS
BUILD_108_ENL_IMPLEMENTATION_STATUS = PAUSED_FOR_CORE_DATA_INTEGRITY
GATE_108_CDI                    = IN_PROGRESS
NEXT_SAFE_ACTION                = CDI-108-01A-TIMEZONE-CANONICALIZATION_THEN_HD_LIVE_CONTRACT_REFINED_AUDIT
RELEASE_GATE                    = FOUNDER_SIGN_OFF_REQUIRED
```

> **CORE DATA INTEGRITY GATE (2026-09-06).** Sprint 4 is complete. **Do NOT start Sprint 5.** The
> next primary agent is **CODEX**. Build 108 ENL remains paused for `GATE_108_CDI`.
>
> Completed state:
> - `SPRINT_108_01 = COMPLETE`
> - `SPRINT_108_02 = COMPLETE`
> - `SPRINT_108_03 = COMPLETE`
> - `SPRINT_108_04 = COMPLETE`
> - `SPRINT_108_05 = BLOCKED`
> - `CDI_108_01_CHIRON_NATAL_ACCURACY = COMPLETE`
> - `CDI_C1 = DONE`
> - `CDI_C2 = DONE`
> - `CDI_C3 = OPEN`
>
> Important Chiron state: the old linear Chiron approximation has been removed; a Swiss
> Ephemeris-derived client-side Chiron table is implemented; Chiron fixture accuracy is 10/10;
> fail-closed persistence is implemented; Whole Sign and Placidus are explicitly separated; no
> production backfill was performed.
>
> Pending blockers:
> 1. `CDI-108-01A` — canonical IANA timezone propagation / `CDI-C3`.
> 2. Genuine Placidus production service deployment remains ops-gated.
> 3. `CDI-108-02` — Human Design advanced variables.
> 4. `CDI-108-03` — Schumann source replacement.
> 5. `CDI-D1` — legacy data backfill, separately Founder-authorized only.
>
> Important Human Design audit refinement: the LIVE deployed Human Design `/calculate` contract
> differs from repo `services/humandesign-api/main.py`. Observed live payload already includes
> `digestion`, `environment`, `motivation`, and `cognition`. Apparently absent / unresolved:
> `perspective` and diagnostic Color/Tone/Base. CODEX must **NOT** assume the HD engine is the
> primary defect.
>
> No further `CDI-*` implementation, no production Firestore read/write or backfill, no backend
> deploy, and no version bump / build / sign / deploy / upload until explicit Founder authorization.
> Production read-only probes are not implicitly authorized beyond evidence already collected.
> `BUILD_106_RECOVERY_IN_PROGRESS` no longer applies.

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
SPRINT_108_01                  = COMPLETE
SPRINT_108_02                  = COMPLETE
SPRINT_108_03                  = COMPLETE
SPRINT_108_04                  = COMPLETE
SPRINT_108_05                  = BLOCKED
CDI_108_01_CHIRON_NATAL_ACCURACY = COMPLETE
CDI_C1                         = DONE
CDI_C2                         = DONE
CDI_C3                         = OPEN
CDI_108_02_HUMAN_DESIGN        = PENDING — ADVANCED VARIABLES
CDI_108_03_SCHUMANN            = PENDING — SOURCE REPLACEMENT
CDI_D1_LEGACY_BACKFILL         = PENDING — NOT AUTHORIZED
NEXT_SAFE_ACTION                = CDI-108-01A-TIMEZONE-CANONICALIZATION_THEN_HD_LIVE_CONTRACT_REFINED_AUDIT
PRODUCTION_FIRESTORE_WRITE      = NOT AUTHORIZED
PRODUCTION_BACKFILL             = NOT AUTHORIZED
BACKEND_DEPLOY                  = NOT AUTHORIZED
PLAY_UPLOAD                     = NOT AUTHORIZED
```

### 5.1 Core Data Integrity Gate — `GATE_108_CDI` (2026-09-06)

Read-only root-cause audit **Founder-approved**: **`BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md`**.
All three root causes CONFIRMED.

| Defect | Confirmed root cause | Status |
|---|---|---|
| **Chiron wrong** | Swiss Ephemeris `/calculate-astrology` unreachable; silent local fallback derived Chiron from a **linear** ephemeris; Equal House mislabelled `placidusHouses`; timezone propagation remains the open CDI-C3 continuity blocker. | **CDI-108-01 COMPLETE. CDI-C1 DONE. CDI-C2 DONE. CDI-C3 OPEN.** Committed Swiss Ephemeris-derived client-side Chiron table; old linear Chiron approximation removed; Chiron fixture accuracy 10/10; fail-closed persistence implemented; Whole Sign and Placidus explicitly separated. Genuine Placidus production service deployment remains ops-gated. No production backfill performed. |
| **HD advanced variables "Not stored"** | **Refined against the LIVE deployed contract (audit §B.8).** The live deployed `/calculate` contract differs from repo `services/humandesign-api/main.py`; observed live payload already includes `digestion`, `environment`, `motivation`, and `cognition`. Apparently absent / unresolved: `perspective` and diagnostic Color/Tone/Base. | **PENDING — CDI-108-02.** CODEX must not assume the HD engine is the primary defect; start from `CDI-108-01A-TIMEZONE-CANONICALIZATION_THEN_HD_LIVE_CONTRACT_REFINED_AUDIT`. |
| **Schumann `Data belum tersedia`** | Provider endpoint `schumannresonancelive.com/api/data.php` → **HTTP 404** (API path removed). Client-only fetch; no proxy under static export. Pre-existing since ≥ Build 106 (DS-E1). No fabricated "healthy" values. | **NOT STARTED — CDI-108-03** (CDI-A1..A3). |

Cross-cutting: **CDI-D1** — legacy data backfill is separately Founder-authorized only and is **not
authorized now**.

**Handoff action:** STOP. Hand over to CODEX for
`CDI-108-01A-TIMEZONE-CANONICALIZATION_THEN_HD_LIVE_CONTRACT_REFINED_AUDIT` under the explicit
authorization boundary below.

```text
PRODUCTION_FIRESTORE_WRITE = NOT AUTHORIZED
PRODUCTION_BACKFILL        = NOT AUTHORIZED
BACKEND_DEPLOY             = NOT AUTHORIZED
PLAY_UPLOAD                = NOT AUTHORIZED
```

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

