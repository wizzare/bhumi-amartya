# Journey Intelligence V1 Reuse Audit

This audit evaluates the feasibility of upgrading Bhumi's Journey from storage-based tracking to an active learning engine using the existing engine framework.

---

## 1. How much of Journey Intelligence V1 already exists?

### **Estimate: 50%**

#### **Rationale**
- **Existing Foundations**: The codebase already features robust engines for calculating individual completion statuses (`completionEngine.ts`), computing growth milestones (`growthEngine.ts`), drafting 7-day reflection summaries (`reflectionEngine.ts`), and generating daily growth/stuck/momentum/blind-spot signals (`journeyRuntimeAdapter.ts`).
- **Missing Elements**: The missing 50% consists of:
  1. Longitudinal aggregation specifically querying nested completion/reflection fields from `JourneyDailyRecord` (instead of legacy flat `DailyState` booleans).
  2. A calculation engine for practice helpfulness scores (percentages).
  3. Dynamic transition-tracking logic to generate chronological theme evolutions (e.g., `Issue A ↓ Issue B`).
  4. Heuristic-based coach memory generators.

---

## 2. Can `weeklyLearning` be built by extending existing engines?

### **Yes, by extending `reflectionEngine.ts`**

- **Why**: `reflectionEngine.ts` is already architected to ingest a list of daily states, count pilar activities, identify a dominant weekly theme (e.g., *Kejernihan Pikiran*, *Ketenteraman Tubuh*), and generate lessons/small wins.
- **How**: We can extend `reflectionEngine.ts` by adding a method (e.g., `generateWeeklyLearningPattern`) that accepts `JourneyDailyRecord[]`, extracts frequencies of issues, categories, and navigator modes, and formats a natural Indonesian pattern paragraph.

---

## 3. Can `monthlyTheme` be built by extending existing engines?

### **Yes, by extending `journeyStoryEngine.ts`**

- **Why**: `journeyStoryEngine.ts` is designed to synthesize history and unified blueprint metadata to build the user's growth focus, growing areas, and attention points.
- **How**: We can extend it by adding a 30-day processor (e.g., `generateMonthlyTheme`) that parses a larger window of records, analyzes recurring issues, and yields the Indonesian monthly theme summary.

---

## 4. Can `growthNarrative` be generated from the existing `journeyStoryEngine`?

### **NO**

- **Explanation**: `journeyStoryEngine.ts` calculates static stage labels (e.g. *Awal Kesadaran*, *Pendalaman Diri*) and flat lists of attention areas. It does **not** track chronological transitions or ordering. It treats daily states as a flat collection for frequency counting. 
- To generate a `growthNarrative` (like `Over Responsibility ↓ Boundary Issues ↓ Difficulty Resting`), we need a new chronological transition tracker that maps sequential issue shifts over time.

---

## 5. Can `practiceEffectiveness` be derived from existing `completionEngine` + `reflectionEngine`?

### **NO**

- **Explanation**: 
  - `completionEngine.ts` only calculates simple boolean completions (`journalingDone`, `meditationDone`, `audioHealingDone`) without looking at reflection results, actual practice IDs, or whether a practice helped/felt heavy.
  - `reflectionEngine.ts` only counts total journal vs total practice counts to pick a high-level weekly theme.
  - Neither of them has access to or analyzes the `innerworkCompletion.practiceHelped`, `innerworkCompletion.reflectionResult`, or specific actual practice titles. To compute `practiceInsights` (e.g., `Body Awareness 78%`), we must query these nested fields in `JourneyDailyRecord` which are not present in legacy `DailyState` or handled by the existing engines.
