# BUILD 108 ENL — OPERATIONAL HANDOFF
**Developer & Agent Execution Guide**

```text
STATUS                          = PAUSED (SPRINT 4 COMPLETE — HELD FOR CORE DATA INTEGRITY AUDIT)
CURRENT_BASELINE                = BUILD 107 (versionCode 107, versionName 5.0.7)
BASELINE_COMMIT                 = d2ecb5ed73b7bb5e95415be314305f3512533752
CURRENT_BRANCH                  = recovery/build106-product-continuity
INITIATIVE                      = BUILD 108 ENL
PURPOSE                         = Dedicated English-Language Edition of Bhumi Amartya
TOTAL_ROUTES_AUDITED            = 51
TOTAL_USER_FACING_PAGES         = 48
DERIVED_SPRINT_COUNT            = 8 SPRINTS
BUILD_108_ENL_IMPLEMENTATION_STATUS = PAUSED_FOR_CORE_DATA_INTEGRITY_AUDIT
NEXT_SAFE_ACTION                = FOUNDER_REVIEW_OF_CORE_DATA_INTEGRITY_AUDIT
RELEASE_GATE                    = FOUNDER_SIGN_OFF_REQUIRED
```

> **PAUSE NOTICE (2026-09-06).** Sprint 4 is complete. **Do NOT start Sprint 5.** The Founder
> confirmed three production data-integrity defects (Schumann unavailable · Human Design advanced
> variables not stored/incomplete · Chiron position incorrect). Read-only root-cause audit is
> complete in **`BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md`** — all three root causes CONFIRMED.
> No `CDI-*` fix may be implemented, no production Firestore read/write or backfill may occur, and
> no version bump / build / sign / deploy / upload is permitted until the Founder reviews the audit
> and rules on sequencing.

---

## 1. Operating Rules for Incoming Agents

Any coding agent operating on Build 108 ENL MUST strictly adhere to the following invariants:

1. **Do NOT modify product code yet.**
   - Code modification, refactoring, or translation PRs may only begin AFTER explicit Founder sign-off.
   - The Build 108 ENL initiative is currently **PAUSED_FOR_CORE_DATA_INTEGRITY_AUDIT**. Sprint 5
     is NOT started. No `CDI-*` fix from `BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md` may be
     implemented until the Founder reviews that audit.
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
BUILD_108_ENL_IMPLEMENTATION_STATUS = PAUSED_FOR_CORE_DATA_INTEGRITY_AUDIT
LAST_COMPLETED_SPRINT           = SPRINT-108-04-AI-GUIDANCE
SPRINT_5_STATUS                 = NOT_STARTED (BLOCKED)
NEXT_SAFE_ACTION                = FOUNDER_REVIEW_OF_CORE_DATA_INTEGRITY_AUDIT
```

### 5.1 Core Data Integrity Hold (2026-09-06)

Sprint 4 completed (English AI guidance, prompts, local deterministic fallbacks, normalization,
birthday messages). Before Sprint 5, the Founder confirmed three production data-integrity defects
that Build 108 must not inherit. A READ-ONLY root-cause audit is complete:
**`BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md`**. All three root causes CONFIRMED.

| Defect | Confirmed root cause | Blockers |
|---|---|---|
| Schumann `Data belum tersedia` | Provider endpoint `schumannresonancelive.com/api/data.php` → **HTTP 404** (API path removed). Client-only fetch; no proxy possible under static export. Fresh installs have no cache. Pre-existing since ≥ Build 106 (DS-E1). No fabricated "healthy" values. | CDI-A1, CDI-A2, CDI-A3 |
| HD advanced variables "Not stored" | Deployed engine (`services/humandesign-api/main.py` `POST /calculate`) emits only the 4 binary Variable arrows; never derives PHS Digestion/Environment/Motivation/Perspective/Cognition; withholds raw Color/Tone/Base unless `debug=true` (never sent). `variables.short_code` read against wrong UI keys. `calculateAdvancedVariables()` orphaned. `mass-recover-hd.ts` drops activations + corrupts `centers`. HD **core** identity healthy; Build 107 convergence intact. | CDI-B1..CDI-B5 |
| Chiron wrong | Swiss Ephemeris `/calculate-astrology` unreachable in production (`HUMAN_DESIGN_SERVICE_URL` undefined → `http://localhost:8000` blocked; no `/api` proxy). Silent local fallback derives Chiron from a linear ephemeris (`astronomy-engine` has no Chiron). Houses are Equal House mislabelled `placidusHouses`. | CDI-C1, CDI-C2, CDI-C3 |

Cross-cutting: **CDI-D1** — post-fix, non-destructive, convergence-safe production backfill for
HD advanced variables + Chiron (Build 103–107 cohorts), Founder-authorised and separate.

**Handoff action:** STOP. Await Founder review of `BUILD_108_CORE_DATA_INTEGRITY_AUDIT.md` and the
Founder's ruling on whether to (a) execute the `CDI-*` fixes before resuming ENL sprints, or
(b) resume Sprint 5 in parallel with a dedicated data-integrity track.

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

