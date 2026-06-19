# INNERWORK VARIATION AUDIT

Analysis of how the system avoids "Content Fatigue" (repeating the same thing forever).

### 1. The Repeat Problem
In the current logic, if a user has the same issue key (e.g., `over_responsibility`) 5 days in a row, they get the **same practice** every day.

### 2. Variation Mechanism
The `innerworkIntelligence.ts` (Repair in progress) uses a `seededIndex` based on `localDateKey`. This ensures that even for the same user with the same issue, the *AI-generated* recommendation will rotate between 4-6 variations from the `INNERWORK_VARIATION_LIBRARY`.

### 3. Progressive Practice (Missing)
The system does not yet "level up" the practice based on history (e.g., Yesterday: Observation → Today: Action).

### 4. Recommendation
Activate the `seededIndex` in the primary UI fallback to ensure that even the "hardcoded" practices have at least 3 variants each to prevent the "Homework" feeling from becoming stale.

**Verdict: Good Data, Partial Coaching (Needs more rotation).**
