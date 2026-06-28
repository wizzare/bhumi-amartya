# MOANA-004 REPORT

## 1. Ticket ID

MOANA-004 — Wellness Daily Check-In Influence Audit/Fix

## 2. Root Cause

Wellness Section 2–4 looked static because the page loaded the saved wellness assessment mapping from `wellnessMappings/{uid}` instead of deriving the current Wellness display from today's Daily Check-In snapshot.

Two follow-on issues made the static behavior more visible:

- `resolveCurrentIssue` prioritized the stale mapping before the current check-in state.
- After saving/updating Daily Check-In, `WellnessPageClient` only toggled `checkInCompleted`; it did not reload the Wellness intelligence used by Section 2–4.

## 3. Files Reviewed

- `components/dashboard/WellnessCheckInCard.tsx`
- `components/wellness/WellnessPageClient.tsx`
- `components/wellness/WellnessMappingView.tsx`
- `components/wellness/WellnessMapView.tsx`
- `components/wellness/WellnessAssessmentFlow.tsx`
- `lib/services/wellnessDailyIntelligence.ts`
- `lib/engines/wellnessMappingEngine.ts`
- `lib/engines/assessmentScoringEngine.ts`
- `lib/engines/innerworkIntelligence.ts`
- `lib/repositories/dailyStateRepository.ts`
- `lib/repositories/wellnessMappingRepository.ts`

## 4. Files Changed

- `components/wellness/WellnessPageClient.tsx`
- `lib/services/wellnessDailyIntelligence.ts`
- `lib/engines/wellnessMappingEngine.ts`

## 5. Daily Check-In Write Path

Daily Check-In writes through `WellnessCheckInCard.handleSave`.

Authenticated runtime:

- `dailyStates/{uid}/entries/{dateKey}`
- field: `wellnessSnapshot`

Browser dev-audit runtime:

- `moana:dailyStates:moana007_uid:2026-06-28`
- field: `wellnessSnapshot`

Snapshot fields:

- `metrics.sleep`
- `metrics.energy`
- `metrics.emotion`
- `metrics.focus`
- `metrics.social`
- `needs`
- `checkInCompleted`
- `updatedAt`

## 6. Section 2 Read Path

Before:

- `loadWellnessDailyIntelligence`
- `wellnessMappingRepository.getMapping(uid)`
- Section 2 rendered stored assessment mapping, which could be stale and unrelated to today's check-in.

After:

- `dailyStateRepository.getDailyState(uid, dateKey)`
- if `wellnessSnapshot` exists, derive today's `AssessmentResult` from check-in metrics
- `calculateWellnessMapping(assessmentFromCheckIn(snapshot), [snapshot])`
- Section 2 renders today's check-in-derived mapping.

## 7. Section 3 Read Path

Before:

- Section 3 used `currentIssue` from `resolveCurrentIssue`.
- `resolveCurrentIssue` usually followed the stale stored mapping first.

After:

- `currentIssue` receives the check-in-derived mapping when today's snapshot exists.
- `buildInnerworkDailyDecision(result.recommendationInput)` then receives the current issue and current energy/mood state.

## 8. Section 4 Read Path

Before:

- Section 4 cards were fixed labels.
- The generated practice hrefs used `intelligence.currentIssue`, but the visible section did not show the active theme.

After:

- Section 4 still keeps the same practice cards.
- The practice context comes from today's `currentIssue`.
- Section 4 now displays the active focus used for practice links: `Fokus praktik saat ini: ...`.

## 9. Mapping Logic Before

- Section 2 could show old assessment/baseline output.
- Section 3 could keep recommending an old/stale issue.
- Section 4 practice context could stay stale because the page intelligence was not refreshed after updating check-in.

## 10. Mapping Logic After

Daily Check-In metrics are normalized into a current-day assessment:

- Body: sleep + energy
- Emotion: emotion
- Relationship: social
- Meaning: focus + energy
- Spirituality: focus + emotion

High all-values now produce Growth Phase instead of heavy/crisis mode.

Low energy/sleep/focus can shift mapping toward recovery/body/meaning themes.

After check-in save, `WellnessPageClient` reloads daily intelligence so Section 2–4 update in the same browser session.

## 11. Browser QA Result For Test A/B/C

BROWSER QA ACCEPTED / ANDROID QA PENDING.

Test A:

- Input: Tidur 7, Energi 4, Emosi 3, Fokus 7, Koneksi 4
- Section 2: `Kehilangan & Duka`, area attention `Emosi (22%)`, mode `Pemulihan (Recovery)`
- Section 3: `Proses Pelepasan dan Duka yang Mendalam`, main practice `Refleksi Kehilangan dan Kasih`
- Section 4: focus `Proses Pelepasan dan Duka yang Mendalam`

Test B:

- Input: Tidur 2, Energi 2, Emosi 8, Fokus 2, Koneksi 9
- Section 2: `Krisis Makna`, area attention `Tubuh (11%)`, mode `Pemulihan (Recovery)`
- Section 3: `Menemukan Nilai Diri yang Sejati`
- Section 4: focus `Menemukan Nilai Diri yang Sejati`

Test C:

- Input: Tidur 9, Energi 9, Emosi 9, Fokus 9, Koneksi 9
- Section 2: `Fase Pertumbuhan`, all dimensions `Sangat Baik 89%`, mode `Pertumbuhan (Growth)`
- Section 3: `Fase Pertumbuhan yang Stabil`
- Section 4: focus `Fase Pertumbuhan yang Stabil`
- Heavy/crisis mode did not persist.

## 12. Evidence Screenshots / Logs

QA artifact:

- `MOANA_004_BROWSER_QA_RESULT.json`

Screenshots:

- `screenshots/moana-004-test-a-wellness-sections-2-4.png`
- `screenshots/moana-004-test-b-wellness-sections-2-4.png`
- `screenshots/moana-004-test-c-wellness-sections-2-4.png`

## 13. Android QA Status

ANDROID QA PENDING.

Do not mark Android PASS. Real-device QA remains pending until ADB/device connection is available.

## 14. Commands Run

- `npx tsc --noEmit` — PASS
- Browser QA via local Playwright against `http://localhost:3001` — PASS
- `npm run build` — PASS

## 15. Final Status

PARTIAL.

Browser/runtime QA proves Daily Check-In influences Wellness Section 2–4. Android real-device close/reopen/readback QA remains pending.
