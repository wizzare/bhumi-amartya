# Destiny Matrix Source of Truth

## Scope and Verdict

This document audits calculation structure only. It does not define meanings, content, narratives, UI, Gaia behavior, or Arcana interpretation.

**Final decision: BLOCKED BY FORMULA AMBIGUITY**

The repository contains a deterministic and internally reproducible calculation family. It does **not** contain enough authoritative topology or source provenance to claim that its full 32-node structural graph, reading paths, Health Matrix, and 56-value age perimeter are the canonical Natalia Ladini system.

The root diamond and first-order center formulas are sufficiently stable to retain. The complete 22-position registry, unknown positions 11/14/15/19/20/21/22, path semantics, and age-to-node mapping must not be declared production source-of-truth yet.

## Method

Evidence classes used here:

- **Code-proven**: directly and deterministically present in `lib/calculations/destinyMatrix/energy.ts`.
- **Geometry-supported**: consistent with the common octagram layout and local formula dependencies, but not backed by an authoritative coordinate registry in this repository.
- **Label-only**: a feature name is assigned in `mapToBlueprint.ts`, but its canonical meaning has not been demonstrated.
- **Unverified**: no authoritative formula or position mapping was found.

Arcana reduction in the active engine is:

```text
R(n) = n, when n <= 22
R(n) = tens(n) + ones(n), when n > 22
```

For values produced by this engine, one pass is sufficient. Zero is retained as zero, although valid birth-derived structural sums do not normally produce it.

## 1. Position Registry

The requested stable IDs are assigned without inventing names. A descriptive location is included only where geometry is supported.

| ID | Current key | Position/location | Status | Confidence |
| --- | --- | --- | --- | --- |
| P01 | `bpoint` | Top root | Mapped | 95% |
| P02 | `apoint` | Left root | Mapped | 95% |
| P03 | `cpoint` | Right root | Mapped | 95% |
| P04 | `dpoint` | Bottom root | Mapped | 95% |
| P05 | `fpoint` | Top-left corner | Mapped | 95% |
| P06 | `gpoint` | Top-right corner | Mapped | 95% |
| P07 | `ipoint` | Bottom-right corner | Mapped | 95% |
| P08 | `hpoint` | Bottom-left corner | Mapped | 95% |
| P09 | `epoint` | Personal center | Mapped | 98% |
| P10 | `tpoint` | Between top root and center | Geometry-supported | 80% |
| P11 | `jpoint` | Between bottom root and center | Geometry-supported; requested unknown | 80% |
| P12 | `fpoint` | Family square top-left vertex | Alias of P05, not a new node | 65% |
| P13 | `gpoint` | Family square top-right vertex | Alias of P06, not a new node | 65% |
| P14 | `ipoint` | Family square bottom-right vertex | Alias of P07; requested unknown | 65% |
| P15 | `hpoint` | Family square bottom-left vertex | Alias of P08; requested unknown | 65% |
| P16 | `upoint` | Family aggregate/center candidate | Formula known; geometry unverified | 60% |
| P17 | `spoint` | Between left root and center | Formula known; canonical ID uncertain | 70% |
| P18 | `npoint` | Between right root and center | Formula known; canonical ID uncertain | 70% |
| P19 | `opoint` | Left-root inner descendant | Formula known; topology unverified | 55% |
| P20 | `ppoint` | Top-root inner descendant | Formula known; topology unverified | 55% |
| P21 | `rpoint` | Bottom-root inner descendant | Formula known; topology unverified | 55% |
| P22 | `qpoint` | Right-root inner descendant | Formula known; topology unverified | 55% |

### Registry warning

This registry is a compatibility registry, not proof of a canonical 22-node Ladini chart. The local engine additionally calculates:

```text
kpoint, lpoint, mpoint, vpoint, wpoint, xpoint
f1point, f2point, g1point, g2point
h1point, h2point, i1point, i2point
```

Therefore:

- `P12–P15` cannot simultaneously be new family-square nodes and aliases of `P05–P08`.
- The local `a–x` family has 24 keys, not 22.
- There is no stored coordinate table proving which two lettered keys are outside the “22 active positions.”
- A production registry needs an authoritative diagram with coordinate-to-formula mapping.

## 2. Formula Registry

### Root, rhombus, and center

| Position | Parents | Formula | Confidence |
| --- | --- | --- | --- |
| P02 / `a` | birth day | `R(day)` | 98% |
| P01 / `b` | birth month | `month` | 98% |
| P03 / `c` | birth year digits | `R(sum(year digits))` | 98% |
| P04 / `d` | P02, P01, P03 | `R(a+b+c)` | 98% |
| P05 / `f` | P02, P01 | `R(a+b)` | 95% |
| P06 / `g` | P01, P03 | `R(b+c)` | 95% |
| P07 / `i` | P03, P04 | `R(c+d)` | 95% |
| P08 / `h` | P04, P02 | `R(d+a)` | 95% |
| P09 / `e` | P02, P01, P03, P04 | `R(a+b+c+d)` | 98% |

### Axis and inner structural formulas

| Position/key | Parents | Formula | Confidence |
| --- | --- | --- | --- |
| P10 / `t` | P01, P09 | `R(b+e)` | 85% formula / 70% topology |
| P11 / `j` | P04, P09 | `R(d+e)` | 90% formula / 75% topology |
| P17 / `s` | P02, P09 | `R(a+e)` | 90% formula / 75% topology |
| P18 / `n` | P03, P09 | `R(c+e)` | 90% formula / 75% topology |
| P19 / `o` | P02, P17 | `R(a+s)` | 90% formula / 55% topology |
| P20 / `p` | P01, P10 | `R(b+t)` | 90% formula / 55% topology |
| P21 / `r` | P11, P04 | `R(j+d)` | 90% formula / 55% topology |
| P22 / `q` | P18, P03 | `R(n+c)` | 90% formula / 55% topology |
| `l` | P11, P18 | `R(j+n)` | 90% formula / 50% topology |
| `k` | P11, `l` | `R(j+l)` | 90% formula / 45% topology |
| `m` | `l`, P18 | `R(l+n)` | 90% formula / 45% topology |
| P16 / `u` | P05, P06, P08, P07 | `R(f+g+h+i)` | 95% formula / 60% label |
| `v` | P09, P16 | `R(e+u)` | 95% formula / 45% topology |
| `w` | P17, P09 | `R(s+e)` | 95% formula / 50% topology |
| `x` | P10, P09 | `R(t+e)` | 95% formula / 50% topology |

### Family descendants

| Key | Parents | Formula | Confidence |
| --- | --- | --- | --- |
| `f2` | `f`, `u` | `R(f+u)` | 95% formula / 50% role |
| `f1` | `f`, `f2` | `R(f+f2)` | 95% formula / 50% role |
| `g2` | `g`, `u` | `R(g+u)` | 95% formula / 50% role |
| `g1` | `g`, `g2` | `R(g+g2)` | 95% formula / 50% role |
| `h2` | `h`, `u` | `R(h+u)` | 95% formula / 50% role |
| `h1` | `h`, `h2` | `R(h+h2)` | 95% formula / 50% role |
| `i2` | `i`, `u` | `R(i+u)` | 95% formula / 50% role |
| `i1` | `i`, `i2` | `R(i+i2)` | 95% formula / 50% role |

## 3. Dependency Graph

```text
birth day ──> a/P02 ─┬─> f/P05 ─┐
birth month -> b/P01 ┘           │
                                 ├─> u/P16 ─> f/g/h/i descendants
b/P01 ───────┬─> g/P06 ──────────┤
birth year -> c/P03 ┘             │
                                  │
a + b + c ─> d/P04 ─┬─> h/P08 ───┤
c/P03 ───────────────┴─> i/P07 ───┘

a + b + c + d ─> e/P09

a + e -> s/P17 -> o/P19
b + e -> t/P10 -> p/P20
d + e -> j/P11 -> r/P21
c + e -> n/P18 -> q/P22

j + n -> l
j + l -> k
l + n -> m

e + u -> v
s + e -> w
t + e -> x
```

Canonical graph shape:

```ts
type MatrixNode = {
  id: string;
  value: number;
  parents: string[];
};

type DestinyMatrixGraph = {
  nodes: MatrixNode[];
};
```

For source inputs, parent IDs should use reserved IDs such as `DOB_DAY`, `DOB_MONTH`, and `DOB_YEAR_DIGITS`; they should not be hidden as constants.

## 4. Golden User Validation

Only the approved users were calculated.

### Root and core graph

| ID / key | Widhi 03-05-1985 | Aya 16-06-2012 | Sheina 17-10-1988 | Bayu 06-01-1989 |
| --- | ---: | ---: | ---: | ---: |
| P01 `b` | 5 | 6 | 10 | 1 |
| P02 `a` | 3 | 16 | 17 | 6 |
| P03 `c` | 5 | 5 | 8 | 9 |
| P04 `d` | 13 | 9 | 8 | 16 |
| P05 `f` | 8 | 22 | 9 | 7 |
| P06 `g` | 10 | 11 | 18 | 10 |
| P07 `i` | 18 | 14 | 16 | 7 |
| P08 `h` | 16 | 7 | 7 | 22 |
| P09 `e` | 8 | 9 | 7 | 5 |
| P10 `t` | 13 | 15 | 17 | 6 |
| P11 `j` | 21 | 18 | 15 | 21 |
| P16 `u` | 7 | 9 | 5 | 10 |
| P17 `s` | 11 | 7 | 6 | 11 |
| P18 `n` | 13 | 14 | 15 | 14 |
| P19 `o` | 14 | 5 | 5 | 17 |
| P20 `p` | 18 | 21 | 9 | 7 |
| P21 `r` | 7 | 9 | 5 | 10 |
| P22 `q` | 18 | 19 | 5 | 5 |

### Additional structural keys

| Key | Widhi | Aya | Sheina | Bayu |
| --- | ---: | ---: | ---: | ---: |
| `k` | 10 | 5 | 18 | 11 |
| `l` | 7 | 5 | 3 | 8 |
| `m` | 20 | 19 | 18 | 22 |
| `v` | 15 | 18 | 12 | 15 |
| `w` | 19 | 16 | 13 | 16 |
| `x` | 21 | 6 | 6 | 11 |
| `f1/f2` | 5 / 15 | 8 / 4 | 5 / 14 | 6 / 17 |
| `g1/g2` | 9 / 17 | 4 / 20 | 5 / 5 | 3 / 20 |
| `h1/h2` | 21 / 5 | 5 / 16 | 19 / 12 | 9 / 5 |
| `i1/i2` | 7 / 7 | 19 / 5 | 10 / 21 | 6 / 17 |

### Validation conclusion

- Deterministic recomputation: **PASS**
- Root arithmetic consistency: **PASS**
- Cross-user differentiation: **PASS**
- External canonical parity for all positions: **NOT ESTABLISHED**

These tables validate the repository algorithm, not the complete Ladini method.

## 5. Unknown Position Analysis

### Position 11

- Candidate: `jpoint`
- Parents: `dpoint`, `epoint`
- Formula: `R(d+e)`
- Generation: bottom root to center
- Confidence: formula 90%, canonical identity 75%

### Positions 14 and 15

The requested labels imply separate family-square bottom/right and bottom/left positions. In the current graph, the family square uses the same corner nodes `f,g,h,i` already represented by P05–P08.

- Candidate P14: alias `ipoint`
- Candidate P15: alias `hpoint`
- No evidence supports generating additional independent values.
- Confidence: 65% alias, 0% as separate nodes

### Positions 19–22

The most defensible candidates are second-order inner descendants:

| ID | Candidate | Parents | Formula | Confidence |
| --- | --- | --- | --- | --- |
| P19 | `opoint` | `a`, `s` | `R(a+s)` | 55% |
| P20 | `ppoint` | `b`, `t` | `R(b+t)` | 55% |
| P21 | `rpoint` | `j`, `d` | `R(j+d)` | 55% |
| P22 | `qpoint` | `n`, `c` | `R(n+c)` | 55% |

The formulas are certain within the local engine. Their membership in the canonical 22-node graph is unresolved because `k,l,m,v,w,x` and eight family descendants compete for the remaining positions.

## 6. Reading Layer Mapping

No meaning is endorsed here. This is only a path audit.

| Feature | Current keys | Position IDs where available | Confidence |
| --- | --- | --- | --- |
| Love Line | `s, e, t` | P17, P09, P10 | 55% label / 95% values |
| Money Line | `j, e, n` | P11, P09, P18 | 55% label / 95% values |
| Karmic Tail | `d, r, j` | P04, P21, P11 | 60% label / 95% values |
| Father Line | `f, g, c` | P05, P06, P03 | 45% |
| Mother Line | `h, i, d` | P08, P07, P04 | 45% |
| Health Matrix | `a,o,s,w,e,j,c` physical; `b,p,t,x,e,n,d` energy; row sums emotional | Mixed | 65% formulas / 40% canonical role |
| Soul Searching | no formula | none | 0% |
| Socialization | repository candidate `socialpurpose` | no stable node ID | 45% |
| Spiritual Knowledge | no formula | none | 0% |
| Age Timeline | 56 `years.*` values | outer segments, IDs not assigned | 55% arithmetic / 20% ages |

### Purpose calculations present in code

```text
sky             = R(b+d)
earth           = R(a+c)
personal        = R(sky+earth)
female          = R(g+h)
male            = R(f+i)
social          = R(female+male)
general         = R(personal+social)
planetary       = R(social+general)
```

These names are local labels. They must not be automatically equated to Soul Searching, Socialization, or Spiritual Knowledge without an authoritative mapping.

## 7. Timeline Analysis

### What the engine calculates

The engine creates eight perimeter segments:

```text
a→f, f→b, b→g, g→c, c→i, i→d, d→h, h→a
```

Each segment has seven derived values. Example for `a→f`:

```text
af  = R(a+f)
af1 = R(a+af)
af2 = R(a+af1)
af3 = R(af+af1)
af4 = R(af+f)
af5 = R(af+af4)
af6 = R(af4+f)
```

The same interpolation pattern is repeated for all eight sides, producing 56 values.

### Supported conclusion

- Timeline arithmetic is projected from the outer octagon/ring.
- It is a separate derived layer whose parents are outer structural nodes.
- It is not a separate birth-date engine.

### Unsupported conclusion

The code stores no age metadata. It does not prove:

- exact assignment of the seven values within each ten-year interval;
- whether endpoints represent integer ages, half-years, or alternating intervals;
- whether root vertices belong to the preceding or following decade;
- how age 70+ wraps to the first root;
- whether all source schools use the same perimeter progression.

Tentative segment association, based on conventional clockwise chart geometry:

| Segment | Candidate decade | Confidence |
| --- | --- | --- |
| `a→f` | 0–10 | 35% |
| `f→b` | 10–20 | 35% |
| `b→g` | 20–30 | 35% |
| `g→c` | 30–40 | 35% |
| `c→i` | 40–50 | 35% |
| `i→d` | 50–60 | 35% |
| `d→h` | 60–70 | 35% |
| `h→a` | 70–80 / 70+ | 35% |

This association must remain unimplemented until a sourced age marker diagram is obtained.

## 8. Canonical Schema

Recommended schema once unresolved mappings are sourced:

```ts
type MatrixNode = {
  id: `P${string}`;
  value: number;
  parents: string[];
  formulaId: string;
  confidence: number;
  legacyKeys: string[];
};

type MatrixPath = {
  nodeIds: string[];
  confidence: number;
  sourceRef?: string;
};

type DestinyMatrixCanonical = {
  standard: {
    school: "Natalia-Ladini";
    reduction: "digit-sum-to-22";
    schemaVersion: string;
    engineVersion: string;
  };
  root: MatrixPath;
  rhombus: MatrixPath;
  personalCenter: string;
  heavenLine: MatrixPath | null;
  earthLine: MatrixPath | null;
  familySquare: MatrixPath | null;
  familyCenter: string | null;
  nodeGraph: {
    nodes: MatrixNode[];
  };
  lovePath: MatrixPath | null;
  moneyPath: MatrixPath | null;
  karmicTail: MatrixPath | null;
  chakraMatrix: {
    rows: Array<{
      id: string;
      physicalNodeIds: string[];
      energyNodeIds: string[];
      emotionFormulaId: string;
    }>;
    confidence: number;
  } | null;
  soulSearching: { nodeIds: string[]; formulaId: string; confidence: number } | null;
  socialization: { nodeIds: string[]; formulaId: string; confidence: number } | null;
  spiritualKnowledge: { nodeIds: string[]; formulaId: string; confidence: number } | null;
  ageTimeline: {
    segments: Array<{
      fromNodeId: string;
      toNodeId: string;
      values: number[];
      ageMarkers: number[] | null;
    }>;
    confidence: number;
  } | null;
};
```

Until source ambiguity is resolved, unresolved values should be `null`, not inferred aliases.

## 9. Confidence by Section

| Section | Confidence |
| --- | ---: |
| Date parsing and root inputs | 98% |
| Root diamond and personal center arithmetic | 96% |
| First-order inner formulas | 90% |
| Family aggregate arithmetic | 95% |
| Family labels and topology | 55% |
| Complete 22-position registry | 48% |
| Love/Money/Karmic path labels | 57% |
| Health Matrix arithmetic | 65% |
| Health Matrix canonical mapping | 40% |
| Soul Searching | 0% |
| Socialization mapping | 45% |
| Spiritual Knowledge | 0% |
| Timeline interpolation arithmetic | 90% |
| Timeline age mapping | 20% |
| Overall readiness | 49% |

## 10. Risk Assessment

### Critical

- Treating 24 lettered nodes as a verified 22-node registry.
- Assigning names to P17–P22 from visual intuition.
- Shipping Soul Searching or Spiritual Knowledge without formulas.
- Persisting age ranges when the code has no age-marker contract.

### High

- Calling `u` the Family Center without a sourced coordinate map.
- Treating local Love/Money/Karmic arrays as canonical solely because they are already stored.
- Equating purpose labels to requested reading-layer terms.
- Maintaining duplicate center engines with subtly different reduction behavior.

### Medium

- Current `reduceNumber` is not a general recursive reducer; future larger formulas could return values above 22.
- The simple calculator and active energy calculator overlap.
- Legacy letter keys hide topology and make migrations error-prone.
- No source/version metadata is stored with current results.

## 11. Final Decision

**BLOCKED BY FORMULA AMBIGUITY**

Ready now:

- Freeze date parsing and reduction rules.
- Preserve root nodes P01–P09.
- Preserve formulas as a legacy calculation graph with explicit confidence.
- Store parent dependencies and legacy keys.
- Generate reproducible golden-user fixtures for Widhi, Aya, Sheina, and Bayu.

Not ready:

- Claiming a canonical 22-position graph.
- Naming unknown positions.
- Releasing reconstructed Love, Money, Karmic, family, Health, or purpose paths as Ladini source-of-truth.
- Assigning timeline values to exact ages.

Unblocking evidence required:

1. An authoritative Natalia Ladini chart diagram with all position coordinates.
2. Formula definitions for every numbered position.
3. A sourced mapping for Love, Money, Karmic Tail, family lines, and Health Matrix rows.
4. Exact perimeter age markers and boundary convention.
5. At least one independently calculated reference chart for each of the four approved golden dates.

## Sources and Evidence

Repository evidence:

- `lib/calculations/destinyMatrix/energy.ts`
- `lib/calculations/destinyMatrix/mapToBlueprint.ts`
- `lib/calculations/calculateDestinyMatrix.ts`
- `scripts/checkDestinyMatrix.ts`
- `IDENTITY_LAYER_MASTERPLAN_V1.md`
- `docs/BHUMI_BLUEPRINT_ENGINE_SOURCE_MAP_V3_JOKER.md`

Public reference discovery did not yield an authoritative, machine-verifiable Natalia Ladini formula registry. Search results were dominated by derivative calculators and interpretive material, which is insufficient for production formula provenance. No derivative webpage was promoted to source-of-truth.
