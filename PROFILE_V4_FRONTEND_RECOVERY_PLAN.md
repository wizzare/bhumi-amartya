# PROFILE V4 FRONTEND RECOVERY PLAN

## OVERVIEW
This plan defines the implementation steps to recover the Profile UI and align it with the finalized KARA V3 decisions. 
This is a strict recovery effort. No new features, cards, domains, or architecture changes will be introduced. The focus is entirely on removing legacy code and wiring up existing V4 runtimes.

## PHASE 1: Remove Legacy GaiaTheme Dependency
**Goal:** Cleanse the frontend of obsolete V3 architectural remnants.
- Remove `GAIA_SECTION_PRESENTATION` from `app/profile/page.tsx`.
- Remove `GaiaTheme` iteration in the UI.
- Remove `isGaiaTheme` and related imports from the frontend.

## PHASE 2: Replace Legacy synthesizeGaiaProfile Consumption
**Goal:** Disconnect the old translator engine from the Profile page.
- Stop calling `synthesizeGaiaProfile` in `app/profile/page.tsx` and `ProfileSectionClient.tsx`.
- Remove `GaiaProfile` and `GaiaInsight` types from frontend state.

## PHASE 3: Connect Profile Runtime Adapter
**Goal:** Hydrate the frontend using the correct Canonical and Human Meaning engines.
- In `app/profile/page.tsx`:
  1. Load user Blueprint.
  2. Call `CanonicalTranslatorService.translate(blueprint)` to generate `CanonicalIdentity`.
  3. Call `HumanMeaningService.generate(canonical)` to generate `HumanMeaning`.
  4. Call `ProfileRuntimeAdapter.buildProfile(meaning, canonical, blueprint)` to generate `ProfileSection[]`.
- Pass `ProfileSection[]` into the frontend state.
- Update `app/profile/[section]/page.tsx` routing to map to the new 8 `ProfileSection` IDs instead of the legacy 6 GaiaThemes.

## PHASE 4: Render All Existing Cards Already Available
**Goal:** Display the output of `ProfileRuntimeAdapter` visually in the UI.
- Render the 8 core sections exactly as they are defined in `ProfileRuntimeAdapter.buildProfile()`.
  1. SIAPA DIRIMU
  2. ENERGI & MEKANIKA
  3. LUKA, BAYANGAN & WARISAN
  4. KARYA & TALENTA
  5. CINTA & RELASI
  6. RAGA & RUANG
  7. SPIRITUALITAS & EVOLUSI
  8. FASE KEHIDUPAN SAAT INI
- Map the UI cards to use `shortMeaning`, `expandableInsight`, and `actionableReflection` from the `ProfileCard` interface.

## PHASE 5: Validate No Orphan Data Remains
**Goal:** Ensure the flow from Blueprint -> Canonical -> Meaning -> ProfileRuntime is unbroken.
- Even though `ProfileRuntimeAdapter` currently contains placeholder strings for several cards, **DO NOT** attempt to write new Human Meaning generation logic in this phase.
- Ensure the placeholders render correctly in the UI. 
- Validate that the data successfully traverses the new V4 pipeline, proving the architectural recovery is complete. Fixing the placeholder strings inside the engine will be a separate data parity task.
