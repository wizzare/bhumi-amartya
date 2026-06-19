# Destiny Matrix Visual Audit

## Visual Coverage

The matrix renders Center Arcana, Money Line, Love Line, Father Line, Mother Line, Ancestor Line, Talents, Karmic Tail as Shadow Arcana, Health Matrix, Soul Blocks, and the stored age timeline.

## Formula Coverage

Every displayed value originates from `calculateDestinyMatrixEnergy` through `calculateDestinyMatrixForBlueprint`. The visual performs no arithmetic and introduces no manual arcana.

## Storage Coverage

- Center: `destinyMatrix.center` / `arcanaCenter`
- Lines: `moneyLine`, `loveLine`, `fatherLine`, `motherLine`, `ancestorLine`
- Talents: `talentsGreat` / `talents`
- Shadow: `karmicTail`
- Health: `destinyIntelligence.healthChart`, `healthChart`, or `chakraMatrix`
- Soul blocks: `destinyIntelligence.*`
- Timeline: `destinyMatrix.years`

## UI Coverage

Every visible number is read from the stored Destiny Matrix object passed to the visual component.

## Gaia Coverage

Gaia consumes the same Destiny Matrix lines, health chart, soul blocks, talents, and karmic-tail fields through `normalizeGaiaSources` and Destiny Matrix intelligence normalization.

## Parity %

Parity is field-presence based: stored values render exactly; absent fields remain absent and are not replaced with mock values.

TypeScript and production build validation passed. Browser screenshot verification was blocked by the host browser sandbox.
