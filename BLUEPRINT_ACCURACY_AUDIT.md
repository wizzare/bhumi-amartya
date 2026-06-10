# Blueprint Accuracy Audit V1

Date: 2026-06-06

Scope: audit only. No feature expansion, UI redesign, or large refactor.

## Summary

| System | Source file | Accuracy status | Priority |
| --- | --- | --- | --- |
| Life Path | `lib/calculations/calculateLifePath.ts` | Internally consistent after component-based master-number fix | Monitor |
| Zodiac Sun | `lib/calculations/calculateSunSign.ts` | Deterministic tropical date-range approximation | P1 |
| Natal Moon | `lib/astrology/calculateNatalBasics.ts` | Uses `astronomy-engine`; needs external ephemeris comparison | P1 |
| Natal Ascendant | `lib/astrology/calculateNatalBasics.ts` | Uses location and timezone; city fallback incomplete | P1 |
| Arcana Center | `lib/calculations/calculateArcanaCenter.ts` | Internally consistent with Destiny Matrix center formula, but has date parsing risk | P1 |
| Destiny Matrix | `lib/calculations/destinyMatrix/*` | Deterministic, validated date parser in energy path | Monitor |
| Human Design | `lib/humandesign/*`, `app/api/humandesign/*` | Fallback only in blueprint generation; not authoritative | P0/P2 |
| Daily Guidance | `components/dashboard/DashboardClient.tsx`, `lib/engines/dailyGuidanceEngine.ts`, `lib/orchestrators/localDailyGuidanceFallback.ts` | Personalized and date-seeded, but depends on blueprint accuracy and local date consistency | P2/P3 |

## 1. Life Path

Source: `lib/calculations/calculateLifePath.ts`

Formula used:

`lifePath = reduce(month) + reduce(day) + reduce(year)`

Then reduce final sum while preserving `11`, `22`, and `33`.

Examples verified:

| DOB | Calculated |
| --- | --- |
| `1987-06-09` | `22/4`, `Master Builder` |
| `2006-12-26` | `1`, `The Leader` |
| `1985-05-03` | `4`, `The Builder` |

Assumptions:

- Uses component-based numerology, not all-digits sum.
- Master numbers remain stored as `number: 11/22/33` and display as `11/2`, `22/4`, `33/6`.

Timezone dependency: none.

Location dependency: none.

Known limitations:

- Different numerology schools may use all-digits reduction; current product standard is component-based.

Accuracy status: internally consistent.

## 2. Zodiac Sun

Source: `lib/calculations/calculateSunSign.ts`

Formula used:

- Static tropical zodiac date ranges.
- Parses string dates as local midnight via `new Date("YYYY-MM-DDT00:00:00")`.

Assumptions:

- Uses simplified date boundaries, not exact solar longitude.
- Does not account for birth time, timezone, or cusp movement by year.

Timezone dependency: currently low for normal dates, high for cusp dates if users expect astronomical Sun sign.

Location dependency: none.

Known limitations:

- Date-range Sun sign can be wrong near cusp boundaries.
- `calculateNatalBasics` uses this simplified Sun sign while Moon/Ascendant use `astronomy-engine`, so astrology precision is mixed.

Accuracy status: acceptable for MVP non-cusp display; not authoritative.

Recommended fix:

- P1: compute Sun sign from `Astronomy.SunPosition(utcDate).elon` when birth time/timezone are available.

## 3. Natal Moon

Source: `lib/astrology/calculateNatalBasics.ts`

Formula used:

- Convert local birth date/time to UTC using numeric offset such as `+07:00`.
- Compute Moon ecliptic longitude with `Astronomy.EclipticGeoMoon(utcDate).lon`.
- Map longitude to sign by 30-degree bands.

Assumptions:

- Timezone string is a fixed UTC offset.
- Location is not needed for Moon sign.
- `astronomy-engine` is sufficient for MVP astrology.

Timezone dependency: high.

Location dependency: none for Moon sign.

Known limitations:

- No IANA timezone support or historical timezone/DST lookup.
- External ephemeris comparison has not been added to automated test results.

Accuracy status: plausible, requires external verification for canonical dataset.

## 4. Natal Ascendant

Source: `lib/astrology/calculateNatalBasics.ts`

Formula used:

- Convert local time to UTC.
- Build `Astronomy.Observer(latitude, longitude, 0)`.
- Convert eastern horizon vector to ecliptic coordinates.
- Map ecliptic longitude to zodiac sign.

Assumptions:

- Latitude/longitude are accurate.
- City fallback is sufficient for supported cities.

Timezone dependency: high.

Location dependency: high.

Known limitations:

- Fallback city list only includes Jakarta, Bandung, Surabaya, Yogyakarta, Bali, Denpasar.
- Bangil and Selong need selected autocomplete coordinates; typed free-text fallback may be approximate or unavailable.
- No external validation against a known astrology calculator.

Accuracy status: plausible engine, incomplete location coverage.

## 5. Arcana Center

Source: `lib/calculations/calculateArcanaCenter.ts`

Formula used:

- Reduce day to <= 22, preserving 22.
- Reduce month to <= 22.
- Reduce year digit sum to <= 22.
- `d = reduce(day + month + year)`
- `center = reduce(day + month + year + d)`

Assumptions:

- Destiny Matrix uses a 1-22 arcana system.
- Values above 22 reduce by digit sum.

Timezone dependency: should be none, but current string path uses `new Date(birthDate)`, which can shift day in negative timezones.

Location dependency: none.

Known limitations:

- `calculateDestinyMatrixEnergy` has safer ISO parsing; `calculateArcanaCenter` should use the same parse logic.

Accuracy status: formula consistent with Destiny Matrix center for tested dates, but date parsing is P1 risk.

## 6. Destiny Matrix

Sources:

- `lib/calculations/calculateDestinyMatrix.ts`
- `lib/calculations/destinyMatrix/energy.ts`
- `lib/calculations/destinyMatrix/mapToBlueprint.ts`

Formula used:

- `energy.ts` validates `YYYY-MM-DD`, derives `apoint`, `bpoint`, `cpoint`, then many derived chart points.
- Blueprint center maps to `result.points.epoint`.

Assumptions:

- Matrix method is the repository's chosen method.
- Reduction is digit-sum once when values exceed 22 in `energy.ts`; most point sums stay in range afterward.

Timezone dependency: none if parsed as ISO parts.

Location dependency: none.

Known limitations:

- `calculateDestinyMatrix.ts` and `energy.ts` implement overlapping logic. The active blueprint path uses `energy.ts`.
- Formula should be documented as product standard.

Accuracy status: internally consistent for active path.

## 7. Human Design

Sources:

- `lib/humandesign/calculateHumanDesign.ts`
- `lib/humandesign/calculateHumanDesignType.ts`
- `lib/humandesign/hdkitAdapter.ts`
- `app/api/humandesign/calculate/route.ts`
- `app/api/humandesign/bodygraph/route.ts`

Current architecture:

- `generateBlueprint` calls `calculateHumanDesign`.
- `calculateHumanDesign` tries `calculateWithHdkit`.
- `calculateWithHdkit` always returns pending because the bundled hdkit is not an installable exported calculator.
- The app falls back to `calculateHumanDesignTypeFromBirthData`.
- Fallback is now marked `status: "needs_verified_engine"`, `source: "fallback_approximation"`, `accuracy: "approximate"`.

Formula used by fallback:

- Converts birth date/time to UTC with fixed timezone offset.
- Uses `astronomy-engine` planetary longitudes for Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto.
- Finds design date by Sun 88 degrees before personality Sun.
- Maps longitudes to gates using a static gate order.
- Determines channels and centers from gate pairs.
- Determines type by Sacral definition and motor-to-throat heuristic.

Assumptions:

- Gate order and center/channel map are sufficient.
- Nodes, profile lines, authority, full center definition, variables, incarnation cross, and exact HD ephemeris are not required for fallback.

Timezone dependency: high.

Location dependency: medium. Actual HD needs timezone/location; current fallback needs timezone and optionally longitude only as backup.

Known limitations:

- Not authoritative.
- Does not use Lunar Nodes.
- Does not produce full bodygraph fields.
- Python route and Human Design Hub route are not wired into client blueprint generation.
- Android static export cannot call local `/api` or `localhost`.

Accuracy status: P0 for user-facing correctness if displayed as a verified type; P2 architecture gap for production.

Recommended architecture:

| Platform | Recommendation |
| --- | --- |
| Android | Hosted backend endpoint or Firebase Function; never `localhost` or internal Next `/api` inside APK |
| Web | Server route can call hosted HD provider/service, but should share the same backend contract as Android |
| Future iOS | Same hosted backend/Firebase Function contract as Android |

## 8. Daily Guidance Personalization

Sources:

- `components/dashboard/DashboardClient.tsx`
- `app/api/ai/daily-guidance/route.ts`
- `lib/engines/dailyGuidanceEngine.ts`
- `lib/orchestrators/localDailyGuidanceFallback.ts`
- `lib/dailyGuidance/unifiedBlueprintSynthesis.ts`
- `lib/dailyGuidance/adaptiveDailyPracticeGenerator.ts`

Formula used:

- Uses local date key from `getLocalDateKey`.
- Uses profile, blueprint, current sky, astrology today, and adaptive context.
- Local fallback hashes date/user/blueprint signals to select text patterns.
- Daily practices avoid exact repetition from yesterday.

Assumptions:

- Blueprint fields are available and correct.
- Local date key from device/browser is acceptable.
- Current sky generated from `new Date()` is acceptable for user's local day.

Timezone dependency: medium to high for daily boundaries and current sky.

Location dependency: low currently; daily guidance does not appear to compute local transits by birth location.

Known limitations:

- If AI route fails, fallback is deterministic and may repeat for users with similar blueprint/date signals.
- Current sky uses runtime current date, not necessarily user's timezone.
- HD approximate status can still influence text as if type is meaningful unless synthesis filters status.

Accuracy status: personalized enough for MVP, but depends on upstream blueprint accuracy.

## Verification Dataset Results

Generated by `scripts/verifyBlueprintDataset.ts`.

| Case | Field | Expected | Calculated | Result |
| --- | --- | --- | --- | --- |
| A | lifePath | 4 | 4 | PASS |
| A | sunSign | Taurus | Taurus | PASS |
| A | moonSign | manual-review | Libra | REVIEW |
| A | ascendant | manual-review | Aquarius | REVIEW |
| A | arcana | 8 | 8 | PASS |
| A | destinyCenter | 8 | 8 | PASS |
| A | humanDesignStatus | needs_verified_engine | needs_verified_engine | PASS |
| B | lifePath | 22/4 | 22/4 | PASS |
| B | sunSign | Gemini | Gemini | PASS |
| B | moonSign | manual-review | Scorpio | REVIEW |
| B | ascendant | manual-review | Leo | REVIEW |
| B | arcana | 8 | 8 | PASS |
| B | destinyCenter | 8 | 8 | PASS |
| B | humanDesignStatus | needs_verified_engine | needs_verified_engine | PASS |
| C | lifePath | 1 | 1 | PASS |
| C | sunSign | Capricorn | Capricorn | PASS |
| C | moonSign | manual-review | Pisces | REVIEW |
| C | ascendant | manual-review | Capricorn | REVIEW |
| C | arcana | 11 | 11 | PASS |
| C | destinyCenter | 11 | 11 | PASS |
| C | humanDesignStatus | needs_verified_engine | needs_verified_engine | PASS |
| D | lifePath | 6 | 6 | PASS |
| D | sunSign | Capricorn | Capricorn | PASS |
| D | moonSign | manual-review | Pisces | REVIEW |
| D | ascendant | manual-review | Aries | REVIEW |
| D | arcana | 12 | 12 | PASS |
| D | destinyCenter | 12 | 12 | PASS |
| D | humanDesignStatus | needs_verified_engine | needs_verified_engine | PASS |

## Files Requiring Fixes

P0:

- `lib/humandesign/*`: replace fallback with verified backend/provider before claiming HD type as accurate.
- `lib/dailyGuidance/unifiedBlueprintSynthesis.ts`: ensure approximate HD is not treated as verified identity.

P1:

- `lib/calculations/calculateArcanaCenter.ts`: parse `YYYY-MM-DD` by parts, not `new Date(birthDate)`.
- `lib/calculations/calculateSunSign.ts`: compute Sun from astronomical longitude when birth time/timezone are available.
- `lib/astrology/calculateNatalBasics.ts`: expand timezone/location support; avoid limited city fallback as hidden source of precision loss.
- `app/setup/page.tsx` and `app/settings/page.tsx`: selected autocomplete coordinates do not provide true timezone; currently defaults can be wrong outside WIB/WITA assumptions.

P2:

- `app/api/humandesign/calculate/route.ts`: cannot depend on `localhost:8000` for deployed web/mobile.
- `app/api/humandesign/bodygraph/route.ts`: provider route needs production key and normalized response contract.

P3:

- Daily guidance fallback templates can be strengthened after blueprint status gating is fixed.
