# MOANA V65 Release Regression Audit

Date: 2026-07-01
Mode: AUDIT ONLY

No code fix was performed.

## Final Status

FAIL

Build 65 is not proven to equal Build 64 plus Google Play Billing.

The native Android shell was built as versionCode 65 and contains the Google Play Billing permission/library, but the packaged Capacitor web assets were copied from a stale static export generated before the Build 64 final web build. This makes Build 65 a mixed artifact:

- Native shell: Build 65 / Billing-capable.
- Web app payload: stale `out` export from 2026-06-30 20:58, static build id `0d2yoDVeroEyjftfBfIzT`.
- Build 64 RC/final AAB web payload: static build id `U-eM47FKLZaWgibfQ2xoB`, generated 2026-07-01 11:21.

Therefore Build 65 is not a clean successor of Build 64.

## 1. Commit Used To Build Build 65

Reported Build 65 commit:

`9e597c430c4cfdbacea0090a20e456ab41591073`

Source:

- `MOANA_V65_FINAL_RELEASE_AAB_REPORT.md`

But this commit is not a real Build 65 Billing commit. It is:

`chore(release): bump android version to 64`

Evidence:

- `git show --stat 9e597c4` changes only `android/app/build.gradle`.
- Billing implementation files are uncommitted in the working tree.
- `android/app/src/main/java/com/bhumiamartya/app/billing/BhumiBillingPlugin.java` is untracked.
- `functions/index.js` is untracked.
- `android/app/build.gradle`, `MainActivity.java`, `app/upgrade/page.tsx`, `lib/billing/googlePlayBilling.ts`, and `lib/config/buildInfo.ts` are modified after HEAD.

Determination:

Build 65 was built from a dirty working tree based on commit `9e597c4`, not from a committed, reproducible Build 65 source commit.

## 2. Build64 RC Vs Build65

Build 64 lineage:

- Build 64 RC commit: `3068f70d17a2efe41cac4f81de69ee50ef7077f3`
- Self-containment hotfix: `068030ffbedfed73f24f597a101f1b84bcf576b3`
- Version metadata commit: `9e597c430c4cfdbacea0090a20e456ab41591073`
- Final Build 64 AAB: `C:\tmp\moana-v64-final-aab-9e597c4\android\app\build\outputs\bundle\release\app-release.aab`
- Build 64 AAB size: `9,270,333` bytes
- Build 64 AAB timestamp: `2026-07-01 11:33:14 +07:00`
- Build 64 web export build id: `U-eM47FKLZaWgibfQ2xoB`

Build 65 artifact:

- Path: `C:\Users\shein\bhumi-amartya-clean\android\app\build\outputs\bundle\release\app-release.aab`
- Size: `10,000,085` bytes
- Timestamp: `2026-07-01 17:30:14 +07:00`
- Native versionCode: `65`
- Native versionName: `3.2.1`
- Billing permission: present in merged release manifest.
- Packaged web export build id: `0d2yoDVeroEyjftfBfIzT`

Critical difference:

Build 64 performed `npm run build -- --webpack` before Capacitor sync. Build 65 report lists:

- `npx tsc --noEmit`
- `npx cap sync android`
- `.\gradlew.bat :app:bundleRelease`

It does not list a fresh `npm run build` before `cap sync`.

Result:

`npx cap sync android` copied stale files from `out`, not a fresh Build 65 web export.

## 3. Module Verification

### Dashboard

FAIL

Build 64 Dashboard work was committed in `3068f70`, including `DashboardClient`, `DailyUserFlowGuide`, `DailyNoteV2`, `DashboardHeader`, `SoulReflectionCard`, and `WellnessCheckInCard`.

Build 65 packaged assets are stale. The packaged static chunks still include stale app metadata such as `appVersion: "3.1.12"` in ActivityTracker code and use the old static build id `0d2yoDVeroEyjftfBfIzT`.

Conclusion: Build 65 does not reliably package the Build 64 Dashboard payload.

### Profile

FAIL

Build 64 included Profile layout cleanup and share-card relocation/removal from Profile:

- `app/profile/page.tsx`
- `components/profile/ProfileShareCardSection.tsx`
- `components/ui/ShareCard.tsx`

Because Build 65 packaged stale web assets, Profile cannot be accepted as Build 64 parity.

### Journey

FAIL

Build 64 source includes Journey Option B:

- `Rencana Hari Ini`
- `Praktik Tambahan`
- Journey daily record persistence support
- Section 4 practice result append path

Build 65 packaging copied stale `out` assets from 2026-06-30 instead of the fresh Build 64 export from 2026-07-01. Journey parity is therefore not guaranteed, and observed behavior matching Build 63 is explained by the stale web payload.

### Wellness

FAIL

Build 64 source includes:

- Section 1 `Baik` / `Tidak Baik` 7-point scale UI.
- Section 2/3 Wellness mapping and `Hari Ini Cukup`.
- Section 4 support/practice layout.
- Section 4 logging into daily state and Journey.

Build 65 did not rebuild the web export before Capacitor sync. Wellness parity fails.

### Founder Dashboard

FAIL

Build 65 working tree includes an uncommitted Founder Dashboard V2 redesign in `app/admin/activity/page.tsx`.

This is not allowed under the rule:

Build 65 = Build 64 + Billing only.

Also, because the V65 AAB copied stale web assets, the Founder Dashboard V2 redesign is not proven to be inside the packaged app. This is both an unauthorized source delta and an unproven packaged result.

## 4. Build64 Features Missing Or Not Proven In Build65

The following Build 64 features are present in the Build 64 source/RC lineage but missing or not proven in the Build 65 packaged web payload:

1. Dashboard Build 64 continuity changes.
2. Dashboard `Disarankan` simplification to Profile, Wellness, Journey.
3. Refleksi Jiwa shortened copy and required closing behavior.
4. Time-aware greeting support for Refleksi Jiwa.
5. Wellness Section 1 `Baik` / `Tidak Baik` scale UI.
6. Wellness Section 2/3 implementation.
7. `Hari Ini Cukup` checklist flow.
8. Wellness Section 4 support layout.
9. Wellness Section 4 save/readback to daily state and Journey.
10. Journey Option B split between `Rencana Hari Ini` and `Praktik Tambahan`.
11. Journey readback/details persistence support.
12. Journey progress hydration from daily state and practice results.
13. Profile two-column cleanup.
14. Share hero removed from Profile.
15. Share card moved/relocated through Journey/Profile share section.
16. AccessGuard self-containment hotfix from `068030f`.
17. Type-only `PremiumFeature` expansion required by Build 64 routes.
18. Build 64 clean web export build id `U-eM47FKLZaWgibfQ2xoB`.

Additional Build 65 expected feature not proven in packaged web payload:

19. Google Play Billing upgrade UI in `/upgrade`.

Native Billing is present, but the user-facing purchase screen depends on the packaged web bundle. Since the web bundle is stale, Billing end-to-end is not proven.

## 5. Why Build65 Was Produced From The Wrong Baseline

Root cause:

Build 65 was produced by changing native/build files in the main dirty workspace and running Capacitor sync without first producing a fresh Next static export from the intended source baseline.

Evidence:

- `out` directory timestamp: `2026-06-30 20:58`.
- Build 64 final export timestamp: `2026-07-01 11:21`.
- Build 65 Android assets timestamp: `2026-07-01 17:28`, but copied from stale `out`.
- Build 65 AAB timestamp: `2026-07-01 17:30`.
- Build 65 report does not list `npm run build`.
- Build 65 packaged static build id is `0d2yoDVeroEyjftfBfIzT`.
- Build 64 final static build id is `U-eM47FKLZaWgibfQ2xoB`.

Secondary process failures:

- No dedicated committed Build 65 source commit exists.
- Billing changes were not committed before release build.
- Non-billing changes were present in the Build 65 working tree, including Founder Dashboard V2, force update/version checker changes, access/billing/access-control changes, Firestore rules, auth actions, and repository changes.
- The release report called the build PASS based on native manifest and Gradle success, not web payload parity.

## 6. Force Update Loop Verification

Status: NOT PROVEN, but root risk identified.

Current source logic:

- `getRuntimeBuildInfo()` uses Capacitor `App.getInfo()` on native.
- If native metadata is available, Build 65 should report versionCode `65`.
- `evaluateAppUpdateStatus()` compares current native build against remote minimum build.
- Local Android failsafe minimum is `62`.

Implication:

If Capacitor native `App.getInfo()` works, Build 65 should not force-update-loop when remote minimum is `65` or lower.

But packaged stale web assets include older app/version strings such as `3.1.12` in client-side tracking/layout chunks. This creates inconsistent telemetry and possible UI/version confusion.

Conclusion:

No hard proof of a force-update loop was found from static audit alone, but Build 65 is unsafe because native version and packaged web version are not from the same build.

## 7. Onboarding Routing Verification

Requirement:

New users must open Dashboard first, not Wellness.

Current source evidence:

- `app/login/page.tsx` defaults `nextParam` to `/dashboard`.
- After login, if `setupCompleted && blueprintExists`, it routes to `/dashboard`.
- Otherwise it routes to `/setup`.
- `lib/auth/userRouteState.ts` maps completed users to `/dashboard`.
- `app/onboarding/page.tsx` re-exports the welcome page, not Wellness.

Static source conclusion:

Current source routes completed users to Dashboard and incomplete users to Setup.

Packaged Build 65 conclusion:

Not proven, because the packaged web assets are stale. Build 65 cannot be accepted as satisfying the onboarding routing requirement until a fresh web export is packaged and verified.

## Unauthorized Non-Billing Changes In Build65 Working Tree

Build 65 was supposed to be Build 64 plus Billing only. The working tree also contains non-billing deltas, including:

- Founder Dashboard V2 redesign: `app/admin/activity/page.tsx`
- Force update/version checker changes: `components/global/VersionChecker.tsx`, `UpdateRequiredScreen.tsx`, `lib/services/appUpdateService.ts`, new `lib/services/appUpdatePolicy.ts`
- Access/auth/repository changes: `lib/access/accessControl.ts`, `lib/auth/authActions.ts`, `lib/repositories/userRepository.ts`
- Firestore rules/config changes: `firestore.rules`, `firebase.json`
- Prompt change: `lib/prompts/dailyGuidancePrompt.ts`
- Healing/journal/meditation route changes.
- Package and lockfile changes.

These changes violate the release rule even before considering the stale packaged web payload.

## Root Cause

Build 65 failed release discipline at two levels:

1. Artifact root cause:
   Capacitor packaged stale `out` assets because `npm run build` was not run before `npx cap sync android`.

2. Source-control root cause:
   Build 65 was produced from an uncommitted dirty working tree based on V64 commit `9e597c4`, not from a clean, committed Build 65 baseline containing exactly Build 64 plus Billing.

## Final Determination

Build65 == Build64 + Billing?

NO.

Final status:

FAIL
