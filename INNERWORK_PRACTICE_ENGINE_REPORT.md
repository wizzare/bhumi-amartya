# Innerwork Practice Engine Report

## Implementation

`lib/engines/innerworkIntelligence.ts` now contains a deterministic mapper with the required input:

- `dominantIssue`
- `navigatorMode`
- `wellnessState`
- `dailyScan`
- `profileMeaning`
- `astroContext`
- `journeyHistory`

Every result contains:

- `practiceId`
- `title`
- `category`
- `durationMinutes`
- `description`
- `instructions`
- `expectedBenefit`
- `intensity`
- `reason`

Unknown issues safely map to `difficulty_resting`. The mapper always selects a complete catalog entry and returns cloned instruction and benefit arrays. It never returns an empty object.

## Determinism and Repetition Control

Practice selection uses the dominant issue as the primary key. For issues with multiple practices, the engine excludes completed practice IDs from the three most recent Journey entries when an alternative is available. When every candidate is recent, it safely returns the first complete candidate.

Navigator mode adjusts the reason and ensures `RECOVERY` output remains gentle.

## Compatibility

The legacy `getRecommendations()` contract remains available for Dashboard and Daily Guidance callers. It now returns complete deterministic content rather than a stub.
