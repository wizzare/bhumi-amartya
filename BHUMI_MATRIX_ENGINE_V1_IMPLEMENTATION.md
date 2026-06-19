# Bhumi Matrix Engine V1 Implementation

## Implemented Files

- `lib/types/destinyMatrix.ts`
- `lib/engines/destinyMatrixGraph.ts`
- `lib/engines/destinyMatrixProjection.ts`
- `lib/engines/calculateBhumiMatrix.ts`
- `lib/engines/destinyMatrixGoldenFixtures.ts`
- `lib/engines/legacyMatrixComparison.ts`
- `scripts/validateBhumiMatrixV1.ts`

## Graph Architecture

`buildDestinyMatrixGraph(dateOfBirth)` validates a Gregorian `YYYY-MM-DD` date and produces:

- 32 structural nodes: 3 root and 29 derived
- 71 projection-calculation nodes after canonical health deduplication
- explicit parent dependencies
- explicit directed edges
- node consumers, including downstream feature consumers
- deterministic FNV-1a input hash
- Bhumi engine/version metadata

Every calculation is represented by a graph node. The graph contains no visual coordinates, meanings, content, or narrative.

The projection-calculation nodes comprise:

- 8 purpose nodes
- 4 independent health emotion nodes; 3 rows alias canonical structural nodes
- 3 health total nodes
- 56 timeline subdivision nodes

## Projection Architecture

The projection engine performs no arithmetic. It only:

- checks that referenced graph nodes exist;
- returns ordered node IDs;
- marks unsupported projections explicitly.

Implemented selection functions:

- `getLoveProjection`
- `getMoneyProjection`
- `getKarmicProjection`
- `getFatherProjection`
- `getMotherProjection`
- `getHealthProjection`
- `getSoulProjection`
- `getSocialProjection`
- `getSpiritualProjection`
- `getTimelineProjection`

Soul Searching and Spiritual Knowledge return `status: "unsupported"`.

Timeline returns `status: "calculated_unmapped"` and null age boundaries.

## Storage Schema

`calculateBhumiMatrix(dateOfBirth)` returns:

```text
destinyMatrix
├── graph
│   ├── nodes
│   ├── edges
│   ├── input
│   └── metadata
├── projections
├── timeline
└── metadata
```

Projection records store graph-node references. They do not copy calculated values. Timeline references are owned only by `timeline`. Display-only values are absent.

The canonical engine is not yet connected to blueprint persistence. This preserves the approved parallel migration boundary and leaves the legacy production path unchanged.

## Golden Fixture Results

| User | Date | Center | Love | Money | Structural nodes | Projection nodes |
| --- | --- | ---: | --- | --- | ---: | ---: |
| Widhi | 1985-05-03 | 8 | 11, 8, 13 | 21, 8, 13 | 32 | 74 |
| Aya | 2012-06-16 | 9 | 7, 9, 15 | 18, 9, 14 | 32 | 74 |
| Sheina | 1988-10-17 | 7 | 6, 7, 17 | 15, 7, 15 | 32 | 74 |
| Bayu | 1989-01-06 | 5 | 11, 5, 6 | 21, 5, 14 | 32 | 74 |

All fixtures generated deterministically. The read-only comparison adapter reported matching structural values against the legacy engine for these four approved dates.

## Migration Notes

1. Keep the legacy engine read-only.
2. Introduce canonical storage beside the existing legacy root.
3. Backfill from birth date, never from legacy result fields.
4. Migrate consumers to projection IDs.
5. Retire legacy writes only after a separately approved storage migration.

`legacyMatrixComparison.ts` is regression tooling only. The canonical graph and projection engines do not import it.

## Known Limitations

- Soul Searching is unsupported.
- Spiritual Knowledge is unsupported.
- Timeline age labels and boundaries are intentionally absent.
- Unknown-node meanings are not represented.
- No persistence/backfill integration is activated in this implementation.
- Recursive reduction is the approved Bhumi V1 standard and may differ from the legacy algorithm for hypothetical high intermediate values outside the present registry.
