# MOANA Android v58 Failure Root Cause Report

## 1. Confirmation

Founder tested `BHUMI-MOANA-v58-3.1.12-RC-section4-journey-fix.aab` on Android and confirmed it is still broken.

Observed Android v58 result:

- Section 4 Wellness buttons still do not function/save correctly.
- Journey page still shows no data.
- Journey does not record Section 4 activity.
- Previous v57 and v58 attempts failed on Android.

## 2. Exact remaining scope

Only these areas are active:

- Wellness Section 4 buttons.
- Journey page data/readback.

No Dashboard identity, Share Cards, Law of Affirmation, Meditation Mudra, Environment, Daily Check-In influence, V4, billing, web redesign, or unrelated architecture work is included.

## 3. Android runtime diagnostics added

Temporary runtime diagnostics were added to prove Android behavior before any v59 build.

Diagnostics persist to:

`localStorage["moana:v58:section4JourneyDiagnostics"]`

Diagnostics also log to console with:

`[MOANA_RUNTIME_DIAG]`

Visible diagnostic panels were added to:

- Wellness Section 4 hub.
- Journaling.
- Meditasi.
- Yoga.
- Olahraga / Workout.
- Audio Healing.
- Healthy Food.
- Manifestasi Hari Ini.
- Journey main page.
- Journey detail pages.

## 4. What happens when each button is tapped

Pending Android runtime capture.

The new diagnostics will record:

- `wellness_section4_hub_button_clicked`
- `section4_save_button_clicked`
- `section4_save_helper_entered`
- `section4_daily_state_write_attempt`
- `section4_daily_state_write_success`
- `section4_journey_record_write_attempt`
- `section4_journey_record_write_success`
- `section4_practice_result_append_attempt`
- `section4_practice_result_append_success`
- `section4_post_save_readback`
- `section4_save_failure`

## 5. Which buttons fire

Not proven yet. Android runtime logs are required.

The hub diagnostic includes label, href, auth uid, active user id, profile uid, and auth state resolution for every Section 4 card tap.

## 6. Which buttons do not fire

Not proven yet. Android runtime logs are required.

## 7. Which writes succeed

Not proven yet. Android runtime logs are required.

The shared save logger now separately proves:

- daily state write success/failure
- Journey record write success/failure
- practice result append success/failure
- post-save daily state readback
- post-save Journey record readback

## 8. Which writes fail

Not proven yet. Android runtime logs are required.

Failure diagnostics include Firebase/JS error name, code, message, and truncated stack.

## 9. Actual write path/key

The instrumented intended write paths are:

- `dailyStates/{uid}/entries/{dateKey}`
- `journeyDailyRecords/{uid}/entries/{dateKey}`
- `journeyDailyRecords/{uid}/entries/{dateKey}.practiceResults`

The Android runtime panel will show the actual uid/dateKey used for each tap.

## 10. Actual Journey read path/key

Journey diagnostics now show:

- daily state read path: `dailyStates/{uid}/entries`
- today Journey record read path: `journeyDailyRecords/{uid}/entries/{dateKey}`
- Journey detail read path: `journeyDailyRecords/{uid}/entries`

## 11. userId in Wellness

Not proven on Android yet.

Diagnostics added:

- Wellness hub logs `userId`, `authUid`, and `profileUid`.
- Each practice save button logs `userId`, `authUid`, and `profileUid`.
- Save helper logs `userId` before writing.

## 12. userId in Journey

Not proven on Android yet.

Diagnostics added:

- Journey main page logs `userId`, `authUid`, and `profileUid`.
- Journey detail pages log `userId`, `authUid`, and `profileUid`.

## 13. dateKey in Wellness

Not proven on Android yet.

Diagnostics added:

- Save helper logs the `dateKey` received from each practice page.
- Save helper logs the exact daily state and Journey record paths derived from that `dateKey`.

## 14. dateKey in Journey

Not proven on Android yet.

Diagnostics added:

- Journey main page logs the `dateKey` it uses for today.
- Journey detail currently logs approximate UTC date and the record collection path; detailed per-record date inspection comes from `journeyRecordsFound` and practice result payloads.

## 15. Why Journey fallback appears

Not proven on Android yet.

Diagnostics added:

- Journey main page logs whether daily state exists, progress count, section 4 practice logs found, raw practice types found, and whether fallback would trigger because no state/log exists.
- Journey detail logs story generation, Journey records found, Section 4 records found, and fallback reason.

## 16. Real root cause

Not proven yet.

Current evidence from code review suggests the likely failure class is one of:

- Android auth state/currentUser unavailable or mismatched at save time.
- Wellness writes use one uid/dateKey while Journey reads another.
- Firestore write fails on Android but was swallowed by page-level catch blocks.
- Journey reads daily states/records but no Section 4 records actually persist.
- Android WebView storage/session scope differs from browser.

These are hypotheses only. The next required step is founder Android runtime log capture with the new diagnostics.

## 17. Proposed fix

No final fix should be made until runtime logs identify the failing step.

Likely fix direction depends on evidence:

- If writes fail because Firebase `auth.currentUser` is missing while `useAuth().user` exists, align repositories to the same authenticated user source or defer saves until Firebase currentUser is ready.
- If writes succeed but Journey reads a different uid/dateKey, align uid/dateKey resolution between Section 4 and Journey.
- If daily state succeeds but Journey record fails, fix `journeyRepository` write/readback path or permissions.
- If hub taps do not fire, fix Section 4 link/tap handling for Android WebView.

## 18. Files that must change

Temporary diagnostics added:

- `lib/innerwork/moanaRuntimeDiagnostics.ts`
- `components/debug/MoanaRuntimeDiagnosticsPanel.tsx`
- `lib/innerwork/wellnessSection4Logging.ts`
- `components/wellness/WellnessPageClient.tsx`
- `app/innerwork/journaling/page.tsx`
- `app/innerwork/meditation/page.tsx`
- `app/innerwork/yoga/page.tsx`
- `app/innerwork/workout/page.tsx`
- `app/innerwork/audio-healing/page.tsx`
- `app/innerwork/herbal/page.tsx`
- `app/innerwork/manifestasi/page.tsx`
- `app/journey/page.tsx`
- `components/journey/details/JourneyDetailClient.tsx`

Files that may need final fix are pending Android evidence.

## 19. Whether v59 should be built

No.

v59 should not be built until Android runtime diagnostics prove the root cause and the targeted fix is implemented.

## Current status

BLOCKED / NEED RUNTIME LOGS

Required next evidence from Android:

- Tap each Section 4 hub card.
- Tap save on each practice.
- Open Journey main page.
- Open Journey history/detail page.
- Capture the visible `MOANA v58 Runtime Diagnostics` panel or console logs.
