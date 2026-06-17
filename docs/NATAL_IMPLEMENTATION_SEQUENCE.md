# Bhumi Natal Chart Completion - Implementation Sequence (V3 Joker)

This document defines the exact execution sequence to build and activate the Natal Chart blueprint system inside V3 Joker. It contains 15 sections detailing all development tasks, dependency chains, scoring logic, and validation/release policies.

---

## SECTION 1: FOUNDATION TASKS

### Task 1.1: Blueprint Type Expansion
* **Goal**: Expand the typescript type definitions for the Natal Chart in the local codebase to support the expanded data model (including planets, nodes, Placidus/Whole Sign houses, aspects, patterns, elements, modalities, and dominance).
* **Files Affected**:
  * [lib/types/blueprint.ts](file:///c:/Users/shein/bhumi-amartya-clean/lib/types/blueprint.ts)
* **Dependencies**: None
* **Estimated Complexity**: Low (1 hour)
* **Validation Method**: Run `tsc --noEmit` to verify type checking compiles.
* **Rollback Risk**: Low (Type definitions only).
* **Priority**: P0

### Task 1.2: Firestore Schema & Validation Expansion
* **Goal**: Modify Firestore security rules to allow read/write actions on the new sub-structures and define the database validation schemas.
* **Files Affected**:
  * [firestore.rules](file:///c:/Users/shein/bhumi-amartya-clean/firestore.rules)
* **Dependencies**: Task 1.1
* **Estimated Complexity**: Low (2 hours)
* **Validation Method**: Run `firebase deploy --only firestore:rules` or verify rules against the emulator.
* **Rollback Risk**: Medium (Incorrect rules can block database reads/writes).
* **Priority**: P0

### Task 1.3: Data Migration & Backward Compatibility Strategy
* **Goal**: Create a client-side database mapper/adapter that checks if a user's blueprint has the legacy natal format (only containing Sun/Moon/Ascendant signs) and triggers an auto-update recalculation or shows a "Recalculate Profile" button on the dashboard/profile tab to populate missing planetary records gracefully.
* **Files Affected**:
  * [lib/mappers/userProfileMapper.ts](file:///c:/Users/shein/bhumi-amartya-clean/lib/mappers/userProfileMapper.ts)
  * [components/profile/details/ProfileInsightClient.tsx](file:///c:/Users/shein/bhumi-amartya-clean/components/profile/details/ProfileInsightClient.tsx)
* **Dependencies**: Task 1.1, Task 1.2
* **Estimated Complexity**: Medium (4 hours)
* **Validation Method**: Load a legacy user account and verify it doesn't crash, instead showing a fallback or triggering automatic updates on first load.
* **Rollback Risk**: Low (Handled entirely as UI/client-side mapping checks).
* **Priority**: P0

---

## SECTION 2: PLANET ENGINE

### Task 2.1: Python API `/calculate-astrology` Endpoint Setup
* **Goal**: Create a new route in the Python FastAPI microservice that accepts birth data (date, time, lat, long, timezone) and queries `pyswisseph` (Swiss Ephemeris) to compute longitudes, zodiac signs, and sign degrees for the 10 planets (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto).
* **Files Affected**:
  * [services/humandesign-api/main.py](file:///c:/Users/shein/bhumi-amartya-clean/services/humandesign-api/main.py)
  * [services/humandesign-api/openapi.yaml](file:///c:/Users/shein/bhumi-amartya-clean/services/humandesign-api/openapi.yaml)
* **Dependencies**: None
* **Estimated Complexity**: Medium (4 hours)
* **Validation Method**: Test the API endpoint using a REST client (e.g., Postman or curl) and verify the returned JSON contains all 10 planets with sign and degree.
* **Rollback Risk**: Low (New endpoint, does not modify Human Design logic).
* **Priority**: P0

### Task 2.2: TypeScript Adapter Expansion
* **Goal**: Update the Next.js API wrapper to fetch natal positions from the Python microservice and map them to the client's `natalChart` schema.
* **Files Affected**:
  * [lib/astrology/calculateNatalBasics.ts](file:///c:/Users/shein/bhumi-amartya-clean/lib/astrology/calculateNatalBasics.ts)
  * [lib/engines/generateBlueprint.ts](file:///c:/Users/shein/bhumi-amartya-clean/lib/engines/generateBlueprint.ts)
* **Dependencies**: Task 2.1
* **Estimated Complexity**: Medium (3 hours)
* **Validation Method**: Generate a new blueprint and verify in logs/Firestore that `planets` are correctly populated.
* **Rollback Risk**: Low (Can revert the client calls to previous stubs).
* **Priority**: P0

---

## SECTION 3: NODE ENGINE

### Task 3.1: North & South Node Calculation via Swiss Ephemeris
* **Goal**: Calculate the True Node (`SE_TRUE_NODE` in Swiss Ephemeris) in the Python service and extrapolate the South Node (exactly $180^\circ$ opposite the North Node's longitude).
* **Files Affected**:
  * [services/humandesign-api/main.py](file:///c:/Users/shein/bhumi-amartya-clean/services/humandesign-api/main.py)
* **Dependencies**: Task 2.1
* **Estimated Complexity**: Low (2 hours)
* **Validation Method**: Check that North Node and South Node signs and degrees match Astro.com for a test date.
* **Rollback Risk**: Low
* **Priority**: P0

### Task 3.2: Chiron Integration
* **Goal**: Calculate Chiron (`SE_CHIRON` in Swiss Ephemeris) in the Python service and map it to coordinates (sign, degree, house).
* **Files Affected**:
  * [services/humandesign-api/main.py](file:///c:/Users/shein/bhumi-amartya-clean/services/humandesign-api/main.py)
* **Dependencies**: Task 3.1
* **Estimated Complexity**: Low (1.5 hours)
* **Validation Method**: Verify Chiron sign and degree match Astro.com for test users.
* **Rollback Risk**: Low
* **Priority**: P1

---

## SECTION 4: HOUSE ENGINE

### Task 4.1: Placidus Cusp Calculation (Primary System)
* **Goal**: Implement Placidus house cusp calculations in the Python service using `swe_houses`. Map each planet and node's longitude into the corresponding Placidus house ($1$ to $12$).
* **Files Affected**:
  * [services/humandesign-api/main.py](file:///c:/Users/shein/bhumi-amartya-clean/services/humandesign-api/main.py)
* **Dependencies**: Task 2.1
* **Estimated Complexity**: Medium (4 hours)
* **Validation Method**: Validate that planetary house placements match Astro.com for the five Golden Users.
* **Rollback Risk**: Medium (Math validation errors).
* **Priority**: P0

### Task 4.2: Whole Sign House Calculation (Secondary System)
* **Goal**: Implement Whole Sign house calculation. The Ascendant sign becomes the 1st House ($0^\circ$ to $30^\circ$). Resolve `wholeSignHouse` for each planet programmatically based on the sign index offset from the Ascendant sign.
* **Files Affected**:
  * [services/humandesign-api/main.py](file:///c:/Users/shein/bhumi-amartya-clean/services/humandesign-api/main.py)
* **Dependencies**: Task 4.1
* **Estimated Complexity**: Low (2 hours)
* **Validation Method**: Check planet placements against Whole Sign calculations on Astro-Seek.
* **Rollback Risk**: Low (Whole Sign is supplementary and does not impact Placidus validation).
* **Priority**: P0

---

## SECTION 5: RETROGRADE ENGINE

### Task 5.1: Retrograde Flag Resolution
* **Goal**: Read the longitudinal velocity vector of each planetary body from Swiss Ephemeris. If velocity $< 0$, set `isRetrograde: true` in the output schema (excluding Sun, Moon, and Nodes which never retrograde).
* **Files Affected**:
  * [services/humandesign-api/main.py](file:///c:/Users/shein/bhumi-amartya-clean/services/humandesign-api/main.py)
* **Dependencies**: Task 2.1
* **Estimated Complexity**: Low (2 hours)
* **Validation Method**: Verify Mercury and Mars retrograde status against Astro.com calendars.
* **Rollback Risk**: Low
* **Priority**: P0

---

## SECTION 6: ELEMENT ENGINE

### Task 6.1: Full Planetary Element Distribution
* **Goal**: Replace the 4-point element stub with a weighted 10-planet scoring model:
  * **Sun, Moon, Ascendant**: $3$ points each
  * **Midheaven, Ascendant Ruler**: $2$ points each
  * **Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto**: $1$ point each
  Calculate Fire, Earth, Air, Water scores based on the placements of these bodies.
* **Files Affected**:
  * [lib/astrology/natalIntelligence.ts](file:///c:/Users/shein/bhumi-amartya-clean/lib/astrology/natalIntelligence.ts)
  * [lib/profile/gaia/normalizeSources.ts](file:///c:/Users/shein/bhumi-amartya-clean/lib/profile/gaia/normalizeSources.ts)
* **Dependencies**: Task 2.2, Task 4.1
* **Estimated Complexity**: Medium (3 hours)
* **Validation Method**: Verify that the elements totals add up correctly (total points = 18) and distribution matches Astro.com.
* **Rollback Risk**: Low (Internal client calculations only).
* **Priority**: P0

---

## SECTION 7: MODALITY ENGINE

### Task 7.1: Modality Scoring & Distribution
* **Goal**: Implement Cardinal, Fixed, and Mutable distribution calculations using the same weighted planetary scoring model defined in Task 6.1.
* **Files Affected**:
  * [lib/astrology/natalIntelligence.ts](file:///c:/Users/shein/bhumi-amartya-clean/lib/astrology/natalIntelligence.ts)
* **Dependencies**: Task 6.1
* **Estimated Complexity**: Low (2 hours)
* **Validation Method**: Confirm distribution matches Astro.com.
* **Rollback Risk**: Low
* **Priority**: P0

---

## SECTION 8: POLARITY ENGINE

### Task 8.1: Polarity Balance (Masculine / Feminine)
* **Goal**: Implement Masculine (Fire & Air) and Feminine (Earth & Water) distribution calculations using the weighted planetary scoring model.
* **Files Affected**:
  * [lib/astrology/natalIntelligence.ts](file:///c:/Users/shein/bhumi-amartya-clean/lib/astrology/natalIntelligence.ts)
* **Dependencies**: Task 6.1
* **Estimated Complexity**: Low (1.5 hours)
* **Validation Method**: Check polarity balance ratios against Astro-Seek calculations.
* **Rollback Risk**: Low
* **Priority**: P0

---

## SECTION 9: ASPECT ENGINE

### Task 9.1: Aspect Integration & Storage
* **Goal**: Activate `aspectEngine.ts` in the blueprint creation flow, calling it during `generateBlueprint.ts` and storing the aspects array in Firestore.
* **Orb Rules**:
  * Conjunction ($0^\circ$), Opposition ($180^\circ$), Trine ($120^\circ$), Square ($90^\circ$): Max orb $8^\circ$.
  * Sextile ($60^\circ$): Max orb $5^\circ$.
* **Files Affected**:
  * [lib/astrology/aspectEngine.ts](file:///c:/Users/shein/bhumi-amartya-clean/lib/astrology/aspectEngine.ts)
  * [lib/engines/generateBlueprint.ts](file:///c:/Users/shein/bhumi-amartya-clean/lib/engines/generateBlueprint.ts)
* **Dependencies**: Task 2.2
* **Estimated Complexity**: Medium (3 hours)
* **Validation Method**: Check output aspects against Astro.com.
* **Rollback Risk**: Low
* **Priority**: P0

---

## SECTION 10: PATTERN ENGINE

### Task 10.1: Stellium & T-Square Detection
* **Goal**: Write geometry detection logic for Stellium ($\ge 3$ planets clustering within $8^\circ$ of each other or in the same house) and T-Square (two opposing planets squaring a third planet).
* **Files Affected**:
  * [lib/astrology/aspectEngine.ts](file:///c:/Users/shein/bhumi-amartya-clean/lib/astrology/aspectEngine.ts)
* **Dependencies**: Task 9.1
* **Estimated Complexity**: Medium (4 hours)
* **Validation Method**: Test with a sample chart known to have a Stellium/T-Square.
* **Rollback Risk**: Low
* **Priority**: P1

### Task 10.2: Grand Trine & Yod Detection
* **Goal**: Write geometry detection logic for Grand Trine (three planets mutually trining each other) and Yod (two sextile planets both quincunxing a third apex planet).
* **Files Affected**:
  * [lib/astrology/aspectEngine.ts](file:///c:/Users/shein/bhumi-amartya-clean/lib/astrology/aspectEngine.ts)
* **Dependencies**: Task 10.1
* **Estimated Complexity**: Medium (4 hours)
* **Validation Method**: Verify detection against charts of famous historical figures or golden users.
* **Rollback Risk**: Low
* **Priority**: P1

---

## SECTION 11: DOMINANCE ENGINE

### Task 11.1: Dominance Scoring Algorithms
* **Goal**: Implement dominant planet, sign, and house scoring in `natalIntelligence.ts` based on planetary weightings, rulerships, exaltations, and aspect density:
  * Planet in its ruled sign (domicile) gets $+2$ points.
  * Planet in its exalted sign gets $+1.5$ points.
  * Weight planet placements and aspect count to determine the dominant elements.
* **Files Affected**:
  * [lib/astrology/natalIntelligence.ts](file:///c:/Users/shein/bhumi-amartya-clean/lib/astrology/natalIntelligence.ts)
* **Dependencies**: Task 6.1, Task 9.1
* **Estimated Complexity**: Medium (4 hours)
* **Validation Method**: Cross-reference dominant planet scores against Astro-Seek calculations.
* **Rollback Risk**: Low
* **Priority**: P1

---

## SECTION 12: GAIA INTEGRATION

### Task 12.1: Gaia Source Normalization update
* **Goal**: Update `normalizeSources.ts` to map the new planetary signs and element compositions to Gaia signals (including Venus for love-style, Mercury for communication-gift, Mars for energy-rhythm, and Saturn for growth-edge).
* **Files Affected**:
  * [lib/profile/gaia/normalizeSources.ts](file:///c:/Users/shein/bhumi-amartya-clean/lib/profile/gaia/normalizeSources.ts)
* **Dependencies**: Task 6.1, Task 11.1
* **Estimated Complexity**: Medium (3 hours)
* **Validation Method**: Confirm Gaia profile creation resolves Venus, Mars, Mercury, and Saturn signals properly from the blueprint.
* **Rollback Risk**: High (Can affect the whole Gaia synthesis chain).
* **Priority**: P0

### Task 12.2: Narrative Engine Integration
* **Goal**: Update the narrative templates in the Gaia synthesis engine to read element balances, modalities, aspects, and patterns to create customized profile insight blocks.
* **Files Affected**:
  * [lib/profile/gaia/synthesisEngine.ts](file:///c:/Users/shein/bhumi-amartya-clean/lib/profile/gaia/synthesisEngine.ts)
* **Dependencies**: Task 12.1
* **Estimated Complexity**: High (6 hours)
* **Validation Method**: Verify the generated `GaiaProfile` contains rich, personalized narrative blocks instead of placeholder fallback text.
* **Rollback Risk**: Medium
* **Priority**: P0

---

## SECTION 13: PROFILE ACTIVATION

### Task 13.1: Profile Card Activation & Render Updates
* **Goal**: Update the front-end profile components to display the detailed calculations (Element Composition, Modality Distribution, Dominant Planet, and Aspect Map).
* **Files Affected**:
  * [components/profile/ProfileTabs.tsx](file:///c:/Users/shein/bhumi-amartya-clean/components/profile/ProfileTabs.tsx)
  * [components/profile/CareerCard.tsx](file:///c:/Users/shein/bhumi-amartya-clean/components/profile/CareerCard.tsx)
  * [components/profile/RelationshipStyleCard.tsx](file:///c:/Users/shein/bhumi-amartya-clean/components/profile/RelationshipStyleCard.tsx)
  * [components/profile/SpiritualArchetypeCard.tsx](file:///c:/Users/shein/bhumi-amartya-clean/components/profile/SpiritualArchetypeCard.tsx)
  * [components/profile/TopTalentCard.tsx](file:///c:/Users/shein/bhumi-amartya-clean/components/profile/TopTalentCard.tsx)
* **Dependencies**: Task 12.2
* **Estimated Complexity**: Medium (5 hours)
* **Validation Method**: Open the profile page in a web browser and visually confirm all cards display the new metrics correctly.
* **Rollback Risk**: Low
* **Priority**: P0

### Dependency Chain and Surfaced Modules
Below is the activation mapping indicating how the updated Natal Chart signals flow into the user's Gaia Profile:
* **Talent DNA**: Fed by **Mercury** (communication-gift) + **Dominant Planet**.
* **Relationship DNA**: Fed by **Venus** (love-style) + **Moon** (emotional-needs) + **7th House (Placidus/Whole Sign comparison)**.
* **Soul Mission**: Fed by **North Node** (evolution-direction) + **9th/12th Houses**.
* **Shadow Profile**: Fed by **Saturn** (growth-edge) + **Pluto** (hidden wounds) + **8th House**.
* **Career DNA**: Fed by **Midheaven (MC)** (career-direction) + **Dominant Sign/House** + **Earth element score**.
* **Element Composition**: Fed by the weighted **10-planet Element distribution**.
* **Dominant Energy**: Fed by the **Dominance Engine (Dominant Planet/Sign)**.

---

## SECTION 14: PARITY VALIDATION

### Task 14.1: Golden User Test Scripts
* **Goal**: Write automated validation script `/scripts/validateGoldenUsersAstrology.ts` loaded with exact birth parameters for Widhi, Ning, Widya, Amartya, and Eva Syana.
* **Verification Metrics**:
  * Planetary signs, degrees, and Placidus houses are compared against certified Astro.com export files.
  * Whole Sign house placements are compared against AstroSeek exports.
  * Aspects, retrogrades, and nodes are cross-checked.
* **Files Affected**:
  * [scripts/validateGoldenUsersAstrology.ts](file:///c:/Users/shein/bhumi-amartya-clean/scripts/validateGoldenUsersAstrology.ts) [NEW]
* **Dependencies**: Task 13.1
* **Estimated Complexity**: Medium (4 hours)
* **Validation Method**: Run the validation script in terminal (`npm run check:astrology`) and verify it outputs $100\%$ success.
* **Rollback Risk**: Low
* **Priority**: P0

---

## SECTION 15: RELEASE STRATEGY

### Build Sequence
1. **Firestore Rules Update**: Deploy the rules update allowing public reads of `/system/version` and writes of the new blueprint models.
2. **Python API Deployment**: Commit and deploy the FastAPI updates to the Railway microservice. Ensure health checks pass.
3. **Next.js Local Integration**: Write and merge the Next.js API client, adapters, engines, and mappers.
4. **Validation Scripts Execution**: Run Golden User scripts to ensure calculations match references perfectly.
5. **UI & Synthesis Integration**: Merge UI activation cards and the updated Gaia synthesis mapping.
6. **Closed Testing Build (Google Play)**: Rebuild the Android package and release via the Closed Testing track.

### Migration Strategy
* Active accounts will remain operational. When a user logs in, the client-side adapter checks for missing planetary records in their local cached blueprint.
* If missing, the app triggers an silent background request to `/api/blueprint/regenerate` (which invokes the new `/calculate-astrology` endpoint) to enrich the Firestore blueprint document.

### Testing Sequence
1. Run local Node unit tests for `aspectEngine.ts` and `synthesisEngine.ts`.
2. Deploy code to the development environment (`npm run dev`) and test manually on multiple screen sizes.
3. Verify unauthenticated fallback behaviour by blocking the Railway API. Confirm local fallback executes without crash.

### Rollback Strategy
* **API Failure**: If the Python API triggers errors, the TypeScript adapter catches the exception and falls back to standard local calculations using `astronomy-engine` and Whole Sign cusps.
* **UI Bug**: If the UI rendering crashes, revert the layout updates in [ProfileTabs.tsx](file:///c:/Users/shein/bhumi-amartya-clean/components/profile/ProfileTabs.tsx) to restore the legacy Profile V1 view.
* **Database rollback**: If the new schema causes write rejections, the client mapper falls back to saving only the legacy properties.

### Production Release Order
1. Deploy Firestore Security Rules.
2. Deploy Railway Python Microservice.
3. Deploy Next.js Backend & API Routes.
4. Deploy Frontend Profile Activation Cards.
5. Upload Build 47 to Google Play Console Closed Testing track.
