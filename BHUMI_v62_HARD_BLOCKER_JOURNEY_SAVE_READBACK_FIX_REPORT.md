# BHUMI v62 HARD BLOCKER — JOURNEY SAVE / READBACK FIX REPORT

## 1. Timestamp
2026-06-29T20:08:00+07:00 (Asia/Jakarta)

## 2. Branch
`KARA_V3_WELLNESS_STABLE`

## 3. Commit Hash Before
`d82e149a4f61c31ad85f4fae9bfcb498adcdfae1`

## 4. Files Reviewed
- `lib/innerwork/wellnessSection4Logging.ts`
- `lib/repositories/journeyRepository.ts`
- `lib/repositories/dailyStateRepository.ts`
- `lib/engines/journeyStoryEngine.ts`
- `components/journey/details/JourneyDetailClient.tsx`
- `app/journey/page.tsx`
- `app/innerwork/meditation/page.tsx`
- `app/innerwork/journaling/page.tsx`
- `app/innerwork/herbal/page.tsx`
- `app/innerwork/audio-healing/page.tsx`
- `app/innerwork/yoga/page.tsx`
- `app/innerwork/workout/page.tsx`
- `app/innerwork/manifestasi/page.tsx`
- `firestore.rules`

## 5. Files Changed
- `components/journey/details/JourneyDetailClient.tsx`: Fixed fallback timing, dateKey calculation, and added graceful read error handling.
- `lib/innerwork/wellnessSection4Logging.ts`: Added validation for `input.uid` before performing repository writes.
- `app/innerwork/audio-healing/page.tsx`: Resolved dateKey using userProfile timezone and wrapped practice logging in try-catch block with user alerts on failure.
- `app/innerwork/meditation/page.tsx`: Validated activeUid readiness and ensured try-catch alerts user on save failures.
- `app/innerwork/journaling/page.tsx`: Cleaned up duplicate manual `dailyStateRepository.saveDailyState` calls and aligned dateKey calculation with canonical timezone helper.
- `app/innerwork/herbal/page.tsx`: Added explicit user alerts on save failure in catch block.
- `app/innerwork/yoga/page.tsx`: Added explicit user alerts on save failure in catch block.
- `app/innerwork/workout/page.tsx`: Added explicit user alerts on save failure in catch block.
- `app/innerwork/manifestasi/page.tsx`: Delayed `setSaved(true)` until write succeeds and replaced swallowed `.catch()` with try-catch user alerts.

## 6. Root Cause Confirmation
1. **Fallback Timing Bug**: In `JourneyDetailClient.tsx`, any Firestore read error or exception caught by `try...catch` prevented `setStory` from running. Because `story` remained `null`, the component rendered the empty fallback message `"Perjalananmu baru saja dimulai..."` despite existing practice records.
2. **DateKey / Timezone Discrepancy**: `JourneyDetailClient.tsx` calculated dates using UTC `new Date().toISOString().slice(0, 10)`, while Section C save buttons used local timezone dates (`getLocalDateKey(new Date(), timezone)`). Near midnight boundaries (WIB / UTC+7), queries missed saved records for the current local day.
3. **Auth Assertion Bottleneck**: `dailyStateRepository.saveDailyState` strictly checks `auth.currentUser`. If called before the client SDK finishes initializing auth, the function throws, causing `logWellnessSection4Practice` to halt before writing to `journeyRepository`.
4. **UID & Error Swallowing Mismatches**: Uncoordinated duplicate writes in `journaling` and swallowed `.catch()` blocks in `manifestasi` contributed to flaky UI state feedback and premature success indicators.

## 7. DateKey Consistency Result
- **Save Path**: Standardized across all 8 Section C practices to use `getLocalDateKey(new Date(), timezone)` where `timezone` is resolved from `profile?.timezone || profile?.profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"`.
- **Read Path**: `JourneyDetailClient.tsx` now resolves `today` using the exact same `getLocalDateKey(new Date(), timezone)` logic instead of raw UTC slicing (`toISOString().slice(0,10)`).
- **Result**: Complete consistency between save and readback queries across all WIB/local time boundaries.

## 8. Auth Readiness Fix
- All Section C save handlers now validate `activeUid` (canonical `auth.user.uid` or development audit mock UID) before attempting writes.
- If `activeUid` is uninitialized, user is notified via clear alert rather than executing unauthenticated writes that fail silently.

## 9. Fallback Timing Fix
- `JourneyDetailClient.tsx` now explicitly tracks `readError`.
- If a Firestore read fails or throws an exception, `JourneyDetailClient` displays a gentle retry card (`"Terjadi kendala saat memuat data perjalanan. [Coba Lagi]"`) rather than swallowing the error and displaying the empty fallback `"Perjalananmu baru saja dimulai..."`.
- Empty fallback is only displayed when read completes successfully and zero records exist.

## 10. Canonical Save Contract
All Section C practices funnel through `logWellnessSection4Practice`:
- `uid`: Canonical auth UID
- `dateKey`: Timezone-aligned date string (`YYYY-MM-DD`)
- `practiceId`: Specific content identifier
- `practiceType`: `"journaling"` | `"meditation"` | `"yoga"` | `"workout"` | `"audioHealing"` | `"healthyFood"` | `"manifestation"`
- `practiceTitle`: Practice title string
- `durationMinutes`: Number of minutes spent
- `dailyStatePatch`: Updates corresponding completion flag in `dailyStates/{uid}/entries/{dateKey}`
- `reflectionResult`: User selected sensation or mood
- `reflectionResponse`: Generated insight synthesis

## 11. Page-by-Page Save QA Table

| Page | Handler | Writes DailyState? | Writes JourneyDailyRecords? | Slug / Type | DateKey | UID Source | Readback Visible? | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Meditation** | `handleSave` | YES (`meditationDone`) | YES (`updateDailyRecord` & `appendPracticeResult`) | `meditation` | Local App Date | `auth.user.uid` | YES | **PASS** |
| **Journaling** | `handleSave` | YES (`journalingDone`) | YES (`updateDailyRecord` & `appendPracticeResult`) | `journaling` | Local App Date | `auth.user.uid` | YES | **PASS** |
| **Healthy Food** | `handleSaveAll` | YES (`herbalDone`) | YES (`updateDailyRecord` & `appendPracticeResult`) | `healthyFood` | Local App Date | `auth.user.uid` | YES | **PASS** |
| **Audio Healing** | `handleSave` | YES (`audioHealingDone`) | YES (`updateDailyRecord` & `appendPracticeResult`) | `audioHealing` | Local App Date | `auth.user.uid` | YES | **PASS** |
| **Yoga** | `handleSave` | YES (`yogaDone`) | YES (`updateDailyRecord` & `appendPracticeResult`) | `yoga` | Local App Date | `auth.user.uid` | YES | **PASS** |
| **Workout** | `handleSave` | YES (`workoutDone`) | YES (`updateDailyRecord` & `appendPracticeResult`) | `workout` | Local App Date | `auth.user.uid` | YES | **PASS** |
| **Herbal** | `handleSaveAll` | YES (`herbalDone`) | YES (`updateDailyRecord` & `appendPracticeResult`) | `healthyFood` | Local App Date | `auth.user.uid` | YES | **PASS** |
| **Manifestasi** | `handleComplete` | YES (`manifestDone`) | YES (`updateDailyRecord` & `appendPracticeResult`) | `manifestation` | Local App Date | `auth.user.uid` | YES | **PASS** |

## 12. Journey Readback After Refresh/Reopen
- Entries written to `dailyStates` and `journeyDailyRecords` persist immediately.
- Refreshing or reopening `/journey` or `/journey/[id]` fetches and displays saved activities consistently without reverting to empty fallback.

## 13. DailyState Write Result
- `dailyStates/{uid}/entries/{dateKey}` properly updates completion flags (`journalingDone`, `meditationDone`, `herbalDone`, `audioHealingDone`, `yogaDone`, `workoutDone`, `manifestDone`).

## 14. JourneyDailyRecords Write Result
- `journeyDailyRecords/{uid}/entries/{dateKey}` properly sets `innerworkCompletion` and appends detailed records to `practiceResults`.

## 15. Regression Checks
- **Dashboard**: Loads normally (`/`).
- **Refleksi Jiwa**: Loads normally.
- **Catatan Hari Ini**: Loads normally.
- **Wellness**: Loads normally (`/wellness`).
- **Journey**: Loads normally (`/journey`).
- **Natal Chart**: Remains fixed (`/blueprint/natal-chart`).
- **Destiny Matrix**: Dynamic meanings remain fixed (`/blueprint/destiny-matrix`).
- **Billing / Subscription / Badges**: Untouched, no locks or fake text appears.

## 16. TypeScript Result
- Command: `npx tsc --noEmit`
- Result: **PASS** (0 errors)

## 17. Build Result
- Command: `npm run build`
- Result: **PASS** (Compiled successfully in 22.3s, 40 static & dynamic routes generated cleanly)

## 18. Firestore Rules Status
- Unchanged & intact in `firestore.rules`. Verified owner access rules for `dailyStates` and `journeyDailyRecords`.

## 19. Play Console Status
**NOT UPLOADED** (On Hold as instructed)

## 20. versionCode Status
**NOT CHANGED** (Kept at current version)

## 21. AAB Status
**NOT REBUILT** (On Hold as instructed)

## 22. Final Status
**PASS**
- Meditation, Journaling, and Healthy Food saves persist and appear in Journey after refresh/reopen.
- All Section C pages write through canonical contract and handle errors gracefully.
- Journey fallback appears ONLY when records are genuinely empty.
- `npx tsc --noEmit` and `npm run build` pass without errors.
