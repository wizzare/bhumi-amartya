# PROFILE V4 REPAIR ORDER

To prevent repairing symptoms (like hardcoding the missing cards into the Runtime Adapter), we must fix the root causes in strict architectural sequence from the bottom up.

### Fix First: Define the Canonical Structure
**File:** `lib/types/canonical.ts`
**Action:** Define `CanonicalHealthDomain` and `CanonicalSpiritualityDomain` and attach them to the `CanonicalIdentity` interface. This creates the required space in the data pipeline.

### Fix Second: Feed the Canonical Structure
**File:** `lib/services/canonicalTranslatorService.ts`
**Action:** Implement `buildHealth(blueprint)` and `buildSpirituality(blueprint)`. This guarantees that user data is actually flowing from the raw Blueprint into the new Canonical structure.

### Fix Third: Define the Narrative Structure
**File:** `lib/types/humanMeaning.ts`
**Action:** Add `health` and `spirituality` narrative domains to the `HumanMeaning` interface.

### Fix Fourth: Synthesize the Narrative
**File:** `lib/services/humanMeaningService.ts`
**Action:** Implement `generateHealth(canonical.health)` and `generateSpirituality(canonical.spirituality)`. This produces the actual `short`, `medium`, and `long` strings needed for the UI.

### Fix Fifth: Enforce Warehouse Conformance
**File:** `lib/services/profileRuntimeAdapter.ts`
**Action:** Delete the graceful fallback structures in `buildSection6` and `buildSection7`. Rebuild these methods to consume `meaning.health` and `meaning.spirituality`, mapping exactly 1-to-1 with the `PROFILE_V4_FINAL_IDENTITY_WAREHOUSE.md` inventory.
