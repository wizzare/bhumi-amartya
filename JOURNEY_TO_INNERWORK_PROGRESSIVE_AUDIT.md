# Journey to Innerwork Progressive Audit

## Scenario

Four prior records:

- Practice: `not-my-burden-body-awareness`
- Type: `bodyAwareness.releaseBurden`
- Result: `Lebih Tenang`
- Completed: true

## Actual Day 5 result

```json
{
  "practiceId": "not-my-burden-journal",
  "type": "journaling.notMyBurden",
  "title": "Jurnal: Mana yang Bukan Bebanku",
  "durationMinutes": 7,
  "navigatorMode": "REFLECTION"
}
```

Runtime proof comes from executing `buildInnerworkDailyDecision()` with the four records.

## Why it changed

`recentPracticeIds()` keeps only the first three completed practice IDs. `mapInnerworkPractice()` avoids those IDs when choosing among the permitted mode variants (`lib/engines/innerworkIntelligence.ts:700-724`).

Helpful history also identifies `bodyAwareness` as helpful, but support categories do not include body awareness. Therefore that positive result does not promote a support candidate.

## Answer

**D. Alternative approach.**

It is not true progression in depth. It is recent-ID avoidance between fixed variants. No frequency reduction occurs. Progression to GROWTH requires Navigator mode to become `GROWTH`; four helpful reflections alone do not trigger it.
