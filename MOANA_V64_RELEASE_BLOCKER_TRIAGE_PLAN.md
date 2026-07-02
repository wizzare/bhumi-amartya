# MOANA V64 Release Blocker Triage Plan

Date: 2026-07-01

Mode: RELEASE CANDIDATE TRIAGE ONLY

Final Android Release Readiness: NOT READY

Website Status: SEPARATE - Known Website Environment Issue

No code changes were made.

## Source Documents Read

- `MOANA_V64_RELEASE_BLOCKER_AUDIT.md`
- `MOANA_V3_EXECUTION_MODE.md`
- `SOURCE_OF_TRUTH_V1.md`
- `KARA_EXPECTED_FEATURES.md`
- `WELLNESS_USER_FLOW.md`
- `WELLNESS_PRODUCTION_READINESS.md`

KARA SoT note:
- A literal file named `KARA Source of Truth` / `KARA_PRODUCT_RULES_V1` / `KARA_IMPLEMENTATION_RULES_V1` was not found in the workspace.
- Existing KARA/MOANA documents and explicit Founder instructions were used as the source baseline.

## Triage Summary

The current Build 64 Android blocker set is dominated by missing runtime proof, not by a proven app-code defect.

Primary Android blocker:
- Runtime QA has not been completed with a valid server-owned access account.

Primary release hygiene blocker:
- Working tree contains many modified/untracked files, including protected systems and temporary/test artifacts. They must be classified before any commit.

Website-only issue:
- `/api/kenali-diri/aura` build failure is not an Android blocker. It remains a Website status issue.

## P0 Critical

| Blocker Name | Affected Module | Android or Website | Root Cause | Evidence | Exact Next Action | Code Change Required | QA Account Required | Founder Action Required | Release Impact |
|---|---|---|---|---|---|---|---|---|---|
| Valid Server-Owned QA Access Missing | Access / Runtime QA | Android | No valid server-owned access account/session was available for RC runtime. | `MOANA_V64_RELEASE_BLOCKER_AUDIT.md`; runtime screenshots redirected to login or lacked authenticated data. | Founder provides or confirms a QA account with server-owned access fields already granted by backend/server process. | No | Yes | Yes | Blocks all Android release readiness. |
| Real Android Runtime Proof Missing | Android Runtime | Android | QA evidence is browser/dev runtime only, not complete real Android runtime with real user. | MOANA V3 Execution Mode requires real Android + real Firebase + real user + feature works. | Run the Android app with the valid QA account and capture Dashboard/Profile/Wellness/Journey screenshots and behavior. | No | Yes | Yes | Blocks release. |
| Firestore Save/Readback Not Verified | Firestore / Save Pipeline | Android | No authenticated Section 1/3/4 save actions were executed in RC QA. | No evidence for `dailyStates`, `journeyDailyRecords`, or `activities` writes. | With QA account, perform Daily Check In, Section 3 checklist, and Section 4 practices; capture Firestore/readback evidence. | No, unless runtime fails | Yes | Yes, to provide account/access | Blocks release. |
| Journey Persistence Not Verified | Journey / Wellness Integration | Android | Journey was not verified with real saved data after Build 64 Option B. | `Rencana Hari Ini` and `Praktik Tambahan` not runtime-proven with real Journey record. | Verify Journey after Section 3 and Section 4 saves, refresh, reopen, logout/login. | No, unless runtime fails | Yes | Yes, to provide account/access | Blocks release. |
| Dashboard Continuity Not Verified | Dashboard / Refleksi / Catatan / Manifestasi | Android | Dashboard was not verified after Wellness/Journey activity. | Dashboard redirected to login in existing runtime evidence. | After Wellness activity, return to Dashboard and verify Refleksi Jiwa, Catatan Bhumi, Manifestasi, and dashboard state changes. | No, unless runtime fails | Yes | Yes, to provide account/access | Blocks release. |
| Subscription / Badge / Access Matrix Not Verified | Subscription / Badge / AccessGuard | Android | Founder, Inti, Alfa, Trial, Expired, Dashboard Only, Premium Lock states were not runtime-tested. | No server-owned access account matrix available. | Test each server-owned state or provide Firestore/server evidence plus runtime sample for each category. | No, unless mismatch found | Yes | Yes | Blocks release. |
| Protected-System Working Tree Drift | Firestore Rules / Billing / Access / version-sensitive files | Android | Protected files appear modified in working tree and have not been approved for RC commit. | `git status --short` includes `firestore.rules`, `android/app/build.gradle`, `lib/billing/*`, `lib/access/accessControl.ts`, `lib/config/buildInfo.ts`, `lib/firebase/service.ts`. | Review diffs for every protected file. Founder decides keep/revert/ignore. Do not commit until classified. | Maybe, only if Founder approves fixes/reverts | No | Yes | Blocks clean RC commit/release. |

### QA Account Setup Steps

Use existing server-owned access process only. Do not write badge/access fields from the client.

1. Founder selects the QA identity.
   - Prefer one existing real tester account already in production Firebase.
   - Account must have complete profile/blueprint data.

2. Server/admin process grants or confirms access.
   - Required server-owned fields: badge/plan/membership/accessUntil/subscriptionStatus as defined by MOANA SoT.
   - Client must not self-write these fields.

3. Confirm AccessGuard naturally opens Android app surfaces.
   - Dashboard
   - Profile
   - Wellness
   - Journey
   - Manifestasi
   - Section 4 practice pages

4. Run runtime QA.
   - Section 1 save.
   - Section 3 checklist save.
   - Section 4 all practices save.
   - Firestore readback.
   - Journey readback.
   - Dashboard continuity.
   - Refresh/reopen/logout-login persistence.

## P1 High

| Blocker Name | Affected Module | Android or Website | Root Cause | Evidence | Exact Next Action | Code Change Required | QA Account Required | Founder Action Required | Release Impact |
|---|---|---|---|---|---|---|---|---|---|
| Wellness Section 1 Not Runtime Verified | Wellness | Android | Authenticated check-in flow was not executed. | `/wellness` redirected to login; static scan confirms `Baik` / `Tidak Baik` exists. | Verify scale UI, scoring preservation, save, and downstream Section 2/3 input. | No, unless runtime fails | Yes | Yes, account/access | Blocks Wellness PASS. |
| Wellness Section 2 Not Runtime Verified | Wellness | Android | Mapping UI not verified with authenticated daily state. | Static scan found `Ringkasan` and `Penjelasan lebih`; no runtime mapping proof. | Verify compact Section 2, correct mapping, no wrong fallback. | No, unless runtime fails | Yes | Yes, account/access | Blocks Wellness PASS. |
| Wellness Section 3 Not Runtime Verified | Wellness / Journey | Android | Checklist save/readback not executed in real runtime. | Static code writes `wellnessState.enoughnessChecklist`; runtime unavailable. | Verify checklist progress, save, refresh persistence, Journey `Rencana Hari Ini`. | No, unless runtime fails | Yes | Yes, account/access | Blocks Wellness/Journey PASS. |
| Wellness Section 4 Not Runtime Verified | Wellness / Innerwork | Android | Seven practice saves not executed with valid account. | No authenticated saves for Journaling, Meditation, Yoga, Workout, Audio, Healthy Food, Manifestasi. | Save each practice and verify `dailyStates`, `journeyDailyRecords`, `activities` where applicable. | No, unless runtime fails | Yes | Yes, account/access | Blocks save pipeline PASS. |
| Profile Not Runtime Verified | Profile / Identitas Inti | Android | Valid identity/profile data unavailable. | `/profile` rendered profile not ready. | Verify 8 Blueprint systems, 2-column layout, responsive behavior, no Profile share hero. | No, unless runtime fails | Yes | Yes, account/access | Blocks Profile PASS. |
| Settings Not Runtime Verified | Settings / Subscription | Android | Authenticated account status page not tested. | No valid logged-in server-owned user. | Verify account status, subscription text, sign out, profile fields, and no client-owned access mutation. | No, unless runtime fails | Yes | Yes, account/access | Blocks Subscription/Access confidence. |
| Manifestasi Not Runtime Verified | Manifestasi / Journey | Android | Authenticated Manifestasi save/readback not executed. | `/innerwork/manifestasi` redirected to login. | Verify content, save, Journey write, dashboard continuity, no static-only behavior. | No, unless runtime fails | Yes | Yes, account/access | Blocks Manifestasi PASS. |
| AI Memory Pipeline Not Verified | AI Memory | Android | No runtime saves reached memory path in this audit. | No authenticated Section 1/3/4 saves. | After Journey save succeeds, verify whether existing memory update occurs and does not block save. | No, unless runtime fails | Yes | Yes, account/access | Blocks full MOANA execution-mode PASS. |
| Working Tree Hygiene Not Classified | Release Process | Android | Working tree includes reports, screenshots, scripts, temp files, AAB artifacts, protected files. | `git status --short` output in audit. | Classify every changed/untracked file into keep/revert/ignore/review before commit. | Maybe | No | Yes | Blocks clean commit. |

## P2 Medium

| Blocker Name | Affected Module | Android or Website | Root Cause | Evidence | Exact Next Action | Code Change Required | QA Account Required | Founder Action Required | Release Impact |
|---|---|---|---|---|---|---|---|---|---|
| Wellness Placeholder Copy Candidate | Wellness | Android | User-facing empty-state copy includes "belum tersedia". | `components/wellness/WellnessPageClient.tsx`: `Pemetaan dimensi belum tersedia.`, `Tema harian belum tersedia.` | Founder decides whether this is acceptable empty-state language or must be replaced before release. | Maybe | Yes, to see runtime context | Yes | Could block polish/content QA if Founder rejects. |
| Profile/Gaia Placeholder Copy Candidate | Profile / Gaia | Android | Gaia/Profile synthesis can render `Belum tersedia` or missing-source copy. | `lib/profile/gaia/synthesisEngine.ts`, `lib/profile/gaia/normalizeSources.ts`. | Runtime verify complete profile path; Founder decides whether incomplete-data copy is acceptable. | Maybe | Yes | Yes | Could block Profile polish if visible. |
| Translation Empty-State Copy Candidate | Dashboard / Wellness / Profile | Android | Generic unavailable/preparing strings exist in translations. | `lib/data/translations.ts`: `Dashboard belum tersedia.`, `Peta jiwamu belum tersedia.`, `Rekomendasi sedang disiapkan.` | Decide whether these are acceptable loading/setup states or release-blocking placeholder text. | Maybe | Yes, for visibility | Yes | Medium unless visible in valid user flow. |

## P3 Low

| Blocker Name | Affected Module | Android or Website | Root Cause | Evidence | Exact Next Action | Code Change Required | QA Account Required | Founder Action Required | Release Impact |
|---|---|---|---|---|---|---|---|---|---|
| Kenali Diri Aura Build Env Issue | Kenali Diri Aura / Website API | Website | Missing Firebase public env vars for website route `/api/kenali-diri/aura`. | `npm run build` fails at `/api/kenali-diri/aura`. Founder explicitly marked this out of Android scope. | Track separately under Website. Do not fail Android RC because of this issue alone. | Maybe, website-only | No | No for Android; yes for website release | Does not block Android release by itself. |

## Working Tree Classification Plan

Do not commit or clean yet. First classify:

### Must Keep For Build 64 Review

- Build 64 implementation files intentionally changed by approved sprints.
- Build 64 reports that Founder wants retained.
- QA screenshots/evidence only if Founder wants them committed.

### Must Review Before Keep

- `app/journey/page.tsx`
- `components/wellness/WellnessPageClient.tsx`
- `components/dashboard/WellnessCheckInCard.tsx`
- `components/dashboard/*`
- `app/profile/page.tsx`
- `components/profile/ProfileShareCardSection.tsx`
- `app/innerwork/*`
- `lib/repositories/*`
- `lib/innerwork/wellnessSection4Logging.ts`
- `lib/types/journeyDailyRecord.ts`

### Protected Review Required

Do not keep or revert without Founder approval:

- `firestore.rules`
- `android/app/build.gradle`
- `lib/access/accessControl.ts`
- `lib/billing/*`
- `lib/config/buildInfo.ts`
- `lib/firebase/service.ts`
- `lib/repositories/userRepository.ts`
- `package.json`
- `package-lock.json`

### Likely Temporary / Debug / Artifact Candidates

These require Founder decision before removal or ignore:

- `test_write.tsx`
- `test_write.txt`
- `scripts/test_*`
- `scripts/runtime-access-audit.js`
- `qa-artifacts/`
- old AAB artifacts in repo root
- `.idea/studiobot.xml`
- generated reports not needed in release commit

No deletion should happen until Founder approves cleanup scope.

## What Must Not Be Touched Yet

Do not touch unless a later approved blocker fix explicitly requires it:

- Billing
- Badge
- AccessGuard / Access Control
- Firestore Rules
- versionCode
- AAB
- Play Console
- Journey architecture
- AI Memory architecture
- new repository or new engine

## Android Release Readiness

NOT READY

Reason:
- P0 blockers remain open.
- Runtime QA with valid server-owned access is not complete.
- Firestore/Journey/Dashboard continuity is not proven.
- Subscription/Badge/Access matrix is not proven.
- Working tree is not release-clean.

## Website Status

SEPARATE - NOT READY FOR WEBSITE BUILD

Reason:
- `/api/kenali-diri/aura` fails build due missing Firebase public env variables.
- This is out of Android release scope.

## Exact Next 3 Actions

1. Founder provides or confirms one valid QA account with server-owned access and complete profile/blueprint data.

2. Run full Android runtime QA using that account, without bypassing AccessGuard:
   - Dashboard
   - Profile
   - Wellness Section 1-4
   - Journey `Rencana Hari Ini` and `Praktik Tambahan`
   - Manifestasi
   - Firestore paths
   - refresh/reopen/logout-login persistence

3. Founder triages working tree classification:
   - keep
   - revert
   - ignore
   - review protected-system diffs

Only after those three actions should code fixes, cleanup, commit, AAB rebuild, or release steps be considered.
