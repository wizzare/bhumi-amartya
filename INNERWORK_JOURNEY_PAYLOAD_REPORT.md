# Innerwork Journey Payload Report

## Journey Read

Innerwork reads the seven most recent daily states through:

`journeyRepository.getRecentDailyStates(userId, 7)`

Completed `innerworkJourney` records are converted into engine history. The engine uses their `practiceId` values to reduce immediate repetition.

No copy mentions yesterday when history is absent.

## Journey Save

Reflection submission writes this complete payload under `DailyState.innerworkJourney`:

| Field | Source |
|---|---|
| `date` | active Daily Guidance date or current date fallback |
| `userId` | authenticated user |
| `dominantIssue` | derived structured issue |
| `navigatorMode` | current navigator mode |
| `practiceId` | practice engine |
| `practiceTitle` | practice engine |
| `practiceCategory` | practice engine |
| `durationMinutes` | practice engine |
| `completed` | `true` after completion |
| `reflectionResult` | selected reflection |
| `timestamp` | save-time ISO timestamp |
| `sourceContextSummary` | structured provenance summary |

Legacy `innerworkDone` and `innerworkReflection` fields are retained for existing Journey and Dashboard consumers.

## Save Timing

The payload is saved only after:

`Mulai Sekarang` → instructions → `Saya Sudah Melakukan Ini` → reflection selection.
