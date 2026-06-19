# IDENTITY LAYER FULL INVENTORY

## OVERVIEW
This document serves as the master inventory of the Bhumi Identity Layer. It maps out all calculated fields, UI sections, derived intelligence, and hidden engine parameters across all 8 identity systems. This serves as the foundation for the Canonical Identity Layer and subsequent refactors.

---

# 1. NUMEROLOGY

## Identity Layer
Core identity fields:
- `lifePath`
- `expression`
- `soulUrge`
- `personality`
- `maturity`
- `karmicLessons`
- `hiddenPassion`
- `subconsciousConfidence`
- `balance`

## Core Sections
- Numerologi Personal
- Siklus Kehidupan (Pinnacles)
- Tantangan Hidup (Challenges)
- Tahun Personal (Personal Year)
- Numerologi Synthesis

## Subsections
**Numerologi Personal**
- Life Path (Jalan Hidup)
- Expression (Ekspresi Diri)
- Soul Urge (Dorongan Jiwa)
- Personality (Kepribadian)

**Siklus Kehidupan & Tantangan**
- Pinnacle 1, 2, 3, 4
- Challenge 1, 2, 3, 4

## Hidden Engine Data
- `dayOfBirth` (calculated but implicitly part of life path logic)
- `karmicDebts` (13, 14, 16, 19) (calculated but not consistently surfaced)
- `bridgeNumbers`
- `planesOfExpression` (Mental, Physical, Emotional, Intuitive ratios)

## Derived Intelligence
- `strengths`
- `challenges`
- `purpose`
- `relationshipStyle`
- `careerStyle`
- `growthStyle`
- `summary` (Synthesis paragraphs)

## Storage Mapping
`blueprint.numerology.*`

## Consumption Mapping
- Profile (`/blueprint/numerology`)
- Innerwork Intelligence (Life path themes)
- Gaia Themes (Psychology/Purpose)

## Gap Analysis
- **Calculated but not stored:** Detailed letter mapping (Pythagorean grids).
- **Stored but not rendered:** `planesOfExpression` often calculated but hidden.
- **Legacy fields:** `masterNumbers` flag is sometimes kept redundantly.

---

# 2. HUMAN DESIGN

## Identity Layer
Core identity fields:
- `type`
- `strategy`
- `authority`
- `profile`
- `definition`
- `incarnationCross`

## Core Sections
- BodyGraph / Chart
- Identitas Desain (Type, Strategy, Authority, Profile)
- Pusat Energi (Centers)
- Definisi & Sirkuit (Channels)
- Sintesis Human Design

## Subsections
**Pusat Energi (Centers)**
- Head, Ajna, Throat, G, Heart/Ego, Sacral, Root, Spleen, Solar Plexus (Defined/Undefined status)
**Channels**
- Active channels list

## Hidden Engine Data
- `gates` (Active gates raw list)
- `personalityActivations` (Sun, Earth, Moon, Node, etc.)
- `designActivations`
- `variables` (Digestion, Cognition, Environment, Perspective, Motivation)
- `color`, `tone`, `base` for every planetary activation.

## Derived Intelligence
- `strengths`
- `challenges`
- `decisionMaking`
- `energyManagement`
- `summary`

## Storage Mapping
`blueprint.humanDesign.*` (Note: sometimes stored as `human-design`)

## Consumption Mapping
- Profile (`/blueprint/human-design`)
- Daily Guidance (Strategy & Authority context)

## Gap Analysis
- **Stored but not rendered:** `variables` (Digestion, Cognition) are heavily calculated but entirely orphaned in the UI.
- **Used by Gaia but not visible:** Sub-conscious vs Conscious splits.

---

# 3. NATAL CHART (ASTROLOGY)

## Identity Layer
Core identity fields:
- `sunSign`, `moonSign`, `ascendant`
- `midheaven` (MC)

## Core Sections
- Big Three (Sun, Moon, Rising)
- Personal Planets (Mercury, Venus, Mars)
- Social Planets (Jupiter, Saturn)
- Generational Planets (Uranus, Neptune, Pluto)
- Lunar Nodes (North Node, South Node)
- Sintesis Astrologi

## Subsections
**Personal Planets**
- Mercury (Mind/Communication)
- Venus (Love/Values)
- Mars (Action/Drive)

## Hidden Engine Data
- `houses` (Cusp degrees, house systems)
- `aspects` (Trine, Square, Conjunctions)
- `retrogrades`
- `chiron`, `lilith`, `partOfFortune`

## Derived Intelligence
- `strengths`
- `challenges`
- `emotionalNature`
- `communicationStyle`
- `summary`

## Storage Mapping
`blueprint.astrology.*`

## Consumption Mapping
- Profile (`/blueprint/natal-chart`)
- Astro Hari Ini (Daily Transits)

## Gap Analysis
- **Stored but not rendered:** `aspects` and `houses`.
- **Visible but not connected:** Planetary degrees are rendered but their exact geometric significance (aspects) is ignored.

---

# 4. WETON

## Identity Layer
Core identity fields:
- `day` (Hari)
- `pasaran`
- `weton`
- `neptuDay`
- `neptuPasaran`
- `totalNeptu`

## Core Sections
- Weton Kelahiran
- Watak & Karakter (Pancasuda, Saptawara, Pancawara)
- Wuku & Pranata Mangsa
- Pola Kehidupan (Rezeki & Jodoh)
- Sintesis Weton

## Subsections
**Wuku & Pranata Mangsa**
- Wuku Name & Description
- Pranata Mangsa Name & Description

## Hidden Engine Data
- Rakâm
- Padangon
- Sadwara (Pariang)

## Derived Intelligence
- `watak`
- `strengths`, `challenges`
- `lifeMission`
- `workStyle`, `moneyStyle`, `relationshipStyle`

## Storage Mapping
`blueprint.weton.*`

## Consumption Mapping
- Profile (`/blueprint/weton`)

## Gap Analysis
- **Missing Gaps:** Primbon cycle matches (Tibo Singo, Tibo Loro) are partially calculated but not always rendered.

---

# 5. BAZI

## Identity Layer
Core identity fields:
- `yearPillar`, `monthPillar`, `dayPillar`, `hourPillar`
- `dayMaster` (Element & Polarity)

## Core Sections
- Day Master
- Empat Pilar (Four Pillars)
- Lima Elemen (Five Elements Balance)
- Ten Gods
- Siklus Keberuntungan (Luck Pillars)
- Kesimpulan BaZi

## Subsections
**Empat Pilar**
- Heavenly Stems & Earthly Branches for each pillar
**Lima Elemen**
- Ratios of Wood, Fire, Earth, Metal, Water

## Hidden Engine Data
- Hidden Stems within Branches
- Clash, Harm, Punishment, Combination matrices

## Derived Intelligence
- `favorableElements`, `unfavorableElements`
- `strengths`, `challenges`
- `careerStyle`, `relationshipStyle`, `moneyStyle`
- `lifeMission`, `summary`

## Storage Mapping
`blueprint.bazi.*`

## Consumption Mapping
- Profile (`/blueprint/bazi`)

## Gap Analysis
- **Stored but not rendered:** Interactions between branches (Clashes/Combinations) are structurally calculated but not cleanly rendered.

---

# 6. VEDIC ASTROLOGY (JYOTISH)

## Identity Layer
Core identity fields:
- `lagna` (Ascendant)
- `moonSign`, `sunSign`
- `nakshatra` (Lunar Mansion)
- `pada`
- `atmakaraka` (Soul Indicator)
- `darakaraka` (Relationship Indicator)

## Core Sections
- Vedic Core (Lagna, Moon, Sun)
- Nakshatra & Atmakaraka
- Mahadasha (Current Timing)
- Purushartha (Dharma, Artha, Kama, Moksha focus)
- Yogas & Planetary Strength

## Subsections
**Mahadasha**
- Current Mahadasha & Antardasha
**Purushartha**
- Dominant signs and scores for Life Aims

## Hidden Engine Data
- Navamsha (D9) Chart
- Shadbala (Planetary Strengths exact points)
- Ashtakavarga

## Derived Intelligence
- `strengths`, `challenges`
- `relationshipStyle`, `careerStyle`, `spiritualStyle`
- `summary`

## Storage Mapping
`blueprint.vedic.*`

## Consumption Mapping
- Profile (`/blueprint/vedic`)

## Gap Analysis
- **Dead fields:** `accuracy`, `calculationSource` metadata.

---

# 7. DESTINY MATRIX

## Identity Layer
Core identity fields:
- Center (Comfort Zone)
- Top (Spiritual/Crown)
- Bottom (Karmic Tail)
- Left (Social/Material)
- Right (Talent/Divine)

## Core Sections
- Octagram Graphic (Core Energies)
- Core Patterns (Center, Top, Left)
- Karmic Tail (Past Life Karma)
- Talents & Gifts
- Money & Love Line
- Synthesis

## Subsections
**Money & Love Line**
- 3 Arcana for Money
- 3 Arcana for Love

## Hidden Engine Data
- Inner/Outer Square intermediate calculation points
- Yearly/Age-based energies (Timeline)

## Derived Intelligence
- Textual breakdown of Arcana intersections
- `summary`

## Storage Mapping
`blueprint.destiny-matrix.*`

## Consumption Mapping
- Profile (`/blueprint/destiny-matrix`)

## Gap Analysis
- **Stored but not rendered:** The `Life Timeline` (Age 0-80 energies) is fully calculated in `types.ts` but missing from the UI implementation.

---

# 8. TZOLKIN

## Identity Layer
Core identity fields:
- `kin`, `kinName`
- `solarSeal`
- `galacticTone`
- `wavespell`
- `castle`
- `gap` (Galactic Activation Portal)

## Core Sections
- Kin Identity
- Solar Seal & Galactic Tone
- Wavespell & Castle
- Galactic Activation Portal
- Tzolkin Archetype
- Synthesis

## Subsections
**Archetype**
- Strengths, Challenges, Relationship, Work, Growth, Life Purpose

## Hidden Engine Data
- `oracle` (Destiny, Guide, Analog, Antipode, Occult) — Implemented, Removed, and Restored.

## Derived Intelligence
- `strengths`, `challenges`
- `summary`

## Storage Mapping
`blueprint.tzolkin.*`

## Consumption Mapping
- Profile (`/blueprint/tzolkin`)

## Gap Analysis
- The `oracle` graphic was added but historically classified as V2.

---

# GAP ANALYSIS SUMMARY

**1. Orphaned Canonical Data:**
`CanonicalIdentity` has just been added to `lib/types/blueprint.ts` but is completely orphaned. It is not populated by the engines, not stored, and not rendered on the Profile page.

**2. Profile Page Violations:**
According to `KARA_PRODUCT_RULES_V1` and `KARA_IMPLEMENTATION_RULES_V1`:
- **"Bhumi is no longer a blueprint calculator. Bhumi is a Personal Intelligence Platform."** The current `app/profile/page.tsx` merely acts as an index/menu (`IdentitasJiwaHub`) linking to 8 separate esoteric systems. It does not synthesize human understanding at the top level.
- **"If data exists, render it." / "No Orphan Data"**. Highly valuable calculated data like Human Design Variables (Digestion, Cognition), Destiny Matrix Timeline, and Astrological Aspects/Houses exist in the backend schema but are hidden from the user, violating Rule #1 and #6.

---

# CANONICAL IDENTITY PROPOSAL

A unified mapping that abstracts the 8 esoteric systems into human-readable psychological and spiritual pillars.

### Purpose (Why am I here?)
* Numerology (Life Path, Soul Urge)
* Human Design (Incarnation Cross)
* BaZi (Life Mission)
* Tzolkin (Life Purpose)

### Energy (How do I operate?)
* Human Design (Type, Strategy, Authority, Centers)
* BaZi (Day Master, 5 Elements)
* Weton (Neptu & Pasaran)

### Psychology (How do I process?)
* Natal Chart (Big Three, Mercury)
* Numerology (Expression, Personality)

### Archetype (What is my core persona?)
* Destiny Matrix (Center Arcana)
* Tzolkin (Solar Seal, Kin)
* Numerology (Life Path Archetype)

### Karma (What am I healing?)
* Destiny Matrix (Karmic Tail)
* Numerology (Karmic Lessons, Karmic Debts)
* Natal Chart (Chiron, Lunar Nodes)

### Evolution (Where am I going?)
* Natal Chart (North Node)
* Vedic (Atmakaraka)
* Tzolkin (Wavespell)

### Talents (What are my innate gifts?)
* Destiny Matrix (Talent Line)
* Human Design (Channels)
* BaZi (Favorable Elements)

### Relationships (How do I connect?)
* Natal Chart (Venus, 7th House)
* Destiny Matrix (Love Line)
* Vedic (Darakaraka)

### Career (How do I build?)
* Natal Chart (Mars, Midheaven)
* Destiny Matrix (Money Line)
* BaZi (10 Gods - Wealth & Career)

### Shadow (What am I avoiding?)
* Human Design (Undefined Centers)
* Tzolkin (Galactic Tone Shadow)
* Natal Chart (Lilith, Pluto)

### Growth (How do I evolve?)
* Destiny Matrix (Spiritual Line)
* Vedic (Dharma/Moksha focus)
* Tzolkin (Castle Spiritual Lesson)

### Timing (Where am I right now?)
* Numerology (Personal Year, Pinnacles)
* Vedic (Mahadasha)
* BaZi (Luck Pillars)
