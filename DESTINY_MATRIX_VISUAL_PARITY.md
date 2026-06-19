# Destiny Matrix Visual Parity Audit

## Final Status

**VISUAL REQUIRES REMEDIATION**

Bhumi Matrix Engine V1 is locked, but the Destiny Matrix visual layer has no canonical-engine connection.

Current flow:

```text
Legacy blueprint.destinyMatrix
    ↓
app/blueprint/destiny-matrix/page.tsx
    ↓
components/blueprint/DestinyMatrixVisual.tsx
```

Required flow:

```text
destinyMatrix.graph + projections + timeline
    ↓
visual read adapter
    ↓
DestinyMatrixVisual
```

No visual element currently consumes `calculateBhumiMatrix`, `DestinyMatrixGraph`, or canonical projection IDs.

## 1. Visual Mapping Table

| Visual element | Current source | Engine source | Canonical projection source | Missing mapping | Legacy mapping |
| --- | --- | --- | --- | --- | --- |
| Center | `matrix.center ?? matrix.arcanaCenter` | `BM05` | `CENTER` | Resolve projection node IDs to graph values | `destinyMatrix.center` / `arcanaCenter` |
| Soul Searching | `matrix.destinyIntelligence.soulSearching` | None | `SOUL_SEARCHING`, status `unsupported` | Visual must display unsupported state, not a generic empty value | Optional legacy intelligence field |
| Socialization | `matrix.destinyIntelligence.socialization` | `PR-SOCIAL` | `SOCIALIZATION` | Read canonical projection and resolve `PR-SOCIAL` | Optional legacy intelligence field; normally absent |
| Spiritual Knowledge | `matrix.destinyIntelligence.spiritualKnowledge` | None | `SPIRITUAL_KNOWLEDGE`, status `unsupported` | Visual must display unsupported state | Optional legacy intelligence field |
| Ancestor | `matrix.ancestorLine` | `PR-FEMALE`, `PR-MALE`, `PR-SOCIAL` exist | No locked `ANCESTOR` projection | Add mapping only in a separately approved projection-expansion phase | `[femalepoint, malepoint, socialpurpose]` |
| Father | `matrix.fatherLine` | `BM06`, `BM07`, `BM03` | `FATHER_LINE` | Canonical visual adapter | `[fpoint, gpoint, cpoint]` |
| Mother | `matrix.motherLine` | `BM08`, `BM09`, `BM04` | `MOTHER_LINE` | Canonical visual adapter | `[hpoint, ipoint, dpoint]` |
| Love | `matrix.loveLine` | `BM12`, `BM05`, `BM13` | `LOVE` | Canonical visual adapter | `[spoint, epoint, tpoint]` |
| Money | `matrix.moneyLine` | `BM10`, `BM05`, `BM11` | `MONEY` | Canonical visual adapter | `[jpoint, epoint, npoint]` |
| Karmic/Shadow | `matrix.karmicTail` | `BM04`, `BM17`, `BM10` | `KARMIC_TAIL` | Canonical visual adapter | `[dpoint, rpoint, jpoint]` |
| Talent | `matrix.talentsGreat || matrix.talents` | `BM26`, `BM28`, `BM30`, `BM32` | `TALENT_PATH` | Canonical visual adapter | `[f1point, g1point, h1point, i1point]` |
| Health Matrix | `destinyIntelligence.healthChart || healthChart || chakraMatrix` | Structural and health projection nodes | `HEALTH`, with row mapping in `details.rows` | Resolve row node IDs and total IDs into table values | Legacy normalized `chartHeart` |
| Age Timeline | `Object.entries(matrix.years)` | `T01-*` through `T08-*` | Canonical `timeline` object | Segment-aware adapter and non-age labels | 56 symbolic keys such as `afpoint`, `fb1point` |

## 2. Current Visual Components

### Destiny Matrix page

`app/blueprint/destiny-matrix/page.tsx` reads:

```text
blueprint.destinyMatrix
```

It never reads a canonical graph root and never calls the Bhumi Matrix engine.

The audit cards consume only legacy paths:

| Card | Current status |
| --- | --- |
| Center Arcana | Legacy |
| Common Energy | Hardcoded `undefined` |
| Karmic Tail | Legacy |
| Father Line | Legacy |
| Mother Line | Legacy |
| Ancestor Line | Legacy |
| Talent Line | Legacy |
| Money Line | Legacy |
| Love Line | Legacy |
| Health / Chakra Matrix | Legacy |
| Age Cycle / Year Cycle | Legacy |

### Destiny Matrix visual

`components/blueprint/DestinyMatrixVisual.tsx` accepts an untyped legacy record. Its six outer circles are feature containers, not canonical graph positions:

- Father
- Mother
- Love
- Money
- Ancestor
- Talents

Only the center circle maps directly to a single engine node.

The polygon, rotated square, radial lines, and coordinates are visual-only geometry. They do not represent the locked 32-node graph topology.

### Profile Destiny Matrix tab

`components/profile/DestinyMatrixTab.tsx` consumes prebuilt narrative strings. It has no direct engine or projection mapping and is outside visual-number parity.

## 3. Missing Projection Table

| Feature | Canonical status | Visual status | Required action |
| --- | --- | --- | --- |
| Center | Ready | Legacy-only | Map `CENTER` |
| Love | Ready | Legacy-only | Map `LOVE` |
| Money | Ready | Legacy-only | Map `MONEY` |
| Karmic Tail | Ready | Legacy-only | Map `KARMIC_TAIL` |
| Father | Ready | Legacy-only | Map `FATHER_LINE` |
| Mother | Ready | Legacy-only | Map `MOTHER_LINE` |
| Talent | Ready | Legacy-only | Map `TALENT_PATH` |
| Health | Ready | Legacy-only | Resolve `HEALTH.details.rows` and totals |
| Socialization | Ready | Usually empty | Map `SOCIALIZATION` |
| Timeline | Ready but unmapped | Legacy-only | Read canonical timeline segments |
| Soul Searching | Unsupported | Empty dash | Show explicit unsupported state |
| Spiritual Knowledge | Unsupported | Empty dash | Show explicit unsupported state |
| Ancestor | Missing canonical projection | Legacy-only | Requires approved projection expansion |

## 4. Empty Cards Despite Available Engine Data

### Socialization

The visual reads:

```text
destinyIntelligence.socialization
```

Bhumi Matrix V1 already calculates and exposes:

```text
SOCIALIZATION → PR-SOCIAL
```

This card can be populated without changing graph formulas or topology.

### Health Matrix

The canonical `HEALTH` projection provides:

- seven row definitions;
- physical node IDs;
- energy node IDs;
- emotion node IDs;
- three total node IDs.

The visual remains empty whenever legacy health normalization is absent, despite the canonical graph having complete data.

### Center, Father, Mother, Love, Money, Talent, and Karmic Tail

These are not normally empty in newly generated legacy blueprints, but they remain disconnected from the locked source of truth. They can become empty for records lacking legacy fields even when canonical graph data exists.

### Common Energy

The audit page explicitly passes `undefined`.

There is no approved Bhumi Matrix V1 `COMMON_ENERGY` projection. It must not be silently mapped to Center, Family Center, Socialization, or another node.

## 5. Legacy Usage Table

| Legacy path | Visual consumer | Canonical replacement |
| --- | --- | --- |
| `destinyMatrix.center` | Center circle and audit card | `CENTER` |
| `destinyMatrix.arcanaCenter` | Center fallback | `CENTER` |
| `destinyMatrix.fatherLine` | Father circle/card | `FATHER_LINE` |
| `destinyMatrix.motherLine` | Mother circle/card | `MOTHER_LINE` |
| `destinyMatrix.loveLine` | Love circle/card | `LOVE` |
| `destinyMatrix.moneyLine` | Money circle/card | `MONEY` |
| `destinyMatrix.karmicTail` | Shadow text/card | `KARMIC_TAIL` |
| `destinyMatrix.ancestorLine` | Ancestor circle/card | No locked replacement |
| `destinyMatrix.talentsGreat` | Talent circle/card | `TALENT_PATH` |
| `destinyMatrix.talents` | Talent fallback | `TALENT_PATH` |
| `destinyMatrix.chartHeart` | Indirect health normalization | `HEALTH` |
| `destinyMatrix.healthChart` | Health table | `HEALTH` |
| `destinyMatrix.chakraMatrix` | Health table | `HEALTH` |
| `destinyMatrix.destinyIntelligence.healthChart` | Health table | `HEALTH` |
| `destinyMatrix.destinyIntelligence.socialization` | Socialization card | `SOCIALIZATION` |
| `destinyMatrix.destinyIntelligence.soulSearching` | Soul card | Unsupported |
| `destinyMatrix.destinyIntelligence.spiritualKnowledge` | Spiritual card | Unsupported |
| `destinyMatrix.years` | Timeline strip/card | Canonical `timeline` |

Current canonical visual consumers: **0**

Current legacy visual consumers: **all displayed Matrix values**

## 6. Canonical Visual Adapter Plan

The visual should not inspect graph formulas or legacy keys. A read adapter should:

1. Accept `CanonicalDestinyMatrix`.
2. Index `graph.nodes` by node ID.
3. Index `projections` by projection ID.
4. Resolve projection `nodeIds` to values.
5. Resolve Health row IDs from projection details.
6. Read timeline only from the top-level canonical `timeline`.
7. Return explicit statuses:
   - `ready`
   - `unsupported`
   - `calculated_unmapped`
   - `missing`

Conceptual output:

```ts
type DestinyMatrixVisualModel = {
  center: VisualValue;
  father: VisualPath;
  mother: VisualPath;
  love: VisualPath;
  money: VisualPath;
  karmic: VisualPath;
  talents: VisualPath;
  ancestor: VisualPath | UnsupportedValue;
  socialization: VisualValue;
  soulSearching: UnsupportedValue;
  spiritualKnowledge: UnsupportedValue;
  health: VisualHealthRows;
  timeline: VisualTimelineSegments;
};
```

The adapter must not calculate, infer, or persist values.

## 7. Timeline Humanization Plan

### Current problem

Legacy UI displays internal keys such as:

```text
afpoint
af1point
fbpoint
```

These are calculation identifiers, not meaningful age labels.

Canonical timeline has:

- eight ordered segments `T01–T08`;
- source and destination graph nodes;
- seven calculated nodes per segment;
- `ageStart: null`;
- `ageEnd: null`;
- status `calculated_unmapped`.

### Safe humanization now

Until age boundaries are approved, the visual may show:

```text
Segment 1 · Point 1
Segment 1 · Point 2
...
Segment 8 · Point 7
```

or:

```text
T01-M
T01-L1
...
```

It may also group values by segment and display the segment endpoints.

### Forbidden humanization

Do not label segments:

- ages 0–10;
- ages 10–20;
- yearly cycles;
- half-year boundaries;
- current age.

Those mappings are not part of the locked engine.

### Future age-label phase

Age humanization requires a separately approved metadata layer:

```ts
type TimelineLabelMap = {
  segmentId: string;
  nodeId: string;
  ageStart: number;
  ageEnd: number;
};
```

This belongs outside graph formulas.

## 8. Ancestor Mapping Plan

### Legacy source

Legacy Ancestor Line is:

```text
[femalepoint, malepoint, socialpurpose]
```

### Existing canonical nodes

The locked graph already calculates:

- `PR-FEMALE`
- `PR-MALE`
- `PR-SOCIAL`

### Missing piece

There is no locked `ANCESTOR` projection selecting those nodes.

### Safe plan

In a separately approved projection-expansion phase:

```text
ANCESTOR → [PR-FEMALE, PR-MALE, PR-SOCIAL]
```

This would add no formula, node, or topology. It would add only a projection registry entry.

Until approved:

- canonical Ancestor status should be `missing_projection`;
- the visual may continue legacy fallback only if clearly marked as legacy;
- canonical-only mode should not infer the path.

## 9. Visual Geometry Assessment

The current graphic is not a rendering of the locked graph:

- six outer circles display arrays rather than graph nodes;
- the diamond and rotated square have no node-coordinate registry;
- 32 structural nodes are not positioned;
- 71 projection-calculation nodes are not intended as visual positions;
- timeline and health values are rendered outside the graphic.

Therefore visual parity should mean **data-source parity**, not geometric graph parity.

A true canonical graph diagram would require a separate, approved visual-coordinate registry. It must not be inferred from formulas.

## 10. Remediation Order

1. Persist or calculate `CanonicalDestinyMatrix` at an approved storage/read boundary.
2. Add a read-only canonical visual adapter.
3. Switch ready elements to projection IDs.
4. Populate Socialization and Health from canonical projections.
5. Render Soul Searching and Spiritual Knowledge as unsupported.
6. Replace legacy timeline keys with segment/point labels.
7. Add Ancestor only after projection expansion approval.
8. Remove legacy visual fallbacks after stored canonical coverage is complete.

## Final Status

**VISUAL REQUIRES REMEDIATION**

Reasons:

- zero current visual elements consume canonical projections;
- every displayed value still reads legacy storage;
- Socialization and Health can be canonical but are unmapped;
- Soul Searching and Spiritual Knowledge do not communicate unsupported status;
- Ancestor lacks a locked projection;
- timeline displays internal legacy keys as if they were human labels;
- current geometry is a feature-summary graphic, not the locked graph topology.

