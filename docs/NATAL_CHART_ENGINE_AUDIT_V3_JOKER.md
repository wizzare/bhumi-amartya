# Natal Chart Engine Audit Report (V3 Joker)

This document provides a comprehensive audit of the Natal Chart engine within the Bhumi Amartya codebase and details the implementation plan to upgrade it into a production-ready, parity-grade blueprint system.

---

## 1. Current Natal Chart Engine

The current codebase features a basic astrology layer that is highly fragmented and underutilized compared to other blueprints like Human Design. Here is a breakdown of what exists today:

### Sun, Moon, Ascendant, and Midheaven
* **Sun**: Calculated using a simplified date-range lookup (`calculateSunSign.ts`) which does not account for year-to-year shifts in the solar ingress, introducing a potential $1^\circ$ to $2^\circ$ boundary error.
* **Moon**: Calculated in `calculateNatalBasics.ts` using the `astronomy-engine` library (`EclipticGeoMoon`). While the math is accurate, only the sign name (e.g., `"Aries"`) is saved in the user's `Blueprint` document; the exact longitude and degree are discarded.
* **Ascendant (Rising)**: Calculated in `calculateNatalBasics.ts` using geocentric horizon and ecliptic vectors from `astronomy-engine`.
* **Midheaven (MC)**: Calculated in `calculateNatalBasics.ts` using local sidereal time and a hardcoded ecliptic obliquity approximation ($23.439^\circ$).

### Elements, Modalities, and Polarity
* **Elements & Modalities**: Implemented as stubs in `natalIntelligence.ts`. The calculation is highly skewed because it only counts the positions of the Sun, Moon, Ascendant, and Midheaven, ignoring the remaining 8 planets.
* **Polarity**: Completely uncalculated in the current active engine.

### Houses
* **Placidus Houses**: The codebase has stubs and helper functions (e.g., in `astroHouseActivations.ts`) to read houses, but **no house cusp calculation engine** exists in the client-side TypeScript. Only the Ascendant and Midheaven signs are computed. If a user does not have full coordinates, it falls back to Whole Sign houses based on the Ascendant sign.

### Aspects
* **Aspect Calculations**: `aspectEngine.ts` implements angular difference checks for major aspects (Conjunction, Opposition, Trine, Square, Sextile) with hardcoded orbs ($8^\circ$ for major, $5^\circ$ for sextile). However, **this aspect engine is dead code**; it is never called during the blueprint generation flow and aspects are not saved to the database.

### Intelligence & Storage
* **Storage**: In `generateBlueprint.ts`, the saved `natalChart` document in Firestore only contains:
  ```json
  {
    "sunSign": "Virgo",
    "moonSign": "Aries",
    "risingSign": "Scorpio",
    "calculationStatus": "completed"
  }
  ```
  All other astronomical parameters (degrees, houses, other planets) are omitted.
* **Intelligence**: `natalIntelligence.ts` contains stubs that try to read elements, modalities, and dominant houses, but since the raw planetary positions do not exist in the database, the resulting "Career DNA" and "Relationship DNA" classifications rely on highly skewed, incomplete inputs.

### UI & Narrative Usage
* **UI Usage**: `InsightPageClient.tsx` reads only the Sun, Moon, and Ascendant signs to display in the user profile. `AstroTodayCard.tsx` reads natal houses to calculate transit house activations, but because only the Ascendant sign is known, it defaults to Whole Sign houses.
* **Narrative Usage**: Prompts in `createBlueprintAstroInsight.ts` and `personalizedTransitNarrative.ts` consume only the Sun sign, Moon sign, and Ascendant sign to generate identity statements.

---

## 2. Missing Natal Chart Data

The following critical fields are currently missing from the calculation engine and database models:

* **Planets**: Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto.
* **Astrological Points**: Chiron, North Node, South Node (always opposite the North Node).
* **Degrees & Minutes**: The exact degree ($0^\circ$ to $29.99^\circ$) within each sign is missing for all bodies.
* **Planet House Placements**: Dual house mappings are required for each planet:
  * **Placidus House** (`placidusHouse`): The primary house number ($1$ to $12$) determined by Placidus cusps. Used for standard parity validation.
  * **Whole Sign House** (`wholeSignHouse`): The secondary house number ($1$ to $12$) determined by sign boundary distribution relative to the Ascendant sign. Used for optional narrative comparison.
* **Retrograde Status**: Retrograde flags (`isRetrograde: boolean`) are missing for all planets.
* **Modalities**: Accurate distribution calculation (Cardinal, Fixed, Mutable) across all 10 planets plus Ascendant and Midheaven.
* **Full Elements**: Complete scoring (Fire, Earth, Air, Water) using a weighted distribution model of all calculated bodies.
* **Aspects**: The list of active inter-planetary aspects (e.g., Sun conjunct Mercury, Moon trine Mars) with calculated orbs.
* **Patterns**: Detection of geometric chart patterns (Stellium, T-Square, Grand Trine, Yod).
* **Dominance**: Derived scoring algorithms for dominant planet, sign, house, and element.

---

## 3. Existing Library Capability

We compared the capabilities of the two available libraries: `astronomy-engine` (currently imported in TypeScript) and `swisseph` (available as a Node dependency and as `pyswisseph` in the Python service).

| Feature / Criteria | `astronomy-engine` (Pure TS/JS) | `swisseph` (C/C++ Native Binding via Node/Python) |
| :--- | :--- | :--- |
| **Can calculate planets?** | **Yes**. (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto). | **Yes**. (Includes all astronomical and astrological bodies). |
| **Can calculate degrees?** | **Yes**. Returns geocentric ecliptic longitude ($0^\circ$ to $360^\circ$). | **Yes**. Returns exact geocentric coordinates. |
| **Can calculate retrograde?** | **Yes** (Indirectly). Must calculate velocity by comparing coordinates across a 24-hour window. | **Yes** (Directly). Returns velocity vectors in the output schema. |
| **Can calculate houses?** | **No**. Lacks a house cusp calculator. Mathematical formulas for Placidus must be coded manually. | **Yes**. Native support for Placidus, Koch, Whole Sign, Equal, etc. |
| **Can calculate nodes?** | **Partial**. Finds node crossing events, but has no instantaneous longitude function. Requires orbital math interpolation. | **Yes**. Native support for True Node (`SE_TRUE_NODE`) and Mean Node (`SE_MEAN_NODE`). |
| **Can support Placidus?** | **No** (Requires custom math implementation). | **Yes** (Native). |
| **Can support Whole Sign?** | **Yes** (Calculated programmatically based on Ascendant sign offset). | **Yes** (Native). |
| **Can support tropical zodiac?** | **Yes**. Ecliptic longitudes are calculated in the tropical framework. | **Yes** (Native). |
| **Accuracy Risk** | **Medium-High**. The planetary coordinates are highly accurate, but implementing custom Placidus math and Node interpolation introduces high risk of developer math errors. | **None**. Highly tested, standard library used by professional astrology platforms. |
| **Implementation Complexity** | **High**. Writing cusp calculations, node interpolation, and aspect/pattern geometry in TS is complex. | **Low (API-driven)**. The Python microservice already runs `pyswisseph` successfully. We only need to write a simple endpoint. |

---

## 4. Recommended Engine Strategy

### Recommended Approach: **C. Hybrid astronomy-engine + swisseph**

#### Why this is the safest and most robust path:
1. **Bypass Native Node Compilation Issues**: The native Node.js wrapper `swisseph` fails to compile/load locally on Windows (and can fail in serverless cloud environments due to missing compilation tools). 
2. **Leverage Existing Working Infrastructure**: The Python microservice (`services/humandesign-api`) already runs `pyswisseph` (Swiss Ephemeris Python bindings) in production on Railway/Linux without compile errors. We can extend this microservice by adding a `/calculate-astrology` endpoint.
3. **100% Parity Accuracy**: Calling Swiss Ephemeris via the Python microservice allows us to calculate Placidus house cusps, True/Mean Nodes, and planetary positions using industry-standard, verified math.
4. **Whole Sign Calculation**: Whole Sign house positions will be calculated programmatically using the simple offset formula relative to the Ascendant sign:
   $$\text{wholeSignHouse} = \left((\text{planetSignIndex} - \text{ascendantSignIndex} + 12) \pmod{12}\right) + 1$$
   This formula runs cleanly in both the microservice and client fallback environments.
5. **Resilient Local Fallback**: We will implement a lightweight local fallback in `calculateNatalBasics.ts` using `astronomy-engine`. If the Python API is down or unreachable, the app falls back to local calculations using `astronomy-engine` for basic signs (Sun, Moon, ASC, MC) and Whole Sign houses. This guarantees that the user flow never crashes, while delivering premium Swiss Ephemeris data when online.

---

## 5. Data Model Proposal

We propose updating the `NatalChartBlueprint` interface in `lib/types/blueprint.ts` to support the expanded dataset with dual house mappings.

### TypeScript Interface:
```typescript
export interface PlanetaryPosition {
  sign: string;
  degree: number;           // 0 to 29.99
  placidusHouse: number;    // 1 to 12 (Primary validation house)
  wholeSignHouse: number;   // 1 to 12 (Secondary narrative house)
  isRetrograde: boolean;
}

export interface AstrologicalAspect {
  p1: string;               // e.g., "Sun"
  p2: string;               // e.g., "Moon"
  type: "Conjunction" | "Opposition" | "Trine" | "Square" | "Sextile";
  angle: number;            // The exact angle, e.g. 120
  orb: number;              // The difference from exact aspect, e.g. 3.4
}

export interface AstrologicalPattern {
  type: "Stellium" | "T-Square" | "Grand Trine" | "Yod";
  planets: string[];        // Planets participating in the pattern
  focalPlanet?: string;     // T-Square apex or Yod apex (if applicable)
  details: string;          // Summary of the placement
}

export interface DominanceProfile {
  planet: string;           // e.g., "Mars"
  sign: string;             // e.g., "Aries"
  house: number;            // e.g., 8 (Primary Placidus-based dominant house)
  element: string;          // e.g., "Fire"
  scores: {
    planets: Record<string, number>;
    signs: Record<string, number>;
    houses: Record<number, number>;
    elements: Record<string, number>;
  };
}

export interface NatalChartBlueprint {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  midheaven: string;
  calculationStatus: "completed" | "pending" | "error";
  engine: "swiss-ephemeris" | "astronomy-engine-fallback";
  
  planets: {
    Sun: PlanetaryPosition;
    Moon: PlanetaryPosition;
    Mercury: PlanetaryPosition;
    Venus: PlanetaryPosition;
    Mars: PlanetaryPosition;
    Jupiter: PlanetaryPosition;
    Saturn: PlanetaryPosition;
    Uranus: PlanetaryPosition;
    Neptune: PlanetaryPosition;
    Pluto: PlanetaryPosition;
  };
  
  nodes: {
    NorthNode: PlanetaryPosition;
    SouthNode: PlanetaryPosition;
    Chiron?: PlanetaryPosition;
  };
  
  houses: {
    placidus: Record<number, {
      sign: string;
      degree: number;         // Starting degree of the house cusp
    }>;
    wholeSign: Record<number, {
      sign: string;
    }>;
  };
  
  distributions: {
    elements: { Fire: number; Earth: number; Air: number; Water: number };
    modalities: { Cardinal: number; Fixed: number; Mutable: number };
    polarities: { Masculine: number; Feminine: number };
  };
  
  aspects: AstrologicalAspect[];
  patterns: AstrologicalPattern[];
  dominance: DominanceProfile;
}
```

---

## 6. Implementation Plan

The project will be executed in 10 sequential phases:

### Phase 1: Planet Positions
* Update the Python microservice to expose `/calculate-astrology`.
* Calculate longitudes, zodiac signs, and sign degrees for the 10 core planets (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto) via `pyswisseph`.

### Phase 2: Retrogrades
* Read planetary velocities from `pyswisseph`.
* Add `isRetrograde` flag to the planetary positions object (excluding Sun and Moon).

### Phase 3: House Placements
* Calculate Placidus house cusps ($1$ to $12$) using `pyswisseph`'s `swe_houses`.
* Map coordinates (latitude, longitude) and birth date/time to resolve `placidusHouse` for each planet.
* Compute the Ascendant sign and resolve `wholeSignHouse` for each planet programmatically based on the sign offsets:
  $$\text{wholeSignHouse} = \left((\text{planetSignIndex} - \text{ascendantSignIndex} + 12) \pmod{12}\right) + 1$$

### Phase 4: Nodes
* Compute the True Node (`SE_TRUE_NODE`) and extrapolate the South Node (exactly $180^\circ$ opposite).
* Calculate Chiron (`SE_CHIRON`) and map them to signs, degrees, Placidus houses, and Whole Sign houses.

### Phase 5: Elements / Modalities / Polarity
* Formulate a weighted scoring model:
  * Sun, Moon, Ascendant = 3 points each.
  * Ruler of Ascendant, Midheaven = 2 points each.
  * Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto = 1 point each.
* Calculate element, modality, and polarity balances using this full distribution.

### Phase 6: Aspects
* Implement standard astrological aspects in the calculation service:
  * Conjunction ($0^\circ$), Opposition ($180^\circ$), Trine ($120^\circ$), Square ($90^\circ$), Sextile ($60^\circ$).
  * Set default orbs: Conjunction/Opposition/Trine/Square = $8^\circ$, Sextile = $5^\circ$.

### Phase 7: Patterns
* Add geometric chart pattern detection:
  * **Stellium**: Look for $\ge 3$ planets clustering within $8^\circ$ of each other or in the same house.
  * **T-Square**: Identify two planets in opposition ($180^\circ \pm 8^\circ$) both squaring a third planet ($90^\circ \pm 8^\circ$).
  * **Grand Trine**: Identify three planets mutually trining each other ($120^\circ \pm 8^\circ$).
  * **Yod**: Identify two planets in sextile ($60^\circ \pm 5^\circ$) both forming quincunxes ($150^\circ \pm 5^\circ$) to a third apex planet.

### Phase 8: Dominance
* Formulate dominance scoring. Combined weighting of planet positions, house positions, and aspect networks to output: dominant planet, sign, house, and element.

### Phase 9: Gaia Normalization
* Create a client mapper in `lib/mappers/natalMapper.ts` to adapt raw calculations into user-friendly UI cards.
* Update `AuthContext` and Firestore schema to store the complete updated data model, retaining Placidus as the validation standard and exposing Whole Sign as a secondary field.

### Phase 10: Golden User Parity Validation
* Test calculations for the five Golden Users. Compare all outputs against Astro.com and AstroSeek references using the Placidus-based validation.

---

## 7. Risk Assessment

* **Timezone Risk (High)**: Offset errors alter Ascendant, MC, and house cusps. We must ensure timezone strings are normalized to offsets (+HH:mm) and utilize a reliable location database/API.
* **Coordinate Risk (Medium)**: House systems (Placidus) require latitude and longitude. If coordinate resolution fails, the app must gracefully fall back to Whole Sign houses based on the Ascendant sign.
* **House System Risk (Low)**: At extreme latitudes (near poles), Placidus houses fail/overlap. The engine must detect this and fall back to Equal Houses or Whole Sign houses.
* **Mobile Performance Risk (Low)**: REST API fetches run on Railway asynchronously. The UI will show a loading/shimmer state. Local fallback calculations take $<50\text{ms}$, avoiding UI latency.
* **Static Export Risk (None)**: Next.js static HTML exports (Capacitor) cannot run server-side code. The app will communicate with the Railway Python microservice via standard HTTPS `fetch`, fully avoiding compile-time dependency bugs in the APK.
* **Client/Server Boundary Risk (Low)**: The API call runs inside standard React hooks. Clean loading states and local caching will prevent layout shifts.
* **Firestore Schema Migration Risk (Medium)**: Existing user profiles only have basic properties (`sunSign`, etc.). The client mapper must handle legacy profiles gracefully (detecting missing fields and showing a "Recalculate Profile" button if needed).

---

## 8. Validation Plan

### Golden Users
We will validate calculations using coordinates and times for:
1. **Widhi**
2. **Ning**
3. **Widya**
4. **Amartya**
5. **Eva Syana**

### Comparison Reference
* **Astro.com** (using Tropical Zodiac, Placidus House System as primary).
* **AstroSeek** (using standard orbs).

### Target Parity Thresholds
* **Sign Positions**: $100\%$ match.
* **Degrees**: Match within $\pm 0.01^\circ$ (to account for timezone or rounding variations).
* **Placidus House Placements**: $100\%$ match for all planets.
* **Whole Sign House Placements**: $100\%$ match against signs relative to the Ascendant.
* **Aspects**: Match all major aspects (within $1^\circ$ tolerance of standard orbs).
* **Elements/Modalities**: Consistent distribution percentages.
