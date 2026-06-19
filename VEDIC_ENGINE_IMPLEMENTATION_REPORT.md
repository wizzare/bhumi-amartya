# Vedic Astrology Engine Implementation Report

## Status

Production implementation completed for the Vedic identity layer only. No Dashboard, Profile, Journey, Innerwork, or Gaia behavior was changed.

The implementation is deterministic. It does not call Gemini, an LLM, or any AI interpretation service. It does not contain mock chart data or placeholder results.

## Implemented Scope

- Sidereal Lagna, Sun, Moon, seven classical grahas, mean Rahu, and Ketu
- Lahiri/Chitrapaksha ayanamsha
- Whole-sign houses
- Moon Nakshatra and Pada
- Seven-graha Jaimini Atmakaraka and Darakaraka
- Vimshottari Mahadasha and Antardasha with exact ISO boundaries
- Deterministic Strong / Balanced / Weak graha ranking
- Evidence-bearing Raja, Dhana, Gaja Kesari, and Budha Aditya Yoga rules
- Dharma, Artha, Kama, and Moksha ranking
- Deterministic Indonesian interpretation dictionaries and 4-paragraph synthesis
- Blueprint generation, local generation, Firestore normalization/backfill, and page-level legacy backfill
- Vedic page with no audit panel, debug UI, or raw JSON

## Formula and Standard Sources

1. Planetary positions use `astronomy-engine` geocentric apparent ecliptic positions.
2. The sidereal conversion subtracts Lahiri ayanamsha from tropical ecliptic longitude. The implementation uses the Lahiri J2000 value `23°51′11.1″` and the general-precession rate `50.290966″/year`.
3. Ascendant is the eastern horizon/ecliptic intersection for the UTC birth instant and geographic observer.
4. Whole-sign houses count signs from the sidereal Lagna sign.
5. Nakshatra length is `360° / 27 = 13°20′`; each Pada is `3°20′`.
6. Vimshottari uses the traditional sequence Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury and periods 7, 20, 6, 10, 7, 18, 16, 19, 17 years. The first balance is proportional to the untraversed Moon Nakshatra. The configured year is `365.2425` days.
7. Chara Karakas use the seven classical grahas, ranked by degree within sign; nodes are excluded.
8. Yoga output is emitted only when its coded rule succeeds, and stores the participating grahas plus rule evidence.

Primary technical references:

- Swiss Ephemeris sidereal modes and Lahiri constant: https://www.astro.com/swisseph/swephinfo_e.htm
- Swiss Ephemeris programmer documentation: https://www.astro.com/swisseph/swephprg.htm
- Astronomy Engine source and calculation documentation: https://github.com/cosinekitty/astronomy

## Storage Schema

The blueprint now has an optional legacy-safe `vedic` root:

```text
vedic
├── lagna, moonSign, sunSign
├── nakshatra, pada
├── atmakaraka, darakaraka
├── currentMahadasha, currentAntardasha
├── planetaryStrength[]
├── majorYogas[]
├── dharmaFocus, arthaFocus, kamaFocus, mokshaFocus
├── strengths[], challenges[]
├── relationshipStyle, careerStyle, spiritualStyle
├── summary[]
├── planets
└── meta
    ├── schemaVersion / engineVersion
    ├── calculationSource / accuracy
    ├── calculatedAt / asOf
    └── standards
```

Missing `vedic` data is calculated from stored birth input during repository normalization and persisted when the Vedic page is opened. Existing documents remain readable.

## Widhi Wedhaswara Validation

Input:

- Date: 3 May 1985
- Time: 23:45 WIB (`UTC+07:00`)
- UTC instant: 3 May 1985, 16:45 UTC
- Location: Jakarta (`-6.2088`, `106.8456`)
- Validation as-of date: 18 June 2026 UTC

Engine result:

| Field | Result |
| --- | --- |
| Lagna | Capricorn, 19°13′ |
| Moon Sign | Libra, 3°29′ |
| Sun Sign | Aries, 19°32′ |
| Nakshatra | Chitra |
| Pada | 4 |
| Atmakaraka | Mercury, Pisces, house 3 |
| Darakaraka | Saturn, Scorpio, house 11 |
| Current Mahadasha | Saturn — 2 January 2021 to 3 January 2040 |
| Current Antardasha | Mercury — 6 January 2024 to 15 September 2026 |

Independent reference checks:

| Reference | Lagna | Moon | Nakshatra / Pada | Mahadasha | Result |
| --- | --- | --- | --- | --- | --- |
| Astro-Seek Sidereal Chart, Lahiri, Jakarta input | Capricorn | Libra | Chitra 4 | Saturn | Match |
| Drik Panchang Janma Nakshatra / Vimshottari tools, Jakarta input | Capricorn | Libra | Chitra 4 | Saturn | Match |

Reference calculators:

- https://horoscopes.astro-seek.com/sidereal-astrology-chart-calculator
- https://www.drikpanchang.com/astrology/prediction/nakshatra-calculator.html
- https://www.drikpanchang.com/astrology/dasha/vimshottari-dasha.html

Small date differences between calculators are possible when they use a 360-day savana year instead of `365.2425`, a different dasha boundary convention, or true rather than mean nodes. The active standard is stored in `vedic.meta.standards`.

## Files

- `lib/vedic/types.ts`
- `lib/vedic/calculateVedic.ts`
- `app/blueprint/vedic/page.tsx`
- `scripts/validateVedic.ts`
- Blueprint type, generation, repository normalization, local generation, and storage type seams

## Verification

- TypeScript: `.\node_modules\.bin\tsc.cmd --noEmit` — passed
- Production build: `npm.cmd run build` — passed
- Next.js: 16.2.6 / Turbopack
- Vedic route: `/blueprint/vedic` generated successfully
- Golden validation: `scripts/validateVedic.ts` produced the Widhi results above

