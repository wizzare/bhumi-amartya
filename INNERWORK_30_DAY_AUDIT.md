# Innerwork 30-Day Audit

The repository reads 30 JourneyDailyRecords and passes them into Innerwork. Actual engine use is limited.

| Requested insight | Can runtime identify it? |
|---|---|
| Theme Besar | NO — no issue-frequency aggregation |
| Pattern | NO — no longitudinal pattern engine over JourneyDailyRecord |
| Most Helpful Practices | NO — `practiceHelped` is not ranked |
| Least Helpful Practices | NO — negative outcomes are not aggregated |
| Growth Direction | NO — Dashboard growth engine still uses legacy DailyState activity signals |

The five simulated users would accumulate useful raw data, but Bhumi does not transform that data into 30-day understanding.

## Verdict

**30-day data availability: PASS. 30-day interpretation: FAIL.**
