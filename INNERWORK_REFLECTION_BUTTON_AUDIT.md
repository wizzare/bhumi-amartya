# Innerwork Reflection Button Audit

All four buttons call the same destination:

`onClick → handleReflection(option)`

| Button | DailyState save | UI state | Journey write |
|---|---|---|---|
| Lebih Tenang | Saves completion and reflection | Sets calming Bhumi response, then submitted state | `practiceHelped: true` |
| Sama Saja | Saves completion and reflection | Sets neutral Bhumi response | `practiceHelped: null` |
| Sedikit Lebih Berat | Saves completion and reflection | Sets supportive/heavier response | `practiceHelped: false` |
| Belum Yakin | Saves completion and reflection | Sets uncertainty response | `practiceHelped: null` |

## Exact execution order

1. Save `dailyStates`.
2. Set local `reflectionResponse`.
3. Save `journeyDailyRecords`.
4. Set `reflectionSubmitted = true`.
5. Render “Progres Dicatat” and the response.

## Why can a user see no response?

If either save throws, execution enters `catch` before `setReflectionSubmitted(true)`. The error is only written to the console. There is:

- no visible saving state
- no visible error
- no retry control
- no optimistic response

Therefore the user clicks and appears to receive no response when DailyState or Journey write fails. Journey failure is especially significant because the response text is set before that write, but the response card is not revealed until after it succeeds.

## Verdict

**Reflection response works only when both writes succeed. It fails silently in the UI when either write fails.**
