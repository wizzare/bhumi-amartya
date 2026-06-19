# Black Moon Lilith Implementation Report

## Calculation Method

Black Moon Lilith uses the deterministic **Mean Lunar Apogee**. The calculation derives the mean lunar perigee from Julian centuries since J2000 and rotates it by 180 degrees to obtain the mean apogee. No API, Gemini, network request, or placeholder data is used.

The calculated ecliptic longitude is normalized into:

- Zodiac sign
- Degree within the sign
- Placidus-compatible house assignment using the natal engine's existing house resolver

## Storage Mapping

The existing natal structure is extended with:

```text
astrology.lilith.sign
astrology.lilith.degree
astrology.lilith.house
```

The same value is preserved through `natalChart` compatibility, blueprint generation, Firestore repository normalization, and local storage serialization.

## UI Mapping

The Natal Experience includes a dedicated **🌑 Black Moon Lilith** section showing:

- Sign
- House
- Meaning
- Shadow Theme
- Growth Invitation

Interpretation is deterministic and selected from the existing astrology dictionary layer.

## Gaia Mapping

Lilith is routed into Gaia's existing `shadow` theme with:

- Shadow Layer: `growth-edge`, `power-transformation`
- Pola Berulang: `recurring-pattern`
- Inner Child: `inner-child`
- Shadow Integration: `integration`

## TypeScript Result

**PASS**

Command:

```text
.\node_modules\.bin\tsc.cmd --noEmit
```

Completed with exit code `0`.

## Build Result

**PASS**

Command:

```text
npm.cmd run build
```

Next.js `16.2.6` compiled successfully, completed TypeScript validation, and generated all `113 / 113` static pages.

## Final Natal Coverage

**21 / 21**
