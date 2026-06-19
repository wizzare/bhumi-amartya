# Gaia Breakage Map

## 1. Mirror Placeholder

### Direct change

Golden:

```tsx
reflection={dailyGuidance?.soulReflectionText}
```

Workspace:

```tsx
reflection={mirrorReflection}
```

`mirrorReflection` starts as an empty string. `SoulReflectionCard` displays:

> Menyiapkan pesan untuk jiwamu...

whenever its cleaned reflection is empty.

### Why the new value may remain empty

The setter is inside `connectDashboardToHumanMeaning()`. That function calls `astroAwarenessEngine`, but `DashboardClient.tsx` does not import that symbol.

### Responsible changes

- `components/dashboard/DashboardClient.tsx` — **BREAKS GAIA**
- `lib/services/dashboardMirrorRuntimeAdapter.ts` — **BREAKS GAIA**
- `lib/engines/astroAwarenessEngine.ts` — **RISKY dependency**

### Conclusion

The placeholder is caused by replacing the working Golden guidance value with initially empty adapter state whose construction path is invalid.

## 2. Catatan Hari Ini Disappearance

### Direct change

Golden `DailyNoteV2` always renders the section. If guidance is unavailable, it shows:

> Informasi sedang dipersiapkan...

Workspace `DailyNoteV2` now contains:

```tsx
if (!categories) return null;
```

This removes the entire standalone section when adapter categories are unavailable.

### Why categories may remain unavailable

`dailyNoteCategories` starts as `null`. It is populated only after the new canonical, human-meaning, Astro, journey, calendar, and awareness chain completes. The chain references the missing `astroAwarenessEngine` symbol in `DashboardClient.tsx`.

### Responsible changes

- `components/dashboard/DailyNoteV2.tsx` — **BREAKS GAIA**
- `components/dashboard/DashboardClient.tsx` — **BREAKS GAIA**
- `lib/services/catatanHariIniRuntimeAdapter.ts` — **BREAKS GAIA**
- Supporting adapter chain — **RISKY**

### Conclusion

The disappearance is directly caused by changing the fallback from visible UI to `null`, combined with a new category-production path that can fail before setting state.

## 3. Astro Behavior Changes

### Golden behavior

- Focused Moon phase summary
- “Berikutnya” identifies the next Moon phase
- Active planets
- Important transits
- Retrogrades
- Personalized transit narratives

### Workspace behavior

- “Berikutnya” comes from `awareness.nextEvent`, which may be Moon, Tzolkin, BaZi, Wuku, or eclipse
- Adds Catatan Kesadaran
- Replaces Golden detail flow with six systems:
  - Western astrology
  - Vedic
  - BaZi
  - Tzolkin
  - Javanese calendar
  - Eclipses
- Adds hardcoded August 2026 eclipse labels and countdowns
- Removes the Golden guarded Astro error state
- Uses fallback birth data such as `1990-01-01`, `12:00`, and `Jakarta`

### Responsible changes

- `components/dashboard/AstroTodayCard.tsx` — **BREAKS GAIA**
- `lib/engines/astroAwarenessEngine.ts` — **RISKY**
- New Vedic/BaZi/Tzolkin/Weton dependencies — outside the requested focused inventory but used by the Astro modification

## 4. Awareness Duplication

The same `activeAwarenessEvents` data is inserted into three dashboard surfaces:

1. Astro renders every active event under Catatan Kesadaran.
2. Mirror inserts the first event into its reflection.
3. Catatan inserts the first event into `sharedReason`.

In Catatan, `sharedReason` is reused for all nine categories, so the same awareness fragment can repeat across every category.

### Responsible changes

- `components/dashboard/AstroTodayCard.tsx` — direct awareness list
- `lib/services/dashboardMirrorRuntimeAdapter.ts` — first awareness event in Mirror
- `lib/services/catatanHariIniRuntimeAdapter.ts` — first awareness event repeated in category reasons
- `components/dashboard/DashboardClient.tsx` — distributes the same awareness context to Mirror and Catatan

### Conclusion

Awareness duplication is architectural, not incidental: one event stream is deliberately injected into Astro, Mirror, and all Catatan categories without deduplication or surface ownership.

## Overall Verdict

The main Gaia breakage cluster is:

```text
astroAwarenessEngine
        ├── AstroTodayCard
        ├── DashboardMirrorRuntimeAdapter
        └── CatatanHariIniRuntimeAdapter
                  ↑
          DashboardClient rewiring
```

The decisive breaking files are:

- `components/dashboard/DashboardClient.tsx`
- `components/dashboard/AstroTodayCard.tsx`
- `components/dashboard/DailyNoteV2.tsx`
- `lib/services/dashboardMirrorRuntimeAdapter.ts`
- `lib/services/catatanHariIniRuntimeAdapter.ts`

