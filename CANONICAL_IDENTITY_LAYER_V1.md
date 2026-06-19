# CANONICAL IDENTITY LAYER V1

## OVERVIEW

Bhumi is shifting from a blueprint calculation engine to a **Personal Intelligence Platform**. To achieve this, the architecture must transition from organizing data by *Systems* (e.g., Human Design, Astrology) to organizing data by **Human Domains** (e.g., Energy, Purpose, Shadow).

The **Canonical Identity Layer** is the single unified object that sits between the raw calculation engines and the consuming layers (Profile V4, Dashboard V4, Innerwork, Gaia V4). Consuming layers will strictly interface with this Canonical Object, decoupling the UI and AI from esoteric mechanics.

---

## PART 1: CANONICAL DOMAINS

We define 15 core domains of human experience. The blueprint must translate perfectly into these domains.

### 1. Identity
- **Purpose**: The core "I am", defining the primary personality and ego.
- **Scope**: Outer expression, initial impression, and conscious self-view.
- **Owner**: Natal Chart (Sun, Ascendant)
- **Secondary**: Human Design (Profile)
- **Support**: Weton (Watak)
- **Conflict Resolution**: Natal dictates the ego and emotional baseline; HD dictates the role played in society.

### 2. Purpose
- **Purpose**: The guiding "Why", the overarching life direction.
- **Scope**: Lifelong mission, driving motivation, legacy.
- **Owner**: Numerology (Life Path)
- **Secondary**: Destiny Matrix (Center/Destiny Point)
- **Support**: Tzolkin (Wavespell)
- **Conflict Resolution**: Numerology sets the broad thematic path; Destiny Matrix provides the specific actions to walk it.

### 3. Energy
- **Purpose**: The physical and auric mechanics of how to move through the world.
- **Scope**: Decision-making strategy, boundary setting, and inherent vitality type.
- **Owner**: Human Design (Type, Strategy, Authority)
- **Secondary**: BaZi (Day Master, Elements)
- **Support**: Destiny Matrix (Physics/Health Chart)
- **Conflict Resolution**: HD dictates the behavioral mechanic; BaZi dictates the elemental flavor feeding that mechanic.

### 4. Psychology
- **Purpose**: The inner emotional landscape and mental processing.
- **Scope**: How the individual processes feelings, communication, and security.
- **Owner**: Natal Chart (Moon, Mercury, Venus)
- **Secondary**: Numerology (Soul Urge)
- **Support**: Destiny Matrix (Chart Heart)
- **Conflict Resolution**: Natal Chart defines the structural emotional needs; Numerology defines the hidden subconscious drive.

### 5. Archetype
- **Purpose**: The mythic or societal role the individual naturally embodies.
- **Scope**: The recurring "character" played in community dynamics.
- **Owner**: Human Design (Incarnation Cross)
- **Secondary**: Tzolkin (Solar Seal / Kin)
- **Support**: Destiny Matrix (Arcana Roles)
- **Conflict Resolution**: HD Cross is the primary life work; Tzolkin is the poetic/mythic flavor.

### 6. Shadow
- **Purpose**: Unconscious defense mechanisms and trauma responses.
- **Scope**: Self-sabotage, deep fears, and actionable negative patterns.
- **Owner**: Destiny Matrix (Karmic Tail, Inner Child)
- **Secondary**: Natal Chart (Chiron, Black Moon Lilith)
- **Support**: Tzolkin (Galactic Tone Shadow)
- **Conflict Resolution**: Destiny Matrix is the actionable, repeated negative pattern; Natal represents the deeper, structural emotional wound.

### 7. Karma
- **Purpose**: The inherited or spiritual lessons to be resolved in this lifetime.
- **Scope**: Generational trauma, past life imprints, soul-level directives.
- **Owner**: Vedic (Atmakaraka, Rahu/Ketu)
- **Secondary**: Destiny Matrix (Ancestor Lines: Father/Mother)
- **Support**: Natal Chart (Lunar Nodes)
- **Conflict Resolution**: Vedic governs the soul's karmic evolution; Matrix governs immediate family/bloodline karma.

### 8. Talents
- **Purpose**: Inherent gifts and consistent capacities.
- **Scope**: Natural skills, what comes easily without force.
- **Owner**: Destiny Matrix (Talent Line)
- **Secondary**: Human Design (Defined Channels)
- **Support**: BaZi (Ten Gods Strengths)
- **Conflict Resolution**: Matrix dictates the expressed talent; HD dictates the energetic consistency of it.

### 9. Relationships
- **Purpose**: How the individual bonds, loves, and maintains intimacy.
- **Scope**: Romantic partnerships, platonic closeness, boundaries in love.
- **Owner**: Destiny Matrix (Love Line)
- **Secondary**: Vedic (Darakaraka / 7th House)
- **Support**: Natal Chart (Venus, Mars)
- **Conflict Resolution**: Matrix dictates the actionable relationship patterns; Vedic/Natal define inherent needs and attractions.

### 10. Career
- **Purpose**: How the individual creates wealth and contributes materially.
- **Scope**: Industry fit, wealth flow, professional environment.
- **Owner**: Destiny Matrix (Money Line)
- **Secondary**: BaZi (Career Path / Ten Gods)
- **Support**: Natal Chart (Midheaven / 10th House)
- **Conflict Resolution**: Matrix defines how wealth is unlocked; BaZi defines the elemental/industry fit.

### 11. Health
- **Purpose**: The physical and energetic constitution.
- **Scope**: Vulnerabilities, required routines, environmental needs.
- **Owner**: Destiny Matrix (Chakra Matrix / Health Chart)
- **Secondary**: Human Design (Variables: Digestion, Environment)
- **Support**: BaZi (Elemental Imbalances)
- **Conflict Resolution**: Matrix defines psychological-physical links (Chakras); HD defines biological interfaces (Digestion/Environment).

### 12. Spirituality
- **Purpose**: The path to inner peace and liberation.
- **Scope**: Connection to source, meaning-making, religious/spiritual frameworks.
- **Owner**: Vedic (Moksha Focus)
- **Secondary**: Tzolkin (Castles / Spiritual Lessons)
- **Support**: Destiny Matrix (Spiritual Purpose)
- **Conflict Resolution**: Vedic defines the path to ultimate liberation; Tzolkin defines daily spiritual synchronicity.

### 13. Growth
- **Purpose**: The current trajectory of personal development.
- **Scope**: Immediate goals, active challenges, measurable progress.
- **Owner**: Innerwork / User State
- **Secondary**: Destiny Matrix (Yearly Arcana)
- **Support**: Tzolkin (Wavespell)
- **Conflict Resolution**: Active user inputs (Innerwork tracking) ALWAYS override static blueprint predictions.

### 14. Timing
- **Purpose**: The atmospheric weather of the user's life right now.
- **Scope**: Transits, daily energy, long-term chapters.
- **Owner**: Vedic (Dashas) & BaZi (Luck Pillars) [Macro]
- **Secondary**: Tzolkin (Daily Kin) [Micro]
- **Support**: Astrology (Daily Transits)
- **Conflict Resolution**: Dashas set the decade-long theme; Tzolkin/Astrology set the daily mood.

### 15. State (NEW)
- **Purpose**: The real-time, dynamic condition of the user.
- **Scope**: Mood, energy levels, sleep quality, stress, streaks.
- **Owner**: Activity Engine / User Inputs
- **Secondary**: Wearable/Health Data (Future)
- **Support**: Innerwork Completion
- **Conflict Resolution**: User-reported state is absolute truth, superseding any blueprint calculation.

---

## PART 2: CANONICAL IDENTITY OBJECT

The final data structure consumed by UI and AI.

```typescript
interface CanonicalIdentity {
  uid: string;
  
  // DOMAIN: IDENTITY
  identity: {
    egoTheme: { value: string; owner: "Natal"; fallback: "Numerology" };
    archetypeRole: { value: string; owner: "HD"; fallback: "Weton" };
  };

  // DOMAIN: PURPOSE
  purpose: {
    lifeMission: { value: string; owner: "Numerology"; fallback: "Matrix" };
    actionPath: { value: string; owner: "Matrix"; fallback: "Tzolkin" };
  };

  // DOMAIN: ENERGY
  energy: {
    mechanic: { value: string; owner: "HD"; fallback: "BaZi" };
    constitution: { value: string; owner: "BaZi"; fallback: "HD" };
    strategy: { value: string; owner: "HD"; fallback: "Natal" };
  };

  // DOMAIN: PSYCHOLOGY
  psychology: {
    emotionalNeeds: { value: string; owner: "Natal"; fallback: "Numerology" };
    subconsciousDrive: { value: string; owner: "Numerology"; fallback: "Matrix" };
  };

  // DOMAIN: ARCHETYPE
  archetype: {
    primaryMyth: { value: string; owner: "HD"; fallback: "Tzolkin" };
  };

  // DOMAIN: SHADOW
  shadow: {
    actionablePattern: { value: string; owner: "Matrix"; fallback: "Natal" };
    deepWound: { value: string; owner: "Natal"; fallback: "Matrix" };
  };

  // DOMAIN: KARMA
  karma: {
    soulEvolution: { value: string; owner: "Vedic"; fallback: "Natal" };
    ancestralLine: { value: string; owner: "Matrix"; fallback: "Vedic" };
  };

  // DOMAIN: TALENTS
  talents: {
    manifested: { value: string[]; owner: "Matrix"; fallback: "HD" };
    consistent: { value: string[]; owner: "HD"; fallback: "BaZi" };
  };

  // DOMAIN: RELATIONSHIPS
  relationships: {
    attractionPattern: { value: string; owner: "Matrix"; fallback: "Vedic" };
    intimacyNeeds: { value: string; owner: "Vedic"; fallback: "Natal" };
  };

  // DOMAIN: CAREER
  career: {
    wealthFlow: { value: string; owner: "Matrix"; fallback: "BaZi" };
    industryFit: { value: string; owner: "BaZi"; fallback: "Natal" };
  };

  // DOMAIN: HEALTH
  health: {
    chakraVulnerabilities: { value: Record<string, string>; owner: "Matrix"; fallback: "Vedic" };
    biologicalInterface: { value: Record<string, string>; owner: "HD"; fallback: "BaZi" };
  };

  // DOMAIN: SPIRITUALITY
  spirituality: {
    liberationPath: { value: string; owner: "Vedic"; fallback: "Tzolkin" };
  };

  // DOMAIN: GROWTH
  growth: {
    currentFocus: { value: string; owner: "StateEngine"; fallback: "Matrix" };
    yearlyTheme: { value: string; owner: "Matrix"; fallback: "Vedic" };
  };

  // DOMAIN: TIMING
  timing: {
    macroCycle: { value: string; owner: "Vedic"; fallback: "BaZi" };
    microAtmosphere: { value: string; owner: "Tzolkin"; fallback: "Natal" };
  };

  // DOMAIN: STATE (Dynamic)
  state: {
    mood: string;
    energyLevel: "High" | "Medium" | "Low" | "Depleted";
    stressLevel: "High" | "Medium" | "Low";
    recentInteractions: string[]; // Last completed innerwork
  };
}
```

---

## PART 3: CANONICAL SCORING

To prevent the "Frankenstein effect" (where derived text contradicts itself), we assign strict weighting for synthesis generation.

*Architecture Only - Used by `insightTranslator` to generate the `CanonicalIdentity` strings.*

| Domain | Primary (60%) | Secondary (25%) | Support (15%) |
| :--- | :--- | :--- | :--- |
| **Purpose** | Numerology (Life Path) | Destiny Matrix (Center) | Tzolkin (Wavespell) |
| **Energy** | Human Design (Type/Auth) | BaZi (Elements) | Natal (Mars) |
| **Psychology** | Natal (Moon/Venus) | Destiny Matrix (Heart) | Numerology (Soul Urge) |
| **Shadow** | Destiny Matrix (Karmic Tail)| Natal (Lilith/Chiron) | Tzolkin (Tone Shadow) |
| **Career** | Destiny Matrix (Money) | BaZi (Ten Gods) | Natal (MC) |
| **Relationships**| Destiny Matrix (Love) | Vedic (Darakaraka) | Natal (Venus) |

---

## PART 4: PROFILE V4 CONSUMPTION

Profile V4 transitions from system tabs to **Human Domain Tabs**. It reads solely from `CanonicalIdentity`.

1. **Section: Identitas (Identity)**
   - Consumes: `CanonicalIdentity.identity`, `CanonicalIdentity.purpose`, `CanonicalIdentity.archetype`
2. **Section: Kondisi (Energy & Health)**
   - Consumes: `CanonicalIdentity.energy`, `CanonicalIdentity.health`, `CanonicalIdentity.state`
3. **Section: Peta Jiwa (Soul Map)**
   - Consumes: `CanonicalIdentity.psychology`, `CanonicalIdentity.shadow`, `CanonicalIdentity.karma`
4. **Section: Potensi (Potentials)**
   - Consumes: `CanonicalIdentity.talents`, `CanonicalIdentity.career`, `CanonicalIdentity.relationships`
5. **Section: Perjalanan (Path/Growth)**
   - Consumes: `CanonicalIdentity.spirituality`, `CanonicalIdentity.growth`, `CanonicalIdentity.timing`

---

## PART 5: DASHBOARD V4 CONSUMPTION

Dashboard widgets map precisely to domains to ensure contextual relevance.

- **Refleksi Jiwa**: `state` + `growth.currentFocus` + `timing.microAtmosphere`
- **Saran Bhumi**: `energy.mechanic` + `shadow.actionablePattern`
- **Catatan Hari Ini**: `timing.microAtmosphere` + `growth.yearlyTheme`
- **Astro Hari Ini**: `timing.microAtmosphere` (Natal Transits) mapped against `identity.egoTheme`
- **Journey**: `karma.soulEvolution` + `shadow.deepWound`
- **Share Cards**: Highlight extractions from `archetype.primaryMyth`, `purpose.lifeMission`, or `talents.manifested`
- **Daily Guidance**: `energy.strategy` + `timing.microAtmosphere` + `state.energyLevel`

---

## PART 6: INNERWORK INTELLIGENCE

Innerwork recommendations dynamically shift based on Canonical Domains and the current State.

- **Meditation**: Influenced by `health.chakraVulnerabilities`, `shadow.deepWound`, `state.stressLevel`. (e.g., grounding meditations when state is highly stressed or Root chakra is vulnerable).
- **Mudra / Yoga**: Influenced by `health.chakraVulnerabilities` and `energy.constitution`.
- **Audio Healing**: Influenced by `psychology.emotionalNeeds` and `state.mood`.
- **Journaling**: Influenced by `karma.ancestralLine`, `shadow.actionablePattern`, `growth.currentFocus`.
- **Workout**: Influenced by `health.biologicalInterface` (HD Environment/Digestion) and `state.energyLevel`.
- **Healthy Food**: Influenced by `health.biologicalInterface` (HD Digestion) and `energy.constitution` (BaZi Elements).

---

## PART 7: GAIA V4

Gaia V4 shifts from an esoteric reader to a **Holistic Personal Intelligence**. 

### Gaia Context Layer
Gaia strictly consumes `CanonicalIdentity`. It does not receive raw fields like `blueprint.humanDesign.type = "Generator"`. Instead, it receives: `energy.mechanic = "Designed to respond to the environment, generating sustainable energy when engaged in joyful work."`

### Minimal Context (Low Token Budget)
Used for quick chats or focused widget generation.
- `CanonicalIdentity.identity.egoTheme`
- `CanonicalIdentity.energy.strategy`
- `CanonicalIdentity.state`

### Extended Context (Deep Chat/Coaching)
- Minimal Context +
- `CanonicalIdentity.purpose`
- `CanonicalIdentity.shadow`
- `CanonicalIdentity.growth`
- `CanonicalIdentity.timing`

### Prompt Budget Strategy
- Never pass all 15 domains simultaneously.
- Map the user's prompt intent to specific domains (e.g., if user asks about work, inject `career` and `talents`).

---

## PART 8: STATE ENGINE

The most significant architectural shift in V4. Blueprint is **static**; State is **dynamic**.

- **Purpose**: To ground esoteric concepts in reality. If a blueprint says a user has infinite energy (Generator), but their State is "Depleted", the system must respect the State.
- **Dynamic Inputs**: User mood check-ins, journal entries completed, meditations finished, days active.
- **Interaction with Identity**: 
  - State **modifies** Identity expression. 
  - *Example*: `energy.mechanic` is "Manifestor" (Initiator). If `state.energyLevel` = "Low", Saran Bhumi advises: *"Istirahatlah hari ini. Sebagai inisiator, tenagamu butuh jeda sebelum lonjakan berikutnya."*

---

## PART 9: MIGRATION STRATEGY

**Current Flow (V3):**
`Raw Engine Data (Blueprint DB) -> UI Components (System Tabs)`

**Future Flow (V4):**
1. **Parallel Generation**: Implement the `CanonicalTranslatorService` on the backend. When a blueprint is updated, generate the `CanonicalIdentity` JSON object and store it alongside the raw blueprint.
2. **Hybrid UI**: Profile V4 releases with Domain Tabs, reading entirely from the `CanonicalIdentity` object. Legacy System Tabs (if kept for visual charts) read from the raw blueprint.
3. **Gaia Transition**: Switch Gaia V3 endpoints to inject the new `CanonicalIdentity` context payload instead of the massive stringified raw blueprint.

*No legacy data is destroyed; the Canonical Layer simply sits on top of the raw engines as a synthesis layer.*

---

## PART 10: RISKS

1. **Data Conflicts (The Frankenstein Effect)**: If scoring weights are poorly tuned, the generated Canonical text will contradict itself (e.g., HD saying "Wait", Natal saying "Attack"). **Mitigation**: Strict adherence to the Primary Owner resolution logic.
2. **Gaia Hallucinations**: If the Canonical Identity text is too abstract, Gaia might invent details. **Mitigation**: Provide concrete, actionable language in the Canonical object (e.g., "Must eat in a calm environment" rather than "Variable 3").
3. **Overlapping Systems / Dilution**: Translating specific esoteric terms (e.g., "Karmic Tail 18-9-9") into generic domains ("Actionable Pattern: Fear of isolation") risks losing the magic of the original system. **Mitigation**: Maintain deep-dive "Details" modals that reveal the exact source system and raw data for power users.
4. **Performance Risks**: Generating the Canonical Identity on the fly for every UI render will lag. **Mitigation**: Compute the `CanonicalIdentity` object on the server immediately after blueprint generation and cache it in Firestore/Redis.
5. **State Stagnation**: If a user doesn't update their state, the intelligence feels broken. **Mitigation**: Decay state over time. If a user hasn't checked in for 48 hours, `state.mood` reverts to "Unknown", and advice defaults back to baseline blueprint recommendations.
