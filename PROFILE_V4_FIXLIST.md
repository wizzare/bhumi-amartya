# PROFILE V4 FIXLIST

### File: `lib/types/canonical.ts`
**Problem:** The `CanonicalIdentity` interface entirely lacks domains to store health and spirituality mappings required by Sections 6 and 7.
**Required Fix:** Define `CanonicalHealthDomain` and `CanonicalSpiritualityDomain` interfaces and add them to `CanonicalIdentity`.

### File: `lib/services/canonicalTranslatorService.ts`
**Problem:** The translator service skips extracting health and spirituality data from the Blueprint, leaving a gap in the data pipeline.
**Required Fix:** Implement `buildHealth()` and `buildSpirituality()` methods to extract and map relevant Blueprint variables into the new canonical domains.

### File: `lib/types/humanMeaning.ts`
**Problem:** The `HumanMeaning` interface does not have properties to hold narratives for health and spirituality, creating a bottleneck before the UI.
**Required Fix:** Extend the `HumanMeaning` interface with `health` and `spirituality` objects.

### File: `lib/services/humanMeaningService.ts`
**Problem:** The engine is missing the generation logic to synthesize short/medium/long narratives for Section 6 (Raga & Ruang) and Section 7 (Spiritualitas & Evolusi).
**Required Fix:** Implement `generateHealth()` and `generateSpirituality()` methods.

### File: `lib/services/profileRuntimeAdapter.ts`
**Problem:** `buildSection6` and `buildSection7` are generating hardcoded surrogate cards instead of consuming HumanMeaning. They violate the inventory by outputting EXTRA cards and omitting expected MISSING cards.
**Required Fix:** Rewrite `buildSection6` to explicitly return the 5 expected cards (`Peta Chakra`, `Sistem Cerna`, `Lingkungan Ideal`, `Ritme Tubuh`, `Energi Dominan`). Rewrite `buildSection7` to explicitly return the 8 expected cards (`Jalur Spiritual`, `Evolusi Jiwa`, `Potensi Spiritual`, `Bakat Spiritual`, `Jejak Intuisi`, `Potensi Channeling`, `Aura Dominan`, `Clair Potential`). Map these directly to `meaning.health` and `meaning.spirituality`.
