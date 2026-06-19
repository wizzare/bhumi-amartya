# Dashboard Rollback Impact

## Candidate Rollback Target

`14a87a1a1e8da2a53c5ede80762458dc38d9fe79`

No rollback was performed.

## Key Finding

A branch rollback is not required to recover the committed golden dashboard. Current `HEAD` already contains the exact same committed dashboard files as the golden commit.

The dashboard differences exist only in the uncommitted working tree.

## Impact of Restoring Golden Dashboard Files

Restoring only the five modified dashboard components to the golden versions would remove the current uncommitted dashboard recovery/refactor wiring:

- Astro Awareness V2 presentation
- Multi-system Astro expansion
- Awareness-event “Berikutnya”
- Catatan Kesadaran inside Astro
- Canonical/Human Meaning Mirror wiring
- Adapter-built Catatan categories
- Current DashboardHeader changes

It would restore:

- Mirror from `dailyGuidance.soulReflectionText`
- Golden Astro moon-phase and transit presentation
- Moon phase as the “next” event
- Standalone Catatan Hari Ini from `dailyGuidance`
- Catatan loading placeholder instead of hiding the section
- Golden dashboard component behavior and order

## Adapter Impact

The following untracked files were introduced after the golden state and would become unused by the restored golden dashboard:

- `canonicalTranslatorService.ts`
- `catatanHariIniRuntimeAdapter.ts`
- `dashboardAstroRuntimeAdapter.ts`
- `dashboardJourneyRuntimeAdapter.ts`
- `dashboardMirrorRuntimeAdapter.ts`
- `humanMeaningService.ts`

Other untracked runtime adapters may still be used by non-dashboard work and must not be removed as part of a dashboard-only rollback without a separate dependency audit:

- `innerworkRuntimeAdapter.ts`
- `journeyRuntimeAdapter.ts`
- `profileRuntimeAdapter.ts`

## Risk Boundary

A full repository reset to the golden commit would affect extensive unrelated work:

- 39 added tracked files
- 51 modified tracked files
- 8 removed tracked files
- Numerous untracked files

Therefore, a future recovery should be scoped to explicitly selected dashboard files rather than resetting the entire branch.

## Recovery Scope Identified, Not Executed

The minimal historical dashboard restoration set is:

- `components/dashboard/AstroTodayCard.tsx`
- `components/dashboard/DailyNoteV2.tsx`
- `components/dashboard/DashboardClient.tsx`
- `components/dashboard/DashboardHeader.tsx`
- `components/dashboard/SoulReflectionCard.tsx`

`app/dashboard/page.tsx` requires no restoration because it already matches the golden commit.

