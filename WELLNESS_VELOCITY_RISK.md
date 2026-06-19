# Wellness Velocity Risk Audit: KARA V3

This audit examines how the system handles rapid declines in mental and physical states over time.

## 1. Static Snapshot vs. Trend Analysis

The current Wellness Engine (`wellnessMappingEngine.ts`) is **stateless** regarding trends. It calculates results based on the current assessment + a list of check-ins, but it does not measure the *velocity* of a score drop.

### Scenario: The Sudden Drop
*   **Day 1:** Score 90 (Optimal)
*   **Day 2:** Score 26 (Acute Distress)

**Current Classification:** Level 1 (Self Support) or Level 2 (Practitioner).
**Reason:** Since 26 is > 25, the system does not trigger clinical escalation.

**Expected Classification:** Level 3 (Professional Support).
**Reason:** A 64-point drop in 24 hours is a clinical red flag indicating a possible acute event or trauma, even if the absolute score hasn't hit the "floor" yet.

## 2. Risk Evaluation

| Trend Type | Example Scores | Current Response | Expected Response | Risk |
| :--- | :--- | :--- | :--- | :--- |
| **Rapid Descent** | 90 -> 26 | Level 1/2 | Level 3 | **HIGH** |
| **Stagnant Low** | 26 -> 26 -> 26 | Level 1/2 | Level 3 (Escalation) | **MEDIUM** |
| **Erratic** | 90 -> 20 -> 85 | Level 3 -> Level 1 | Level 2 (Observation) | **LOW** |

## 3. Findings
1.  **Missing Temporal Logic:** The engine does not compare `calculatedAt` timestamps to look for delta changes in dimension scores.
2.  **Floor Dependence:** Safety is entirely dependent on absolute floor values rather than relative health. A "healthy" person who suddenly feels "terrible" is treated with less urgency than a "chronically distressed" person who stays at score 24.
