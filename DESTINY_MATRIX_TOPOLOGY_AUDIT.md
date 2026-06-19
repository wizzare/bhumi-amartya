# Destiny Matrix Topology Audit

## Scope

This is a code-topology audit only. It does not validate meanings, interpretations, UI quality, content, or external product usage.

## Final Status

**BLOCKED BY TOPOLOGY AMBIGUITY**

The local implementation has a fully enumerable computational topology, but it does not have a verified canonical visual topology.

Code-level counts:

| Layer | Count | Definition |
| --- | ---: | --- |
| Structural calculation nodes | 32 | Keys stored in `result.points` |
| Root calculation nodes | 3 | Directly derived from date components: `a`, `b`, `c` |
| Derived structural nodes | 29 | Remaining `result.points` keys |
| Projection calculations | 74 | 56 timeline + 8 purpose + 7 health emotions + 3 health totals |
| Health aliases of existing nodes | 14 | Physical/energy cells that reference structural nodes |
| Current SVG display placements | 7 | Six feature containers plus center |

### Required count summary

- **Actual Node Count:** 32 structural calculation nodes
- **Root Node Count:** 3
- **Derived Node Count:** 29
- **Projection Node Count:** 74 computed projections
- **Display Node Count:** 7 current renderer placements

The number 22 is confirmed as the Arcana value domain. It is not established as the number of structural positions in the local engine.

## Classification Rules

- **Calculation node**: has its own computed value and can be a parent of another formula.
- **Projection node**: computed from structural nodes for a feature-specific output, but not used to construct the structural graph.
- **Display node**: a coordinate or container created by the renderer. It may display one or several calculation values and does not create a new engine value.
- **Alias**: another storage/display name for an existing calculation value.

## 1. Full Structural Node Inventory

`Displayed value` means the value available for display from the engine. Only `e` is currently rendered as an individual structural node. Other structural values are exposed through feature arrays, health cells, or raw storage.

### Root nodes

| Node ID | Legacy key | Visual position | Displayed value | Parents | Formula | Type | Confidence |
| --- | --- | --- | --- | --- | --- | --- | ---: |
| C01 | `apoint` | Outer left candidate | `a` | `DOB_DAY` | `R(day)` | Root calculation | 98% formula / 70% visual |
| C02 | `bpoint` | Outer top candidate | `b` | `DOB_MONTH` | `month` | Root calculation | 98% formula / 70% visual |
| C03 | `cpoint` | Outer right candidate | `c` | `DOB_YEAR` | `R(sum(year digits))` | Root calculation | 98% formula / 70% visual |

`dpoint` is an outer/root-looking visual position, but computationally it is derived. Root count is therefore three, not four.

### Primary derived structure

| Node ID | Legacy key | Visual position | Displayed value | Parent nodes | Formula | Type | Confidence |
| --- | --- | --- | --- | --- | --- | --- | ---: |
| C04 | `dpoint` | Outer bottom candidate | `d` | C01,C02,C03 | `R(a+b+c)` | Derived calculation | 98% / 70% |
| C05 | `epoint` | Center | `e` | C01,C02,C03,C04 | `R(a+b+c+d)` | Derived calculation | 98% / 98% |
| C06 | `fpoint` | Outer top-left corner candidate | `f` | C01,C02 | `R(a+b)` | Derived calculation | 98% / 70% |
| C07 | `gpoint` | Outer top-right corner candidate | `g` | C02,C03 | `R(b+c)` | Derived calculation | 98% / 70% |
| C08 | `hpoint` | Outer bottom-left corner candidate | `h` | C04,C01 | `R(d+a)` | Derived calculation | 98% / 70% |
| C09 | `ipoint` | Outer bottom-right corner candidate | `i` | C03,C04 | `R(c+d)` | Derived calculation | 98% / 70% |

### Inner horizontal/vertical candidates

| Node ID | Legacy key | Visual position | Displayed value | Parent nodes | Formula | Type | Confidence |
| --- | --- | --- | --- | --- | --- | --- | ---: |
| C10 | `jpoint` | Between bottom and center candidate | `j` | C04,C05 | `R(d+e)` | Derived calculation | 98% / 60% |
| C11 | `npoint` | Between right and center candidate | `n` | C03,C05 | `R(c+e)` | Derived calculation | 98% / 60% |
| C12 | `spoint` | Between left and center candidate | `s` | C01,C05 | `R(a+e)` | Derived calculation | 98% / 60% |
| C13 | `tpoint` | Between top and center candidate | `t` | C02,C05 | `R(b+e)` | Derived calculation | 98% / 60% |
| C14 | `opoint` | Left inner descendant candidate | `o` | C01,C12 | `R(a+s)` | Derived calculation | 98% / 45% |
| C15 | `ppoint` | Top inner descendant candidate | `p` | C02,C13 | `R(b+t)` | Derived calculation | 98% / 45% |
| C16 | `qpoint` | Right inner descendant candidate | `q` | C11,C03 | `R(n+c)` | Derived calculation | 98% / 45% |
| C17 | `rpoint` | Bottom inner descendant candidate | `r` | C10,C04 | `R(j+d)` | Derived calculation | 98% / 45% |
| C18 | `wpoint` | Left-center second descendant candidate | `w` | C12,C05 | `R(s+e)` | Derived calculation | 98% / 35% |
| C19 | `xpoint` | Top-center second descendant candidate | `x` | C13,C05 | `R(t+e)` | Derived calculation | 98% / 35% |

### Internal chain

| Node ID | Legacy key | Visual position | Displayed value | Parent nodes | Formula | Type | Confidence |
| --- | --- | --- | --- | --- | --- | --- | ---: |
| C20 | `lpoint` | Unverified | `l` | C10,C11 | `R(j+n)` | Derived calculation | 98% / 20% |
| C21 | `kpoint` | Unverified | `k` | C10,C20 | `R(j+l)` | Derived calculation | 98% / 20% |
| C22 | `mpoint` | Unverified | `m` | C20,C11 | `R(l+n)` | Derived calculation | 98% / 20% |

### Family aggregate and descendants

| Node ID | Legacy key | Visual position | Displayed value | Parent nodes | Formula | Type | Confidence |
| --- | --- | --- | --- | --- | --- | --- | ---: |
| C23 | `upoint` | Unverified family-center candidate | `u` | C06,C07,C08,C09 | `R(f+g+h+i)` | Derived calculation | 98% / 35% |
| C24 | `vpoint` | Unverified | `v` | C05,C23 | `R(e+u)` | Derived calculation | 98% / 20% |
| C25 | `f2point` | Unverified near `f` | `f2` | C06,C23 | `R(f+u)` | Derived calculation | 98% / 25% |
| C26 | `f1point` | Unverified near `f` | `f1` | C06,C25 | `R(f+f2)` | Derived calculation | 98% / 25% |
| C27 | `g2point` | Unverified near `g` | `g2` | C07,C23 | `R(g+u)` | Derived calculation | 98% / 25% |
| C28 | `g1point` | Unverified near `g` | `g1` | C07,C27 | `R(g+g2)` | Derived calculation | 98% / 25% |
| C29 | `h2point` | Unverified near `h` | `h2` | C08,C23 | `R(h+u)` | Derived calculation | 98% / 25% |
| C30 | `h1point` | Unverified near `h` | `h1` | C08,C29 | `R(h+h2)` | Derived calculation | 98% / 25% |
| C31 | `i2point` | Unverified near `i` | `i2` | C09,C23 | `R(i+u)` | Derived calculation | 98% / 25% |
| C32 | `i1point` | Unverified near `i` | `i1` | C09,C31 | `R(i+i2)` | Derived calculation | 98% / 25% |

### Structural count conclusion

```text
32 total structural calculation nodes
  3 root nodes
 29 derived nodes
```

The 24 `a–x` keys are not the entire structural graph. Eight `f/g/h/i` descendants are also stored in `result.points`.

## 2. Projection Node Inventory

### Purpose projections

| Projection ID | Key | Parents | Formula | Confidence |
| --- | --- | --- | --- | ---: |
| PR01 | `skypoint` | C02,C04 | `R(b+d)` | 98% formula / 30% label |
| PR02 | `earthpoint` | C01,C03 | `R(a+c)` | 98% / 30% |
| PR03 | `perspurpose` | PR01,PR02 | `R(sky+earth)` | 98% / 30% |
| PR04 | `femalepoint` | C07,C08 | `R(g+h)` | 98% / 30% |
| PR05 | `malepoint` | C06,C09 | `R(f+i)` | 98% / 30% |
| PR06 | `socialpurpose` | PR04,PR05 | `R(female+male)` | 98% / 30% |
| PR07 | `generalpurpose` | PR03,PR06 | `R(personal+social)` | 98% / 30% |
| PR08 | `planetarypurpose` | PR06,PR07 | `R(social+general)` | 98% / 30% |

These are new calculations, not aliases of structural nodes.

### Health projections

Fourteen cells are aliases of existing structural nodes:

| Health field | Existing node |
| --- | --- |
| `sahphysics` | C01 |
| `ajphysics` | C14 |
| `vishphysics` | C12 |
| `anahphysics` | C18 |
| `manphysics` | C05 |
| `svadphysics` | C10 |
| `mulphysics` | C03 |
| `sahenergy` | C02 |
| `ajenergy` | C15 |
| `vishenergy` | C13 |
| `anahenergy` | C19 |
| `manenergy` | C05 |
| `svadenergy` | C11 |
| `mulenergy` | C04 |

Ten health values are new projection calculations:

| Projection ID | Key | Parents | Formula |
| --- | --- | --- | --- |
| PR09 | `sahemotions` | C01,C02 | `R(a+b)` |
| PR10 | `ajemotions` | C14,C15 | `R(o+p)` |
| PR11 | `vishemotions` | C12,C13 | `R(s+t)` |
| PR12 | `anahemotions` | C18,C19 | `R(w+x)` |
| PR13 | `manemotions` | C05 | `R(e+e)` |
| PR14 | `svademotions` | C10,C11 | `R(j+n)` |
| PR15 | `mulemotions` | C03,C04 | `R(c+d)` |
| PR16 | `resultphysics` | seven physical cells | `R(sum physical)` |
| PR17 | `resultenergy` | seven energy cells | `R(sum energy)` |
| PR18 | `resultemotions` | seven emotion cells | `R(sum emotions)` |

Several health projections duplicate existing structural values arithmetically:

- `sahemotions = fpoint`
- `svademotions = lpoint`
- `mulemotions = ipoint`

They remain projection aliases by role, not new unique mathematical values.

### Timeline projections

The timeline contains 56 computed projection nodes in eight seven-node families:

| Projection IDs | Keys | Structural endpoints |
| --- | --- | --- |
| PR19–PR25 | `af, af1…af6` | C01 → C06 |
| PR26–PR32 | `fb, fb1…fb6` | C06 → C02 |
| PR33–PR39 | `bg, bg1…bg6` | C02 → C07 |
| PR40–PR46 | `gc, gc1…gc6` | C07 → C03 |
| PR47–PR53 | `ci, ci1…ci6` | C03 → C09 |
| PR54–PR60 | `id, id1…id6` | C09 → C04 |
| PR61–PR67 | `dh, dh1…dh6` | C04 → C08 |
| PR68–PR74 | `ha, ha1…ha6` | C08 → C01 |

Each family follows the same binary subdivision pattern. For endpoints `A` and `B`:

```text
AB  = R(A+B)
AB1 = R(A+AB)
AB2 = R(A+AB1)
AB3 = R(AB+AB1)
AB4 = R(AB+B)
AB5 = R(AB+AB4)
AB6 = R(AB4+B)
```

The formula topology is code-proven. Exact visual ordering and age labels are not.

## 3. Display Node Inventory

The current renderer does not render the structural graph. It creates a presentation graph:

| Display ID | Coordinate | Display source | Engine node? |
| --- | --- | --- | --- |
| D01 | `(70,70)` | `fatherLine` array | No |
| D02 | `(330,70)` | `motherLine` array | No |
| D03 | `(70,330)` | `loveLine` array | No |
| D04 | `(330,330)` | `moneyLine` array | No |
| D05 | `(200,35)` | `ancestorLine` array | No |
| D06 | `(200,365)` | `talentsGreat` array | No |
| D07 | `(200,200)` | C05 / `epoint` | Alias of calculation node |

The outer diamond, rotated square, six radial lines, labels, and Karmic Tail text are visual primitives, not engine nodes.

Therefore the existing SVG cannot be used to infer the actual calculation topology.

## 4. Calculation vs Projection vs Display

```text
CALCULATION NODES
  C01–C32
  Persisted in rawPoints
  May feed other formulas

PROJECTION NODES
  PR01–PR74
  Purpose, health-derived, and timeline calculations
  Generated from calculation nodes
  Do not feed the structural graph

DISPLAY NODES
  D01–D07
  Renderer coordinates/containers
  Do not generate values
```

Feature paths such as Love Line are projections by selection: they create no new arithmetic value, but select ordered existing nodes.

## 5. “22” Clarification

### A. Arcana values

**Confirmed.**

The reduction function constrains normal engine values to the 1–22 Arcana domain. This is the strongest and only code-proven meaning of 22.

### B. Structural positions

**Not supported by the local implementation.**

- `result.points` has 32 keys.
- The lettered subset `a–x` has 24 keys.
- No position registry limits the graph to 22.
- No coordinate model identifies two non-structural lettered keys.

### C. Both

**Unproven.**

A source tradition may use 22 named chart positions, but that cannot be derived from this code. The local engine uses 22 as a value domain and a larger set of calculation positions.

## 6. Dependency Tree

```text
ROOT NODES
├── C01 a = day
├── C02 b = month
└── C03 c = year digits
        │
        ▼
PRIMARY DERIVED NODES
├── C04 d = a+b+c
├── C05 e = a+b+c+d
├── C06 f = a+b
├── C07 g = b+c
├── C08 h = d+a
└── C09 i = c+d
        │
        ▼
SECONDARY DERIVED NODES
├── Axis/inner: C10–C19
├── Internal chain: C20–C22
└── Family aggregate/descendants: C23–C32
        │
        ▼
PROJECTION NODES
├── Purpose calculations PR01–PR08
├── Health calculations PR09–PR18
├── Timeline calculations PR19–PR74
└── Feature selections
    ├── Love: C12,C05,C13
    ├── Money: C10,C05,C11
    ├── Karmic: C04,C17,C10
    ├── Father: C06,C07,C03
    └── Mother: C08,C09,C04
        │
        ▼
DISPLAY NODES
└── D01–D07 renderer containers
```

## 7. Feature Topology

| Feature | Uses existing nodes? | Creates new nodes? | Current dependency |
| --- | --- | --- | --- |
| Love Line | Yes | No | Selects C12,C05,C13 |
| Money Line | Yes | No | Selects C10,C05,C11 |
| Karmic Tail | Yes | No | Selects C04,C17,C10 |
| Father Line | Yes | No | Selects C06,C07,C03 |
| Mother Line | Yes | No | Selects C08,C09,C04 |
| Health Matrix | Both | Yes | 14 aliases + PR09–PR18 |
| Soul Searching | No formula | Unknown | Read-only optional field; no engine output |
| Socialization | Candidate only | PR06 exists | `socialpurpose` is calculated but not canonically mapped |
| Spiritual Knowledge | No formula | Unknown | Read-only optional field; no engine output |
| Age Timeline | Uses outer nodes | Yes | Creates PR19–PR74 |

`ancestorLine` also creates no new arithmetic at mapping time; it selects PR04, PR05, and PR06.

## 8. Minimum Viable Graphs

### Center

Smallest graph:

```text
C01,C02,C03 → C04 → C05
```

Required nodes: **5**

### Love

```text
C01,C02,C03 → C04 → C05
C01+C05 → C12
C02+C05 → C13
Love = [C12,C05,C13]
```

Required structural nodes: **7** (`C01–C05`, C12, C13)

### Money

```text
C01,C02,C03 → C04 → C05
C04+C05 → C10
C03+C05 → C11
Money = [C10,C05,C11]
```

Required structural nodes: **7** (`C01–C05`, C10, C11)

### Health

Health requires:

```text
C01,C02,C03,C04,C05
C10,C11,C12,C13
C14,C15,C18,C19
PR09–PR18
```

Required structural nodes: **13**

Required new health projections: **10**

The structural dependency closure is:

```text
a,b,c → d,e
a,e → s → o
b,e → t → p
d,e → j
c,e → n
s,e → w
t,e → x
```

### Timeline

Timeline requires the outer octagon:

```text
C01,C02,C03 → C04
C01+C02 → C06
C02+C03 → C07
C04+C01 → C08
C03+C04 → C09
```

Required structural nodes: **8** (`a,b,c,d,f,g,h,i`)

Required timeline projections: **56**

Center C05 is not required for timeline generation.

### Combined minimum graph

To generate Center + Love + Money + Health + Timeline:

```text
C01–C19 except C16,C17
```

Explicit set:

```text
C01,C02,C03,C04,C05,C06,C07,C08,C09,
C10,C11,C12,C13,C14,C15,C18,C19
```

Required structural nodes: **17**

Required projection calculations:

- Health: 10
- Timeline: 56

Total required computational outputs: **83** including the 17 structural values.

Not required for these five outputs:

```text
C16 q, C17 r, C20 k/l/m chain, C23–C32 family graph
```

Karmic Tail would additionally require C17.

## 9. Graph Diagram

```text
                          C02 b
                       /    │    \
                    C06 f  C13 t  C07 g
                    /       │       \
                 C01 a--C12 s--C05 e--C11 n--C03 c
                    \       │       /
                    C08 h  C10 j  C09 i
                       \    │    /
                          C04 d

Second-order candidates:
C01→C12→C14       C02→C13→C15
C04→C10→C17       C03→C11→C16
C12→C05→C18       C13→C05→C19

Unpositioned:
C10+C11→C20(l); C10+C20→C21(k); C20+C11→C22(m)
C06+C07+C08+C09→C23(u)→C24(v), C25–C32
```

The diagram shows formula relationships. Coordinates outside center and the tentative outer/axis layout remain unverified.

## 10. Formula and Topology Ambiguities

1. The code has no coordinate registry.
2. The renderer is a feature summary, not a structural chart.
3. `a–x` supplies 24 nodes, while `result.points` supplies 32.
4. No evidence identifies a canonical 22-node subset.
5. `k,l,m,u,v,w,x` lack verified visual coordinates.
6. Eight family descendants lack verified visual coordinates.
7. Health labels are attached to node aliases without source metadata.
8. `socialpurpose` is not proven equivalent to Socialization.
9. Soul Searching and Spiritual Knowledge have no engine formulas.
10. Timeline values have formula order but no exact age-coordinate contract.
11. `reduceNumber` describes a 22-value domain, not a node-count constraint.

## 11. Final Decision

**BLOCKED BY TOPOLOGY AMBIGUITY**

Ready to lock:

- 32-node local computational inventory
- 3 root / 29 derived classification
- 74-node projection inventory
- Parent/formula dependency graph
- Minimum dependency closures
- Separation of calculation, projection, and display layers
- Clarification that 22 is the Arcana value domain

Not ready to lock:

- Canonical visual coordinates
- Canonical structural node count for the Ladini method
- A 22-position subset
- Feature labels as authoritative topology
- Exact age-ring positions
- Soul Searching and Spiritual Knowledge nodes

Required before graph lock:

1. A sourced coordinate diagram mapping every formula key to a visual position.
2. Confirmation of whether family/talent descendants are chart positions or auxiliary calculations.
3. Identification of the intended role of `k,l,m,u,v,w,x`.
4. An authoritative distinction between structural and feature-only nodes.
5. Exact timeline coordinate and age-marker mapping.

## Evidence

- `lib/calculations/destinyMatrix/energy.ts`
- `lib/calculations/destinyMatrix/mapToBlueprint.ts`
- `components/blueprint/DestinyMatrixVisual.tsx`
- `lib/engines/destinyMatrixIntelligence.ts`
- `DESTINY_MATRIX_SOURCE_OF_TRUTH.md`
