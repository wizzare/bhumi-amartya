# Reflection End-to-End Audit

## Trace

UI buttons at `app/innerwork/page.tsx:660` call `handleReflection()`.

1. `dailyStateRepository.saveDailyState()` writes reflection and `innerworkJourney`.
2. UI immediately sets the matching Bhumi response.
3. `journeyRepository.updateDailyRecord()` writes `innerworkCompletion`.
4. Tomorrow, Innerwork calls `journeyRepository.getDailyMemory()` and maps the last 30 records into `journeyHistory`.

## Option behavior

| Selection | Bhumi response appears | Saved | Next-day history |
|---|---:|---:|---:|
| Lebih Tenang | Yes | Yes | Yes; marked helpful |
| Sama Saja | Yes | Yes | Yes; no helpful/heavy classification |
| Sedikit Lebih Berat | Yes | Yes | Yes; marked not helpful |
| Belum Yakin | Yes | Yes | Yes; unknown classification |

Responses are defined at `app/innerwork/page.tsx:459-464`. Journey classification is written at lines 468-480.

## Runtime effect

- `Lebih Tenang` contributes to `helpedTypes`.
- `Sedikit Lebih Berat` contributes to `reducedTypes`.
- `Sama Saja` is not recognized as neutral by `calculatePracticeEffectiveness()` because it searches for “biasa”, “neutral”, or “sedang”.
- `Belum Yakin` remains unknown.

## Failure boundary

The UI response is set before the Journey write completes. If Journey saving fails, the user still sees success and Daily State retains the reflection, but learning based on `journeyDailyRecords` does not receive it.

## Verdict

Reflection memory is active, with a partial-write risk and incomplete neutral semantics.
