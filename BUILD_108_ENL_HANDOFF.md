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
BUILD_108_ENL_IMPLEMENTATION_STATUS = SPRINT_02_COMPLETE (Dashboard & Environment 100% English)
NEXT_SAFE_ACTION                = SPRINT-108-03-BLUEPRINT-CORE
```

**Sprint 2 Accomplishments:**
- `app/dashboard/page.tsx`, `app/dashboard/environment/page.tsx`, and all dashboard subcards localized to 100% English.
- `DashboardClient`: localized opening and syncing/fallback screens, footer quote, and language routing.
- `CoreIdentity`: preserved Build 107 HD convergence invariant (`isRecognizedHumanDesignType` early return), localized calculation in progress and unavailable labels.
- `EnvironmentContextCard` & `app/dashboard/environment/page.tsx`: English coordinate formatting (`N`/`S`, `E`/`W`), weather conditions, moon phases, AQI, UV, Kp index, and spiritual readings.
- `WeeklyGuidanceCard`: `en-US` date formatting and localized phase guidance.
- `AstroTodayCard`: `en-US` date/instant formatting, English transit events, and moon headers.
- `GuardianIdentityCard`: English greetings, badges (Bhumi Founder, Bhumi Core Guardian, etc.), and recognition date.
- `PendingHdRecoveryBanner` & `AccuracyUpgradeBanner`: English copy across all states while strictly guarding `saveUserBlueprint` with `isCanonicalHumanDesign`.
- `TrialWelcomePopup` & `ReviewDialog`: English modal titles, descriptions, and buttons.
- `DailyNoteV2`, `AIReminderState`, `PenjagaBhumiIntiBanner`, and `DailyUserFlowGuide`: English notes, section titles, reminders, and guardian banners.
- `SafetyActionCard` & `supportResourceLibrary`: English safety disclaimers, safe path header, 24-hour tag, call copy, SMS text, and recommendation.
- Unit and regression test suite `tests/unit/build108-sprint02-dashboard.test.ts` (258 assertions) passing.
- 100% regression suite passing (576 assertions total across all test files).

**Next Sprint:** `SPRINT-108-03-BLUEPRINT-CORE` (Blueprint Hub, Human Design, Natal Chart, Numerology, Destiny Matrix).
