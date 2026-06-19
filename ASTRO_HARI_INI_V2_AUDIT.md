# Astro Hari Ini V2: Awareness Engine Audit

## 1. Current State (V1.x)
- **Primary Source:** Astronomy Engine (Langit Barat) only.
- **Focus:** Current Moon Phase and planet transits.
- **Missing:** Vedic, BaZi, Tzolkin Maya, Kalender Jawa, and forward-looking Awareness Windows.
- **Tone:** Slightly descriptive but lacks proactive anchoring in approaching cycles.

## 2. Inventory of Rhythms (Target V2)

| Rhythm Type | Identification Source | Implementation Status |
| :--- | :--- | :--- |
| **Moon Phases** | `astronomy-engine` | **ACTIVE** |
| **Retrogrades** | `astronomy-engine` (Boundary search) | **ACTIVE** |
| **GAP Days** | `lib/tzolkin/calculateTzolkin.ts` | **INACTIVE** (Engine ready) |
| **Vedic Dashas** | `lib/vedic/calculateVedic.ts` | **INACTIVE** (Engine ready) |
| **BaZi Pillars** | `lib/bazi/calculateBazi.ts` | **INACTIVE** (Engine ready) |
| **Kalender Jawa** | `lib/weton/calculateWeton.ts` | **INACTIVE** (Engine ready) |
| **Eclipse Season** | *New Logic Required* | **MISSING** |

## 3. Awareness Window Logic
The engine must identify events in the following proximity windows:
- **Approach:** 30d, 7d, 3d, 1d before.
- **Presence:** Event Day.
- **Integration:** 1d, 3d, 7d after.

**Audit Finding:** Current `calculateCurrentSky` only looks at "Today" and finds the *next* major boundary. It does not generate a list of all approaching events across systems.

## 4. Integration Analysis
- **Mirror:** Needs to consume "Approaching Rhythms" to frame the daily greeting.
- **Catatan Hari Ini:** Needs the full 6-pillar intelligence to create multi-dimensional awareness.
- **Innerwork:** Needs to bias practice selection based on upcoming intense cycles (e.g., Eclipse season or GAP days).
