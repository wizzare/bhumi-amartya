# Golden to Workspace Diff

## Comparison

```text
14a87a1a1e8da2a53c5ede80762458dc38d9fe79
vs
current working tree
```

## File Status

### Modified

- `components/dashboard/AstroTodayCard.tsx`
- `components/dashboard/DailyNoteV2.tsx`
- `components/dashboard/DashboardClient.tsx`
- `components/dashboard/DashboardHeader.tsx`
- `components/dashboard/SoulReflectionCard.tsx`

### Untracked

- `lib/engines/astroAwarenessEngine.ts`
- `lib/services/canonicalTranslatorService.ts`
- `lib/services/catatanHariIniRuntimeAdapter.ts`
- `lib/services/dashboardAstroRuntimeAdapter.ts`
- `lib/services/dashboardJourneyRuntimeAdapter.ts`
- `lib/services/dashboardMirrorRuntimeAdapter.ts`
- `lib/services/humanMeaningService.ts`
- `lib/services/innerworkRuntimeAdapter.ts`
- `lib/services/journeyRuntimeAdapter.ts`
- `lib/services/profileRuntimeAdapter.ts`

### Added

None in the focused paths.

### Deleted

None in the focused paths.

### Unchanged

- `app/dashboard/page.tsx`

## Golden-to-Workspace Data Flow

### Mirror

```text
Golden:
dailyGuidance.soulReflectionText
    → SoulReflectionCard

Workspace:
Blueprint
    → CanonicalTranslatorService
    → HumanMeaningService
    → DashboardMirrorRuntimeAdapter
    → mirrorReflection state
    → SoulReflectionCard
```

### Catatan

```text
Golden:
dailyGuidance.categories
    → DailyNoteV2
    → visible section or visible preparation state

Workspace:
Canonical meaning + Astro + Journey + State + Calendar + Awareness
    → CatatanHariIniRuntimeAdapter
    → dailyNoteCategories state
    → DailyNoteV2
    → null when categories are unavailable
```

### Astro

```text
Golden:
Moon + planets + transits + retrogrades

Workspace:
Moon + awareness events + Western + Vedic + BaZi
+ Tzolkin + Weton + hardcoded eclipse cards
```

## Classification Summary

- **SAFE:** 1 modified file
- **RISKY:** 6 focused files
- **BREAKS GAIA:** 5 focused files
- **UNKNOWN:** 3 untracked adapters

## Final Finding

The Golden dashboard was not changed by a later commit. Its behavior was replaced locally through uncommitted component rewiring and untracked adapter/runtime layers.

