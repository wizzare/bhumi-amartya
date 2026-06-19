# Astro V2: Feature Restoration Audit

## 1. Feature Parity Tracking (V1 vs V2)

| Feature | Description | Status in V2 | Restoration Required? |
| :--- | :--- | :--- | :--- |
| **Periode** | The start and end dates of a moon phase or planet transit. | **MISSING** | **YES**. Users lost temporal context for transits. |
| **Fase Berikutnya** | The label and countdown for the upcoming moon phase. | **PRESERVED** | NO. Successfully integrated into the awareness banner. |
| **Tema Kolektif** | Collective interpretation of planetary energies. | **MISSING** | **YES**. Current V2 is purely data/positional. |
| **Menyentuh Dirimu** | Personalized impact based on user blueprint. | **MISSING** | **YES**. Decoupling has led to clinical coldness in the card. |
| **Yang Bisa Dilakukan** | Suggested grounded actions adjacent to astro data. | **MISSING** | **YES**. Users now have to scroll to another card to find "What to do". |

---

## 2. Restoration Specification
To meet the "Enrichment not Replacement" requirement, the following sub-components must be restored within `AstroTodayCard.tsx`:
- **`TransitNarrativeView`**: Needs to be re-added to the "Langit Barat" section for each planet.
- **Planetary Period Logic**: Restore `formatPeriod` usage to show how long a planet remains in a sign.
- **Moon Narrative**: Restore the `personalImpact` text for the current moon phase in the main banner.
