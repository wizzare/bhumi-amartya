# MOANA V3 - Journey Persistence Audit

Audit date: 2026-06-30
Execution rule: `MOANA_V3_EXECUTION_MODE.md`

## STATUS

FAIL

Reason: Root cause in Journey hydration was found and fixed at code level. TypeScript and production build pass. Required runtime proof on real Android + production Firebase + real authenticated user was not executed in this session, so this audit cannot be marked PASS.

## ROOT CAUSE

Journey detail and Journey progress could still depend on `dailyStates` even when Firestore already had `journeyDailyRecords`.

Affected behavior:
- `/journey` Progress Today used `dailyStates/{uid}/entries/{date}` as the progress source.
- `/journey/[id]` generated `story` from `dailyStates` only.
- If `journeyDailyRecords/{uid}/entries/{date}` existed but `dailyStates` was missing, delayed, or unreadable, Journey could show empty/fallback state despite Firestore having Journey data.

This violates MOANA V3 execution mode:
- Journey must not fallback when records exist.
- Every save must update Journey and Progress Today.
- Journey must survive refresh, reopen, and logout/login from Firestore state.

## Evidence

Write source:
- `lib/innerwork/wellnessSection4Logging.ts` writes both `dailyStates/{uid}/entries/{dateKey}` and `journeyDailyRecords/{uid}/entries/{dateKey}`.
- `lib/repositories/journeyRepository.ts` reads persisted records from `journeyDailyRecords/{uid}/entries`.

Regression point before this audit:
- `app/journey/page.tsx` read `todayRecord`, but Progress Today still used `getCompletionSummary(todayState)`.
- `components/journey/details/JourneyDetailClient.tsx` read `memory.last30Days`, but `journeyStoryEngine.generateStory()` still received `states`.

Fix evidence:
- `lib/engines/completionEngine.ts:108` adds `mergeDailyStateWithJourneyRecord()`.
- `lib/engines/completionEngine.ts:133` adds `mergeDailyStatesWithJourneyRecords()`.
- `app/journey/page.tsx:62` hydrates today progress from `todayRecord`.
- `app/journey/page.tsx:73` calculates Progress Today from the hydrated state.
- `components/journey/details/JourneyDetailClient.tsx:114` hydrates history from Journey records.
- `components/journey/details/JourneyDetailClient.tsx:126` generates story from hydrated history.

## Fix Implemented

Minimal fix only:
- No new architecture.
- No new Journey engine.
- No new save pipeline.
- No new cache.
- No new Firestore collection.
- No data model change.

Changed behavior:
- Journey UI now merges existing `journeyDailyRecords` into the in-memory completion view used by Journey.
- If `dailyStates` exists, it remains the base.
- If `dailyStates` is missing but Journey Firestore data exists, Journey records hydrate the visible progress/story.
- Empty fallback is no longer caused only by missing `dailyStates` when Journey records exist.

## Verification

Static audit:
- Save Journey: PASS
- Firestore write path: PASS
- Firestore read path: PASS
- Journey hydration: PASS at code level after fix
- Cache: PASS at Journey page level; Journey pages read Firestore repositories directly, not local daily guidance cache
- Session restore: PASS at code level through Firebase `browserLocalPersistence`
- Login restore: PASS at code level through owner-scoped Firestore reads
- Dashboard data source: PASS at code level; dashboard calls `loadWellnessDailyIntelligence()` and reads Journey memory
- Progress Today source: PASS at code level after fix
- Daily Context source: PASS at code level; dashboard payload includes Journey memory, recent Daily States, Blueprint, current sky, environment context

Commands:
- `npx tsc --noEmit`: PASS
- `npm run build`: PASS, 72 routes generated

## Runtime Proof

Runtime Android proof: FAIL

Reason: Not executed in this session.

Required tests and current status:

| Test | Required Flow | Status |
| --- | --- | --- |
| TEST 1 | Save Meditation -> Refresh -> Journey still exists | FAIL: no real Android runtime proof |
| TEST 2 | Save Journaling -> Close App -> Open -> Journey still exists | FAIL: no real Android runtime proof |
| TEST 3 | Save Workout -> Logout -> Login -> Journey still exists | FAIL: no real Android runtime proof |
| TEST 4 | Save Yoga -> Refresh -> Progress Today still correct | FAIL: no real Android runtime proof |
| TEST 5 | Save Healthy Food -> Dashboard reads Journey | FAIL: no real Android runtime proof |

## Files Changed

- `lib/engines/completionEngine.ts`
- `app/journey/page.tsx`
- `components/journey/details/JourneyDetailClient.tsx`
- `MOANA_V3_JOURNEY_PERSISTENCE_AUDIT.md`

Note: The working tree already contained previous uncommitted changes from earlier Section 4/Journey work. This audit changed only the files listed above.

## Regression Risk

Low to medium.

Reason:
- The fix changes Journey read/hydration behavior only.
- It does not modify Section 4 save handlers.
- It does not modify Firestore rules.
- It does not modify repository write paths.
- It does not change data model.
- Risk is limited to how Journey progress/story interprets existing `practiceResults` categories.

Known remaining risk:
- Duplicate save clicks can still append multiple `practiceResults` when each click has a new `completedAt`. This audit did not change write semantics because the mission was persistence and no new pipeline/model was allowed.
- Real Android persistence is not certified until runtime tests are completed.

## Final Gate

NOT READY

Required before PASS:
- Real Android test.
- Production Firebase authenticated user.
- Firestore readback after refresh.
- Firestore readback after force close/reopen.
- Firestore readback after logout/login.
- Dashboard confirmation after Healthy Food save.
- Progress Today confirmation after Yoga save.
- Duplicate Journey record check.

