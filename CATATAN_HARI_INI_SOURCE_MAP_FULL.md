# Catatan Hari Ini Full Source Map

## Active Runtime Path

```text
DailyNoteV2
↓
DashboardClient.dailyGuidance
↓
Local cache / dailyGuidanceRepository / AI API / local fallback
↓
DailyGuidance.categories
```

The UI does not use `CatatanHariIniRuntimeAdapter`.

## Source Status Matrix

| Source layer | Status | Evidence |
|---|---|---|
| UI `DailyNoteV2` | USED | Renders `dailyGuidance.categories` |
| Daily Guidance AI response | USED | Primary category source after cache/repository checks |
| Local Daily Guidance fallback | FALLBACK | Builds all nine categories |
| `mentorAdvice` enrichment | USED in local fallback | Rewrites every category advice with multiple contexts |
| Human Meaning | BYPASSED | Structured `HumanMeaning` Catatan adapter is not called |
| Canonical Identity | BYPASSED | No active Catatan UI path through canonical translation |
| Astro Awareness | USED | First active event is passed separately as global `focus` |
| Astro current sky | USED | Sent to AI prompt and local guidance context |
| Astro house activation | USED by prompt intent; runtime output dependent | AI reason rules explicitly request planet/house mapping |
| Journey Runtime adapter | BYPASSED | File exists but has no caller |
| Journey memory/history | USED indirectly | AI prompt receives journals, meditation, audio, activities, prior guidance |
| Wellness Baseline / mapping | PARTIAL | Mapping is fetched for safety; not passed into active Catatan AI payload in `DashboardClient` |
| Daily Scan / DailyState | BYPASSED for content | State is loaded for completion/safety, but active category content does not consume it |
| Calendar Context adapter | BYPASSED | `CatatanHariIniRuntimeAdapter.calendarContext` has no caller |
| UI seeded day angle | USED | Generic angle appended to every category reason |
| UI seeded reflection question | USED | Generic question appended to every category reflection |
| Hardcoded category labels/icons | HARDCODED | Defined in `CATEGORY_CONFIG` |
| Loading message | FALLBACK | Rendered if categories are unavailable |

## Detailed Trace by Category

All nine categories share the same source architecture:

```text
AI schema category instruction
↓
Daily Guidance API response
↓
normalizeUserFacingGuidance
↓
DailyGuidance.categories[key]
↓
withDailyCategoryAngle
↓
DailyNoteV2 card
```

If AI fails:

```text
generateLocalDailyGuidance
↓
base fallback category
↓
refreshDailyCompanionCategories
↓
DailyGuidance.categories[key]
```

## AI Source Intent

The prompt asks each category to combine:

- Current sky
- Natal house activation
- Blueprint psychology
- Core identity
- Journey memory
- Previous practices

The prompt also requires category-specific Astro emphasis:

- Mental: Mercury/communication area
- Finance: resource/career area
- Love: romance/relationship area
- Relational: community/communication area
- Spiritual: subconscious/spiritual area
- Challenges: retrograde/Saturn/Mars
- Opportunities: Jupiter/North Node

This makes Astro the dominant category-generation frame.

## Structured Runtime Path That Is Not Active

```text
CatatanHariIniRuntimeAdapter
├── HumanMeaning
├── DashboardAstroRuntime
├── DashboardJourneyRuntime
├── DailyState / WellnessSnapshot
├── CalendarContext
└── AwarenessContext
```

Status: **BYPASSED**

Its supporting files have no active callers:

- `catatanHariIniRuntimeAdapter.ts`
- `dashboardAstroRuntimeAdapter.ts`
- `dashboardJourneyRuntimeAdapter.ts`
- `DashboardMirrorRuntimeAdapter.buildDailyNoteCategories`

## Source Readiness Verdict

Sources exist, but the intended complete companion source graph is disconnected. Current UI relies on a separate AI/fallback category system.

