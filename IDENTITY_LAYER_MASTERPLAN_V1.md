# Identity Layer Masterplan V1

## 1. Current State

### Scope

This document audits and plans the identity architecture only. It proposes no code, database, UI, Dashboard, Profile, Journey, Innerwork, Gaia, or synthesis changes.

### System status

| System | Status | Current source of truth | Architectural condition |
| --- | --- | --- | --- |
| Numerology | Completed | `lifePath` plus `numerology` | Functional, but stored and UI-derived fields diverge |
| Human Design | Completed / locked | `humanDesign` | Rich schema with explicit accuracy metadata; some presentation fields are still derived in UI |
| Natal Chart | Completed / locked | `astrology` and alias `natalChart` | Broad coverage, but duplicate roots and mixed precision must be normalized later |
| Weton | Completed / locked | `weton` | Clean standalone schema containing canonical and interpretation fields |
| BaZi | Completed / locked | `bazi` | Broad standalone schema; canonical, dynamic-cycle, and narrative fields are currently mixed |
| Vedic Astrology | Planned | None | Requires a sidereal chart contract and an explicit ayanamsha standard |
| Tzolkin | Planned | None | Requires a declared calendar correlation standard before implementation |
| Destiny Matrix | Refactor planned | `destinyMatrix` | Large raw dataset exists, but semantic naming and visual topology are not canonical |

### Main architecture findings

1. There is no single normalized identity envelope. Each system stores a different mixture of calculation data, interpretation, status, and presentation text.
2. Numerology, Human Design, and Natal Chart have meaningful divergence between stored fields and fields derived at render time.
3. Natal data is duplicated under `astrology` and `natalChart`.
4. Weton and BaZi include generated narrative fields inside their stored system objects, while older systems mostly store calculated facts.
5. Dynamic fields such as Personal Year and current BaZi luck cycle require an `asOf` date. They should not be treated as timeless identity facts.
6. Calculation quality is mature in Human Design but not standardized across the other systems.
7. A future synthesis layer should consume normalized semantic signals, not arbitrary raw engine paths.

### Recommended system envelope

Every identity system should eventually expose four separated layers:

| Layer | Responsibility |
| --- | --- |
| `canonical` | Stable calculated facts: numbers, placements, pillars, cycles, gates |
| `derived` | Deterministic classifications calculated from canonical facts |
| `interpretation` | Human-readable meanings and summaries |
| `meta` | Engine version, source, status, accuracy, input hash, calculated timestamp, standards used |

Dynamic calculations should be separate:

```text
identity.systems.<system>.canonical
identity.systems.<system>.derived
identity.systems.<system>.interpretation
identity.systems.<system>.meta

identity.cycles.<system>.<cycle>
  asOf
  validFrom
  validUntil
  value
```

This is a future target architecture, not a database migration instruction.

---

## 2. Data Coverage

## 2.1 Numerology

### Currently calculated or available

| Field | Current state | Location |
| --- | --- | --- |
| Life Path number | Stored | `lifePath.number`, duplicated in numerology shape |
| Life Path display | Stored | `lifePath.display` |
| Life Path role | Stored | `lifePath.role` |
| Life Path strengths | Stored | `lifePath.positiveTraits` |
| Life Path challenges | Stored | `lifePath.negativeTraits` |
| Expression | Calculated and normally stored | `numerology.expression` |
| Soul Urge | Calculated and normally stored | `numerology.soulUrge` |
| Personality | Calculated and normally stored | `numerology.personality` |
| Birthday Number | Calculated in UI/normalizers | Not canonical in current blueprint type |
| Personal Year | Calculated in UI/normalizers | Not canonical; time-dependent |
| Meanings for Birthday, Expression, Soul Urge, Personality, Personal Year | Dictionary-derived | Presentation/data dictionaries |

### Expected long-term fields not currently implemented

- Maturity Number
- Pinnacle cycles
- Challenge cycles
- Personal Month
- Personal Day
- Balance Number
- Hidden Passion
- Karmic Lessons
- Subconscious Self
- Cornerstone, Capstone, and First Vowel
- Full name-normalization provenance

### Canonical classification

**CORE**

- Life Path number and master-number display
- Expression
- Soul Urge
- Personality
- Birthday Number

**IMPORTANT**

- Life Path role, strengths, and challenges
- Maturity Number
- Pinnacle cycles
- Challenge cycles
- Karmic Lessons
- Hidden Passion

**OPTIONAL / DYNAMIC**

- Personal Year
- Personal Month
- Personal Day
- Cornerstone, Capstone, First Vowel
- Long-form number meanings

### Architectural notes

- `NumerologyBlueprint` is narrower than the object actually stored by blueprint generation.
- `lifePath` and `numerology` overlap but are not equivalent.
- Personal Year must carry an `asOfYear`; otherwise a persisted value becomes stale.
- Name-based numbers require a canonical `nameUsed` and normalization method for reproducibility.

---

## 2.2 Human Design

### Currently stored

- Type
- Strategy
- Authority
- Profile
- Definition
- Incarnation Cross name
- Incarnation Cross gates
- Nine centers as defined/open/null states
- Gates
- Channels
- Personality activations
- Design activations
- Planet, gate, line, and optional color/tone/base per activation
- Variables object
- Digestion
- Cognition
- Motivation
- Environment
- Perspective
- Status and calculation status
- Source
- Accuracy and calculation quality
- Engine version and audit status
- Timezone and timezone source
- Input hash and calculated timestamp
- Upgrade/repair metadata

### Currently derived in presentation

- Signature, derived from Type
- Not-Self Theme, derived from Type
- Defined-center list
- Open-center list
- Human-readable summaries

### Missing or structurally incomplete

- Signature and Not-Self Theme are not canonical stored fields
- Definition bridges and split-definition details
- Channel metadata beyond channel IDs
- Gate-line interpretations
- Circuitry and circuit groups
- Profile line names/themes
- Full Incarnation Cross calculation provenance
- Variable arrows and explicit left/right orientation contract
- Design/personality planetary longitude provenance
- Complete PHS/View/Environment detail hierarchy

### Canonical classification

**CORE**

- Type
- Strategy
- Authority
- Profile
- Defined/open centers
- Status, accuracy, and engine source

**IMPORTANT**

- Definition
- Signature
- Not-Self Theme
- Incarnation Cross
- Channels
- Gates
- Personality and design activations

**OPTIONAL / ADVANCED**

- Variables
- Digestion
- Cognition
- Motivation
- Environment
- Perspective/View
- Color, Tone, Base
- Circuitry and detailed gate-line interpretation

### Architectural notes

- Human Design has the strongest metadata contract and should be the model for system-level `meta`.
- Downstream layers must only consume data with canonical/verified accuracy status.
- Signature and Not-Self Theme should be normalized once, not repeatedly mapped in pages.
- Raw activations should remain canonical; textual gate/channel meanings belong in derived or interpretation layers.

---

## 2.3 Natal Chart

### Currently stored or calculated

- Sun Sign
- Moon Sign
- Ascendant / Rising Sign
- Midheaven / MC
- Placidus-like houses
- Whole Sign houses
- Planet placements:
  - Sun
  - Moon
  - Mercury
  - Venus
  - Mars
  - Jupiter
  - Saturn
  - Uranus
  - Neptune
  - Pluto
  - North Node
  - South Node
  - Chiron
- Per-placement:
  - Sign
  - Degree
  - Absolute longitude
  - Retrograde
  - House
  - Placidus house
  - Whole Sign house
- North Node sign
- South Node sign
- Chiron sign
- Mean Black Moon Lilith sign, degree, and house
- Element balance
- Modality balance
- Polarity balance
- Major aspects:
  - Conjunction
  - Sextile
  - Square
  - Trine
  - Opposition
- Aspect orb
- Patterns:
  - Stellium
  - Grand Trine
  - T-Square
  - Yod
- Dominant planet
- Dominant sign
- Dominant element
- Dominant modality
- Dominant house
- Deterministic summary
- Derived top houses and top aspects

### Missing or incomplete

- Exact Sun longitude is calculated in planet data, but top-level Sun Sign may still originate from a simplified date-range calculator
- True Placidus cusps are not consistently guaranteed; local fallback uses an approximation
- Historical IANA timezone provenance
- Vertex and Anti-Vertex
- Part of Fortune
- East Point
- Fixed stars
- Declinations and out-of-bounds states
- Additional aspect families
- Applying/separating aspect state
- Essential dignity and dispositor chains
- House rulers and chart ruler
- Aspect patterns beyond the current four
- Validated Lilith mode selection: mean versus true

### Canonical classification

**CORE**

- Sun
- Moon
- Ascendant
- Planet longitudes and signs
- House cusps
- Birth-time/location/timezone provenance
- Calculation source and precision status

**IMPORTANT**

- Mercury, Venus, Mars
- Jupiter and Saturn
- Midheaven
- North and South Nodes
- Houses for all placements
- Major aspects and orbs
- Element and modality balance
- Chart ruler

**OPTIONAL / ADVANCED**

- Uranus, Neptune, Pluto
- Chiron
- Lilith
- Aspect patterns
- Dominance metrics
- Vertex
- Part of Fortune
- Fixed stars
- Declinations

### Architectural notes

- `astrology` and `natalChart` should eventually become one canonical root with compatibility aliases only at read boundaries.
- Calculation source should be per placement or per chart segment when mixed engines are possible.
- Houses must state the actual house system and whether the result is exact or approximate.
- Natal interpretation should reference exact placements, not infer missing planets from top-level aliases.

---

## 2.4 Weton

### Currently stored

- Day
- Pasaran
- Full Weton name
- Day Neptu
- Pasaran Neptu
- Total Neptu
- Wuku:
  - Name
  - Index
  - Description
- Pranata Mangsa:
  - Name
  - Description
- Watak
- Strengths
- Challenges
- Life mission
- Relationship style
- Work style
- Money style
- Deterministic summary is generated from stored fields at presentation time

### Missing or potentially future fields

- Effective Javanese date used after evening-boundary adjustment
- Day-boundary standard and engine version in stored metadata
- Pawukon cycle day
- Sadwara / Paringkelan
- Other concurrent Pawukon cycles
- Weton-specific relationship compatibility, if ever desired
- Explicit interpretation provenance

### Canonical classification

**CORE**

- Day
- Pasaran
- Weton name
- Day Neptu
- Pasaran Neptu
- Total Neptu

**IMPORTANT**

- Wuku name and index
- Effective Javanese date
- Day-boundary standard
- Watak dictionary key or archetype

**OPTIONAL**

- Pranata Mangsa
- Wuku description
- Strengths and challenges
- Relationship style
- Work style
- Money style
- Life mission
- Extended Pawukon cycles

### Architectural notes

- Canonical calendrical facts and interpretation text are currently stored together.
- Wuku and Pranata Mangsa descriptions should eventually be dictionary IDs plus versioned localized content.
- The effective date and boundary method are essential for reproducibility but are not currently represented in the public Weton schema.

---

## 2.5 BaZi

### Currently stored

- Year Pillar
- Month Pillar
- Day Pillar
- Hour Pillar
- Per pillar:
  - Heavenly Stem character and pinyin
  - Earthly Branch character and pinyin
  - Stem element
  - Stem polarity
  - Animal
  - Display label
- Day Master:
  - Stem
  - Pinyin
  - Element
  - Polarity
  - Description
- Five Elements visible balance
- Ten Gods for year, month, and hour stems
- Favorable elements
- Unfavorable elements
- Ten Luck Pillars
- Current Luck Cycle
- Luck-cycle method
- Strengths
- Challenges
- Career style
- Relationship style
- Money style
- Life mission
- Deterministic summary

### Missing or incomplete

- Hidden stems in Earthly Branches
- Ten Gods for hidden stems and branch contents
- Seasonal strength and month-command weighting
- Day Master strength classification
- Rooting, support, combinations, clashes, harms, punishments, and transformations
- Na Yin
- Useful God / Yong Shen based on full chart analysis
- Favorable elements currently reflect visible-count balancing, not a full classical strength analysis
- Luck-cycle direction cannot be personalized because profile gender is absent
- Exact Da Yun start date, not only rounded start age
- Annual, monthly, and daily transits
- Twelve Growth Stages
- Symbolic stars / Shen Sha
- Explicit solar-term timestamps and timezone provenance

### Canonical classification

**CORE**

- Four Pillars
- Day Master
- Exact local/UTC birth instant
- Solar-term standard
- Zi-hour rollover convention
- Engine/version metadata

**IMPORTANT**

- Hidden stems
- Ten Gods
- Five Elements with seasonal weighting
- Day Master strength
- Branch/stem relationships
- Favorable and unfavorable elements after classical strength analysis
- Luck Pillars and start date

**OPTIONAL / ADVANCED**

- Current Luck Cycle
- Annual/monthly cycles
- Na Yin
- Twelve Growth Stages
- Symbolic stars
- Career, relationship, money, mission, and summary text

### Architectural notes

- `currentLuckCycle` is dynamic and should carry `asOf`.
- Current favorable/unfavorable fields should be labeled as visible-balance guidance until hidden stems and seasonal strength are implemented.
- Luck-cycle method must remain explicit. Gender-dependent direction cannot silently use a default.
- Canonical Chinese characters should be stored independently from localized display labels.

---

## 3. Canonical Identity Layer

## 3.1 Purpose

The Canonical Identity Layer should be the stable boundary between specialized calculation engines and all product experiences. It should preserve system truth while preventing UI pages or downstream features from understanding engine-specific legacy paths.

## 3.2 Proposed conceptual model

```text
IdentityRecord
├── subject
│   ├── uid
│   └── birthInputRef
├── systems
│   ├── numerology
│   ├── humanDesign
│   ├── natal
│   ├── weton
│   ├── bazi
│   ├── vedic
│   ├── tzolkin
│   └── destinyMatrix
├── canonicalSignals
├── dynamicCycles
└── meta
```

Each system should expose:

```text
SystemIdentity
├── canonical
├── derived
├── interpretation
└── meta
```

### Required `meta`

- `schemaVersion`
- `engineVersion`
- `calculationSource`
- `calculationStatus`
- `accuracy`
- `standards`
- `inputHash`
- `calculatedAt`
- `warnings`
- `dependencies`

Examples of `standards`:

- Natal: tropical/sidereal, house system, node mode, Lilith mode
- Vedic: ayanamsha, house system, dasha year length, node mode
- Weton: day boundary, Pawukon epoch
- BaZi: Li Chun boundary, Zi-hour rollover, solar-term engine, luck direction method
- Tzolkin: correlation constant and tradition variant

## 3.3 Cross-system semantic signal contract

Systems should not directly write into Profile, Dashboard, Innerwork, or Gaia shapes. They should publish normalized signals:

| Signal family | Meaning | Example sources |
| --- | --- | --- |
| `identity.core` | Stable identity archetype | Life Path, HD Type, Sun, Weton, Day Master |
| `decision.style` | Decision rhythm | HD Authority, Moon, BaZi Day Master |
| `energy.rhythm` | Consistent energy pattern | HD Type/Centers, Natal Mars, BaZi elements |
| `emotion.needs` | Emotional safety and regulation | Moon, Soul Urge, Weton relationship style |
| `relationship.style` | Connection pattern | Venus, HD Profile, BaZi/Weton relation style |
| `work.style` | Natural work expression | Expression, HD Type, Mercury/Mars/MC, BaZi |
| `resource.style` | Money/resource pattern | BaZi Wealth element, Weton money style, Destiny Money Line |
| `growth.edge` | Recurring challenge | Life Path challenge, Saturn, Not-Self, Weton/BaZi challenges |
| `purpose.direction` | Long-range direction | Life Path, Incarnation Cross, Nodes, Day Master mission |
| `ancestry.pattern` | Family/lineage pattern | Destiny family lines, optional Vedic lineage indicators |
| `cycle.current` | Time-dependent context | Personal Year, Da Yun, Dasha, annual cycles |

Each signal should include:

- `system`
- `field`
- `value`
- `semanticTags`
- `tier`: CORE / IMPORTANT / OPTIONAL
- `confidence`
- `accuracy`
- `asOf`, when dynamic
- `sourcePath`

## 3.4 Canonical tier matrix

### CORE identity anchors

These fields should remain available for long-term identity synthesis:

- Numerology: Life Path, Expression, Soul Urge, Personality, Birthday
- Human Design: Type, Strategy, Authority, Profile, centers
- Natal: Sun, Moon, Ascendant
- Weton: Weton name, total Neptu
- BaZi: Four Pillars, Day Master
- Vedic: Lagna, Moon Sign, Nakshatra, sidereal Sun
- Tzolkin: Kin, Tone, Seal, Galactic Signature
- Destiny Matrix: Arcana Center and validated matrix topology

### IMPORTANT enrichment

- Numerology: Maturity, Pinnacles, Challenges
- Human Design: Definition, Incarnation Cross, Channels, Gates
- Natal: Mercury, Venus, Mars, MC, Nodes, houses, major aspects
- Weton: Wuku
- BaZi: Ten Gods, hidden stems, weighted Five Elements, Day Master strength
- Vedic: Lagna lord, Moon Nakshatra/Pada, Atmakaraka, Darakaraka, houses, Vimshottari Dasha
- Tzolkin: Wavespell, Guide, Analog, Antipode, Occult
- Destiny Matrix: family, money, love, talent, karmic, and purpose structures

### OPTIONAL depth and cycles

- Numerology: Personal Year/Month/Day
- Human Design: Variables and PHS
- Natal: Chiron, Lilith, outer planets, patterns
- Weton: Pranata Mangsa and extended cycles
- BaZi: Luck Pillars, current Luck Cycle, Na Yin, symbolic stars
- Vedic: divisional charts, Ashtakavarga, extensive yogas and transits
- Tzolkin: Castle, Earth Family, Harmonic, Chromatic, PSI/Haab extensions
- Destiny Matrix: year timeline and advanced aggregate metrics

## 3.5 Layer flow

```text
IDENTITY LAYER
  Canonical facts, derived classifications, accuracy, provenance
        ↓
PROFILE LAYER
  Stable self-understanding and long-form identity organization
        ↓
DASHBOARD LAYER
  Small current-context projections; never raw full charts
        ↓
INNERWORK LAYER
  Practices selected from normalized needs, patterns, and growth edges
        ↓
GAIA LAYER
  Cross-system reasoning over approved normalized signals
```

### Identity Layer

Should receive:

- Birth/name input references
- Engine outputs
- Version and accuracy metadata
- Stable and dynamic cycle separation

Should not receive:

- UI card labels
- Page-specific summaries
- Product navigation state
- AI-generated narratives as canonical facts

### Profile Layer

Should receive:

- CORE identity anchors
- IMPORTANT relationship, talent, career, shadow, and purpose signals
- Stable interpretations with source attribution

Should not receive:

- Complete raw planetary arrays
- Complete gate activation diagnostics
- Temporary daily cycles as permanent identity
- Unverified or approximate data without a visible confidence gate

### Dashboard Layer

Should eventually receive only projections such as:

- One or two stable identity reminders
- Current validated cycle context
- Current energy/decision guidance

It should not calculate identity systems or read arbitrary raw paths.

### Innerwork Layer

Should eventually receive semantic needs:

- Emotional regulation
- Decision pacing
- Boundary practice
- Relationship pattern
- Grounding need
- Expression need
- Current-cycle focus

It should not interpret raw arcana, gates, houses, pillars, or Kin directly.

### Gaia Layer

Should eventually receive:

- Normalized identity signals
- Tier and confidence
- Source system and field
- Contradiction/convergence metadata
- Time validity for dynamic signals

It should not consume UI summaries as evidence or treat repeated fields from two aliases as independent corroboration.

---

## 4. Future Vedic Architecture

## 4.1 Standards that must be decided first

No implementation should begin before these are fixed as product standards:

- Sidereal zodiac
- Ayanamsha, recommended: Lahiri/Chitrapaksha unless product research selects another
- Node mode: mean or true Rahu/Ketu
- House representation: Whole Sign/Rashi as canonical, with Bhava Chalit optional
- Dasha year length and boundary convention
- Ephemeris provider and precision
- Retrograde and combustion rules
- Divisional-chart calculation method

## 4.2 Required field model

### CORE

- Sidereal Sun Sign
- Moon Sign / Chandra Rashi
- Lagna / Ascendant
- Lagna degree
- Lagna lord
- Moon Nakshatra
- Nakshatra lord
- Nakshatra Pada
- Rahu sign/house
- Ketu sign/house
- Sidereal planetary placements
- House placements
- Ayanamsha value and standard
- Calculation source and accuracy

### IMPORTANT

- Atmakaraka
- Darakaraka
- Amatyakaraka
- Other Chara Karakas
- Moon lord
- Lagna lord placement
- Planetary dignity:
  - Own sign
  - Exaltation
  - Debilitation
  - Moolatrikona
  - Friendly/enemy sign
- Combustion
- Retrograde state
- Graha aspects / Drishti
- House lords
- Yogas with rule evidence
- Vimshottari Mahadasha
- Vimshottari Antardasha
- Current Dasha period with exact dates
- Navamsa / D9 core placements

### OPTIONAL / ADVANCED

- Additional divisional charts:
  - D2 Hora
  - D3 Drekkana
  - D4 Chaturthamsa
  - D7 Saptamsa
  - D10 Dasamsa
  - D12 Dwadasamsa
  - D20 Vimsamsa
  - D24 Chaturvimsamsa
  - D30 Trimsamsa
  - D60 Shashtiamsa
- Ashtakavarga
- Shadbala
- Bhava Bala
- Upapada Lagna
- Arudha Lagna
- Karakamsha
- Gulika/Mandi
- Panchanga:
  - Tithi
  - Vara
  - Yoga
  - Karana
- Gana, Nadi, Yoni, Varna, Vasya
- Extended Yoga library
- Transits / Gochar
- Sade Sati and Saturn phases
- Jaimini aspects and additional systems

## 4.3 Proposed Vedic object boundaries

```text
vedic.canonical
├── standard
├── lagna
├── planets
├── houses
├── nakshatra
├── nodes
└── charaKarakas

vedic.derived
├── dignities
├── aspects
├── houseLords
├── yogas
└── strengths

vedic.cycles
├── vimshottari
└── transits

vedic.interpretation
└── versioned dictionary references
```

## 4.4 Long-term synthesis priority

- Lagna: embodied approach and visible life orientation
- Moon/Nakshatra/Pada: emotional nature, instinct, conditioning
- Atmakaraka: soul-development theme
- Darakaraka: relationship-development theme
- Lagna lord and Moon lord: operating style
- Current Dasha: dynamic context, not permanent identity
- Yogas: IMPORTANT only when rule engine provides exact participating planets and conditions

## 4.5 Vedic risks

- Ayanamsha drift will change signs and divisional charts.
- Yoga lists become unreliable if they are text templates without rule evidence.
- Dasha periods must store exact start/end dates and calculation convention.
- Vedic and tropical Natal placements must remain separate systems; they are not aliases.

---

## 5. Future Tzolkin Architecture

## 5.1 Standard that must be decided first

“Tzolkin” may refer to different modern and traditional interpretations. The product must explicitly choose:

- Traditional Chol Q'ij/Tzolk'in day-sign correlation, or
- Dreamspell / Law of Time Kin system

The requested fields `Kin`, `Wavespell`, `Castle`, and `Galactic Signature` align primarily with Dreamspell. They should not be presented as identical to the classical Maya calendar without a standard label.

Required standard metadata:

- Tradition/variant
- Correlation constant or epoch
- Day-boundary convention
- Locale/date handling
- Glyph naming standard
- Engine version

## 5.2 Required field model

### CORE

- Kin number
- Galactic Tone number
- Galactic Tone name
- Solar Seal number
- Solar Seal name
- Galactic Signature
- Signature code
- Gregorian date used
- Correlation/variant metadata

### IMPORTANT

- Wavespell number
- Wavespell seal
- Position within Wavespell
- Guide Kin
- Analog Kin
- Antipode Kin
- Occult Kin
- Galactic Activation Portal state
- Kin color
- Kin direction
- Seal element/archetype

### OPTIONAL / ADVANCED

- Castle
- Earth Family
- Clan
- Harmonic
- Chromatic
- Galactic Season
- PSI Chrono Unit
- Destiny Oracle layout
- Haab position, if a separate classical-calendar module is later approved
- Long Count correlation, only if classical Maya support is in scope
- Personal year/day cycles derived from the selected modern system

## 5.3 Proposed Tzolkin object boundaries

```text
tzolkin.canonical
├── standard
├── kin
├── tone
├── seal
└── galacticSignature

tzolkin.derived
├── wavespell
├── oracle
├── harmonic
├── castle
└── families

tzolkin.interpretation
└── versioned archetype references
```

## 5.4 Long-term synthesis priority

- Tone: mode of action and process
- Seal: archetypal expression
- Kin/Galactic Signature: combined identity key
- Wavespell: developmental context
- Oracle relations: supportive, challenging, hidden, and guiding dynamics
- Castle and advanced cycles: optional contextual depth

## 5.5 Tzolkin risks

- Mixing Dreamspell terminology with classical Maya claims
- Hardcoding an epoch without recording the correlation standard
- Treating symbolic color/direction associations as astronomical facts
- Persisting long-form interpretation instead of versioned dictionary keys

---

## 6. Destiny Matrix Gap Analysis

## 6.1 Current stored coverage

| Requested area | Current state | Evidence / current field |
| --- | --- | --- |
| Matrix image structure | Partial | `rawPoints`, named line arrays, and a simplified SVG |
| Health Matrix | Calculated and stored indirectly | `chartHeart`; normalized into `destinyIntelligence.healthChart` |
| Soul Searching | Not explicitly generated | Normalizer searches for it, but active mapper does not assign it |
| Socialization | Partial semantic equivalent | `purposes.socialpurpose`; not normalized to `socialization` |
| Spiritual Knowledge | Not explicitly generated | No proven direct field |
| Year Cycles | Stored | `years` with symbolic keys such as `afpoint`, `af1point` |
| Father Line | Stored | `fatherLine` |
| Mother Line | Stored | `motherLine` |
| Ancestor Line | Stored | Constructed from female purpose, male purpose, and social purpose |
| Money Line | Stored | `moneyLine` |
| Love Line | Stored | `loveLine` |
| Talent Line | Stored in multiple groups | `talentsGreat`, `talentsFather`, `talentsMother`; runtime also uses untyped `talents` |
| Common Energy | Missing | UI explicitly passes `undefined` |
| Arcana Center | Stored | `center` and `arcanaCenter` |
| Karmic Tail | Stored | `karmicTail` |
| Purpose values | Stored | `purposes` |
| Raw matrix points | Stored | `rawPoints` |

## 6.2 Formula coverage

The active engine calculates:

- Base day, month, and year points
- Center and many internal points
- Karmic, money, love, parent, ancestor, and talent line inputs
- Purpose points:
  - Sky
  - Earth
  - Personal purpose
  - Female
  - Male
  - Social purpose
  - General purpose
  - Planetary purpose
- Seven-chakra physical, energy, and emotional values
- Aggregate physical, energy, and emotional values
- A long year-point sequence

## 6.3 Gaps requiring mapping, not reverse engineering

These values appear calculable now but need canonical naming:

- `purposes.socialpurpose` → candidate source for Socialization
- `chartHeart` → Health Matrix normalization
- `years` symbolic keys → human-readable age ranges
- `talents` versus `talentsGreat`
- Purpose point names
- `center` versus `arcanaCenter`
- Chakra result totals

## 6.4 Gaps requiring formula validation or reverse engineering

### Matrix image structure

The current visual is a simplified diamond with six peripheral nodes. It does not encode the full coordinate topology of `rawPoints`.

Required work:

- Obtain the authoritative target matrix diagram
- Define every visual node:
  - Coordinate
  - Point key
  - Semantic role
  - Color/ring
  - Age marker
- Define every edge and line membership
- Map year-cycle keys to perimeter ages
- Validate that line arrays match displayed node order

### Soul Searching

No explicit engine output currently proves which formula corresponds to this label.

Required work:

- Identify the target-school formula
- Compare candidate purpose points
- Validate against known reference charts

### Spiritual Knowledge

No explicit engine output or verified semantic alias exists.

Required work:

- Identify exact formula and school terminology
- Avoid inventing an alias from `generalpurpose` or `planetarypurpose`

### Common Energy

The page confirms this is missing.

Required work:

- Determine whether Common Energy means center, aggregate purpose, repeated arcana, or another target-chart field
- Validate with reference charts before naming or storage

### Year Cycles

The values exist, but their age semantics are opaque.

Required work:

- Map `afpoint` through `ha6point` to exact age positions/ranges
- Validate cycle direction and boundary ages
- Define current-year/current-age selection rules

### Ancestor Line

The current line is a semantic construction:

```text
female purpose
male purpose
social purpose
```

This may be useful, but it requires validation against the visual school’s actual Ancestor Line definition.

### Talent Line

Several talent groupings exist, but “Talent Line” is not a single canonical contract.

Required work:

- Distinguish great/personal talent from paternal and maternal talents
- Map each group to matrix coordinates
- Confirm ordering and labels

## 6.5 Health Matrix assessment

The Health Matrix is the strongest advanced Destiny dataset currently available:

- Seven chakras
- Physics
- Energy
- Emotion
- Aggregate totals

Remaining architecture needs:

- Canonical typed health object as the stored source of truth
- `chartHeart` retained only as raw engine output
- Formula/version metadata
- Separation of calculated values from wellness interpretation
- Clear non-medical disclaimer at product boundaries

## 6.6 Recommended Destiny Matrix target model

```text
destinyMatrix
├── canonical
│   ├── center
│   ├── points
│   ├── lines
│   ├── purposes
│   ├── talents
│   ├── healthMatrix
│   └── yearCycles
├── topology
│   ├── nodes
│   ├── edges
│   └── agePositions
├── derived
│   ├── soulSearching
│   ├── socialization
│   ├── spiritualKnowledge
│   └── commonEnergy
└── meta
```

No derived field should be added until its formula and target-school terminology are validated.

---

## 7. Recommended Build Order

### 1. Identity contract and standards freeze

Before another engine:

- Approve CORE / IMPORTANT / OPTIONAL tiers
- Approve the four-layer system envelope
- Define common metadata and accuracy states
- Define dynamic-cycle handling
- Define semantic signal taxonomy

This is the highest-leverage step because Vedic and Tzolkin would otherwise repeat current schema drift.

### 2. Read-only canonical adapters for completed systems

Design adapters that conceptually normalize:

- Numerology
- Human Design
- Natal
- Weton
- BaZi

The adapters should not change existing consumers during the architecture phase. Their purpose is to prove that one stable contract can represent all five systems.

### 3. Accuracy and provenance normalization

Prioritize:

- Natal alias and precision contract
- Numerology stored-versus-derived contract
- Weton effective-date/boundary metadata
- BaZi dynamic-cycle `asOf` and calculation-standard metadata
- Human Design presentation-derived fields

### 4. Vedic standards spike

Decide and validate:

- Lahiri or alternative ayanamsha
- Sidereal chart calculations
- Nakshatra/Pada
- Chara Karakas
- Vimshottari Dasha boundaries

Build a golden validation dataset before planning UI.

### 5. Vedic CORE engine

Implement only after the standard is frozen:

- Lagna
- Sidereal planets
- Moon Sign
- Nakshatra/Pada
- Nodes
- Houses
- Core provenance

Then add IMPORTANT fields in a second pass.

### 6. Tzolkin standards spike

Choose classical Tzolk'in versus Dreamspell explicitly. Because requested product terminology is Dreamspell-oriented, naming and educational copy must avoid conflating the two traditions.

### 7. Tzolkin CORE engine

Implement:

- Kin
- Tone
- Seal
- Galactic Signature
- Standard/correlation metadata

Add Wavespell and Oracle relations only after golden-date validation.

### 8. Destiny Matrix reverse-engineering project

Treat this as a separate research/refactor stream:

1. Freeze target school and reference chart
2. Map all points to visual coordinates
3. Validate existing formulas
4. Resolve Soul Searching, Socialization, Spiritual Knowledge, and Common Energy
5. Normalize Health Matrix
6. Decode year-cycle ages
7. Define canonical line and talent contracts

### 9. Cross-system convergence design

Only after all engines have canonical adapters:

- Define convergence rules
- Define conflict handling
- Weight by accuracy and tier
- Separate stable identity from current cycles
- Prevent duplicate aliases from counting as independent evidence

### Recommended sequence summary

```text
Canonical Contract
→ Completed-System Adapters
→ Provenance/Accuracy Normalization
→ Vedic Standards
→ Vedic CORE
→ Tzolkin Standard
→ Tzolkin CORE
→ Destiny Matrix Reverse Engineering
→ Cross-System Convergence
```

## Final recommendation

Do not make the next architecture unit “another blueprint page.” Make it the Canonical Identity Contract. The five completed systems already contain enough heterogeneous data to prove the need for that boundary. Vedic, Tzolkin, and the Destiny Matrix refactor should be built behind that contract so future Profile, Dashboard, Innerwork, and Gaia consumers receive stable semantic signals rather than another generation of engine-specific paths.
