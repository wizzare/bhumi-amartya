# Dashboard Section Render Map

## 1. Trace: Dashboard Render Chain

| Layer | Source File | Responsibility |
| :--- | :--- | :--- |
| **Orchestrator** | `DashboardClient.tsx` | Aggregates user profile, blueprint, and real-time astronomical data. |
| **Logic (Mirror)** | `DashboardMirrorRuntimeAdapter.ts` | Humanizes blueprint signals into a conversational greeting. |
| **Logic (Astro)** | `astroAwarenessEngine.ts` | Calculates 6-pillar celestial windows. |
| **Logic (Compass)**| `CatatanHariIniRuntimeAdapter.ts` | Synthesizes state, astro, and journey into 9 focus categories. |
| **UI (Mirror)** | `SoulReflectionCard.tsx` | Renders the reflective greeting. |
| **UI (Astro)** | `AstroTodayCard.tsx` | Renders the high-resolution intelligence surface. |
| **UI (Compass)** | `DailyNoteV2.tsx` | Renders the expandable focus categories. |

## 2. Regression Verdict: FILE CORRUPTION DETECTED
While the architectural flow is correct, the **physical implementation in `DashboardClient.tsx` is corrupted**. The file has a large block of duplicated/garbage code appended after the main export, which must be cleaned to ensure stability.
