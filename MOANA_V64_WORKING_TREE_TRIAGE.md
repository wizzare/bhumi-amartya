# MOANA V64 Working Tree Triage

Date: 2026-07-01

Mode: audit only. No cleanup, no commit, no reset, no restore, no git clean.

Final status: NOT READY

Reason: working tree contains many modified, staged, and untracked files. Several are protected systems or unclear scope and require Founder review before cleanup or commit.

## Commands Run

```bash
git status
git diff --stat
git diff --name-only
```

Summary:

- Branch: `KARA_V3_WELLNESS_STABLE`
- Branch state: ahead of `origin/KARA_V3_WELLNESS_STABLE` by 11 commits
- Staged new files: 8
- Modified tracked files: 54
- Untracked files/directories: many, including reports, AAB artifacts, QA artifacts, scripts, secure key file, and Functions files
- `git diff --stat`: 53 files changed, 1239 insertions, 715 deletions
- `git status` warning: `.pytest_cache/` permission denied

## Classification Rules Used

- KEEP: clearly part of approved Build 64 Dashboard/Profile/Wellness/Journey/save-readback implementation.
- REVERT: changed but clearly outside Build 64 and not needed.
- IGNORE: local artifacts, screenshots, logs, cache, generated build/test files, old reports, AABs, IDE files, secrets.
- REVIEW: protected systems, unclear scope, release metadata, access/billing/security/version files, package/config files, or reports Founder may or may not want committed.

## KEEP

| File | Kategori | Alasan | Masuk Build 64? |
|---|---|---|---|
| `app/innerwork/audio-healing/page.tsx` | KEEP | Section 4 Wellness practice save/readback path touched for Build 64 runtime persistence. | YES |
| `app/innerwork/herbal/page.tsx` | KEEP | Section 4 Healthy Food/Herbal practice save/readback path touched for Build 64. | YES |
| `app/innerwork/journaling/page.tsx` | KEEP | Section 4 Journaling save/readback path touched for Build 64. | YES |
| `app/innerwork/manifestasi/page.tsx` | KEEP | Manifestasi save/readback is part of Build 64 Wellness/Journey persistence. | YES |
| `app/innerwork/meditation/page.tsx` | KEEP | Section 4 Meditation save/readback path touched for Build 64. | YES |
| `app/innerwork/workout/page.tsx` | KEEP | Section 4 Workout save/readback path touched for Build 64. | YES |
| `app/innerwork/yoga/page.tsx` | KEEP | Section 4 Yoga save/readback path touched for Build 64. | YES |
| `app/journey/page.tsx` | KEEP | Build 64 Option B Journey UI: `Rencana Hari Ini` + `Praktik Tambahan`. | YES |
| `app/profile/page.tsx` | KEEP | Build 64 Profile UI cleanup: 2-column Identitas Jiwa and share hero relocation/removal. | YES |
| `app/wellness/page.tsx` | KEEP | Wellness route wrapper involved in Build 64 Wellness sprint. | YES |
| `components/dashboard/DailyNoteV2.tsx` | KEEP | Dashboard/Catatan Build 64 continuity and copy scope. | YES |
| `components/dashboard/DailyUserFlowGuide.tsx` | KEEP | Dashboard Disarankan simplification/order scope. | YES |
| `components/dashboard/DashboardClient.tsx` | KEEP | Dashboard order, continuity reads, and Journey/Daily state context changes. | YES |
| `components/dashboard/DashboardHeader.tsx` | KEEP | Dashboard RC visual/copy scope. | YES |
| `components/dashboard/SoulReflectionCard.tsx` | KEEP | Refleksi Jiwa shortening and closing copy scope. | YES |
| `components/dashboard/WellnessCheckInCard.tsx` | KEEP | Wellness Section 1 7-point `Baik` / `Tidak Baik` scale UI. | YES |
| `components/journey/details/JourneyDetailClient.tsx` | KEEP | Journey readback/diagnostics path touched for Build 64 persistence verification. | YES |
| `components/ui/ShareCard.tsx` | KEEP | Share card visual cleanup requested in Build 64 profile/journey work. | YES |
| `components/wellness/WellnessPageClient.tsx` | KEEP | Build 64 Wellness Section 2/3/4 implementation and support card order. | YES |
| `components/profile/ProfileShareCardSection.tsx` | KEEP | New component for moving Profile share hero to Journey. | YES |
| `lib/auth/waitForFirebaseAuthOwner.ts` | KEEP | Auth hydration helper supports save/readback persistence hardening. | YES |
| `lib/engines/completionEngine.ts` | KEEP | Journey completion hydration from practice results. | YES |
| `lib/innerwork/wellnessSection4Logging.ts` | KEEP | Canonical Section 4 logging and Journey readback diagnostics. | YES |
| `lib/repositories/activityRepository.ts` | KEEP | Activity save path for Yoga/Workout/Healthy Food. | YES |
| `lib/repositories/dailyStateRepository.ts` | KEEP | Daily state save/readback path used by Section 1/4 and Journey. | YES |
| `lib/repositories/journeyRepository.ts` | KEEP | Existing Journey repository used by Section 3/4 persistence. | YES |
| `lib/types/journeyDailyRecord.ts` | KEEP | Journey record typing for wellness/checklist/practice persistence. | YES |
| `MOANA_V64_WORKING_TREE_TRIAGE.md` | KEEP | Current requested triage deliverable. | YES |

## REVERT

No files are classified as REVERT automatically.

Founder decision is required before any revert because the working tree includes protected systems, staged files, and many prior-sprint changes. Nothing was reverted in this audit.

## IGNORE

| File | Kategori | Alasan | Masuk Build 64? |
|---|---|---|---|
| `.idea/studiobot.xml` | IGNORE | Local IDE file. | NO |
| `BHUMI-MOANA-v57-3.1.12-RC-release.aab` | IGNORE | Old build artifact, not Build 64 source. | NO |
| `BHUMI-MOANA-v58-3.1.12-RC-section4-journey-fix.aab` | IGNORE | Old build artifact, not Build 64 source. | NO |
| `BHUMI-MOANA-v59-3.1.12-RC-diagnostics-section4-journey.aab` | IGNORE | Old build artifact, not Build 64 source. | NO |
| `BHUMI-MOANA-v60-3.1.12-RC-diagnostics-assets-corrected.aab` | IGNORE | Old build artifact, not Build 64 source. | NO |
| `BHUMI_POST_RELEASE_BADGE_PLAN_SUBS_AUDIT.md` | IGNORE | Older audit/report artifact, not current Build 64 release source. | NO |
| `MOANA_JULY1_ACCESS_MINIMAL_READINESS_AUDIT.md` | IGNORE | Older audit/report artifact. | NO |
| `MOANA_V3_APP_FLOW_FINAL_AUDIT.md` | IGNORE | Older audit/report artifact. | NO |
| `MOANA_V3_APP_ONLY_ACCESS_COMPLETION_REPORT.md` | IGNORE | Older audit/report artifact. | NO |
| `MOANA_V3_APP_ONLY_ACCESS_DEPLOYMENT_REPORT.md` | IGNORE | Older audit/report artifact. | NO |
| `MOANA_V3_BILLING_SUBS_RATING_PREP_REPORT.md` | IGNORE | Older audit/report artifact. | NO |
| `MOANA_V3_FORCE_UPDATE_ROLLBACK_REPORT.md` | IGNORE | Older audit/report artifact. | NO |
| `MOANA_V3_JOURNEY_PERSISTENCE_AUDIT.md` | IGNORE | Older audit/report artifact. | NO |
| `MOANA_V3_JULY1_DRIFT_IMPLEMENTATION_REPORT.md` | IGNORE | Older audit/report artifact. | NO |
| `MOANA_V3_JULY1_SOT_AUDIT.md` | IGNORE | Older audit/report artifact. | NO |
| `MOANA_V3_JULY_1_ACCESS_RULE_IMPLEMENTATION_REPORT.md` | IGNORE | Older audit/report artifact. | NO |
| `MOANA_V3_REAL_ANDROID_RUNTIME_CHECKLIST.md` | IGNORE | Older checklist/report artifact unless Founder wants docs committed. | NO |
| `MOANA_V3_RELEASE_BUILD_V64_REPORT.md` | IGNORE | Prior release report artifact; review only if Founder wants report history committed. | NO |
| `MOANA_V3_RUNTIME_ACCESS_VERIFICATION_REPORT.md` | IGNORE | Staged report artifact from earlier task, not source code. | NO |
| `MOANA_V3_RUNTIME_JOURNEY_VERIFICATION.md` | IGNORE | Older runtime report artifact. | NO |
| `MOANA_V3_SERVER_DEPLOYMENT_READINESS_REPORT.md` | IGNORE | Older deployment report artifact. | NO |
| `MOANA_V3_SERVER_DEPLOYMENT_REPORT.md` | IGNORE | Older deployment report artifact. | NO |
| `MOANA_V3_SIMPLE_ACCESS_RULE_FIX_REPORT.md` | IGNORE | Staged report artifact from earlier task, not Build 64 source. | NO |
| `MOANA_V63_FINAL_RELEASE_AUDIT.md` | IGNORE | Old V63 report. | NO |
| `MOANA_V63_SAVE_PIPELINE_ROOTCAUSE_REPORT.md` | IGNORE | Old V63 report. | NO |
| `qa-artifacts/v64-final/dashboard.png` | IGNORE | QA screenshot artifact. | NO |
| `qa-artifacts/v64-final/journey.png` | IGNORE | QA screenshot artifact. | NO |
| `qa-artifacts/v64-final/login.png` | IGNORE | QA screenshot artifact. | NO |
| `qa-artifacts/v64-final/manifestasi.png` | IGNORE | QA screenshot artifact. | NO |
| `qa-artifacts/v64-final/profile.png` | IGNORE | QA screenshot artifact. | NO |
| `qa-artifacts/v64-final/runtime-summary.json` | IGNORE | QA runtime artifact. | NO |
| `qa-artifacts/v64-final/wellness.png` | IGNORE | QA screenshot artifact. | NO |
| `test_write.tsx` | IGNORE | Staged temporary test file. | NO |
| `test_write.txt` | IGNORE | Staged temporary test file. | NO |
| `test_hd_bhumi.js` | IGNORE | Local test script. | NO |
| `test_natal_bhumi.js` | IGNORE | Local test script. | NO |
| `tsconfig.tsbuildinfo` | IGNORE | Generated TypeScript build cache. | NO |
| `secure/bhumiamartya-adminsdk.json.json` | IGNORE | Local secret/service-account-looking file; must never be committed. | NO |
| `functions/node_modules/**` | IGNORE | Generated dependency tree found locally under untracked `functions/`; not a source file for this Android RC. | NO |

## REVIEW

| File | Kategori | Alasan | Masuk Build 64? |
|---|---|---|---|
| `.env.local.example` | REVIEW | Environment template changed; needs review for web/android env separation. | UNKNOWN |
| `.gitignore` | REVIEW | Ignore rules changed; affects cleanup and artifact handling. | UNKNOWN |
| `PROJECT_CONTEXT.md` | REVIEW | Project process documentation changed. | UNKNOWN |
| `RELEASE_METADATA.json` | REVIEW | Release metadata changed; must verify no versionCode/release drift. | UNKNOWN |
| `android/app/build.gradle` | REVIEW | Android version/build config protected by instruction. | UNKNOWN |
| `app/healing/audio/page.tsx` | REVIEW | Healing route changed; unclear if part of Build 64 Android scope or legacy route. | UNKNOWN |
| `app/healing/meditation/page.tsx` | REVIEW | Healing route changed; unclear if part of Build 64 Android scope or legacy route. | UNKNOWN |
| `app/healing/page.tsx` | REVIEW | Healing route changed; unclear if part of Build 64 Android scope or legacy route. | UNKNOWN |
| `app/journal/page.tsx` | REVIEW | Journal route changed; may be access/save related but not explicit in latest Build 64 scope. | UNKNOWN |
| `app/layout.tsx` | REVIEW | App root layout changed; high blast radius. | UNKNOWN |
| `app/meditation/page.tsx` | REVIEW | Meditation route changed; unclear if current Android route or legacy route. | UNKNOWN |
| `components/auth/AccessGuard.tsx` | REVIEW | New AccessGuard file; access control is protected and must be explicitly approved. | UNKNOWN |
| `components/global/UpdateRequiredScreen.tsx` | REVIEW | Global update UI changed; release/access behavior sensitive. | UNKNOWN |
| `components/global/VersionChecker.tsx` | REVIEW | Version/update check changed; release behavior sensitive. | UNKNOWN |
| `firebase.json` | REVIEW | Firebase config changed; deployment behavior sensitive. | UNKNOWN |
| `firestore.rules` | REVIEW | Firestore rules are explicitly protected. | UNKNOWN |
| `functions/index.js` | REVIEW | New Firebase Functions source; not approved for Android RC yet. | UNKNOWN |
| `functions/package-lock.json` | REVIEW | New Functions dependency lock; not approved for Android RC yet. | UNKNOWN |
| `functions/package.json` | REVIEW | New Functions package config; not approved for Android RC yet. | UNKNOWN |
| `lib/access/accessControl.ts` | REVIEW | Access control protected by instruction. | UNKNOWN |
| `lib/auth/authActions.ts` | REVIEW | Auth action changed; access/login behavior sensitive. | UNKNOWN |
| `lib/billing/accessControl.ts` | REVIEW | Billing/access protected by instruction. | UNKNOWN |
| `lib/billing/billingPreparation.ts` | REVIEW | New billing prep file; billing protected. | UNKNOWN |
| `lib/billing/founderTesterSourceOfTruth.ts` | REVIEW | Founder/tester access source changed; protected access/badge domain. | UNKNOWN |
| `lib/billing/founderTesterSourceOfTruth.ts.txt` | REVIEW | Staged duplicate/text copy of access source; likely not source but needs Founder decision. | UNKNOWN |
| `lib/billing/founderTesterSourceOfTruth.tsx` | REVIEW | Staged duplicate TSX copy of access source; likely not source but needs Founder decision. | UNKNOWN |
| `lib/billing/membershipGrant.ts` | REVIEW | Membership grant logic changed; protected. | UNKNOWN |
| `lib/config/buildInfo.ts` | REVIEW | Build/version metadata changed; release-sensitive. | UNKNOWN |
| `lib/dailyGuidance/timeOfDayGreeting.ts` | REVIEW | Greeting logic changed; likely Build 64 Refleksi/Dashboard but should be reviewed. | UNKNOWN |
| `lib/firebase/service.ts` | REVIEW | Firebase service changed; access/protected field handling sensitive. | UNKNOWN |
| `lib/prompts/dailyGuidancePrompt.ts` | REVIEW | AI/daily guidance prompt changed; AI engine/copy continuity sensitive. | UNKNOWN |
| `lib/repositories/userRepository.ts` | REVIEW | User profile repository changed; protected access fields and profile writes sensitive. | UNKNOWN |
| `lib/services/appUpdatePolicy.ts` | REVIEW | New app update policy; version/update behavior sensitive. | UNKNOWN |
| `lib/services/appUpdateService.ts` | REVIEW | App update service changed; release/version behavior sensitive. | UNKNOWN |
| `lib/rating/ratingPreparation.ts` | REVIEW | New rating prep file; outside Build 64 feature scope unless approved. | UNKNOWN |
| `package.json` | REVIEW | Dependency/script changes affect build/release. | UNKNOWN |
| `package-lock.json` | REVIEW | Dependency lock changed; must match approved package changes. | UNKNOWN |
| `scripts/grant_new_user_penjaga_bhumi.ts` | REVIEW | Access/badge script; protected domain. | UNKNOWN |
| `scripts/prepare_july1_access_seed.ts` | REVIEW | Access seed script; protected domain. | UNKNOWN |
| `scripts/rollback-version-config.js` | REVIEW | Staged rollback script; version/release behavior sensitive. | UNKNOWN |
| `scripts/runtime-access-audit.js` | REVIEW | Staged audit script; likely local tooling, not app source. | UNKNOWN |
| `scripts/seed_minimum_app_version_config.ts` | REVIEW | Version config seed script; protected release behavior. | UNKNOWN |
| `scripts/test_browser_runtime.js` | REVIEW | Test script; likely local tooling but may be useful for QA. | UNKNOWN |
| `scripts/test_rules_temp.js` | REVIEW | Firestore rules test script; protected/security tooling. | UNKNOWN |
| `scripts/test_section4_multi_user_memory.ts` | REVIEW | Section 4/Memory test script; likely local QA tooling. | UNKNOWN |
| `scripts/test_section4_runtime.ts` | REVIEW | Section 4 runtime test script; likely local QA tooling. | UNKNOWN |
| `scripts/verify_july1_access_seed.ts` | REVIEW | Access seed verification script; protected domain. | UNKNOWN |
| `MOANA_V3_EXECUTION_MODE.md` | REVIEW | Source-of-truth process doc; may need to keep, but Founder decides commit. | UNKNOWN |
| `MOANA_V64_DAILY_CHECKIN_SCALE_UI_REPORT.md` | REVIEW | Build 64 report; Founder decides whether reports are committed. | UNKNOWN |
| `MOANA_V64_DASHBOARD_ONLY_REDIGNSPRINT_REPORT.md` | REVIEW | Build 64 report; Founder decides whether reports are committed. | UNKNOWN |
| `MOANA_V64_FINAL_RUNTIME_QA_REPORT.md` | REVIEW | Build 64 QA report; Founder decides whether to commit. | UNKNOWN |
| `MOANA_V64_PROFILE_JOURNEY_UI_CLEANUP_REPORT.md` | REVIEW | Build 64 report; Founder decides whether to commit. | UNKNOWN |
| `MOANA_V64_RELEASE_BLOCKER_AUDIT.md` | REVIEW | Build 64 RC report; Founder decides whether to commit. | UNKNOWN |
| `MOANA_V64_RELEASE_BLOCKER_TRIAGE_PLAN.md` | REVIEW | Build 64 RC report; Founder decides whether to commit. | UNKNOWN |
| `MOANA_V64_WELLNESS_IMPLEMENTATION_REPORT.md` | REVIEW | Build 64 report; Founder decides whether to commit. | UNKNOWN |
| `MOANA_V64_WELLNESS_JOURNEY_INTEGRATION_PLAN.md` | REVIEW | Build 64 plan; Founder decides whether to commit. | UNKNOWN |
| `MOANA_V64_WELLNESS_JOURNEY_OPTION_B_IMPLEMENTATION_REPORT.md` | REVIEW | Build 64 report; Founder decides whether to commit. | UNKNOWN |
| `MOANA_V64_WELLNESS_JOURNEY_PERSISTENCE_AUDIT.md` | REVIEW | Build 64 audit report; Founder decides whether to commit. | UNKNOWN |
| `MOANA_V64_WELLNESS_UX_DESIGN.md` | REVIEW | Build 64 approved UX design; Founder decides whether to commit. | UNKNOWN |

## Notes On Untracked Directories

| Path | Kategori | Alasan | Masuk Build 64? |
|---|---|---|---|
| `functions/` | REVIEW | Contains source files plus generated `node_modules`; Functions were not explicitly approved for Android Build 64. Source files require review, `node_modules` should be ignored. | UNKNOWN |
| `qa-artifacts/` | IGNORE | Screenshot/runtime evidence artifacts; useful locally, not release source unless Founder explicitly wants evidence committed. | NO |
| `secure/` | IGNORE | Contains service-account-looking JSON file; must not be committed. | NO |
| `lib/rating/` | REVIEW | New rating prep code; retention/rating is future roadmap unless approved. | UNKNOWN |

## KEEP Summary

- Build 64 Dashboard, Wellness, Journey, Profile UI and save/readback implementation files.
- Current triage report.

## REVERT Summary

- None selected automatically.
- Founder must decide before any revert.

## IGNORE Summary

- IDE files
- AAB artifacts
- QA screenshots/runtime JSON
- generated TypeScript cache
- temporary test files
- older reports
- local secret/service-account file
- generated Functions dependencies

## REVIEW Summary

- All protected systems
- app/root/version/update/access files
- billing/access/firestore/auth/user repository files
- package/config files
- scripts
- Build 64 reports/plans if Founder wants to commit or keep local only

## Final Status

NOT READY

Working tree is not ready for cleanup or commit until Founder decides:

1. Which REVIEW files are approved for Build 64.
2. Whether V64 reports should be committed or kept local.
3. Whether protected system changes are intentional.
4. Which IGNORE artifacts should be deleted or added to `.gitignore`.
5. Whether any file should be reverted.
