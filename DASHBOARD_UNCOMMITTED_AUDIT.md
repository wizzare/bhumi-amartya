# Dashboard Uncommitted Change Audit

## Baseline

- Golden commit: `14a87a1a1e8da2a53c5ede80762458dc38d9fe79`
- Date: June 17, 2026
- Current committed dashboard: identical to Golden
- Dashboard divergence: uncommitted workspace only

## Focused Inventory

### Modified

| File | Classification | Finding |
|---|---|---|
| `components/dashboard/AstroTodayCard.tsx` | **BREAKS GAIA** | Replaces the focused Gaia moon/transit card with Astro Awareness and six-system content. Changes “Berikutnya,” adds awareness fragments, and introduces hardcoded eclipse content. |
| `components/dashboard/DailyNoteV2.tsx` | **BREAKS GAIA** | Replaces `dailyGuidance` input with adapter categories and removes the visible preparation state. It now returns `null` when categories are unavailable. |
| `components/dashboard/DashboardClient.tsx` | **BREAKS GAIA** | Rewires Mirror and Catatan away from Golden `dailyGuidance`, introduces adapter dependencies, and references `astroAwarenessEngine` without importing it. |
| `components/dashboard/DashboardHeader.tsx` | **SAFE** | Moves time-of-day greeting logic into a helper without changing dashboard section wiring. |
| `components/dashboard/SoulReflectionCard.tsx` | **RISKY** | Adds a 30-second clock state that is not used in rendering. The existing placeholder remains and becomes visible because the parent now supplies initially empty adapter state. |

### Added or Untracked

| File | Git state | Classification | Finding |
|---|---|---|---|
| `lib/engines/astroAwarenessEngine.ts` | Untracked | **RISKY** | Generates moon, Tzolkin, BaZi, Wuku, and eclipse awareness events. The same event stream is consumed in multiple dashboard surfaces. |
| `lib/services/canonicalTranslatorService.ts` | Untracked | **RISKY** | New prerequisite for Mirror and Catatan. Expands their runtime dependency chain beyond Golden. |
| `lib/services/humanMeaningService.ts` | Untracked | **RISKY** | New generated meaning layer used before Mirror and Catatan can receive content. |
| `lib/services/dashboardMirrorRuntimeAdapter.ts` | Untracked | **BREAKS GAIA** | Replaces the Golden Mirror source and injects awareness into Mirror. |
| `lib/services/dashboardAstroRuntimeAdapter.ts` | Untracked | **RISKY** | Produces Astro-derived text for Catatan. Not independently breaking, but part of the new mandatory Catatan chain. |
| `lib/services/dashboardJourneyRuntimeAdapter.ts` | Untracked | **RISKY** | Adds journey data as another mandatory Catatan construction dependency. |
| `lib/services/catatanHariIniRuntimeAdapter.ts` | Untracked | **BREAKS GAIA** | Replaces Golden Catatan categories and repeats awareness text in every category reason through `sharedReason`. |
| `lib/services/innerworkRuntimeAdapter.ts` | Untracked | **UNKNOWN** | Not connected to the focused dashboard diff. |
| `lib/services/journeyRuntimeAdapter.ts` | Untracked | **UNKNOWN** | Not connected to the focused dashboard diff. |
| `lib/services/profileRuntimeAdapter.ts` | Untracked | **UNKNOWN** | Not connected to the focused dashboard diff. |

### Added

No focused files are staged as newly added. The runtime and adapter files above are untracked.

### Deleted

No files are deleted under:

- `components/dashboard/`
- `app/dashboard/`
- Focused runtime/adapter paths

### `app/dashboard/`

No changes. `app/dashboard/page.tsx` matches Golden.

## Focused Diff Size

Tracked dashboard components:

- 5 files modified
- 340 insertions
- 227 deletions

Untracked focused runtime/service files:

- 10 files

## Critical Integrity Finding

`DashboardClient.tsx` calls `astroAwarenessEngine` twice but has no import for it. This produces TypeScript/build failures and blocks the new Mirror/Catatan data path.

