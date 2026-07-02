# MOANA V64 Release Candidate Filelist

Date: 2026-07-01

Mode: Git staging management only.

Final status: READY TO SELECT RC FILES

No commit, push, clean, reset, delete, restore-discard, or application code change was performed.

## Step 1 Result

Unstaged the previously staged files only.

Command used:

```bash
git restore --staged .
```

Result:
- Initial attempt was blocked by `.git/index.lock` permission.
- Re-run with elevated permission succeeded.
- Working tree contents were not discarded.

## Step 2 Result

`git status` confirms:

- No files remain staged.
- `git diff --cached --name-only` returns no files.
- Working tree still contains modified and untracked files.

## SECTION A - BUILD 64 RC

Files recommended for Build 64 RC selection.

| Path | Reason | Category |
|---|---|---|
| `app/innerwork/audio-healing/page.tsx` | Section 4 Audio Healing save/readback path for Wellness to Journey persistence. | BUILD 64 RC |
| `app/innerwork/herbal/page.tsx` | Section 4 Healthy Food/Herbal save/readback path for Wellness to Journey persistence. | BUILD 64 RC |
| `app/innerwork/journaling/page.tsx` | Section 4 Journaling save/readback path for Wellness to Journey persistence. | BUILD 64 RC |
| `app/innerwork/manifestasi/page.tsx` | Manifestasi save/readback and Journey persistence scope. | BUILD 64 RC |
| `app/innerwork/meditation/page.tsx` | Section 4 Meditation save/readback path for Wellness to Journey persistence. | BUILD 64 RC |
| `app/innerwork/workout/page.tsx` | Section 4 Workout save/readback path for Wellness to Journey persistence. | BUILD 64 RC |
| `app/innerwork/yoga/page.tsx` | Section 4 Yoga save/readback path for Wellness to Journey persistence. | BUILD 64 RC |
| `app/journey/page.tsx` | Journey Option B UI: separate `Rencana Hari Ini` and `Praktik Tambahan`. | BUILD 64 RC |
| `app/profile/page.tsx` | Profile layout cleanup and share hero relocation/removal. | BUILD 64 RC |
| `app/wellness/page.tsx` | Wellness route wrapper used by Build 64 Wellness work. | BUILD 64 RC |
| `components/dashboard/DailyNoteV2.tsx` | Dashboard/Catatan Build 64 continuity and copy scope. | BUILD 64 RC |
| `components/dashboard/DailyUserFlowGuide.tsx` | Dashboard `Disarankan` simplification and route card scope. | BUILD 64 RC |
| `components/dashboard/DashboardClient.tsx` | Dashboard section order, continuity context, and Journey/daily state reads. | BUILD 64 RC |
| `components/dashboard/DashboardHeader.tsx` | Dashboard visual/copy adjustment in Build 64 scope. | BUILD 64 RC |
| `components/dashboard/SoulReflectionCard.tsx` | Refleksi Jiwa shorter copy and required closing. | BUILD 64 RC |
| `components/dashboard/WellnessCheckInCard.tsx` | Wellness Section 1 7-point `Baik` / `Tidak Baik` scale UI. | BUILD 64 RC |
| `components/journey/details/JourneyDetailClient.tsx` | Journey readback/diagnostics path related to persistence verification. | BUILD 64 RC |
| `components/profile/ProfileShareCardSection.tsx` | New share-card section moved from Profile to Journey. | BUILD 64 RC |
| `components/ui/ShareCard.tsx` | Share card visual cleanup requested in Profile/Journey sprint. | BUILD 64 RC |
| `components/wellness/WellnessPageClient.tsx` | Wellness Section 2/3 implementation, Section 4 support layout, and enoughness checklist. | BUILD 64 RC |
| `lib/auth/waitForFirebaseAuthOwner.ts` | Auth hydration helper for save/readback stability. | BUILD 64 RC |
| `lib/dailyGuidance/timeOfDayGreeting.ts` | Greeting logic supports Refleksi Jiwa greeting requirement. | BUILD 64 RC |
| `lib/engines/completionEngine.ts` | Journey progress hydration from daily state and practice results. | BUILD 64 RC |
| `lib/innerwork/wellnessSection4Logging.ts` | Canonical Section 4 logging into daily state and Journey. | BUILD 64 RC |
| `lib/repositories/activityRepository.ts` | Activity save path for Yoga, Workout, and Healthy Food. | BUILD 64 RC |
| `lib/repositories/dailyStateRepository.ts` | Daily state save/readback path for Section 1/4 and Dashboard/Journey reads. | BUILD 64 RC |
| `lib/repositories/journeyRepository.ts` | Existing Journey repository used by Section 3 and Section 4 persistence. | BUILD 64 RC |
| `lib/types/journeyDailyRecord.ts` | Journey record typing for enoughness checklist and practice results. | BUILD 64 RC |

## SECTION B - NOT BUILD 64

Files excluded from RC by default: reports, screenshots, QA artifacts, temp/debug files, scripts, experiments, website-only items, old docs, cache, IDE files, and local secrets.

| Path | Reason | Category |
|---|---|---|
| `.idea/studiobot.xml` | Local IDE file. | NOT BUILD 64 |
| `BHUMI-MOANA-v57-3.1.12-RC-release.aab` | Old AAB artifact. | NOT BUILD 64 |
| `BHUMI-MOANA-v58-3.1.12-RC-section4-journey-fix.aab` | Old AAB artifact. | NOT BUILD 64 |
| `BHUMI-MOANA-v59-3.1.12-RC-diagnostics-section4-journey.aab` | Old AAB artifact. | NOT BUILD 64 |
| `BHUMI-MOANA-v60-3.1.12-RC-diagnostics-assets-corrected.aab` | Old AAB artifact. | NOT BUILD 64 |
| `BHUMI_POST_RELEASE_BADGE_PLAN_SUBS_AUDIT.md` | Historical report. | NOT BUILD 64 |
| `MOANA_JULY1_ACCESS_MINIMAL_READINESS_AUDIT.md` | Historical report. | NOT BUILD 64 |
| `MOANA_V3_APP_FLOW_FINAL_AUDIT.md` | Historical report. | NOT BUILD 64 |
| `MOANA_V3_APP_ONLY_ACCESS_COMPLETION_REPORT.md` | Historical report. | NOT BUILD 64 |
| `MOANA_V3_APP_ONLY_ACCESS_DEPLOYMENT_REPORT.md` | Historical report. | NOT BUILD 64 |
| `MOANA_V3_BILLING_SUBS_RATING_PREP_REPORT.md` | Historical report. | NOT BUILD 64 |
| `MOANA_V3_FORCE_UPDATE_ROLLBACK_REPORT.md` | Historical report. | NOT BUILD 64 |
| `MOANA_V3_JOURNEY_PERSISTENCE_AUDIT.md` | Historical report. | NOT BUILD 64 |
| `MOANA_V3_JULY1_DRIFT_IMPLEMENTATION_REPORT.md` | Historical report. | NOT BUILD 64 |
| `MOANA_V3_JULY1_SOT_AUDIT.md` | Historical report. | NOT BUILD 64 |
| `MOANA_V3_JULY_1_ACCESS_RULE_IMPLEMENTATION_REPORT.md` | Historical report. | NOT BUILD 64 |
| `MOANA_V3_REAL_ANDROID_RUNTIME_CHECKLIST.md` | Historical checklist/report. | NOT BUILD 64 |
| `MOANA_V3_RELEASE_BUILD_V64_REPORT.md` | Prior report, not app source. | NOT BUILD 64 |
| `MOANA_V3_RUNTIME_ACCESS_VERIFICATION_REPORT.md` | Previously staged historical report; not RC source. | NOT BUILD 64 |
| `MOANA_V3_RUNTIME_JOURNEY_VERIFICATION.md` | Historical report. | NOT BUILD 64 |
| `MOANA_V3_SERVER_DEPLOYMENT_READINESS_REPORT.md` | Historical report. | NOT BUILD 64 |
| `MOANA_V3_SERVER_DEPLOYMENT_REPORT.md` | Historical report. | NOT BUILD 64 |
| `MOANA_V3_SIMPLE_ACCESS_RULE_FIX_REPORT.md` | Previously staged historical report; not RC source. | NOT BUILD 64 |
| `MOANA_V63_FINAL_RELEASE_AUDIT.md` | V63 historical report. | NOT BUILD 64 |
| `MOANA_V63_SAVE_PIPELINE_ROOTCAUSE_REPORT.md` | V63 historical report. | NOT BUILD 64 |
| `MOANA_V64_DAILY_CHECKIN_SCALE_UI_REPORT.md` | Report artifact; not app source unless Founder wants reports committed. | NOT BUILD 64 |
| `MOANA_V64_DASHBOARD_ONLY_REDIGNSPRINT_REPORT.md` | Report artifact; not app source unless Founder wants reports committed. | NOT BUILD 64 |
| `MOANA_V64_FINAL_RUNTIME_QA_REPORT.md` | QA report artifact; not app source unless Founder wants reports committed. | NOT BUILD 64 |
| `MOANA_V64_PROFILE_JOURNEY_UI_CLEANUP_REPORT.md` | Report artifact; not app source unless Founder wants reports committed. | NOT BUILD 64 |
| `MOANA_V64_RELEASE_BLOCKER_AUDIT.md` | Audit report artifact; not app source unless Founder wants reports committed. | NOT BUILD 64 |
| `MOANA_V64_RELEASE_BLOCKER_TRIAGE_PLAN.md` | Triage report artifact; not app source unless Founder wants reports committed. | NOT BUILD 64 |
| `MOANA_V64_STAGED_FILES_REVIEW.md` | Staging review report artifact; not app source. | NOT BUILD 64 |
| `MOANA_V64_WELLNESS_IMPLEMENTATION_REPORT.md` | Report artifact; not app source unless Founder wants reports committed. | NOT BUILD 64 |
| `MOANA_V64_WELLNESS_JOURNEY_INTEGRATION_PLAN.md` | Plan/report artifact; not app source unless Founder wants plans committed. | NOT BUILD 64 |
| `MOANA_V64_WELLNESS_JOURNEY_OPTION_B_IMPLEMENTATION_REPORT.md` | Report artifact; not app source unless Founder wants reports committed. | NOT BUILD 64 |
| `MOANA_V64_WELLNESS_JOURNEY_PERSISTENCE_AUDIT.md` | Audit report artifact; not app source unless Founder wants reports committed. | NOT BUILD 64 |
| `MOANA_V64_WELLNESS_UX_DESIGN.md` | UX design artifact; not app source unless Founder wants docs committed. | NOT BUILD 64 |
| `MOANA_V64_WORKING_TREE_TRIAGE.md` | Working-tree report artifact; not app source. | NOT BUILD 64 |
| `MOANA_V64_RELEASE_CANDIDATE_FILELIST.md` | Current filelist report artifact; not app source. | NOT BUILD 64 |
| `functions/node_modules/**` | Generated dependency tree; should not be committed. | NOT BUILD 64 |
| `lib/billing/founderTesterSourceOfTruth.ts.txt` | One-line test artifact in protected billing path. | NOT BUILD 64 |
| `lib/billing/founderTesterSourceOfTruth.tsx` | One-line test artifact in protected billing path. | NOT BUILD 64 |
| `qa-artifacts/v64-final/dashboard.png` | QA screenshot artifact. | NOT BUILD 64 |
| `qa-artifacts/v64-final/journey.png` | QA screenshot artifact. | NOT BUILD 64 |
| `qa-artifacts/v64-final/login.png` | QA screenshot artifact. | NOT BUILD 64 |
| `qa-artifacts/v64-final/manifestasi.png` | QA screenshot artifact. | NOT BUILD 64 |
| `qa-artifacts/v64-final/profile.png` | QA screenshot artifact. | NOT BUILD 64 |
| `qa-artifacts/v64-final/runtime-summary.json` | QA runtime artifact. | NOT BUILD 64 |
| `qa-artifacts/v64-final/wellness.png` | QA screenshot artifact. | NOT BUILD 64 |
| `scripts/rollback-version-config.js` | Local release/version script with inline Firebase config; not approved RC app source. | NOT BUILD 64 |
| `scripts/runtime-access-audit.js` | Local audit script with inline Firebase config and account UIDs. | NOT BUILD 64 |
| `scripts/test_browser_runtime.js` | Local test script. | NOT BUILD 64 |
| `scripts/test_rules_temp.js` | Local test script. | NOT BUILD 64 |
| `scripts/test_section4_multi_user_memory.ts` | Local test script. | NOT BUILD 64 |
| `scripts/test_section4_runtime.ts` | Local test script. | NOT BUILD 64 |
| `secure/bhumiamartya-adminsdk.json.json` | Local secret/service-account-looking file; must not be committed. | NOT BUILD 64 |
| `test_hd_bhumi.js` | Local test script. | NOT BUILD 64 |
| `test_natal_bhumi.js` | Local test script. | NOT BUILD 64 |
| `test_write.tsx` | Temporary test file. | NOT BUILD 64 |
| `test_write.txt` | Temporary test file. | NOT BUILD 64 |
| `tsconfig.tsbuildinfo` | Generated TypeScript cache. | NOT BUILD 64 |

## SECTION C - FOUNDER REVIEW REQUIRED

Files that cannot be safely classified without Founder decision.

| Path | Reason | Category |
|---|---|---|
| `.env.local.example` | Environment template changed; needs review for Android vs Website env separation. | FOUNDER REVIEW |
| `.gitignore` | Ignore rules changed; impacts artifact cleanup. | FOUNDER REVIEW |
| `PROJECT_CONTEXT.md` | Project process context changed. | FOUNDER REVIEW |
| `RELEASE_METADATA.json` | Release metadata changed; version/release-sensitive. | FOUNDER REVIEW |
| `android/app/build.gradle` | Android build config/version-sensitive; protected by release instructions. | FOUNDER REVIEW |
| `app/healing/audio/page.tsx` | Healing route changed; unclear if Android RC scope or legacy route. | FOUNDER REVIEW |
| `app/healing/meditation/page.tsx` | Healing route changed; unclear if Android RC scope or legacy route. | FOUNDER REVIEW |
| `app/healing/page.tsx` | Healing route changed; unclear if Android RC scope or legacy route. | FOUNDER REVIEW |
| `app/journal/page.tsx` | Journal route changed; not explicitly approved in final Build 64 RC scope. | FOUNDER REVIEW |
| `app/layout.tsx` | Root app layout changed; high blast radius. | FOUNDER REVIEW |
| `app/meditation/page.tsx` | Meditation route changed; unclear if Android RC scope or legacy route. | FOUNDER REVIEW |
| `components/auth/AccessGuard.tsx` | AccessGuard is access-control sensitive and protected. | FOUNDER REVIEW |
| `components/global/UpdateRequiredScreen.tsx` | Global update UI changed; release/version behavior sensitive. | FOUNDER REVIEW |
| `components/global/VersionChecker.tsx` | Version checking changed; release/version behavior sensitive. | FOUNDER REVIEW |
| `firebase.json` | Firebase config changed; deployment behavior sensitive. | FOUNDER REVIEW |
| `firestore.rules` | Firestore rules are explicitly protected. | FOUNDER REVIEW |
| `functions/index.js` | New Firebase Functions source; not approved yet for Android RC. | FOUNDER REVIEW |
| `functions/package-lock.json` | New Functions package lock; not approved yet for Android RC. | FOUNDER REVIEW |
| `functions/package.json` | New Functions package config; not approved yet for Android RC. | FOUNDER REVIEW |
| `lib/access/accessControl.ts` | Access control protected. | FOUNDER REVIEW |
| `lib/auth/authActions.ts` | Auth actions changed; login/access behavior sensitive. | FOUNDER REVIEW |
| `lib/billing/accessControl.ts` | Billing/access protected. | FOUNDER REVIEW |
| `lib/billing/billingPreparation.ts` | New billing prep file; billing protected. | FOUNDER REVIEW |
| `lib/billing/founderTesterSourceOfTruth.ts` | Founder/tester access source changed; badge/access domain protected. | FOUNDER REVIEW |
| `lib/billing/membershipGrant.ts` | Membership grant logic changed; access protected. | FOUNDER REVIEW |
| `lib/config/buildInfo.ts` | Build/version metadata changed; release-sensitive. | FOUNDER REVIEW |
| `lib/firebase/service.ts` | Firebase service changed; protected access-field handling sensitive. | FOUNDER REVIEW |
| `lib/prompts/dailyGuidancePrompt.ts` | AI/daily guidance prompt changed; AI behavior sensitive. | FOUNDER REVIEW |
| `lib/repositories/userRepository.ts` | User repository changed; profile/access writes sensitive. | FOUNDER REVIEW |
| `lib/services/appUpdatePolicy.ts` | New app update policy; version/update behavior sensitive. | FOUNDER REVIEW |
| `lib/services/appUpdateService.ts` | App update service changed; version/update behavior sensitive. | FOUNDER REVIEW |
| `lib/rating/ratingPreparation.ts` | New rating prep file; rating is future roadmap unless explicitly approved. | FOUNDER REVIEW |
| `package.json` | Dependency/script changes affect build/release. | FOUNDER REVIEW |
| `package-lock.json` | Dependency lock changed; must match approved package changes. | FOUNDER REVIEW |
| `scripts/grant_new_user_penjaga_bhumi.ts` | Access/badge script in protected domain. | FOUNDER REVIEW |
| `scripts/prepare_july1_access_seed.ts` | Access seed script in protected domain. | FOUNDER REVIEW |
| `scripts/seed_minimum_app_version_config.ts` | Version config seed script; release-sensitive. | FOUNDER REVIEW |
| `scripts/verify_july1_access_seed.ts` | Access seed verification script; protected domain. | FOUNDER REVIEW |
| `MOANA_V3_EXECUTION_MODE.md` | Source-of-truth/process doc; Founder decides whether to commit. | FOUNDER REVIEW |

## Final Status

READY TO SELECT RC FILES

The staging area is clean, and the working tree is inventoried for Founder selection.

Do not commit yet. Wait for Founder approval before staging Build 64 Release Candidate files.
