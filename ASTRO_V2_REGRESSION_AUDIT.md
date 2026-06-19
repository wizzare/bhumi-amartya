# Astro Awareness V2: Regression Audit

## 1. Feature Parity Check

| Feature | Previous Status | Current Status | Verdict |
| :--- | :--- | :--- | :--- |
| **Moon Phase Period** | Visible (Start - End) | **MISSING** | **REGRESSION** |
| **Next Phase** | Visible (Label + Countdown) | **VISIBLE** | **PASS** |
| **Tema Kolektif** | Visible in Detail | **MISSING** from Astro Card | **REMOVED BY DESIGN** (Shifted to Intelligence layer) |
| **Menyentuh Dirimu** | Visible in Detail | **MISSING** from Astro Card | **REMOVED BY DESIGN** (Shifted to Catatan Hari Ini) |
| **Yang Bisa Dilakukan** | Visible in Detail | **MISSING** from Astro Card | **REMOVED BY DESIGN** (Shifted to Innerwork/Catatan) |

---

## 2. Component Persistence
- **Catatan Hari Ini Card (`DailyNoteV2`):** **VISIBLE**. The component remains on the dashboard, consuming the synthesized intelligence from the new Astro Awareness Engine.
- **Source Change:** The personal relevance (Menyentuh Dirimu / Yang Bisa Dilakukan) was intentionally decoupled from the *Astro Card* to follow the **Intelligence vs Guidance** separation principle.

---

## 3. Dashboard Flow Validation
Actual order in `DashboardClient.tsx`:
1.  **Identitas Inti** (`CoreIdentity`)
2.  **Refleksi Jiwa** (`SoulReflectionCard`)
3.  **Astro Hari Ini** (`AstroTodayCard`)
4.  **Catatan Hari Ini** (`DailyNoteV2`)
5.  **Panduan Alur** (`DailyUserFlowGuide`)

**Verdict:** Does not match requested flow (Astro -> Refleksi -> Catatan). The Mirror (Refleksi) is currently placed *above* the Astro card.

---

## 4. Companion Regression Analysis
**Question:** Did Astro Awareness V2 increase data richness while decreasing personal relevance?
**Answer: YES.**

**Evidence:**
- **Richness:** Added Vedic, BaZi, Tzolkin, and Javanese data pillars.
- **Relevance Gap:** By removing `TransitNarrativeView` from the Astro card, the immediate "Why this matters to me" context is no longer adjacent to the astronomical data. While this data is passed to `Catatan Hari Ini`, the Astro card itself has become more "Educational" and less "Companionable."
