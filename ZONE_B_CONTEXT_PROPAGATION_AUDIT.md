# Zone B Context Propagation Audit

## Before repair

| Category | Issue | Practice ID | Category | Source theme |
|---|---:|---:|---:|---:|
| Journaling | No | No | No | No |
| Meditation | No | No | No | No |
| Breathwork | No | No | No | No |
| Mudra | No | No | No | No |
| Yoga | No | No | No | No |
| Workout | No issue-generated card | No | No | No |

Cards linked only to category paths.

## After repair

Every non-audio Zone B card now navigates with:

```text
issue
practiceId
practiceCategory
sourceTheme
title
duration
```

The target pages parse the same contract with `readZoneBContext()`.

| Category | Issue | Practice ID | Category | Source theme |
|---|---:|---:|---:|---:|
| Journaling | Yes | Yes | Yes | Yes |
| Meditation | Yes | Yes | Yes | Yes |
| Breathwork | Yes | Yes | Yes | Yes |
| Mudra | Yes | Yes | Yes | Yes |
| Yoga | Yes | Yes | Yes | Yes |
| Workout | Yes | Yes | Yes | Yes |

Runtime source: `lib/innerwork/zoneBContext.ts`, contextual links in `app/innerwork/page.tsx`, and destination consumers in category pages.
