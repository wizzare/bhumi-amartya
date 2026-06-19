# Innerwork Life Coach Failure Trace

## What is written

JourneyDailyRecord stores:

- daily issue/context
- recommendation
- completion/skip
- reflection response
- `practiceHelped`
- 1/7/30-day retrievable records

## What is read tomorrow

Innerwork maps up to 30 records into:

- practice ID
- practice type
- issue
- completed/skipped
- reflection result

## What is actually used

- latest skipped state forces Recovery and two minutes
- three most recent completed IDs drive anti-repeat
- helped/heavier types create Zone B ranking scores

## What is ignored

- dominant-issue frequency over 7/30 days
- `practiceHelped` aggregation
- repeated context before improvement
- source confidence trend
- Catatan challenge/opportunity history
- wellness trajectory
- most/least helpful practice calculation
- user learning synthesis

## Exact missing code paths

There is no function that:

- groups `last7Days` or `last30Days` by issue
- computes issue trend
- ranks practices by `practiceHelped`
- compares wellness before/after practice
- generates a growth direction
- feeds a longitudinal synthesis into Catatan or Zone A

`DashboardJourneyRuntimeAdapter` still uses legacy `DailyState[]` and `growthEngine`; it does not consume `JourneyDailyRecord[]`.

## Why previous verdicts failed

- Journey Learning FAIL: raw memory is not converted into learning.
- 7 Day FAIL: records are fetched but not summarized.
- 30 Day FAIL: no longitudinal analytics/synthesis exists.
- Life Coach FAIL: recommendations react to yesterday's skip and recent IDs, not to the user's evolving pattern.
