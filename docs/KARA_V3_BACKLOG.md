# KARA V3 - Backlog

## Velocity Intelligence (Phase 10)
**Goal:** Track score trends over time to detect rapid declines and trigger proactive escalation.

**Logic:**
- Compare `calculatedAt` timestamps between assessments.
- Calculate Δ (Delta) change in each dimension.
- **Trigger:** If any dimension drops > 40 points in < 48 hours, trigger an automatic escalation to **Level 3 (Professional Support)**, regardless of whether the final score is above the safety floor.

**Context:** A user dropping from 90 to 26 is in more acute danger than a user who has consistently been at 24.
