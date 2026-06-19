# Journey to Dashboard Audit

## What Dashboard actually consumes

Dashboard loads seven records from `dailyStates`, not `journeyDailyRecords` (`components/dashboard/DashboardClient.tsx:179-191`).

`DailyNoteV2` receives:

- Yesterday Daily State.
- Seven recent Daily States.
- The latest copied `innerworkJourney` data contained in those states.
- Completion/activity counts.

It uses these for yesterday language, active-day counts, streak language, and latest practice context.

## Learning outputs

| Output | Computed by `getDailyMemory()` | Used by Dashboard | Used by Catatan |
|---|---:|---:|---:|
| Weekly Learning | Yes | No | No |
| Monthly Theme | Yes | No | No |
| Growth Narrative | Yes | No | No |
| Coach Memory | Yes | No | No |
| Practice Effectiveness | Yes | No | No |

These outputs are consumed on Journey detail screens (`components/journey/details/JourneyDetailClient.tsx`) only.

`DashboardJourneyRuntimeAdapter` exists, but no active Dashboard call site was found. `CatatanHariIniRuntimeAdapter` also has no active Dashboard call site.

## Verdict

Journey activity memory reaches Dashboard. Journey learning intelligence does not.
