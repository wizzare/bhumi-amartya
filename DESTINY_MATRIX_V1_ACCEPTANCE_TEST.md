# Destiny Matrix V1 Acceptance Test

## Result

**Historical acceptance status: REQUIRES REMEDIATION**

The findings in this report were remediated and superseded by
`DESTINY_MATRIX_ENGINE_LOCK_REPORT.md`. The locked acceptance status is
**ENGINE LOCKED**.

The engine generates correct approved fixtures, compiles, and has a valid acyclic dependency graph. It does not yet satisfy all approved storage invariants:

1. Three health calculations duplicate existing graph formulas.
2. Four structural nodes are stored without any registered consumer.
3. Timeline node references are stored twice.

No engine formulas or implementation files were modified during this audit.

## Test Evidence

Acceptance fixture:

- `scripts/acceptDestinyMatrixV1.ts`

Commands:

```powershell
$env:TS_NODE_COMPILER_OPTIONS='{"module":"CommonJS","moduleResolution":"node"}'
.\node_modules\.bin\ts-node.cmd scripts\acceptDestinyMatrixV1.ts
.\node_modules\.bin\tsc.cmd --noEmit
```

Results:

- Acceptance checks: 54 passed, 12 failed
- TypeScript: passed
- Failures are the same invariant failures repeated across four fixtures
- Unique remediation categories: 3

## 1. Graph Validation

Results are identical for Widhi, Aya, Sheina, and Bayu.

| Check | Result | Evidence |
| --- | --- | --- |
| Stored node count | Pass | 106 |
| Structural node count | Pass | 32 |
| Root count | Pass | 3 |
| Derived structural count | Pass | 29 |
| Projection-calculation node count | Pass | 74 |
| Edge count | Pass | 226, equal to total stored parent references |
| Missing parents | Pass | None |
| Circular dependencies | Pass | None |
| Root reachability | Pass | All 106 nodes reachable |
| Unique node IDs | Pass | Enforced by graph builder |
| Duplicate calculations | Fail | Three duplicate formula groups |
| Hidden structural leaves | Fail | Four structural nodes have no consumers |

### Duplicate calculations

| Existing node | Duplicate projection node | Formula |
| --- | --- | --- |
| `BM06` | `H01-EMOTION` | `R(BM01 + BM02)` |
| `BM09` | `H07-EMOTION` | `R(BM03 + BM04)` |
| `BM20` | `H06-EMOTION` | `R(BM10 + BM11)` |

The duplicate nodes can produce the same value, but the approved invariant is stronger: every calculation must exist exactly once.

### Hidden structural leaves

| Node | Formula | Registered consumers |
| --- | --- | --- |
| `BM16` | `R(BM11+BM03)` | None |
| `BM21` | `R(BM10+BM20)` | None |
| `BM22` | `R(BM20+BM11)` | None |
| `BM24` | `R(BM05+BM23)` | None |

These nodes are reachable and calculated correctly. They fail the “no hidden-only values” requirement because no graph node or projection consumes them.

## 2. Fixture Validation

| User | Graph | Projections | Canonical object | Missing parents | Deterministic |
| --- | --- | --- | --- | --- | --- |
| Widhi — 1985-05-03 | Pass | Pass | Pass | None | Pass |
| Aya — 2012-06-16 | Pass | Pass | Pass | None | Pass |
| Sheina — 1988-10-17 | Pass | Pass | Pass | None | Pass |
| Bayu — 1989-01-06 | Pass | Pass | Pass | None | Pass |

Golden projection results:

| User | Center | Love | Money | Karmic | Social |
| --- | ---: | --- | --- | --- | ---: |
| Widhi | 8 | 11, 8, 13 | 21, 8, 13 | 13, 7, 21 | 16 |
| Aya | 9 | 7, 9, 15 | 18, 9, 14 | 9, 9, 18 | 9 |
| Sheina | 7 | 6, 7, 17 | 15, 7, 15 | 8, 5, 15 | 14 |
| Bayu | 5 | 11, 5, 6 | 21, 5, 14 | 16, 10, 21 | 19 |

All fixture structural values match the approved golden arrays.

## 3. Storage Validation

Generated shape:

```text
destinyMatrix
├── graph
├── projections
├── timeline
└── metadata
```

| Check | Result |
| --- | --- |
| `destinyMatrix.graph` exists | Pass |
| `destinyMatrix.projections` exists | Pass |
| `destinyMatrix.metadata` exists | Pass |
| Graph nodes and edges populated | Pass |
| Input hash and engine version populated | Pass |
| No visual coordinates | Pass |
| No display labels/content/narrative | Pass |
| No missing referenced nodes | Pass |
| No duplicated calculated values | Fail |
| No duplicated storage references | Fail |
| No hidden-only structural values | Fail |

### Timeline duplication

The same 56 timeline node IDs are stored in:

1. `projections[id="AGE_TIMELINE"].nodeIds`
2. `timeline.nodeIds`

The graph stores the actual timeline nodes once, which is correct. The canonical object duplicates their reference list in two storage locations, violating the no-duplicated-storage requirement.

## 4. Projection Validation

| Projection | Generated | References valid | Performs arithmetic |
| --- | --- | --- | --- |
| Love | Pass | Pass | No |
| Money | Pass | Pass | No |
| Health | Pass | Pass | No |
| Karmic | Pass | Pass | No |
| Social | Pass | Pass | No |
| Timeline | Pass | Pass | No |
| Soul Searching | Unsupported as required | N/A | No |
| Spiritual Knowledge | Unsupported as required | N/A | No |

Static source inspection confirms `destinyMatrixProjection.ts`:

- imports no reducer;
- invokes no arithmetic engine;
- selects existing graph node IDs;
- validates references through `matrixNodeValue`.

Health emotions/totals and timeline subdivisions are calculated in the graph engine, not in the projection module.

## 5. Legacy Comparison

### Behavior comparison

The 32 structural values match the legacy engine for all four approved fixtures.

This is evidence of regression continuity, not a parity requirement.

### Major differences

| Legacy engine | Bhumi Matrix V1 |
| --- | --- |
| Letter-key records | Stable `BMxx` and projection IDs |
| Implicit formula order | Explicit parents and edges |
| Feature arrays copy values | Projection registry references node IDs |
| Timeline key names imply presentation | Timeline nodes have explicit dependencies and no fabricated ages |
| Mixed graph and feature outputs | Calculation graph separated from projections |
| No engine ownership metadata | Bhumi schema and engine versions |

### Removed ambiguities

- 22 is explicitly the Arcana value domain.
- Structural node count is explicitly 32.
- Root count is explicitly 3.
- Timeline age labels are not invented.
- Projections are selection-only.
- Legacy comparison is isolated from production calculation.

### Unsupported features

- Soul Searching
- Spiritual Knowledge
- Timeline ages and labels
- Unknown-node meanings

## 6. Regression Strategy

The acceptance fixture should be retained as a mandatory engine gate.

### Golden outputs

For each approved user, freeze:

- 32 ordered structural values;
- Center, Love, Money, Karmic, Father, Mother, and Social projections;
- structural/projection node counts;
- graph edge count;
- unsupported projection statuses;
- canonical schema keys.

### Required invariant gates

Future engine changes must prove:

1. All node IDs are unique.
2. Every parent exists.
3. The graph is acyclic.
4. Every stored node is reachable.
5. Every calculation formula is unique or explicitly represented as an alias.
6. Every structural leaf has a registered consumer or an explicit reserved status.
7. Projection modules contain no arithmetic.
8. Projection references resolve.
9. Canonical storage contains no visual values.
10. Timeline references have one canonical storage owner.

### Existing regression fixtures

- `lib/engines/destinyMatrixGoldenFixtures.ts`
- `scripts/validateBhumiMatrixV1.ts`
- `scripts/acceptDestinyMatrixV1.ts`

## 7. Readiness Assessment

| Target | Decision | Reason |
| --- | --- | --- |
| Projection expansion | Not ready | Duplicate calculations and unconsumed structural leaves should be resolved first |
| Gaia integration | Not ready | Explicitly out of scope; canonical storage invariants currently fail |
| Dashboard usage | Not ready | Explicitly out of scope; no approved consumer contract |
| Production storage | Not ready | Timeline reference duplication and hidden-only values violate accepted storage rules |
| Continued engine testing | Ready | Graph, fixtures, projections, and validation tooling are operational |

## 8. Required Remediation

This report does not prescribe or implement changes. Acceptance requires resolving:

1. Health projection duplicate formulas for `H01`, `H06`, and `H07`.
2. Consumer/status treatment for `BM16`, `BM21`, `BM22`, and `BM24`.
3. Single ownership for the 56 timeline node references.

After remediation, rerun:

```powershell
$env:TS_NODE_COMPILER_OPTIONS='{"module":"CommonJS","moduleResolution":"node"}'
.\node_modules\.bin\ts-node.cmd scripts\acceptDestinyMatrixV1.ts
.\node_modules\.bin\tsc.cmd --noEmit
npm.cmd run build
```

## Final Status

**REQUIRES REMEDIATION**
