# Innerwork Legacy Contamination Report

## Legacy systems still present

1. `innerworkIntelligence.getRecommendations()`
2. `DailyGuidance.innerworkRecommendations`
3. `INNERWORK_VARIATION_LIBRARY`
4. Static workout, yoga, food, and audio databases
5. Daily Guidance fallback generators
6. Existing meditation and mudra libraries
7. Legacy DailyState `innerworkJourney`

## Can these override V6 on `/innerwork`?

The current `/innerwork` page uses:

- `buildInnerworkDailyDecision()`
- `mainPractice`
- `supportPractices`

It no longer renders `DailyGuidance.innerworkRecommendations` for Zone A or Zone B. Therefore old recommendations do not directly override V6 on this page.

## Where old behavior can still appear

- Dashboard cards still consume `dailyGuidance.innerworkRecommendations`.
- Daily Guidance generation still calls `getRecommendations()`.
- Dedicated subpages use their own meditation/audio/yoga/content libraries.
- Cached Daily Guidance can carry old recommendation data.

This creates cross-screen inconsistency: the Innerwork page is V6, while Dashboard recommendations can still look like the old category-first system.

## Answer

Old code cannot directly override the V6 decision inside `/innerwork`, but it can still present old behavior elsewhere and make users believe Innerwork has not changed.
