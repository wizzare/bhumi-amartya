# BUILD 108 ENL — OPERATIONAL HANDOFF
**Developer & Agent Execution Guide**

```text
STATUS                          = NOT_STARTED (FOUNDATION AUDIT & SPECIFICATION COMPLETE)
CURRENT_BASELINE                = BUILD 107 (versionCode 107, versionName 5.0.7)
BASELINE_COMMIT                 = d2ecb5ed73b7bb5e95415be314305f3512533752
CURRENT_BRANCH                  = recovery/build106-product-continuity
INITIATIVE                      = BUILD 108 ENL
PURPOSE                         = Dedicated English-Language Edition of Bhumi Amartya
BUILD_108_ENL_IMPLEMENTATION_STATUS = NOT_STARTED
NEXT_SAFE_ACTION                = FOUNDER_REVIEW_OF_BUILD_108_ENL_SOT
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

Once the Founder reviews and approves the Build 108 ENL SOT, implementation will proceed through the following disciplined sprints:

### Sprint 0: Foundation & Governance (COMPLETE)
- [x] Audit entire Build 107 production codebase for language readiness.
- [x] Create `BUILD_108_ENL_MASTER_SOT.md`.
- [x] Create `BUILD_108_ENL_SCOPE_MATRIX.md`.
- [x] Create `BUILD_108_ENL_HANDOFF.md`.
- [x] Create `BUILD_108_ENL_RELEASE_PLAN.md`.
- [x] Update agent entrypoints in `AGENTS.md` and `CLAUDE.md`.
- [x] Stop and wait for Founder review.

### Sprint 1: Core Shell, Auth & Navigation i18n
- [ ] Connect Landing page (`app/page.tsx`) copy to `t.welcome`.
- [ ] Handle locale switcher visibility for ENL edition (`NEXT_PUBLIC_APP_EDITION=ENL`).
- [ ] Connect Login page (`app/login/page.tsx`) error states and banners to English dictionaries.
- [ ] Complete Setup onboarding flow (`app/setup/page.tsx`) with English validation strings.
- [ ] Verify `components/navigation/AppNav.tsx` renders clean English navigation without regression to Admin/Diagnostics.

### Sprint 2: The 11 Blueprint Presentation Engines English Layer
- [ ] **Numerology / Life Path:** Enhance `lib/data/numerology.ts` and `lib/numerology/presentation.ts` with English role, journey, and lesson templates.
- [ ] **Human Design:** Enhance `lib/humandesign/presentation.ts` with English Center names, Type narratives, Authority guides, and Incarnation Cross descriptions.
- [ ] **Natal Astrology:** Enhance `lib/astrology/presentation.ts` with English Zodiac, House, and Aspect synthesis.
- [ ] **Destiny Matrix:** Enhance `lib/destiny-matrix/presentation.ts` with English 22 Arcana archetypes and line descriptions.
- [ ] **Vedic Astrology:** Enhance `lib/vedic/presentation.ts` with English Nakshatra and Dasha cycles.
- [ ] **BaZi:** Enhance `lib/bazi/baziMeaning.ts` with English Day Master and five-element dynamics.
- [ ] **Tzolkin:** Enhance `lib/tzolkin/presentation.ts` with English Solar Seal and Galactic Tone descriptions.
- [ ] **Weton:** Enhance `lib/weton/presentation.ts` with English character profiles and *Pancasuda* advice while retaining authentic Javanese names.
- [ ] **Whole Sign:** Enhance `lib/whole-sign/presentation.ts` with English house activations.
- [ ] **Zi Wei Dou Shu:** Enhance `lib/zi-wei/presentation.ts` with English 12 Palaces interpretations.
- [ ] **Astrocartography:** Enhance `lib/astrocartography/presentation.ts` with English planetary line insights.

### Sprint 3: AI Orchestration, Prompts & Local Fallback
- [ ] Update `lib/prompts/dailyGuidancePrompt.ts` to output clean, natural English companion prose without Indonesian greeting boilerplate.
- [ ] Update `lib/prompts/bhumiSoulMirrorPrompt.ts` and `lib/prompts/bhumiManifestationPrompt.ts`.
- [ ] Enhance `lib/dailyGuidance/unifiedBlueprintSynthesis.ts` to support full English synthesis via `pickLocale`.
- [ ] Complete 100% of English fallback strings in `lib/orchestrators/localDailyGuidanceFallback.ts`.
- [ ] Localize time-of-day greetings in `lib/dailyGuidance/timeOfDayGreeting.ts`.

### Sprint 4: Hub Surfaces & Component Migration
- [ ] Localize `DashboardClient.tsx` subcards (`DailyNoteV2.tsx`, `SoulReflectionCard.tsx`, `WeeklyGuidanceCard.tsx`, `AIReminderState.tsx`, `WellnessCheckInCard.tsx`).
- [ ] Localize `CoreIdentity.tsx` fallbacks ("Not available yet") while preserving HD convergence.
- [ ] Localize Profile Hub (`app/profile/page.tsx`) and tabs (`IdentityTab.tsx`, `DestinyMatrixTab.tsx`, `GrowthChart.tsx`).
- [ ] Localize Journey pages (`app/journey/page.tsx`, `app/journey/[id]/page.tsx`).
- [ ] Localize Journaling flow (`app/journal/page.tsx`, `DailyPromptCard.tsx`, `EmotionalCheckin.tsx`).
- [ ] Localize Wellness Hub and Assessment questionnaire (`app/wellness/page.tsx`, `app/wellness-assessment/page.tsx`).

### Sprint 5: Legal, Settings, Paywall & Static Copy
- [ ] Translate all 5 legal and static pages into native English:
  - `app/tentang/page.tsx` -> English About Bhumi Amartya story.
  - `app/syarat-ketentuan/page.tsx` -> English Terms of Service.
  - `app/kebijakan-privasi/page.tsx` -> English Privacy Policy.
  - `app/bantuan/page.tsx` -> English Help Center & FAQs.
  - `app/kontak/page.tsx` -> English Contact Us page.
- [ ] Localize Settings page (`app/settings/page.tsx`) Danger Zone, Account Deletion, and Membership cards.
- [ ] Replace hardcoded `"id-ID"` in `toDisplayDate()` with dynamic locale formatting.
- [ ] Localize Paywall and Upgrade pages (`app/premium-bhumi/page.tsx`, `app/upgrade/page.tsx`, `components/billing/*`).

### Sprint 6: Verification, Build & Release Gate
- [ ] Execute `npx tsc --noEmit` -> MUST BE EXIT 0.
- [ ] Execute `tests/unit/build107-production-surface-guard.test.ts` -> MUST BE PASS.
- [ ] Execute `tests/unit/build107-hd-existing-user-convergence.test.ts` -> MUST BE PASS.
- [ ] Run full emulator test suite `npm run test:release` -> MUST BE PASS (29+ tests).
- [ ] Verify zero untranslated Indonesian strings across production surfaces.
- [ ] Sync versions: bump to `versionCode = 108`, `versionName = "5.0.8"`.
- [ ] Build production web export (`node scripts/run-prod-build.mjs`).
- [ ] Sync Capacitor and build release AAB + APK.
- [ ] Stop and request Founder Release Sign-Off.

---

## 4. Quick Verification Commands

```powershell
# Set Node environment
$env:PATH = "C:\Users\shein\AppData\Local\nvm\v20.20.2;" + $env:PATH

# 1. Typecheck
npx tsc --noEmit

# 2. Production Surface Guard
node --loader tsx tests/unit/build107-production-surface-guard.test.ts

# 3. Human Design Convergence Guard
node --loader tsx tests/unit/build107-hd-existing-user-convergence.test.ts

# 4. Version Reconciliation Guard
node --loader tsx tests/unit/version-reconciliation.test.ts
```

---

## 5. Current Task State & Handoff Action

```text
BUILD_108_ENL_IMPLEMENTATION_STATUS = NOT_STARTED
NEXT_SAFE_ACTION                = FOUNDER_REVIEW_OF_BUILD_108_ENL_SOT
```

**Instruction:** Do not perform any further modifications until the Founder has reviewed `BUILD_108_ENL_MASTER_SOT.md` and approved the implementation architecture.
