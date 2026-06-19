# Reflection Save Trace

```text
Button
→ handleReflection(label)
→ dailyStateRepository.saveDailyState()
→ dailyStates/{uid}/entries/{date}
→ setReflectionResponse()
→ journeyRepository.updateDailyRecord()
→ journeyDailyRecords/{uid}/entries/{date}
→ setReflectionSubmitted(true)
→ tomorrow getDailyMemory()
→ buildInnerworkDailyDecision()
→ calculatePracticeEffectiveness()
```

Daily State stores issue, category, practice ID/title/type, planned duration, result, source signals, and timestamp.

Journey stores completion timestamp, actual practice ID/type, copied planned duration, reflection result/response, `practiceHelped`, and `userFelt`.

Missing: measured elapsed duration, start timestamp, user note, and transactional consistency.
