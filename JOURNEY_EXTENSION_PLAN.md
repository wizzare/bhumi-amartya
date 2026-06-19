# Journey Extension Plan

This document outlines the extension strategy for upgrading the Journey module. It focuses on a reuse-first approach to avoid code duplication and maintain type safety.

---

## 1. Recommended Approach: A. Reuse-first

### **Why Reuse-first?**
- **Saves Resources & Complexity**: We already have 7 engines that handle 50% of the mathematical, statistical, and narrative synthesis requirements. Building a completely parallel set of engines from scratch would violate our DRY principles and increase maintenance overhead.
- **Unified Schema Mapping**: The existing engines already map from local daily states. By writing a light coordination adapter (`JourneyLearningAdapter` or extending `JourneyRuntimeAdapter`), we can bridge the new `JourneyDailyRecord` fields to the existing engines.
- **Type Stability**: Reusing existing interfaces ensures the Next.js pages build cleanly without having to refactor the entire state model of the app.

---

## 2. Integration Details

### **Layer 1: 7-Day Pattern (`weeklyLearning`)**
- **Extension**: Extend `reflectionEngine.ts` or add a helper inside a new `JourneyLearningAdapter` that accepts `JourneyDailyRecord[]`.
- **Heuristic**: Count the occurrences of `dominantIssue`, `issueCategory`, and `navigatorMode` over the last 7 days.
- **Output**: An Indonesian paragraph description (e.g., *"Selama 7 hari terakhir, tema yang paling sering muncul adalah..."*).

### **Layer 2: 30-Day Theme (`monthlyTheme`)**
- **Extension**: Extend `journeyStoryEngine.ts` or add a helper inside the adapter.
- **Heuristic**: Aggregates the top 3 categories and constructs a transition narrative, looking at the first 15 days vs. the last 15 days.
- **Output**: Indonesian summary paragraph.

### **Layer 3: Practice Effectiveness (`practiceInsights`)**
- **Extension**: Extend `completionEngine.ts` or calculate directly inside the adapter.
- **Heuristic**: Processes the `innerworkCompletion` object for each practice. Maps `practiceHelped` (or `reflectionResult` keywords) to categories: Helpful (100%), Neutral (50%), Heavy (0%).
- **Output**: Mapped records (e.g., `{ "Body Awareness": 78, "Boundary Journaling": 72 }`).

### **Layer 4: Theme Evolution (`growthNarrative`)**
- **Extension**: Write a sequential chronological transition processor within the adapter.
- **Heuristic**: Scans daily records in chronological order, deduplicates adjacent categories, and formats the evolution flow using the `↓` delimiter.
- **Output**: Arrow-delimited theme string.

### **Layer 5: Coach Memory (`coachMemory`)**
- **Extension**: Extend `journeyRuntimeAdapter.ts` or write heuristics inside the learning adapter.
- **Heuristic**: Compares completion metrics between short and long duration practices, and checks if somatic practices yield higher helpfulness scores than mental reflection ones.
- **Output**: Indonesian insight observation (e.g., *"Bhumi melihat: Kamu lebih mudah bergerak maju ketika..."*).

---

## 3. Recommended Code Execution Steps

1. **Update Interface**:
   Add the 5 learning keys (`weeklyLearning`, `monthlyLearning`, `practiceInsights`, `growthNarrative`, `coachMemory`) to `JourneyDailyMemory` in `lib/types/journeyDailyRecord.ts`.

2. **Build the Adapter/Engine**:
   Create `lib/services/journeyLearningAdapter.ts` (or extend `JourneyRuntimeAdapter.ts`) to coordinate the calculations. It will ingest `JourneyDailyRecord[]` and apply the Layer 1-5 heuristics.

3. **Wire into Repository**:
   In `lib/repositories/journeyRepository.ts`, update `getDailyMemory(uid)` to run the adapter on the fetched 30-day records and merge the fields into the returned object.

4. **UI Binding**:
   Update `JourneyDetailClient.tsx` to display the new fields under the corresponding existing tabs (Stage, Focus, Attention), fulfilling the "No Orphan Data" rule.
