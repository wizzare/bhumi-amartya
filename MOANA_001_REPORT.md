# MOANA-001 REPORT

## 1. Ticket ID

MOANA-001 — Wellness Save + Journey Readback Runtime Fix

## 2. Root Cause

Wellness and Innerwork save flows did not reliably feed the same data source used by Journey during browser/dev-audit runtime.

- Journey reads daily progress from `dailyStates/{uid}/entries` and Journey details from `journeyDailyRecords`.
- Several Wellness/Innerwork save flows required Firebase auth and silently degraded when browser QA used the dev audit fixture without a Firebase-authenticated user.
- Some local-only saves showed success but did not write Journey-readable records.
- Journey stage narrative could still show the fallback phrase after one saved practice when the saved category was not mapped into a readable transition.

## 3. Files Reviewed

- `components/wellness/WellnessPageClient.tsx`
- `components/dashboard/WellnessCheckInCard.tsx`
- `app/journey/page.tsx`
- `components/journey/details/JourneyDetailClient.tsx`
- `app/innerwork/journaling/page.tsx`
- `app/innerwork/meditation/page.tsx`
- `app/innerwork/audio-healing/page.tsx`
- `app/innerwork/yoga/page.tsx`
- `app/innerwork/workout/page.tsx`
- `app/innerwork/herbal/page.tsx`
- `app/innerwork/manifestasi/page.tsx`
- `lib/repositories/dailyStateRepository.ts`
- `lib/repositories/activityRepository.ts`
- `lib/repositories/journeyRepository.ts`
- `lib/innerwork/zoneBContext.ts`
- `lib/auth/resolveActiveProfile.ts`
- `lib/engines/growthNarrativeEngine.ts`

## 4. Files Changed

- `components/wellness/WellnessPageClient.tsx`
- `app/innerwork/journaling/page.tsx`
- `app/innerwork/meditation/page.tsx`
- `app/innerwork/audio-healing/page.tsx`
- `app/innerwork/yoga/page.tsx`
- `app/innerwork/workout/page.tsx`
- `app/innerwork/herbal/page.tsx`
- `app/innerwork/manifestasi/page.tsx`
- `lib/auth/resolveActiveProfile.ts`
- `lib/repositories/dailyStateRepository.ts`
- `lib/repositories/activityRepository.ts`
- `lib/repositories/journeyRepository.ts`
- `lib/engines/growthNarrativeEngine.ts`

## 5. Data Flow Before

- Wellness check-in and Innerwork pages could display local success in dev audit mode.
- Without Firebase auth, repository writes either failed auth-owner checks or did not write into the Journey read path.
- Journey main page read empty daily states and continued to show fallback/empty progress.
- Journey stage could still show `Perjalananmu baru saja dimulai...` when saved practice records existed but had no mapped narrative transition.

## 6. Data Flow After

- Dev audit browser QA resolves `moana007` to `moana007_uid`.
- Wellness check-in writes a daily state snapshot for the active uid.
- Journaling writes both daily state and Journey daily record data.
- Yoga/workout/activity completion writes activity history and updates daily state completion IDs.
- Journey reads back the same persisted dev-audit local records and displays progress instead of fallback.
- Journey stage uses saved practice data to produce a real narrative when completed records exist.

## 7. Wellness Write Path

Authenticated runtime remains Firestore-backed:

- `users/{uid}/dailyStates/{date}`
- `users/{uid}/activities`
- `users/{uid}/journeyDailyRecords/{date}`

Browser dev-audit runtime writes local fallback keys:

- `moana:dailyStates:moana007_uid:2026-06-28`
- `moana:journeyDailyRecords:moana007_uid:2026-06-28`
- `moana:activities:moana007_uid`

## 8. Journey Read Path

Journey reads:

- `journeyRepository.getRecentDailyStates(uid, limit)`
- `journeyRepository.getDailyRecord(uid, appDate)`
- `journeyRepository.getRecentDailyRecords(uid, limit)`

In dev audit browser QA, those repository reads now use the same `moana:*` localStorage keys written by Wellness/Innerwork.

## 9. userId Source

- Authenticated runtime: Firebase auth uid.
- Browser dev-audit runtime: `localStorage.bhumi_audit_user = "moana007"` resolves to mock profile uid `moana007_uid`.

## 10. dateKey Format

`YYYY-MM-DD`, generated with the resolved profile timezone. Browser QA used:

- `2026-06-28`

## 11. Browser QA Result

BROWSER QA ACCEPTED / ANDROID QA PENDING.

Browser QA verified:

- Wellness page opened.
- Wellness check-in saved.
- Journaling entry saved and success state appeared.
- Browser reload retained persisted data.
- Journey no longer showed only fallback after Journaling.
- Yoga saved.
- Browser reload/readback retained updated data.
- Journey showed progress increasing from `1/6 Aktivitas Selesai` to `2/6 Aktivitas Selesai`.
- Journey stage did not show `Perjalananmu baru saja dimulai...`.

QA result artifact:

- `MOANA_001_BROWSER_QA_RESULT.json`

## 12. Android QA Status

ANDROID QA PENDING.

Do not mark Android PASS. Real-device QA remains blocked until ADB/device connection is available.

## 13. Evidence Screenshots / Logs

- `screenshots/moana-001-wellness-before.png`
- `screenshots/moana-001-wellness-checkin-saved.png`
- `screenshots/moana-001-journaling-saved.png`
- `screenshots/moana-001-journey-after-journal.png`
- `screenshots/moana-001-journey-stage-after-journal.png`
- `screenshots/moana-001-yoga-saved.png`
- `screenshots/moana-001-journey-after-yoga.png`
- `screenshots/moana-001-journey-stage-after-yoga.png`
- `MOANA_001_BROWSER_QA_RESULT.json`

## 14. Commands Run

- `npx tsc --noEmit` — PASS
- `npm run build` — PASS
- Browser QA via local Playwright script against `http://localhost:3001` — PASS
- `adb devices -l` — no real Android device detected earlier, Android QA pending

## 15. Final Status

PARTIAL.

Browser QA for MOANA-001 is accepted. Wellness save and Journey readback are proven in browser/dev-audit runtime. Android real-device close/reopen/readback QA is still pending and must be completed before PASS.
