# MOANA V64 Wellness Section 1-4 to Journey Persistence Audit

Date: 2026-07-01

Final Status: BLOCKED

Reason: runtime end-to-end save/read verification could not be completed without passing through active AccessGuard/access renewal screens. Per audit rule, this is BLOCKED, not PASS.

## Scope

Audit only. No feature code was changed.

Strict untouched systems:
- Billing
- Badge
- Access / AccessGuard
- Firestore Rules
- versionCode
- AAB / Play Console
- Journey architecture
- Memory architecture
- AI architecture

## Files Reviewed

- `components/dashboard/WellnessCheckInCard.tsx`
- `components/wellness/WellnessPageClient.tsx`
- `components/dashboard/DashboardClient.tsx`
- `app/journey/page.tsx`
- `components/journey/details/JourneyDetailClient.tsx`
- `lib/repositories/dailyStateRepository.ts`
- `lib/repositories/journeyRepository.ts`
- `lib/repositories/activityRepository.ts`
- `lib/innerwork/wellnessSection4Logging.ts`
- `lib/innerwork/zoneBContext.ts`
- `lib/engines/completionEngine.ts`
- `lib/types/journeyDailyRecord.ts`
- `app/innerwork/journaling/page.tsx`
- `app/innerwork/meditation/page.tsx`
- `app/innerwork/yoga/page.tsx`
- `app/innerwork/workout/page.tsx`
- `app/innerwork/audio-healing/page.tsx`
- `app/innerwork/herbal/page.tsx`
- `app/innerwork/manifestasi/page.tsx`

## Firestore Paths Found

- Daily state: `dailyStates/{uid}/entries/{dateKey}`
- Journey daily record: `journeyDailyRecords/{uid}/entries/{dateKey}`
- Physical activity records: `activities/{uid}/entries/{activityId}`
- Local dev audit fallback:
  - `moana:dailyStates:{uid}:{dateKey}`
  - `moana:journeyDailyRecords:{uid}:{dateKey}`
  - `moana:activities:{uid}`
- Section 3 checklist field:
  - `journeyDailyRecords/{uid}/entries/{dateKey}.wellnessState.enoughnessChecklist`
- Section 4 practice results field:
  - `journeyDailyRecords/{uid}/entries/{dateKey}.practiceResults[]`

## Audit Table

| Section | User Action | Firestore Path | Saved? | Journey Reads? | Refresh Persist? | Logout/Login Persist? | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Section 1 - Daily Check In | Fill 7-point check-in and save | `dailyStates/{uid}/entries/{dateKey}` | Code path yes; runtime not verified | Dashboard/Wellness intelligence reads `wellnessSnapshot`; Journey can read daily states | Not runtime verified | Not runtime verified | BLOCKED | Saves via `dailyStateRepository.saveDailyState` with uid/dateKey. It does not directly write Journey, but Dashboard/Journey derive from daily state. Firestore write could not be tested because access runtime was blocked. |
| Section 2 - Kondisimu Hari Ini | Read mapped condition | None direct | Not applicable | Reads Section 1-derived wellness intelligence | Not applicable | Not applicable | READ ONLY | Section 2 is derived/read-only UI. No manual Journey entry is expected. |
| Section 3 - Hari Ini Cukup | Toggle checklist item | `journeyDailyRecords/{uid}/entries/{dateKey}.wellnessState.enoughnessChecklist` | Code path yes; runtime not verified | Journey repository can read the record; Journey UI does not count it in the 7-practice completion summary | Not runtime verified | Not runtime verified | BLOCKED | Checklist progress is written through `journeyRepository.updateDailyRecord`. Existing Journey progress counter is for Section 4 practice flags/results, not Section 3 checklist. End-to-end readback blocked by AccessGuard. |
| Section 4 - Journaling | Save journaling reflection | `dailyStates/{uid}/entries/{dateKey}`, `journeyDailyRecords/{uid}/entries/{dateKey}` | Code path yes; runtime not verified | Journey reads via daily state + `practiceResults` | Not runtime verified | Not runtime verified | BLOCKED | Uses `logWellnessSection4Practice` with `practiceType: journaling`; helper performs post-save readback in code path. Runtime save was blocked. |
| Section 4 - Meditasi | Save meditation | `dailyStates/{uid}/entries/{dateKey}`, `journeyDailyRecords/{uid}/entries/{dateKey}` | Code path yes; runtime not verified | Journey reads via daily state + `practiceResults` | Not runtime verified | Not runtime verified | BLOCKED | Uses `practiceType: meditation`; runtime save blocked. |
| Section 4 - Yoga | Select yoga activity and save | `activities/{uid}/entries/{activityId}`, `dailyStates/{uid}/entries/{dateKey}`, `journeyDailyRecords/{uid}/entries/{dateKey}` | Code path yes; runtime not verified | Journey reads via daily state + `practiceResults` | Not runtime verified | Not runtime verified | BLOCKED | Uses `activityRepository.completeActivity` plus `logWellnessSection4Practice`; runtime page blocked by AccessGuard. |
| Section 4 - Olahraga | Select workout and save | `activities/{uid}/entries/{activityId}`, `dailyStates/{uid}/entries/{dateKey}`, `journeyDailyRecords/{uid}/entries/{dateKey}` | Code path yes; runtime not verified | Journey reads via daily state + `practiceResults` | Not runtime verified | Not runtime verified | BLOCKED | Uses `activityRepository.completeActivity` plus `logWellnessSection4Practice`; runtime page blocked by AccessGuard. |
| Section 4 - Audio Healing | Save audio healing reflection | `dailyStates/{uid}/entries/{dateKey}`, `journeyDailyRecords/{uid}/entries/{dateKey}` | Code path yes; runtime not verified | Journey reads via daily state + `practiceResults` | Not runtime verified | Not runtime verified | BLOCKED | Uses `practiceType: audioHealing`; runtime showed access renewal screen, so save/read could not be performed. |
| Section 4 - Makanan Sehat / Herbal | Select food/herbal activity and save | `activities/{uid}/entries/{activityId}`, `dailyStates/{uid}/entries/{dateKey}`, `journeyDailyRecords/{uid}/entries/{dateKey}` | Code path yes; runtime not verified | Journey reads via daily state + `practiceResults` | Not runtime verified | Not runtime verified | BLOCKED | Uses `practiceType: healthyFood`; runtime page blocked by AccessGuard. |
| Section 4 - Manifestasi Hari Ini | Mark manifestation complete | `dailyStates/{uid}/entries/{dateKey}`, `journeyDailyRecords/{uid}/entries/{dateKey}` | Code path yes; runtime not verified | Journey reads via daily state + `practiceResults` | Not runtime verified | Not runtime verified | BLOCKED | Uses `practiceType: manifestation`; runtime page blocked by AccessGuard. |
| Dashboard impact | Read latest wellness/journey state | `dailyStates/{uid}/entries/{dateKey}`, `journeyDailyRecords/{uid}/entries/{dateKey}` | Not applicable | Code reads daily state, Journey memory, recent practice results | Not runtime verified | Not runtime verified | BLOCKED | Dashboard code builds memory context from daily state, Journey memory, journals, meditations, audio, activities. Runtime dashboard content did not provide enough authenticated state to verify non-fallback output. |

## Section Findings

### Section 1 - Daily Check In

Code path:
- Builds `dateKey` with `getLocalDateKey(new Date(), timezone)`.
- Saves `wellnessSnapshot` into `dailyStates/{uid}/entries/{dateKey}`.
- Uses the active uid from authenticated user or dev audit uid.
- Does not only use component state; repository writes to Firestore for real authenticated users.
- In local dev audit mode, repository intentionally writes to localStorage instead of Firestore.

Journey impact:
- Dashboard ensures/updates a Journey daily record from daily state.
- Wellness intelligence reads daily state and uses `wellnessSnapshot`.
- Journey reads recent daily states and merges with Journey records.

Runtime result:
- End-to-end save/read could not be performed because the runtime was not in a valid full-access authenticated state.

### Section 2 - Kondisimu Hari Ini

Code path:
- Reads wellness intelligence and current mapping.
- Reads Section 1-derived `wellnessSnapshot`.
- No save handler or Journey write was found for Section 2.

Status: READ ONLY.

### Section 3 - Hari Ini Cukup

Code path:
- Toggle updates local checklist state.
- Saves checklist into `journeyDailyRecords/{uid}/entries/{dateKey}.wellnessState.enoughnessChecklist`.
- On load, reads the same field from `intelligence.journeyMemory.last30Days`.

Journey read note:
- The raw Journey daily record can contain the checklist.
- Existing Journey progress UI counts Section 4 practice completion items from daily state / practice results.
- No explicit Journey history display for `enoughnessChecklist` was found in the reviewed Journey UI.

Runtime result:
- Checklist save/readback could not be verified because runtime access to the needed flow was blocked.

### Section 4 - Praktik Tambahan

Shared save helper:
- `logWellnessSection4Practice` updates daily state flags.
- Updates `journeyDailyRecords/{uid}/entries/{dateKey}` with innerwork recommendation/completion.
- Appends `practiceResults[]` with `source: "wellness_section_4"`.
- Performs post-save readback in code for daily state and Journey record.

Practice mappings:
- Journaling -> `journalingDone`
- Meditasi -> `meditationDone`
- Yoga -> `yogaDone`
- Olahraga -> `workoutDone`
- Audio Healing -> `audioHealingDone`
- Makanan Sehat / Herbal -> `herbalDone`
- Manifestasi Hari Ini -> `manifestDone`

Activity record note:
- Yoga, workout, and healthy food/herbal also call `activityRepository.completeActivity`, writing to `activities/{uid}/entries/{activityId}` and updating `dailyStates/{uid}/entries/{dateKey}`.

Duplicate record note:
- Firestore append uses `arrayUnion`, but entries include timestamps. Repeated saves can create multiple practice result entries if the UI allows repeated submission or multiple selected activities. No fatal duplicate was proven in runtime because saving could not be executed.

## Runtime Verification

Runtime command used:

```bash
node -e "<Playwright audit script>"
```

Viewport:
- Android-like mobile viewport: 390 x 844

Routes checked:
- `/dashboard`
- `/wellness`
- `/journey`
- `/journey/history`
- `/innerwork/journaling`
- `/innerwork/meditation`
- `/innerwork/yoga`
- `/innerwork/workout`
- `/innerwork/audio-healing`
- `/innerwork/herbal`
- `/innerwork/manifestasi`

Observed:
- `/journey`, `/journey/history`, `/innerwork/yoga`, `/innerwork/workout`, `/innerwork/herbal`, and `/innerwork/manifestasi` showed the AccessGuard screen:
  - `AKSES BHUMI`
  - `Perjalanan Berlanjut dari Dashboard`
  - `Masa akses penuh akun ini sudah selesai`
- `/innerwork/journaling`, `/innerwork/meditation`, and `/innerwork/audio-healing` showed an access renewal message:
  - `Akses Bhumi kamu perlu diperbarui`
- No `permission-denied` text was observed in rendered page text.
- No horizontal overflow was observed on the checked pages.
- No save action was executed because the audited runtime was blocked before usable controls.

## Verification Result

- Section 1 code path: reviewed, plausible save path found, runtime BLOCKED.
- Section 2 code path: READ ONLY, as expected.
- Section 3 code path: reviewed, Journey record write path found, runtime BLOCKED.
- Section 4 code path: reviewed, daily state + Journey record + practice result paths found, runtime BLOCKED.
- Journey readback: code reads daily states, Journey records, and Section 4 `practiceResults`; runtime BLOCKED.
- Dashboard impact: code reads latest daily state/Journey context; runtime BLOCKED.

## Final Decision

Final Status: BLOCKED

This audit cannot be marked PASS because the required runtime save/readback checks were not possible under the active AccessGuard/access renewal state, and the task explicitly requires BLOCKED in that situation.
