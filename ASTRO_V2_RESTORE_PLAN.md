# Astro V2 Restoration Plan

## 1. Goal
Restore the companion depth of the Astro card (Periode, Collective, Personal Impact, Action) while retaining the 6-pillar multi-system intelligence of V2.

## 2. Component Restoration (AstroTodayCard.tsx)

### A. Main Banner (Moon Phase)
- **Restore:** "Periode" (Start - End dates).
- **Restore:** "Menyentuh Dirimu" (Personal impact of moon phase on blueprint).
- **Data Source:** `sky.moonInfo` for dates, `buildTransitNarrative` for impact.

### B. Langit Barat Section (Western Transits)
- **Restore:** "Periode" for each active planet.
- **Restore:** "Tema Kolektif".
- **Restore:** "Menyentuh Dirimu" (Personal Impact).
- **Restore:** "Yang Bisa Dilakukan" (Grounded Action).
- **Mechanism:** Re-integrate `TransitNarrativeView` component for each planet entry.

### C. Multi-System Enrichment
- Keep Vedic, BaZi, Tzolkin, and Jawa sections as data intelligence layers.
- Ensure the "Awareness Windows" (3 days before, etc.) remain high-visibility in the banner.

---

## 3. Technical Logic
- Re-enable the `formatPeriod` helper function.
- Ensure `buildTransitNarrative` is called for every visible planet status.
- Maintain the `isExpanded` state to hide the complexity until the user requests it.
