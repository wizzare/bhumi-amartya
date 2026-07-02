# MOANA V64 Final RC Staging Recommendation

Date: 2026-07-01

Mode: Recommendation only.

No `git add`, commit, push, clean, delete, or code change was performed.

Source reviewed:
- `MOANA_V64_RELEASE_CANDIDATE_FILELIST.md`

Staging state:
- `git diff --cached --name-only` returned no staged files.

## Files To Stage

Default RC candidate files from SECTION A:

| File | Reason |
|---|---|
| `app/innerwork/audio-healing/page.tsx` | Wellness Section 4 Audio Healing save/readback path. |
| `app/innerwork/herbal/page.tsx` | Wellness Section 4 Healthy Food/Herbal save/readback path. |
| `app/innerwork/journaling/page.tsx` | Wellness Section 4 Journaling save/readback path. |
| `app/innerwork/manifestasi/page.tsx` | Manifestasi save/readback and Journey persistence scope. |
| `app/innerwork/meditation/page.tsx` | Wellness Section 4 Meditation save/readback path. |
| `app/innerwork/workout/page.tsx` | Wellness Section 4 Workout save/readback path. |
| `app/innerwork/yoga/page.tsx` | Wellness Section 4 Yoga save/readback path. |
| `app/journey/page.tsx` | Journey Option B UI: `Rencana Hari Ini` and `Praktik Tambahan`. |
| `app/profile/page.tsx` | Profile 2-column layout and share hero removal/relocation scope. |
| `app/wellness/page.tsx` | Wellness Build 64 route wrapper. |
| `components/dashboard/DailyNoteV2.tsx` | Dashboard Catatan/continuity copy scope. |
| `components/dashboard/DailyUserFlowGuide.tsx` | Dashboard `Disarankan` simplification. |
| `components/dashboard/DashboardClient.tsx` | Dashboard section order and daily/Journey reads. |
| `components/dashboard/DashboardHeader.tsx` | Dashboard visual/copy adjustment. |
| `components/dashboard/SoulReflectionCard.tsx` | Shortened Refleksi Jiwa copy and required closing. |
| `components/dashboard/WellnessCheckInCard.tsx` | Wellness Section 1 `Baik` / `Tidak Baik` scale UI. |
| `components/journey/details/JourneyDetailClient.tsx` | Journey readback/details related to persistence verification. |
| `components/profile/ProfileShareCardSection.tsx` | Share card section moved from Profile to Journey. |
| `components/ui/ShareCard.tsx` | Share card visual cleanup. |
| `components/wellness/WellnessPageClient.tsx` | Wellness Sections 1-3 UI and checklist state. |
| `lib/auth/waitForFirebaseAuthOwner.ts` | Auth hydration helper for save/readback stability. |
| `lib/dailyGuidance/timeOfDayGreeting.ts` | Greeting logic for Refleksi Jiwa. |
| `lib/engines/completionEngine.ts` | Journey progress hydration from daily state/practices. |
| `lib/innerwork/wellnessSection4Logging.ts` | Canonical Section 4 logging into daily state and Journey. |
| `lib/repositories/activityRepository.ts` | Activity save path for Yoga, Workout, and Healthy Food. |
| `lib/repositories/dailyStateRepository.ts` | Daily state save/readback for Wellness, Dashboard, and Journey. |
| `lib/repositories/journeyRepository.ts` | Existing Journey repository reused for Section 3/4 persistence. |
| `lib/types/journeyDailyRecord.ts` | Journey daily record typing for checklist/practice results. |

## Files To Exclude

Exclude all SECTION B files from the RC commit by default.

These include:
- Old AAB artifacts.
- Historical reports and audit documents.
- QA screenshots and runtime artifacts.
- Local scripts, temp files, debug files, generated cache, and IDE files.
- `functions/node_modules/**`.
- Local secret-looking file: `secure/bhumiamartya-adminsdk.json.json`.
- Website-only or out-of-scope artifacts.
- Current staging-management reports such as `MOANA_V64_RELEASE_CANDIDATE_FILELIST.md`.

Specific SECTION B paths remain excluded exactly as listed in `MOANA_V64_RELEASE_CANDIDATE_FILELIST.md`.

## Files Requiring Founder Decision

SECTION C should not be staged until Founder approves each item.

| File | Decision Needed | Risk If Included | Risk If Excluded |
|---|---|---|---|
| `.env.local.example` | Confirm Android vs Website env template scope. | Could mix website env requirements into Android release docs. | Needed env documentation may be omitted. |
| `.gitignore` | Confirm ignore-rule changes. | Could hide or expose wrong release artifacts. | Useful artifact hygiene may be missed. |
| `PROJECT_CONTEXT.md` | Confirm process docs belong in RC. | Non-runtime process changes enter release commit. | Project context updates remain local. |
| `RELEASE_METADATA.json` | Confirm release metadata/version intent. | Could alter release metadata unexpectedly. | Release metadata may not match RC. |
| `android/app/build.gradle` | Confirm Android build config/version scope. | Version/build config may change against instruction. | Required Android config fix may be omitted. |
| `app/healing/audio/page.tsx` | Confirm legacy/healing route belongs to Android RC. | Out-of-scope route changes enter RC. | Needed legacy route fix may be omitted. |
| `app/healing/meditation/page.tsx` | Confirm legacy/healing route belongs to Android RC. | Out-of-scope route changes enter RC. | Needed legacy route fix may be omitted. |
| `app/healing/page.tsx` | Confirm legacy/healing route belongs to Android RC. | Out-of-scope route changes enter RC. | Needed legacy route fix may be omitted. |
| `app/journal/page.tsx` | Confirm journal route is Build 64 scope. | Unapproved route behavior enters RC. | Journal fix may be omitted. |
| `app/layout.tsx` | Confirm root layout change is required. | High-blast-radius app behavior change. | Required app shell fix may be omitted. |
| `app/meditation/page.tsx` | Confirm meditation route belongs to Android RC. | Unapproved route behavior enters RC. | Needed route fix may be omitted. |
| `components/auth/AccessGuard.tsx` | Confirm AccessGuard change is approved. | Access control behavior could change. | Required access fix may be omitted. |
| `components/global/UpdateRequiredScreen.tsx` | Confirm update UI/version scope. | Version/update behavior could change. | Required forced-update fix may be omitted. |
| `components/global/VersionChecker.tsx` | Confirm version-checking scope. | Version enforcement could change. | Required version check fix may be omitted. |
| `firebase.json` | Confirm Firebase deployment config scope. | Deployment behavior could change. | Needed Firebase config fix may be omitted. |
| `firestore.rules` | Confirm Firestore Rules change is explicitly approved. | Protected rules could change. | Needed permission fix may be omitted. |
| `functions/index.js` | Confirm Firebase Functions are part of RC. | New backend behavior enters RC. | Needed backend support may be omitted. |
| `functions/package-lock.json` | Confirm Functions dependency lock is part of RC. | Backend dependency churn enters RC. | Needed Functions dependency lock may be omitted. |
| `functions/package.json` | Confirm Functions package config is part of RC. | Backend package changes enter RC. | Needed Functions config may be omitted. |
| `lib/access/accessControl.ts` | Confirm access-control change is approved. | Protected access behavior could change. | Required access fix may be omitted. |
| `lib/auth/authActions.ts` | Confirm auth action change is approved. | Login/access behavior could regress. | Required auth fix may be omitted. |
| `lib/billing/accessControl.ts` | Confirm billing/access change is approved. | Billing or access behavior could change. | Required protected fix may be omitted. |
| `lib/billing/billingPreparation.ts` | Confirm billing prep belongs to RC. | Future billing prep enters release. | Planned billing prep remains local. |
| `lib/billing/founderTesterSourceOfTruth.ts` | Confirm Founder/tester access source changes. | Badge/access source could change. | Required access list update may be omitted. |
| `lib/billing/membershipGrant.ts` | Confirm membership grant change. | Membership/access behavior could change. | Required grant fix may be omitted. |
| `lib/config/buildInfo.ts` | Confirm build/version metadata scope. | Version metadata could change. | Required metadata fix may be omitted. |
| `lib/firebase/service.ts` | Confirm Firebase service change. | Server-owned access handling could change. | Required service fix may be omitted. |
| `lib/prompts/dailyGuidancePrompt.ts` | Confirm AI/daily guidance change. | AI output behavior could change. | Required prompt fix may be omitted. |
| `lib/repositories/userRepository.ts` | Confirm user repository change. | Profile/access write behavior could change. | Required user read/write fix may be omitted. |
| `lib/services/appUpdatePolicy.ts` | Confirm update policy belongs to RC. | Version/update rules could change. | Required update policy may be omitted. |
| `lib/services/appUpdateService.ts` | Confirm update service belongs to RC. | Version/update behavior could change. | Required update service fix may be omitted. |
| `lib/rating/ratingPreparation.ts` | Confirm rating prep belongs to RC. | Future rating code enters release. | Planned rating prep remains local. |
| `package.json` | Confirm dependency/script changes. | Build dependency surface could change. | Required dependency/script change may be omitted. |
| `package-lock.json` | Confirm dependency lock changes. | Dependency churn enters release. | Required lockfile sync may be omitted. |
| `scripts/grant_new_user_penjaga_bhumi.ts` | Confirm access/badge script scope. | Protected admin/access script enters RC. | Needed script remains local. |
| `scripts/prepare_july1_access_seed.ts` | Confirm access seed script scope. | Protected seed script enters RC. | Needed script remains local. |
| `scripts/seed_minimum_app_version_config.ts` | Confirm version seed script scope. | Version config script enters RC. | Needed script remains local. |
| `scripts/verify_july1_access_seed.ts` | Confirm access verification script scope. | Protected verification script enters RC. | Needed script remains local. |
| `MOANA_V3_EXECUTION_MODE.md` | Confirm SoT/process doc should be committed. | Process doc changes enter release commit. | Source-of-truth update remains local. |

## Recommended Git Add Command

Do not run until Founder approves.

```bash
git add app/innerwork/audio-healing/page.tsx app/innerwork/herbal/page.tsx app/innerwork/journaling/page.tsx app/innerwork/manifestasi/page.tsx app/innerwork/meditation/page.tsx app/innerwork/workout/page.tsx app/innerwork/yoga/page.tsx app/journey/page.tsx app/profile/page.tsx app/wellness/page.tsx components/dashboard/DailyNoteV2.tsx components/dashboard/DailyUserFlowGuide.tsx components/dashboard/DashboardClient.tsx components/dashboard/DashboardHeader.tsx components/dashboard/SoulReflectionCard.tsx components/dashboard/WellnessCheckInCard.tsx components/journey/details/JourneyDetailClient.tsx components/profile/ProfileShareCardSection.tsx components/ui/ShareCard.tsx components/wellness/WellnessPageClient.tsx lib/auth/waitForFirebaseAuthOwner.ts lib/dailyGuidance/timeOfDayGreeting.ts lib/engines/completionEngine.ts lib/innerwork/wellnessSection4Logging.ts lib/repositories/activityRepository.ts lib/repositories/dailyStateRepository.ts lib/repositories/journeyRepository.ts lib/types/journeyDailyRecord.ts
```

## Risks

### Risks If SECTION A Is Included

- RC commit will include runtime changes across Dashboard, Profile, Wellness, Journey, and persistence helpers.
- If final Android runtime QA has not passed with a valid server-owned access account, unverified behavior may enter the RC.
- Persistence-related files affect save/readback paths and should be reviewed carefully before commit.

### Risks If SECTION A Is Excluded

- Build 64 RC will miss the approved Dashboard, Profile, Wellness, Journey Option B, and persistence work.
- Journey may not show separate `Rencana Hari Ini` and `Praktik Tambahan`.
- Wellness Section 1-3 UI and Section 4 logging improvements may be absent.

### Risks If SECTION B Is Included

- Old AABs, reports, screenshots, scripts, generated cache, IDE files, and local artifacts could pollute the RC commit.
- Secret-looking files or local QA artifacts could be exposed.
- Website/out-of-scope files could confuse Android release status.

### Risks If SECTION B Is Excluded

- No expected Android runtime risk.
- Local audit evidence and historical reports will remain uncommitted unless Founder separately requests a docs/archive commit.

### Risks If SECTION C Is Included Without Approval

- Protected systems may change: Access, Billing, Badge, Firestore Rules, Auth, Firebase Functions, version/update policy, package dependencies, and source-of-truth docs.
- This could violate Release Candidate Mode and create new release blockers.

### Risks If SECTION C Is Excluded

- If one of these files contains a required release-blocking fix, the RC may be incomplete.
- Founder review is required before deciding whether any SECTION C file moves into the RC staging command.

## Final Status

WAITING FOUNDER APPROVAL
