# Journey Intelligence Consumption Reality

| Intelligence | Stored | Calculated | Dashboard | Catatan | Innerwork |
|---|---:|---:|---:|---:|---:|
| Weekly Learning | No | Yes | No | No | No |
| Monthly Theme | No | Yes | No | No | No |
| Coach Memory | No | Yes | No | No | No |
| Growth Narrative | No | Yes | No | No | No |
| Practice Effectiveness | No | Yes | No | No | Indirect raw-result logic only |

All five are computed by `journeyRepository.getDailyMemory()`.

Journey detail displays them. Dashboard never calls `getDailyMemory()`. Catatan receives seven Daily States. Innerwork receives raw 30-day records but ignores the calculated summaries.

These are calculated-only intelligence outputs with Journey-screen consumption.
