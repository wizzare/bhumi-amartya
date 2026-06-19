# Innerwork Input Audit — 5 Users

## Method

- **Widhi:** uses the repository's Widhi blueprint fixture.
- **Love Block, Anxiety, Low Energy, Money Block users:** controlled scenarios with explicit Catatan dominant issues. They are simulations, not real stored accounts.
- Recommendation selection follows `catatanDominantIssue()`, `deriveCurrentIssue()`, and `buildInnerworkDailyDecision()`.

| User | Profile/Human Meaning | Daily Scan | Wellness/Navigator | Astro | Journey | Actual dominant-issue influence |
|---|---|---|---|---|---|---|
| Widhi | Life Path 22, MG/Sacral, karmic tail 18-6-15, profile-derived shadow/boundary text | Assumed completed, neutral | Reflection | Stored as source signal | Empty Day 1 | Profile text can select over-responsibility before wellness |
| Love Block | Controlled relationship/love-block signal | Relationship unease | Reflection | Stored only as context | Empty Day 1 | Explicit Catatan `love_block` wins |
| Anxiety | Controlled anxiety signal | Tense/uneasy | Recovery | Stored only as context | Empty Day 1 | Explicit Catatan `anxiety` wins |
| Low Energy | Controlled body-fatigue signal | Energy 3 | Recovery | Stored only as context | Empty Day 1 | Explicit Catatan `low_energy` wins |
| Money Block | Controlled money/safety signal | Financial worry | Reflection | Stored only as context | Empty Day 1 | Explicit Catatan `money_block` wins |

## Signals that actually choose the issue

1. Explicit Catatan `dominantIssue`.
2. Catatan keyword extraction.
3. Profile Human Meaning regex.
4. Navigator/energy/mood fallback.

## Signals that do not choose the issue

- Astro signals: passed into `sourceSignals`, but never scored for issue selection.
- Gaia signals: passed into profile context, but the issue regex only uses three Human Meaning fields.
- Journey issue patterns: do not select today's issue.
- Seven-day and 30-day frequencies: read but not aggregated for issue selection.

The advertised weights are not implemented as numeric weights.
