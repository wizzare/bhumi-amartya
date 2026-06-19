# Zone B Source Trace

## Shared Input

`buildInnerworkDailyDecision()` first creates Zone A:

1. `normalizeIssue(input.dominantIssue)`
2. `TYPE_BASED_PRACTICES[issue]`
3. navigator/date/Journey selection
4. `mainPractice`

Zone B then uses:

1. `issue = mainPractice.issueKey`
2. `supportForIssue(issue)`
3. category sequence:
   - journaling
   - meditation
   - breathwork
   - mudra
   - yoga
   - audio
4. one result per category

## Independent Logic Check

Zone B does not derive a new issue from profile, astro, Journey, or category data. It receives Zone A's normalized issue.

However, `supportForIssue()` substitutes libraries:

| Zone A issue | Zone B library |
|---|---|
| love_block | love_block |
| inner_child | inner_child |
| money_block | money_block |
| over_responsibility | love_block |
| anxiety | money_block |
| low_energy | money_block |
| grief | inner_child |
| any other normalized issue | inner_child |

Therefore:

- Same source issue: **YES**
- Same semantic theme after mapping: **ONLY FOR 3 ISSUES**
- Independent category logic: **NO**
- Cross-theme fallback logic: **YES**

Journey only ranks candidates inside the already selected library. Since each category currently has one candidate per library, that ranking cannot correct a wrong theme.
