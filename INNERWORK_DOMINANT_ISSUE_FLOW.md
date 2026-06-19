# Innerwork Dominant Issue Flow

## Inputs actually used

| Requested input | Actual use |
|---|---|
| Wellness | `dailyState.wellnessSnapshot.metrics.energy` and emotion fallback |
| Daily Scan | `dailyState.moodLevel` and wellness snapshot |
| Human Meaning | Five medium narratives: sabotage, triggers, money block, love block, boundaries |
| Journey | Not used |
| Astro | Not used directly |

## Priority and tie-breaking

There is no numerical weighting. Selection is first-match-wins:

1. Profile text matching over-responsibility keywords.
2. Profile text matching fear/disappointment keywords.
3. Profile text matching boundary keywords.
4. Profile text matching worth/achievement keywords.
5. Recovery mode, energy ≤ 4, or mood ≤ 4 → emotional fatigue.
6. Reflection mode → overthinking.
7. Growth mode → direction confusion.
8. Default → difficulty resting.

Consequences:

- Human Meaning always outranks current wellness and Navigator.
- Multiple profile themes are resolved by regex order, not severity.
- Missing mood/energy default to `10`.
- Missing Navigator ultimately defaults the rendered mode to Reflection, but issue derivation receives `null` mode and falls to difficulty resting unless a profile regex matches.

## Current issue for Widhi

Not verified. Authorized browser profiles contained no active application session/data and remained at “Mempersiapkan panduan...”. No valid Widhi blueprint, Daily State, or Navigator value reached the renderer.

