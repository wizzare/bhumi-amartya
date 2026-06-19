# Dashboard Diff From Golden

## Comparison Points

- Golden: `14a87a1a1e8da2a53c5ede80762458dc38d9fe79`
- Current branch tip: `6ff69827cd4c46f0229cd8ef4ef01544f8575f25`
- Current working tree: branch tip plus uncommitted changes

## Golden vs Current Branch Tip

There are no committed changes under:

- `components/dashboard/`
- `app/dashboard/`
- `lib/services/`

The only committed change after the golden commit is:

- Added: `DAY3_NOTES.md`

Therefore, the committed dashboard at current `HEAD` is identical to the golden dashboard.

## Golden vs Current Working Tree

### Modified Dashboard Files

- `components/dashboard/AstroTodayCard.tsx`
- `components/dashboard/DailyNoteV2.tsx`
- `components/dashboard/DashboardClient.tsx`
- `components/dashboard/DashboardHeader.tsx`
- `components/dashboard/SoulReflectionCard.tsx`

Dashboard tracked-file diff:

- 5 files modified
- 340 insertions
- 227 deletions

### Added Dashboard Adapter and Service Files

These files are untracked and do not exist in the golden commit:

- `lib/services/canonicalTranslatorService.ts`
- `lib/services/catatanHariIniRuntimeAdapter.ts`
- `lib/services/dashboardAstroRuntimeAdapter.ts`
- `lib/services/dashboardJourneyRuntimeAdapter.ts`
- `lib/services/dashboardMirrorRuntimeAdapter.ts`
- `lib/services/humanMeaningService.ts`
- `lib/services/innerworkRuntimeAdapter.ts`
- `lib/services/journeyRuntimeAdapter.ts`
- `lib/services/profileRuntimeAdapter.ts`

### Removed Dashboard Files

None under the special-focus paths.

### `app/dashboard/`

No change. `app/dashboard/page.tsx` matches the golden commit.

## Functional Wiring Differences

### Mirror

Golden:

- `SoulReflectionCard` receives `dailyGuidance?.soulReflectionText`.

Working tree:

- `DashboardClient` creates separate `mirrorReflection` state.
- Mirror content is routed through canonical translation, human meaning, awareness context, and `DashboardMirrorRuntimeAdapter`.

### Astro

Golden:

- Focused Western sky, moon phase, active planets, important transits, retrogrades, and personalized transit narratives.
- “Next” refers to the next moon phase.

Working tree:

- Expanded into awareness events and multiple systems.
- “Next” is sourced from an awareness event.
- Adds Vedic, Bazi, Tzolkin, and Weton calculations.
- Adds Catatan Kesadaran inside Astro.

### Catatan Hari Ini

Golden:

- Receives `dailyGuidance`.
- Always renders its standalone section, including a preparation placeholder when guidance is unavailable.

Working tree:

- Receives adapter-built `categories` and `dateKey`.
- Returns `null` when categories are unavailable.
- Removes the golden daily category-angle enrichment helper.

## Repository-Wide Tracked Difference

Relative to the golden commit, the working tree currently contains:

- 39 added tracked files
- 51 modified tracked files
- 8 removed tracked files

This count excludes untracked files, including the nine adapter/service files listed above.

