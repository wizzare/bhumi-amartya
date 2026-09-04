# BUILD 108 ENL — OPERATIONAL HANDOFF
**Developer & Agent Execution Guide**

```text
STATUS                          = IN_PROGRESS (SPRINT-108-02-DASHBOARD COMPLETE)
CURRENT_BASELINE                = BUILD 107 (versionCode 107, versionName 5.0.7)
BASELINE_COMMIT                 = d2ecb5ed73b7bb5e95415be314305f3512533752
CURRENT_BRANCH                  = recovery/build106-product-continuity
INITIATIVE                      = BUILD 108 ENL
PURPOSE                         = Dedicated English-Language Edition of Bhumi Amartya
TOTAL_ROUTES_AUDITED            = 51
TOTAL_USER_FACING_PAGES         = 48
DERIVED_SPRINT_COUNT            = 8 SPRINTS
BUILD_108_ENL_IMPLEMENTATION_STATUS = SPRINT_02_COMPLETE
NEXT_SAFE_ACTION                = SPRINT_03_BLUEPRINT_CORE
RELEASE_GATE                    = FOUNDER_SIGN_OFF_REQUIRED
```

---

## 1. Operating Rules for Incoming Agents

Any coding agent operating on Build 108 ENL MUST strictly adhere to the following invariants:

1. **Do NOT modify product code yet.**
   - All work in the current session is strictly limited to canonical Markdown foundation creation.
   - Code modification, refactoring, or translation PRs may only begin AFTER explicit Founder sign-off.
2. **Do NOT bump version yet.**
   - `versionCode` remains `107` and `versionName` remains `"5.0.7"` until the sprint release stage.
3. **Do NOT build, sign, or upload artifacts yet.**
   - No APK, AAB, or web export generation is authorized at this time.
4. **Preserve Untracked Files:**
   - `scripts/.build106-production-admin-provision.mjs` is an untracked credential utility and MUST NOT be staged or deleted.
5. **Honor Build 107 Continuity:**
   - You must verify that `tests/unit/build107-hd-existing-user-convergence.test.ts` and `tests/unit/build107-production-surface-guard.test.ts` stay completely GREEN at all times.

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
BUILD_108_ENL_IMPLEMENTATION_STATUS = SPRINT_03_COMPLETE (Blueprint Hub + all 11 Blueprint Systems: Numerology, Human Design, Natal Chart, Destiny Matrix, Vedic, BaZi, Tzolkin, Weton, Whole Sign, Zi Wei, Astrocartography 100% English)
NEXT_SAFE_ACTION                = SPRINT-108-04-AI-GUIDANCE
```

**Sprint 3 Accomplishments:**
- Blueprint Hub (`app/blueprint/page.tsx`) + `IdentityExpansionPage.tsx` + `AuditSection.tsx` 100% English with localized card descriptions, metadata, and badge labels.
- All 11 Blueprint detail pages (`app/blueprint/*/page.tsx`) fully localized with English headers, section titles, reading narratives, and fallback states.
- All 11 Presentation Engines in `lib/` updated to provide dual-language (`isEn`) support producing fluent English interpretations.
- Visual child components updated with English labels: `AstrocartographyMap.tsx`, `DestinyMatrixVisual.tsx`, `TwelvePalaceChart.tsx`, `HumanDesignBodygraphLite.tsx`, `NatalWheelLite.tsx`.
- Cultural terminology preservation: Strictly preserved authentic terms (Javanese weton days/pasarans/neptu/tulang wangi, Chinese stems/branches/palaces, Sanskrit nakshatras, Mayan solar seals) with English explanatory glosses.
- Mathematical Calculation Integrity: Zero calculation routines altered across all 11 systems.
- Build 107 HD Convergence: 100% preserved.
- Unit and regression test suite `tests/unit/build108-sprint03-blueprints.test.ts` (15 sub-suites, 171 assertions) passing.
- 100% regression suite passing (747 assertions total across all 5 test files, exit code 0).
- Repository `npx tsc --noEmit` passing with 0 errors.

**Next Sprint:** `SPRINT-108-04-AI-GUIDANCE` (Daily guidance prompts, unified blueprint synthesis, local guidance fallback).
