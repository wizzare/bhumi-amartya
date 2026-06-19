# Bhumi Matrix Engine V1 Specification

## 1. Decision

**Final status: READY FOR IMPLEMENTATION**

> Lock amendment: V1 remediation canonicalized three health emotion formulas as
> aliases of `BM06`, `BM20`, and `BM09`. The locked graph therefore stores 71
> projection-calculation nodes rather than 74, with no formula or structural
> topology change. See `DESTINY_MATRIX_ENGINE_LOCK_REPORT.md`.

Bhumi Matrix V1 is a new, Bhumi-owned deterministic calculation graph. It does not claim parity with Soulmap, Natalia Ladini, or any external calculator.

The source of truth is:

```text
Birth Date
    ↓
Calculation Graph
    ↓
Projection Registry
    ↓
Future Interpretation Layer
```

Visual coordinates, labels, meanings, and narratives are not engine truth.

## 2. Engine Standard

### Input

```ts
type BhumiMatrixInput = {
  birthDate: string; // YYYY-MM-DD
};
```

Birth time, timezone, location, name, and gender are not inputs.

### Value domain

All calculated values use the 22-value Arcana domain:

```ts
function reduce22(value: number): number {
  if (!Number.isInteger(value) || value < 0) throw new Error("Invalid matrix value");
  let result = value;
  while (result > 22) {
    result = String(result)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
  }
  return result === 0 ? 22 : result;
}
```

The number 22 defines the value domain. It does not define the number of graph nodes.

### Node classes

| Class | Definition |
| --- | --- |
| Root node | Obtains its value directly from normalized birth-date input |
| Derived node | Has a formula and graph-node parents |
| Projection node | Feature-specific calculation derived from graph nodes |
| Display node | Forbidden from canonical storage; belongs to a future renderer |
| Unknown node | Reserved registry entry with no active formula |

## 3. Core Node Registry

Bhumi V1 contains 32 active graph nodes:

- 3 root nodes
- 29 derived nodes
- 0 visual-only nodes
- 0 active unknown nodes

Unknown IDs are reserved for future versioned expansion and must not receive inferred formulas.

### Root and primary graph

| ID | Legacy key | Class | Parents | Formula | Primary consumers |
| --- | --- | --- | --- | --- | --- |
| BM01 | `a` | Root | `INPUT_DAY` | `R(day)` | BM04, BM05, BM06, BM08, BM12, timeline, health |
| BM02 | `b` | Root | `INPUT_MONTH` | `R(month)` | BM04, BM05, BM06, BM07, BM13, timeline, health |
| BM03 | `c` | Root | `INPUT_YEAR` | `R(sum(year digits))` | BM04, BM05, BM07, BM09, BM11, timeline, health |
| BM04 | `d` | Derived | BM01,BM02,BM03 | `R(BM01+BM02+BM03)` | BM05, BM08, BM09, BM10, BM17, timeline, health |
| BM05 | `e` | Derived | BM01,BM02,BM03,BM04 | `R(BM01+BM02+BM03+BM04)` | center, BM10–BM13, BM18,BM19,BM24, Love, Money, health |
| BM06 | `f` | Derived | BM01,BM02 | `R(BM01+BM02)` | BM23,BM25,BM26, Father, timeline |
| BM07 | `g` | Derived | BM02,BM03 | `R(BM02+BM03)` | BM23,BM27,BM28, Father, timeline |
| BM08 | `h` | Derived | BM04,BM01 | `R(BM04+BM01)` | BM23,BM29,BM30, Mother, timeline |
| BM09 | `i` | Derived | BM03,BM04 | `R(BM03+BM04)` | BM23,BM31,BM32, Mother, timeline |

### Axis and inner graph

| ID | Legacy key | Class | Parents | Formula | Primary consumers |
| --- | --- | --- | --- | --- | --- |
| BM10 | `j` | Derived | BM04,BM05 | `R(BM04+BM05)` | BM17,BM20,BM21, Money, Karmic, health |
| BM11 | `n` | Derived | BM03,BM05 | `R(BM03+BM05)` | BM16,BM20,BM22, Money, health |
| BM12 | `s` | Derived | BM01,BM05 | `R(BM01+BM05)` | BM14,BM18, Love, health |
| BM13 | `t` | Derived | BM02,BM05 | `R(BM02+BM05)` | BM15,BM19, Love, health |
| BM14 | `o` | Derived | BM01,BM12 | `R(BM01+BM12)` | health |
| BM15 | `p` | Derived | BM02,BM13 | `R(BM02+BM13)` | health |
| BM16 | `q` | Derived | BM11,BM03 | `R(BM11+BM03)` | reserved graph output |
| BM17 | `r` | Derived | BM10,BM04 | `R(BM10+BM04)` | Karmic Tail |
| BM18 | `w` | Derived | BM12,BM05 | `R(BM12+BM05)` | health |
| BM19 | `x` | Derived | BM13,BM05 | `R(BM13+BM05)` | health |

### Internal chain

| ID | Legacy key | Class | Parents | Formula | Primary consumers |
| --- | --- | --- | --- | --- | --- |
| BM20 | `l` | Derived | BM10,BM11 | `R(BM10+BM11)` | BM21,BM22, health alias |
| BM21 | `k` | Derived | BM10,BM20 | `R(BM10+BM20)` | reserved graph output |
| BM22 | `m` | Derived | BM20,BM11 | `R(BM20+BM11)` | reserved graph output |

### Family graph

| ID | Legacy key | Class | Parents | Formula | Primary consumers |
| --- | --- | --- | --- | --- | --- |
| BM23 | `u` | Derived | BM06,BM07,BM08,BM09 | `R(BM06+BM07+BM08+BM09)` | BM24–BM32 |
| BM24 | `v` | Derived | BM05,BM23 | `R(BM05+BM23)` | reserved graph output |
| BM25 | `f2` | Derived | BM06,BM23 | `R(BM06+BM23)` | BM26, father projection |
| BM26 | `f1` | Derived | BM06,BM25 | `R(BM06+BM25)` | talent projection |
| BM27 | `g2` | Derived | BM07,BM23 | `R(BM07+BM23)` | BM28, father projection |
| BM28 | `g1` | Derived | BM07,BM27 | `R(BM07+BM27)` | talent projection |
| BM29 | `h2` | Derived | BM08,BM23 | `R(BM08+BM23)` | BM30, mother projection |
| BM30 | `h1` | Derived | BM08,BM29 | `R(BM08+BM29)` | talent projection |
| BM31 | `i2` | Derived | BM09,BM23 | `R(BM09+BM23)` | BM32, mother projection |
| BM32 | `i1` | Derived | BM09,BM31 | `R(BM09+BM31)` | talent projection |

### Unknown registry

```ts
type UnknownMatrixNode = {
  id: `BMX${string}`;
  status: "unresolved";
  parents: [];
  formula: null;
  value: null;
  evidence: string[];
};
```

Bhumi V1 does not create speculative unknown nodes. New nodes require an engine-version increment.

## 4. Dependency Graph

```text
INPUT_DAY ──> BM01 ─┬─> BM06 ─────────────┐
INPUT_MONTH -> BM02 ┘                      │
                                          ├─> BM23 -> BM24–BM32
BM02 ───────────────┬─> BM07 ─────────────┤
INPUT_YEAR -> BM03 ─┘                      │
                                          │
BM01+BM02+BM03 -> BM04 ─┬─> BM08 ─────────┤
BM03 ───────────────────┴─> BM09 ─────────┘

BM01+BM02+BM03+BM04 -> BM05

BM04+BM05 -> BM10 -> BM17
BM03+BM05 -> BM11 -> BM16
BM01+BM05 -> BM12 -> BM14
BM02+BM05 -> BM13 -> BM15

BM12+BM05 -> BM18
BM13+BM05 -> BM19

BM10+BM11 -> BM20
BM10+BM20 -> BM21
BM20+BM11 -> BM22
```

### Edge rules

- Every parent relationship is stored as an edge.
- Formula evaluation follows topological order.
- Cycles are invalid.
- A node may not read an unregistered value.
- Projection calculations may consume graph nodes or earlier nodes within the same projection.
- Projections may not become hidden parents of graph nodes.

## 5. Projection Registry

Projections contain references and optional projection-local formulas. They do not duplicate structural values.

| Projection | Nodes consumed | Dependency path | New calculated values | Confidence |
| --- | --- | --- | --- | ---: |
| Center | BM05 | roots → BM04 → BM05 | None | 100% Bhumi standard |
| Love Line | BM12,BM05,BM13 | roots → BM04/BM05 → BM12/BM13 | None | 100% Bhumi standard |
| Money Line | BM10,BM05,BM11 | roots → BM04/BM05 → BM10/BM11 | None | 100% Bhumi standard |
| Karmic Tail | BM04,BM17,BM10 | roots → BM04/BM05 → BM10 → BM17 | None | 100% Bhumi standard |
| Father Line | BM06,BM07,BM03 | roots → BM06/BM07 | None | 100% Bhumi standard |
| Mother Line | BM08,BM09,BM04 | roots → BM04 → BM08/BM09 | None | 100% Bhumi standard |
| Family Square | BM06,BM07,BM09,BM08 | roots → outer derived nodes | None | 100% Bhumi standard |
| Family Center | BM23 | family square → BM23 | None | 100% Bhumi standard |
| Father descendants | BM25,BM27 | family square → BM23 → descendants | None | 100% Bhumi standard |
| Mother descendants | BM29,BM31 | family square → BM23 → descendants | None | 100% Bhumi standard |
| Talent path | BM26,BM28,BM30,BM32 | family descendants | None | 100% Bhumi standard |
| Health Matrix | BM01,BM02,BM03,BM04,BM05,BM10,BM11,BM12,BM13,BM14,BM15,BM18,BM19 | graph closure | 7 row results + 3 totals | 100% formula / labels Bhumi-owned |
| Socialization | PR-SOCIAL | family projections | 3 purpose intermediates | 100% Bhumi standard |
| Soul Searching | none | unresolved | None | 0%; disabled |
| Spiritual Knowledge | none | unresolved | None | 0%; disabled |
| Age Timeline | BM01–BM04,BM06–BM09 | outer graph → eight segment trees | 56 timeline nodes | 100% formula / age labels unresolved |

### Purpose projection formulas

```text
PR-SKY       = R(BM02 + BM04)
PR-EARTH     = R(BM01 + BM03)
PR-PERSONAL  = R(PR-SKY + PR-EARTH)
PR-FEMALE    = R(BM07 + BM08)
PR-MALE      = R(BM06 + BM09)
PR-SOCIAL    = R(PR-FEMALE + PR-MALE)
PR-GENERAL   = R(PR-PERSONAL + PR-SOCIAL)
PR-PLANETARY = R(PR-SOCIAL + PR-GENERAL)
```

Only `PR-SOCIAL` is registered as the V1 Socialization projection. Soul Searching and Spiritual Knowledge remain unsupported.

### Health projection

Health cells reference graph node IDs:

```ts
const healthRows = [
  { id: "H01", physical: "BM01", energy: "BM02" },
  { id: "H02", physical: "BM14", energy: "BM15" },
  { id: "H03", physical: "BM12", energy: "BM13" },
  { id: "H04", physical: "BM18", energy: "BM19" },
  { id: "H05", physical: "BM05", energy: "BM05" },
  { id: "H06", physical: "BM10", energy: "BM11" },
  { id: "H07", physical: "BM03", energy: "BM04" },
];
```

For every row:

```text
emotion = R(value(physical) + value(energy))
```

Totals:

```text
physicalTotal = R(sum(row physical values))
energyTotal   = R(sum(row energy values))
emotionTotal  = R(sum(row emotion values))
```

### Timeline projection

Timeline consumes the outer ring:

```text
BM01 → BM06 → BM02 → BM07 → BM03 → BM09 → BM04 → BM08 → BM01
```

For each segment `(A,B)`:

```text
M  = R(A+B)
L1 = R(A+M)
L2 = R(A+L1)
L3 = R(M+L1)
R1 = R(M+B)
R2 = R(M+R1)
R3 = R(R1+B)
```

V1 stores segment order but does not assign ages until an explicit age-boundary standard is approved.

## 6. Canonical Schema

```ts
type MatrixNodeKind = "root" | "derived";

type DestinyMatrixNode = {
  id: string;
  kind: MatrixNodeKind;
  value: number;
  parentIds: string[];
  formulaId: string;
};

type DestinyMatrixEdge = {
  from: string;
  to: string;
};

type DestinyMatrixProjectionNode = {
  id: string;
  value: number;
  parentIds: string[];
  formulaId: string;
};

type DestinyMatrixProjection = {
  id: string;
  status: "ready" | "unsupported";
  nodeIds: string[];
  derivedNodes: DestinyMatrixProjectionNode[];
  confidence: number;
};

type DestinyMatrixTimelineSegment = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  projectionNodeIds: string[];
  ageStart: number | null;
  ageEnd: number | null;
};

type DestinyMatrixTimeline = {
  status: "calculated_unmapped" | "ready";
  nodes: DestinyMatrixProjectionNode[];
  segments: DestinyMatrixTimelineSegment[];
};

type DestinyMatrixGraph = {
  schemaVersion: "1.0.0";
  engineVersion: "bhumi-matrix-1.0.0";
  standard: {
    owner: "Bhumi";
    valueDomain: "arcana-1-22";
    reduction: "recursive-digit-sum";
    topology: "calculation-graph";
  };
  input: {
    birthDate: string;
    inputHash: string;
  };
  nodes: DestinyMatrixNode[];
  edges: DestinyMatrixEdge[];
  projections: DestinyMatrixProjection[];
  timeline: DestinyMatrixTimeline;
  unresolved: UnknownMatrixNode[];
  calculatedAt: string;
};
```

### Storage invariants

1. Every calculated value exists exactly once as a node.
2. Feature paths store node IDs, not copied values.
3. Projection-local values are stored only inside their projection.
4. Edges must match node `parentIds`.
5. Display coordinates are never stored in `destinyMatrixGraph`.
6. Unsupported projections have empty `nodeIds`, no derived nodes, and explicit status.
7. Legacy letter keys are migration metadata only.
8. Storage must be deterministic for the same date and engine version, excluding `calculatedAt`.

## 7. Golden Dataset

Only these fixtures are valid for V1 acceptance.

### Root and primary nodes

| Node | Widhi 1985-05-03 | Aya 2012-06-16 | Sheina 1988-10-17 | Bayu 1989-01-06 |
| --- | ---: | ---: | ---: | ---: |
| BM01 | 3 | 16 | 17 | 6 |
| BM02 | 5 | 6 | 10 | 1 |
| BM03 | 5 | 5 | 8 | 9 |
| BM04 | 13 | 9 | 8 | 16 |
| BM05 | 8 | 9 | 7 | 5 |
| BM06 | 8 | 22 | 9 | 7 |
| BM07 | 10 | 11 | 18 | 10 |
| BM08 | 16 | 7 | 7 | 22 |
| BM09 | 18 | 14 | 16 | 7 |

### Remaining graph nodes

| Node | Widhi | Aya | Sheina | Bayu |
| --- | ---: | ---: | ---: | ---: |
| BM10 | 21 | 18 | 15 | 21 |
| BM11 | 13 | 14 | 15 | 14 |
| BM12 | 11 | 7 | 6 | 11 |
| BM13 | 13 | 15 | 17 | 6 |
| BM14 | 14 | 5 | 5 | 17 |
| BM15 | 18 | 21 | 9 | 7 |
| BM16 | 18 | 19 | 5 | 5 |
| BM17 | 7 | 9 | 5 | 10 |
| BM18 | 19 | 16 | 13 | 16 |
| BM19 | 21 | 6 | 6 | 11 |
| BM20 | 7 | 5 | 3 | 8 |
| BM21 | 10 | 5 | 18 | 11 |
| BM22 | 20 | 19 | 18 | 22 |
| BM23 | 7 | 9 | 5 | 10 |
| BM24 | 15 | 18 | 12 | 15 |
| BM25 | 15 | 4 | 14 | 17 |
| BM26 | 5 | 8 | 5 | 6 |
| BM27 | 17 | 20 | 5 | 20 |
| BM28 | 9 | 4 | 5 | 3 |
| BM29 | 5 | 16 | 12 | 5 |
| BM30 | 21 | 5 | 19 | 9 |
| BM31 | 7 | 5 | 21 | 17 |
| BM32 | 7 | 19 | 10 | 6 |

### Core projection fixtures

| Projection | Widhi | Aya | Sheina | Bayu |
| --- | --- | --- | --- | --- |
| Center | `[8]` | `[9]` | `[7]` | `[5]` |
| Love | `[11,8,13]` | `[7,9,15]` | `[6,7,17]` | `[11,5,6]` |
| Money | `[21,8,13]` | `[18,9,14]` | `[15,7,15]` | `[21,5,14]` |
| Karmic Tail | `[13,7,21]` | `[9,9,18]` | `[8,5,15]` | `[16,10,21]` |
| Father Line | `[8,10,5]` | `[22,11,5]` | `[9,18,8]` | `[7,10,9]` |
| Mother Line | `[16,18,13]` | `[7,14,9]` | `[7,16,8]` | `[22,7,16]` |
| Socialization | `16` | `9` | `14` | `19` |

## 8. Migration Plan

```text
Legacy Engine
    ↓ read-only adapter
Canonical Graph
    ↓ ID-based projections
Projection Layer
    ↓ future explicit opt-in
Interpretation Layer
```

### Phase A — Parallel engine

- Keep legacy calculator unchanged and reference-only.
- Implement `lib/destinyMatrixGraph/` as an independent module.
- Add node registry, formula registry, evaluator, projection registry, validator, and golden fixtures.
- Do not read legacy `rawPoints` during calculation.

### Phase B — Verification

- Assert all 32 golden node values.
- Assert graph acyclicity.
- Assert every parent exists.
- Assert every projection references registered nodes.
- Assert deterministic serialized output.
- Assert unsupported projections remain unsupported.

### Phase C — Storage introduction

- Add optional `destinyMatrixGraph` beside legacy `destinyMatrix`.
- New blueprint generation writes both during a controlled transition.
- Existing documents are backfilled from birth date, never by translating legacy values.
- Record engine version and input hash.

### Phase D — Projection migration

- Create compatibility selectors:

```text
legacy center       <- projection CENTER
legacy loveLine     <- projection LOVE
legacy moneyLine    <- projection MONEY
legacy karmicTail   <- projection KARMIC_TAIL
legacy fatherLine   <- projection FATHER_LINE
legacy motherLine   <- projection MOTHER_LINE
legacy chartHeart   <- projection HEALTH
legacy years        <- projection TIMELINE
```

- Consumers migrate to projection IDs.
- No consumer may read graph internals by legacy letter key.

### Phase E — Legacy retirement

- Stop writing legacy engine output after projection-consumer parity is verified.
- Retain a read adapter for old records.
- Remove legacy calculation only in a separately approved release.
- Interpretation remains downstream and must never write into graph storage.

## 9. Required Implementation Modules

```text
lib/destinyMatrixGraph/
├── types.ts
├── reduction.ts
├── registry.ts
├── formulas.ts
├── evaluator.ts
├── edges.ts
├── projections.ts
├── timeline.ts
├── validateGraph.ts
├── calculateBhumiMatrix.ts
└── goldenFixtures.ts
```

No UI module belongs in this package.

## 10. Acceptance Criteria

- Exactly 32 active graph nodes.
- Exactly 3 root and 29 derived nodes.
- No display coordinates or content fields.
- No duplicated structural values in projections.
- All edges explicit.
- Golden fixtures pass for all four approved users.
- Soul Searching and Spiritual Knowledge are explicitly unsupported.
- Timeline arithmetic is available without fabricated age labels.
- TypeScript and production build pass.
- Legacy systems remain behaviorally unchanged during parallel introduction.

## 11. Risk Analysis

### High

- Accidentally treating the Bhumi standard as historical Ladini parity.
- Copying values into projections instead of storing references.
- Translating legacy records instead of recalculating from birth date.
- Exposing unsupported projections as zero or inferred values.
- Assigning timeline ages without an approved boundary standard.

### Medium

- Existing consumers depend on legacy field shapes.
- Recursive reduction differs from the legacy one-pass implementation for hypothetical larger values.
- The graph contains currently unused nodes whose future role must remain versioned.
- Firestore size increases temporarily while both legacy and canonical roots coexist.

### Mitigations

- Store owner and engine standard metadata.
- Use strict registries and graph validation.
- Backfill from source input only.
- Keep compatibility mapping at repository boundaries.
- Require an engine-version bump for any node/formula/projection change.

## 12. Final Status

**READY FOR IMPLEMENTATION**

The missing external visual topology no longer blocks Bhumi Matrix V1 because:

1. Bhumi defines calculation topology independently of rendering.
2. All active graph nodes and dependencies are explicit.
3. Projection boundaries are explicit.
4. Unsupported features remain unsupported instead of guessed.
5. The four-user golden dataset is complete.
6. Migration can proceed in parallel without changing locked consumers.
