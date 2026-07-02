# MOANA V63 Save Pipeline Root Cause Report

## 1. Root Cause
The first shared break point found by static audit was the repository auth gate before Firestore write.

In v62, all Section 4 save handlers were routed through `logWellnessSection4Practice()`, which writes `dailyStates/{uid}/entries/{dateKey}` before `journeyDailyRecords/{uid}/entries/{dateKey}`. `dailyStateRepository.saveDailyState()` and `activityRepository.completeActivity()` immediately asserted `auth.currentUser`. If the UI had `auth.user.uid` from React context while the Firebase SDK auth instance had not finished hydrating `currentUser`, the first repository call threw before the Firestore write.

Exact failure shape:
`missing auth: expected uid <uid>, current auth uid null`

Before v63 this surfaced to users as a generic `"Gagal menyimpan..."`, masking the first failure.

The latest runtime screenshot on 2026-06-30 narrowed the remaining production break:
`code=permission-denied | operation=getDoc | path=journeyDailyRecords/vybyLLFpBxhF1L1m9IiGHm5chgG2/entries/2026-06-30 | authUid=vybyLLFpBxhF1L1m9IiGHm5chgG2`

Because `authUid` exactly matches the user id in the document path, this is not an auth-owner mismatch. The first failing operation is the Journey pre-read in `journeyRepository.ensureDailyRecord()` before the Section 4 save write. That read failure aborts the shared save helper before `appendPracticeResult()` can write the practice result that Journey Memory reads.

## 2. Exact File / Function / Line
- `lib/repositories/dailyStateRepository.ts:75` `ensureAuthenticatedOwner()`
- `lib/repositories/activityRepository.ts:63` `ensureAuthenticatedOwner()`
- `lib/auth/waitForFirebaseAuthOwner.ts:3` `waitForFirebaseAuthOwner()`
- `lib/innerwork/wellnessSection4Logging.ts:37` `logWellnessSection4Practice()`
- `lib/innerwork/wellnessSection4Logging.ts:193` `formatSection4SaveError()`
- `lib/repositories/journeyRepository.ts:188` `ensureDailyRecord()` pre-read diagnostic
- `lib/repositories/journeyRepository.ts:228` `updateDailyRecord()` write-first Journey patch
- `lib/repositories/journeyRepository.ts:259` `appendPracticeResult()` write-first Memory record patch

## 3. Why KARA Worked
KARA did not have the new `wellnessSection4Logging.ts` helper. Saves were simpler:
- local entry save for journal/meditation/audio
- direct daily state flag writes for completion
- Zone B journey writes through `saveZoneBJourneyContext()` only when needed

KARA had fewer chained writes and fewer chances for an early auth hydration race to abort the whole save path.

## 4. Why MOANA Broke
MOANA v62 centralized Section 4 saves through a new helper:
1. `dailyStateRepository.saveDailyState()`
2. `journeyRepository.updateDailyRecord()`
3. `journeyRepository.appendPracticeResult()`
4. readback diagnostics

Because step 1 could throw before Firestore, Journey and memory never received the new record. Yoga, Workout, and Healthy Food had an additional first write through `activityRepository.completeActivity()`, which had the same immediate auth assertion.

## 5. Fix Implemented
Added a tiny auth readiness wait at the repository gate:
- `dailyStateRepository` now waits for Firebase `auth.currentUser.uid === uid` before asserting owner.
- `activityRepository` now does the same before activity/dailyState writes.
- `journeyRepository` now does the same before `journeyDailyRecords` reads/writes.
- If auth never resolves, the thrown error is explicit.

Added exact error surfacing:
- all Section 4 save pages now use `formatSection4SaveError()`
- alerts and console logs include code/message/path/authUid when available
- no generic-only `"Gagal menyimpan"` remains in these catch blocks

After screenshot evidence on 2026-06-30 showed:
`code=permission-denied | message=Missing or insufficient permissions.`

the Journey repository was patched because its Firestore calls were not wrapped by `debugFirestoreOperation()`. That meant the app could show the permission code but not the failing path. `journeyRepository` now wraps:
- `getDoc journeyDailyRecords/{uid}/entries/{dateKey}`
- `setDoc journeyDailyRecords/{uid}/entries/{dateKey}`
- `getDocs journeyDailyRecords/{uid}/entries`

with path-aware debug metadata.

After screenshot evidence on 2026-06-30 at 09:15 showed the exact first failing operation was:
`operation=getDoc | path=journeyDailyRecords/{uid}/entries/{dateKey}`

the Section 4 save path was patched again:
- `updateDailyRecord()` no longer calls `ensureDailyRecord()` before writing.
- `appendPracticeResult()` no longer calls `ensureDailyRecord()` before writing.
- both methods now call `setDoc(..., { merge: true })` directly with only stable identity fields plus the actual save payload.
- this avoids the denied pre-read and prevents blank base defaults from overwriting existing Journey narrative fields.

## 6. Wellness / Section 4 Route Audit
Current app has 7 Section 4 routes, not 8 separate routes:
- Journaling: `/innerwork/journaling`
- Meditation: `/innerwork/meditation`
- Yoga: `/innerwork/yoga`
- Workout: `/innerwork/workout`
- Audio Healing: `/innerwork/audio-healing`
- Healthy Food / Herbal: `/innerwork/herbal`
- Manifestasi: `/innerwork/manifestasi`

`Healthy Food` and `Herbal` are one current route in this codebase. `translations.ts` labels `innerwork.herbal` as `Makanan Sehat` / `Healthy Food`, and the route uses `HEALTHY_FOOD_DATABASE`.

## 7. Save Path Audit
All current Section 4 save buttons route to the shared Journey writer:

| Module | Handler | First write | Journey writer | DailyState flag |
| --- | --- | --- | --- | --- |
| Meditation | `app/innerwork/meditation/page.tsx:167` | local meditation cache | `logWellnessSection4Practice()` at line 218 | `meditationDone` |
| Journaling | `app/innerwork/journaling/page.tsx:283` / `369` | local or journal repo | line 335 / 424 | `journalingDone` |
| Yoga | `app/innerwork/yoga/page.tsx:85` | `activityRepository.completeActivity()` line 114 | line 142 | `yogaDone` |
| Workout | `app/innerwork/workout/page.tsx:90` | `activityRepository.completeActivity()` line 119 | line 147 | `workoutDone` |
| Healthy Food / Herbal | `app/innerwork/herbal/page.tsx:46` | `activityRepository.completeActivity()` line 66 | line 83 | `herbalDone` |
| Audio Healing | `app/innerwork/audio-healing/page.tsx:93` | local audio cache | line 128 | `audioHealingDone` |
| Manifestasi | `app/innerwork/manifestasi/page.tsx:141` | shared helper | line 164 | `manifestDone` |

Shared helper:
- dailyState write attempt: `lib/innerwork/wellnessSection4Logging.ts:88`
- dailyState save: `lib/innerwork/wellnessSection4Logging.ts:92`
- journey record write attempt: `lib/innerwork/wellnessSection4Logging.ts:98`
- `updateDailyRecord`: `lib/innerwork/wellnessSection4Logging.ts:102`
- `appendPracticeResult`: `lib/innerwork/wellnessSection4Logging.ts:137`

Journey repository protection:
- auth owner wait: `lib/repositories/journeyRepository.ts:34`
- journey doc path: `lib/repositories/journeyRepository.ts:17`
- path-aware `ensureDailyRecord`: `lib/repositories/journeyRepository.ts:171`
- write-first `updateDailyRecord`: `lib/repositories/journeyRepository.ts:228`
- write-first `appendPracticeResult`: `lib/repositories/journeyRepository.ts:259`

## 8. Memory Pipeline Audit
Section 4 memory source is `journeyRepository.getDailyMemory(uid)`, which reads recent records from:
`journeyDailyRecords/{uid}/entries`

The practice memory signal is written by:
`logWellnessSection4Practice()` -> `journeyRepository.appendPracticeResult()` -> `practiceResults: arrayUnion(result)`

Before this patch, `appendPracticeResult()` never ran in production for affected users because `updateDailyRecord()` called `ensureDailyRecord()` and died on the denied `getDoc`. After this patch, both Journey update and Memory practice result write attempt happen through direct merge writes. If production still shows `permission-denied`, the next exact error should be `operation=setDoc`, which means deployed Firestore rules reject writes and must be redeployed/aligned.

## 9. Regression Test
- `npx tsc --noEmit`: PASS
- `npm run build`: PASS
- Wellness Section 4 static route audit: PASS
- Save handler to Journey writer static audit: PASS
- Screenshot regression recheck: permission-denied was exposed; Journey path instrumentation added; typecheck/build PASS after patch.
- Screenshot `091525` regression recheck: first denied operation was `getDoc`; write-first Journey patch implemented; `npx tsc --noEmit` PASS; `npm run build` PASS.

## 10. Runtime Proof
Not certified in this session.

The required proof needs real Android, real Firebase, real authenticated user, Firestore readback, refresh persistence, logout/login persistence, and AI Memory verification for each module. This session can compile and audit the code path, but it cannot honestly certify all real-device production assertions without operating the Android app with an authenticated Firebase account.

## 11. Screenshot / Log Evidence
Build evidence:
- `npx tsc --noEmit`: exit code 0
- `npm run build`: compiled successfully, TypeScript finished, 72 routes generated
- repeated after `journeyRepository` patch: `npm run build` PASS, 72 routes generated
- repeated after write-first Journey patch: `npx tsc --noEmit` PASS; `npm run build` PASS, 72 routes generated

Static evidence:
- Wellness Section 4 links in `components/wellness/WellnessPageClient.tsx:206-212`
- Current route set under `app/innerwork`: `audio-healing`, `herbal`, `journaling`, `manifestasi`, `meditation`, `workout`, `yoga`

Screenshot evidence:
- `Screenshot 2026-06-30 090836.png`: Meditation save reached exact Firestore error display: `code=permission-denied | message=Missing or insufficient permissions.`
- Because no path was shown in that screenshot, the failing call was inferred to be in uninstrumented `journeyRepository` rather than `dailyStateRepository` or `activityRepository`, which already add `firestoreDebug.path`.
- `Screenshot 2026-06-30 091525.png`: Meditation save reached exact first failing operation: `operation=getDoc | path=journeyDailyRecords/{uid}/entries/2026-06-30 | authUid={same uid}`. This proves the save was blocked before the Journey write and before Memory `practiceResults` append.
- Runtime console evidence after write-first patch: Meditation save now reaches `operation=setDoc | path=journeyDailyRecords/{uid}/entries/2026-06-30 | authUid={same uid}` and is still rejected with `permission-denied`. This proves the pre-read blocker was removed and the remaining blocker is deployed Firestore write permission.
- Runtime console evidence from Journaling: `handleLocalSave()` reaches the same `operation=setDoc | path=journeyDailyRecords/{uid}/entries/2026-06-30 | authUid={same uid}` and is rejected with `permission-denied`. This proves the remaining failure is shared Journey Firestore permission, not a Meditation-only UI handler bug.

## 12. Final Status
FAIL - NOT PRODUCTION CERTIFIED.

Reason: code fix, compile, build, and static save-path audit passed, but the strict mission requires real Android + real Firebase + authenticated-user runtime proof for all listed practices. That proof has not been completed in this session, so this cannot be marked PASS.
