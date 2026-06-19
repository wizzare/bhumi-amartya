# GUDANG IDENTITAS JIWA - AUDIT & PROFILE V4 PROPOSAL

## OVERVIEW
This document serves as a comprehensive audit of the current "Gudang Identitas Jiwa" (Profile V3) structure and proposes the ideal human-centric architecture for **Profile V4**. 

The goal is to shift the user experience from reading fragmented esoteric system reports into understanding a cohesive, holistic reflection of their human identity.

---

## PART 1: CURRENT PROFILE INVENTORY (V3)

Based on the current `ProfileTabs.tsx` implementation, the identity warehouse is divided into 4 main sections with 15 detail cards.

### SECTION 1: IDENTITAS (IDENTITY)
1. **Misi Jiwa** 
   - *Description*: Arah utama yang ingin diwujudkan.
   - *Sources*: Destiny Matrix (Soul Mission)
2. **Arketipe Utama**
   - *Description*: Arketipe utama menunjukkan cara alami energimu bekerja.
   - *Sources*: Numerology (Life Path), Astrology (Sun Sign), Human Design (Type)
3. **Cahaya Jiwa**
   - *Description*: Kualitas terang yang bisa kamu pancarkan saat selaras.
   - *Sources*: Human Design (Cross Mission/Manifestation)
4. **Bayangan Jiwa**
   - *Description*: Sisi yang perlu dilihat tanpa dihakimi.
   - *Sources*: Destiny Matrix (Arcana Center Shadow)

### SECTION 2: PETA JIWA (SOUL MAP)
5. **Karma Leluhur**
   - *Description*: Pola keluarga yang bisa dihormati tanpa selalu diteruskan.
   - *Sources*: Destiny Matrix (Father/Mother Line)
6. **Pola Berulang**
   - *Description*: Tema yang sering kembali sampai diberi respons baru.
   - *Sources*: Destiny Matrix (Repeating Patterns / Karmic Tail)
7. **Luka Inti**
   - *Description*: Bagian yang paling sering meminta perlindungan.
   - *Sources*: Inner Child Needs (Synthesis)
8. **Inner Child**
   - *Description*: Kebutuhan emosional yang ingin merasa aman.
   - *Sources*: Destiny Matrix (Inner Child)

### SECTION 3: POTENSI (POTENTIALS)
9. **Potensi Bawaan (Talent DNA)**
   - *Description*: 5 bakat dominan yang muncul dari pola dirimu.
   - *Sources*: Destiny Matrix (Talents Line)
10. **Potensi Karya**
    - *Description*: Arah karya yang paling selaras dengan pola energimu.
    - *Sources*: Destiny Matrix (Money Line)
11. **Binar Batin**
    - *Description*: Kecenderungan binar batin dan energi jiwamu.
    - *Sources*: Human Design (Incarnation Cross / Mission)
12. **Gaya Relasi**
    - *Description*: Cara hati membangun kedekatan dan menjaga batas.
    - *Sources*: Destiny Matrix (Love Line)

### SECTION 4: PERTUMBUHAN (GROWTH)
13. **Tahap Pertumbuhan**
    - *Description*: Tahap pertumbuhan saat ini.
    - *Sources*: Innerwork Journey Engine
14. **Area Pengembangan**
    - *Description*: Area yang sedang paling siap dilatih (Kesadaran, Konsistensi, dll).
    - *Sources*: Innerwork Activity State
15. **Fokus Saat Ini**
    - *Description*: Satu arah kecil untuk dibawa hari ini.
    - *Sources*: Healing Path Synthesis

---

## PART 2: SECTION QUALITY REVIEW

| Card | Score | Rationale |
| :--- | :--- | :--- |
| **Misi Jiwa** | Split | Confuses identity with chronological purpose. Needs its own domain. |
| **Arketipe Utama** | Keep | Excellent blend of Numerology, HD, and Sun Sign. |
| **Cahaya Jiwa** | Merge | Overlaps heavily with "Binar Batin" and "Misi Jiwa". |
| **Bayangan Jiwa** | Expand | Currently only pulls from Matrix Center; needs Natal Lilith/Chiron. |
| **Karma Leluhur** | Keep | Deeply valuable, highly actionable. |
| **Pola Berulang** | Merge | Overlaps heavily with "Bayangan Jiwa" and "Luka Inti". |
| **Luka Inti** | Merge | Redundant alongside "Inner Child". |
| **Inner Child** | Expand | Great emotional anchor, needs Natal Moon context. |
| **Potensi Bawaan**| Keep | The 5 Talents format is highly engaging. |
| **Potensi Karya** | Keep | Needs inclusion of BaZi Career and Natal Midheaven. |
| **Binar Batin** | Remove| Duplicate of Cahaya Jiwa / Arketipe Utama. |
| **Gaya Relasi** | Expand | Currently Matrix only; needs Vedic/Natal relationship layers. |
| **Tahap Pertumbuhan**| Keep | Excellent State-driven insight. |
| **Area Pengembangan**| Merge | Merge with Tahap Pertumbuhan as one holistic Growth card. |
| **Fokus Saat Ini** | Keep | Highly actionable micro-timing step. |

---

## PART 3: CANONICAL DOMAIN MAPPING (CURRENT)

Mapping V3 cards to the Canonical Identity Model:

- **Misi Jiwa** ➔ `Purpose`
- **Arketipe Utama** ➔ `Identity` & `Archetype`
- **Cahaya Jiwa** ➔ `Archetype`
- **Bayangan Jiwa** ➔ `Shadow`
- **Karma Leluhur** ➔ `Karma`
- **Pola Berulang** ➔ `Shadow`
- **Luka Inti** ➔ `Psychology`
- **Inner Child** ➔ `Psychology` & `Shadow`
- **Potensi Bawaan** ➔ `Talents`
- **Potensi Karya** ➔ `Career`
- **Binar Batin** ➔ `Spirituality`
- **Gaya Relasi** ➔ `Relationships`
- **Tahap Pertumbuhan** ➔ `Growth` & `State`
- **Area Pengembangan** ➔ `Growth`
- **Fokus Saat Ini** ➔ `Timing` & `State`

---

## PART 4: MISSING SECTIONS

When viewing from a purely human experience perspective, the current V3 structure is missing several massive domains of human existence:

1. **ENERGY MECHANICS**: How does this person physically operate? How should they make decisions? (HD Strategy/Authority is currently buried inside "Arketipe Utama" text).
2. **HEALTH & VITALITY**: How does this person's body process the world? (Destiny Matrix Chakras, HD Digestion/Environment, BaZi Elements are totally absent).
3. **TIMING & SEASONS**: What life chapter is this person in? (Vedic Dashas, Matrix Yearly Arcana, BaZi Luck Pillars are absent).
4. **SPIRITUALITY**: What is their ultimate evolutionary path? (Vedic Moksha is absent).

---

## PART 5: DUPLICATE SECTIONS

1. **The Shadow Overlap**: "Bayangan Jiwa", "Pola Berulang", "Luka Inti", and "Inner Child" are four different cards in V3 attempting to explain the exact same psychological trauma space. This causes user fatigue.
2. **The Purpose Overlap**: "Misi Jiwa", "Cahaya Jiwa", and "Binar Batin" are three abstract cards talking about "Soul Purpose" without offering concrete distinctions between them.

---

## PART 6: PROFILE V4 PROPOSAL

To resolve missing data, eliminate duplicates, and create a truly holistic human mirror, Profile V4 is restructured into 8 distinct sections.

### SECTION 1: EKSISTENSI (IDENTITY & ARCHETYPE)
*Who are you at your core, and what is your overarching life mission?*
- **Arketipe Utama**: Outer personality, social mask, and natural role.
- **Misi Kehidupan**: The overarching thematic path and ultimate "Why".
- **Karakter Tersembunyi**: The deeper subconscious drive.

### SECTION 2: ENERGI & MEKANIKA (ENERGY & MECHANICS)
*How do you operate, make decisions, and set boundaries?*
- **Otoritas Batin**: How your body actually makes the correct decisions.
- **Strategi Aksi**: How you should initiate or wait for opportunities.
- **Kapasitas Vitalitas**: Your elemental and physiological energy reserves.

### SECTION 3: PETA LUKA & BAYANGAN (SHADOW & PSYCHOLOGY)
*What are your deep emotional needs, recurring traps, and unconscious defenses?*
- **Kebutuhan Emosional**: What your inner child needs to feel safe.
- **Pola Sabotase (Bayangan)**: The actionable negative patterns you repeatedly fall into.
- **Titik Rawan (Trigger)**: Situations that force you into fight/flight/fawn.

### SECTION 4: KARMA & WARISAN (KARMA & LINEAGE)
*What spiritual and ancestral baggage did you bring into this life?*
- **Karma Evolusi**: The primary spiritual lesson your soul is trying to learn.
- **Warisan Leluhur**: Patterns handed down by your family line.

### SECTION 5: KARYA & TALENTA (CAREER & TALENTS)
*What comes naturally to you, and how does wealth flow into your life?*
- **DNA Talenta**: Your 5 most consistent, effortless abilities.
- **Gaya Karya**: The ideal working environment and industry fit.
- **Aliran Rezeki**: How you block or unlock material abundance.

### SECTION 6: CINTA & RELASI (LOVE & RELATIONSHIPS)
*How do you bond, connect, and communicate?*
- **Gaya Ketertarikan**: What you are naturally drawn to and what you need in intimacy.
- **Pola Relasi**: How you behave when a relationship deepens.

### SECTION 7: RAGA & RUANG (HEALTH & ENVIRONMENT)
*How does your physical body interact with the physical world?*
- **Peta Chakra**: Vulnerable energy centers that hold physiological stress.
- **Sistem Cerna & Ruang**: Ideal environments and intake mechanics for optimal health.

### SECTION 8: FASE & PERTUMBUHAN (TIMING & STATE)
*Where are you right now?*
- **Musim Kehidupan (Macro Timing)**: The overarching theme of your current decade/year.
- **Fokus Hari Ini (State)**: The exact micro-step required today based on your active Innerwork.

---

## PART 7: CANONICAL OWNERSHIP

| Profile V4 Section | Canonical Domain | Owner System | Supporting System |
| :--- | :--- | :--- | :--- |
| **Arketipe Utama** | `identity` & `archetype` | Natal Chart (Sun) | Human Design (Profile) |
| **Misi Kehidupan** | `purpose` | Numerology (LP) | Destiny Matrix (Destiny Pt) |
| **Otoritas Batin** | `energy` | Human Design (Auth)| - |
| **Strategi Aksi** | `energy` | Human Design (Strat)| - |
| **Kapasitas Vitalitas**| `energy` | BaZi (Elements) | Destiny Matrix (Physics) |
| **Kebutuhan Emosional**| `psychology` | Natal Chart (Moon) | Destiny Matrix (Inner Child) |
| **Pola Sabotase** | `shadow` | Destiny Matrix (Karmic Tail) | Natal Chart (Chiron) |
| **Karma Evolusi** | `karma` | Vedic (Nodes) | - |
| **Warisan Leluhur** | `karma` | Destiny Matrix (Ancestors)| - |
| **DNA Talenta** | `talents` | Destiny Matrix (Talents) | HD (Channels) |
| **Gaya Karya** | `career` | BaZi (Career) | Natal Chart (MC) |
| **Aliran Rezeki** | `career` | Destiny Matrix (Money) | BaZi (Ten Gods) |
| **Gaya Ketertarikan** | `relationships`| Vedic (Darakaraka)| Natal Chart (Venus) |
| **Pola Relasi** | `relationships`| Destiny Matrix (Love) | - |
| **Peta Chakra** | `health` | Destiny Matrix (Chakras) | - |
| **Sistem Cerna** | `health` | Human Design (Variables)| - |
| **Musim Kehidupan** | `timing` | Vedic (Dashas) | BaZi (Luck Pillars) |
| **Fokus Hari Ini** | `growth` & `state`| State Engine (Innerwork) | Tzolkin (Daily) |

---

## PART 8: CONSUMPTION PLAN

### Data Ingestion Flow for V4 Cards
Profile V4 components **MUST NOT** import `lib/humandesign/types.ts` or read `blueprint.humanDesign`.

1. UI Component requests `CanonicalIdentity`.
2. `CanonicalTranslatorService` processes the blueprint and returns standard JSON.
3. UI renders `CanonicalIdentity.shadow.actionablePattern.value`.

### Invisible Systems
The following systems/components should **never** be exposed as raw UI cards in Profile V4 to prevent user confusion:
- Raw Astrological Aspects (Trines, Squares).
- Raw BaZi Ten Gods (Direct Wealth, Eating God).
- Raw Tzolkin Math (Galactic Tones, Harmonic Runs).
- Raw HD Gate details outside of the 5 main Talents.

*These mechanics operate purely as calculation logic behind the `CanonicalIdentity` layer.*

---

## PART 9: PROFILE V4 ROADMAP

### Phase 1: Quick Wins (Consolidation)
- **Goal**: Clean up V3 duplication without changing the data model.
- **Action**: Merge "Bayangan Jiwa", "Pola Berulang", and "Luka Inti" into a single "Bayangan & Pola Lama" card. Merge "Misi Jiwa" and "Cahaya Jiwa" into a single "Misi Batin" card.

### Phase 2: Medium Changes (New Domains)
- **Goal**: Expose highly valuable hidden data.
- **Action**: Create the "Kesehatan & Energi" (Health) section. Feed it using Destiny Matrix Chakras and BaZi Elements. Create the "Mekanika" (Energy) section explicitly for HD Strategy and Authority.

### Phase 3: Major Refactor (Profile V4 Release)
- **Goal**: Full launch of the new 8-section layout.
- **Action**: Deprecate `ProfileTabs.tsx`. Introduce the `CanonicalIdentity` object to the frontend. Implement the exact sections proposed in Part 6.

### Migration Strategy
1. Build `CanonicalIdentity` endpoint.
2. Build Profile V4 UI alongside Profile V3.
3. Route 10% of traffic to V4 (A/B Test) to measure engagement with Health and Timing sections.
4. If positive, deprecate V3 completely.

### Risk Analysis
- **User Disorientation**: Existing users love their "Destiny Matrix" tab. Removing the tab names might anger esoteric enthusiasts.
  - *Mitigation*: Inside every Card Detail view, include a "Source" button that reveals exactly which system calculated this insight (e.g., "Insight ini diolah dari Human Design Profile 4/6 dan Life Path 1").
- **Translator Service Failure**: If the `insightTranslator` fails, entire sections of the Profile turn blank.
  - *Mitigation*: Ensure aggressive fallback strategies. If HD fails to generate, the `CanonicalIdentity.energy.mechanic` must fallback gracefully to BaZi Elemental flow without breaking the UI.
