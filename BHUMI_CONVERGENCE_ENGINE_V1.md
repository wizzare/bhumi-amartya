# BHUMI CONVERGENCE ENGINE V1

## 1. Domain Architecture

Convergence Engine V1 is the intelligence layer above the existing four blueprint engines. It does not calculate new blueprint data and does not replace existing modules. It consumes normalized signals already produced from:

- Numerology
- Human Design
- Natal Chart
- Destiny Matrix

The engine turns multiple related signals into one meaning-first intelligence output per domain.

Runtime shape:

```ts
type ConvergenceDomain =
  | "coreShadow"
  | "coreTalent"
  | "careerDNA"
  | "relationshipDNA"
  | "soulMission"
  | "energyBlueprint";

type ConvergenceEngineSource =
  | "numerology"
  | "humanDesign"
  | "natalChart"
  | "destinyMatrix";

type ConvergenceOutput = {
  domain: ConvergenceDomain;
  title: string;
  pattern: string;
  meaning: string;
  reflection: string;
  guidance: string;
  action: string;
  confidence: 50 | 70 | 85 | 100;
  contributingEngines: ConvergenceEngineSource[];
  sourceBalance: Record<ConvergenceEngineSource, number>;
  creativeTensions: Array<{
    label: string;
    meaning: string;
    involvedEngines: ConvergenceEngineSource[];
  }>;
  evidenceRefs: string[];
};
```

The six V1 domains:

| Domain | Output | Existing Destination |
| --- | --- | --- |
| `coreShadow` | Core Shadow Pattern | Profile shadow cards, Daily reflection, Innerwork shadow work |
| `coreTalent` | Core Talent DNA | Profile talents, Dashboard identity language |
| `careerDNA` | Career DNA | Profile career cards, Career intelligence |
| `relationshipDNA` | Relationship DNA | Profile relationship cards, Reflection prompts |
| `soulMission` | Soul Mission | Profile spirituality, Daily guidance, Journey |
| `energyBlueprint` | Energy Blueprint | Innerwork, Profile energy, Daily practice selection |

## 2. Signal Mapping

The engine should use existing normalized signals first:

- Primary signal source: `normalizeGaiaSources(blueprint)` from `lib/profile/gaia/normalizeSources.ts`
- Existing synthesis source: `buildUnifiedBlueprintSynthesis(...)` from `lib/dailyGuidance/unifiedBlueprintSynthesis.ts`
- Existing profile intelligence: `synthesizeGaiaProfile(blueprint)` from `lib/profile/gaia/synthesisEngine.ts`

No raw source values should be exposed. Raw values can be used internally for scoring, but user-facing output must use meaning labels from the existing Profile meaning layer.

### Domain 1: Core Shadow

Inputs:

| Engine | Existing Signals |
| --- | --- |
| Numerology | `lifePath.negativeTraits`, `numerology.personality`, challenge-like weakness signals |
| Human Design | `notSelfTheme`, `openCenters`, `motivation` when routed as distortion/growth edge |
| Natal Chart | `Saturn`, `Chiron`, `SouthNode`, difficult aspects from `astrology.aspects` |
| Destiny Matrix | `karmicTail`, `ancestorLine`, shadow/family line signals |

Signal tags to prioritize:

- `recurring-pattern`
- `growth-edge`
- `inner-child`
- `past-pattern`
- `family-pattern`
- `wound-healing`
- `power-transformation`

Output:

- `pattern`: one repeated protection pattern
- `meaning`: why this pattern creates suffering
- `reflection`: where the blind spot usually appears
- `guidance`: how to interrupt the pattern
- `action`: one small stabilizing action

### Domain 2: Core Talent

Inputs:

| Engine | Existing Signals |
| --- | --- |
| Numerology | `expression`, `lifePath.positiveTraits` |
| Human Design | `channels`, `gates`, `profile` |
| Natal Chart | `Mercury`, `Jupiter`, `dominance.dominantPlanet` |
| Destiny Matrix | `talentsGreat`, `talentsFather`, `talentsMother`, `purposes` |

Signal tags to prioritize:

- `natural-strength`
- `communication-gift`
- `value-creation`
- `expansion-zone`
- `life-direction`
- `ancestry-wisdom`

Output:

- `pattern`: natural value creation style
- `meaning`: what comes naturally
- `reflection`: where talent is already showing up
- `guidance`: how to train it
- `action`: one concrete talent experiment

### Domain 3: Career DNA

Inputs:

| Engine | Existing Signals |
| --- | --- |
| Numerology | `lifePath.number`, `expression`, `personality` |
| Human Design | `type`, `environment`, `motivation`, `channels` |
| Natal Chart | `Mercury`, `Mars`, `Jupiter`, `Saturn`, `Midheaven` |
| Destiny Matrix | `talentsGreat`, `moneyLine`, `purposes` |

Signal tags to prioritize:

- `work-style`
- `career-direction`
- `value-creation`
- `economic-pattern`
- `ideal-environment`
- `inner-driver`
- `natural-strength`

Output:

- `pattern`: best-fit work style
- `meaning`: natural contribution
- `reflection`: what kind of work drains or strengthens the user
- `guidance`: how to choose better work structures
- `action`: one career validation step

### Domain 4: Relationship DNA

Inputs:

| Engine | Existing Signals |
| --- | --- |
| Numerology | `soulUrge`, `personality` |
| Human Design | `profile`, `authority` |
| Natal Chart | `Venus`, `Moon`, `Chiron` |
| Destiny Matrix | `loveLine`, `motherLine`, `fatherLine`, family line signals |

Signal tags to prioritize:

- `love-style`
- `emotional-needs`
- `relationship-pattern`
- `connection-style`
- `family-pattern`
- `decision-rhythm`
- `wound-healing`

Output:

- `pattern`: connection style
- `meaning`: what creates closeness
- `reflection`: repeated relational lesson
- `guidance`: how to communicate needs
- `action`: one relationship repair or boundary step

### Domain 5: Soul Mission

Inputs:

| Engine | Existing Signals |
| --- | --- |
| Numerology | `lifePath.role`, `soulUrge` |
| Human Design | `incarnationCross`, `profile` |
| Natal Chart | `NorthNode`, `Sun`, `Midheaven` |
| Destiny Matrix | `arcanaCenter` / `center`, `purposes` |

Signal tags to prioritize:

- `soul-direction`
- `life-direction`
- `evolution-direction`
- `value-creation`
- `archetype`
- `power-transformation`

Output:

- `pattern`: direction life keeps pointing toward
- `meaning`: lesson that returns across systems
- `reflection`: where meaning becomes visible
- `guidance`: how to ground purpose
- `action`: one purpose-led action that is useful today

### Domain 6: Energy Blueprint

Inputs:

| Engine | Existing Signals |
| --- | --- |
| Numerology | emotional tendencies from strengths/challenges, `soulUrge`, energy-rhythm numerology signals |
| Human Design | centers, authority, variables, cognition, digestion |
| Natal Chart | `elements`, `modalities`, dominant element |
| Destiny Matrix | `chakraMatrix`, `healthChart`, `dominantChakra` |

Signal tags to prioritize:

- `energy-balance`
- `energy-rhythm`
- `grounding`
- `decision-rhythm`
- `emotional-needs`
- `perception-mode`
- `learning-mode`

Output:

- `pattern`: natural energy flow
- `meaning`: where energy is gained
- `reflection`: where energy is lost
- `guidance`: how to regulate the system
- `action`: one body-based practice

## 3. Confidence System

Confidence is based on engine coverage, not number of individual fields.

| Contributing Engines | Confidence |
| --- | --- |
| 4 engines | 100 |
| 3 engines | 85 |
| 2 engines | 70 |
| 1 engine | 50 |
| 0 engines | no convergence output |

Engine mapping must collapse local source names into the four official engines:

| Local Source Names | Engine |
| --- | --- |
| `lifePath`, `numerology` | Numerology |
| `humanDesign` | Human Design |
| `natalChart`, `elements` | Natal Chart |
| `destinyMatrix`, `chakra`, `innerChild`, `arcana` | Destiny Matrix |

Confidence should be stored on every `ConvergenceOutput.confidence`.

Profile `GaiaInsight.meta.confidence` can continue to exist, but Convergence V1 confidence should be separate because it answers engine coverage, not profile-card coverage.

## 4. Conflict Resolution

The engine must not label cross-system differences as contradictions. It should mark them as `Creative Tension`.

Conflict detection rule:

1. Convert each signal into a meaning axis.
2. Compare axes inside one convergence domain.
3. If two strong axes pull in different directions, create a creative tension.
4. Resolve the tension as guidance, not as an error.

V1 meaning axes:

| Axis | Signals That May Indicate It |
| --- | --- |
| Independence | HD autonomy themes, Mars action, self-driven career tags |
| Partnership | Venus, Moon, love line, relationship pattern tags |
| Stability | Saturn, Earth element, fixed modality, grounding tags |
| Change | Uranus, mutable modality, exploration/freedom tags |
| Visibility | Midheaven, Sun, expression, value creation tags |
| Retreat | open centers, Projector/Reflector pacing, inner child safety tags |
| Structure | Life Path discipline, Saturn, defined centers, career-direction tags |
| Flow | Water element, Moon, soul urge, emotional-needs tags |

Example output:

```ts
creativeTensions: [
  {
    label: "Creative Tension: freedom and closeness",
    meaning: "A part of you needs room to move, while another part grows through steady emotional connection. The task is not choosing one, but building relationships that leave space for both.",
    involvedEngines: ["humanDesign", "natalChart", "destinyMatrix"],
  },
]
```

## 5. Output Structure

Every convergence domain returns the same user-facing structure:

- `title`
- `pattern`
- `meaning`
- `reflection`
- `guidance`
- `action`

Internal metadata:

- `domain`
- `confidence`
- `contributingEngines`
- `sourceBalance`
- `creativeTensions`
- `evidenceRefs`

User-facing language rules:

- Do not show Gate numbers.
- Do not show Channel numbers.
- Do not show Arcana numbers.
- Do not show House numbers.
- Do not show Life Path numbers.
- Do not show raw planetary degree, longitude, or retrograde data.
- Do not say a blueprint source “proves” something.
- Say “pola yang terlihat”, “tema yang berulang”, “arah yang muncul”, or “bagian dirimu yang meminta perhatian”.

Bad output:

> Gate 48, Arcana 15, and Saturn in House 8 indicate fear.

Correct output:

> Beberapa lapisan profilmu menunjukkan pola hati-hati yang muncul saat kamu merasa harus memegang kendali. Pola ini bisa membuatmu menunda meminta bantuan, bahkan ketika tubuh sudah memberi sinyal lelah.

## 6. Runtime Flow

V1 should be implemented as a pure engine using existing data.

Recommended file:

```txt
lib/engines/convergenceEngine.ts
```

Runtime sequence:

```txt
Blueprint
  -> normalizeGaiaSources(blueprint)
  -> group signals by convergence domain
  -> collapse local source names into 4 official engines
  -> cap source balance at 40%
  -> detect agreement tags
  -> detect creative tension axes
  -> create meaning-first output
  -> return six ConvergenceOutput objects
```

No new persisted blueprint fields are required for V1. The engine can be called at runtime wherever intelligence is needed. If caching is later required, store the output as derived profile intelligence, not as new blueprint data.

Source balancing:

```txt
For each domain:
1. Collect candidate signals.
2. Group by official engine.
3. Score each signal by quality and tag relevance.
4. Sum engine scores.
5. Normalize to 100.
6. Cap each engine at 40.
7. Re-distribute overflow across other present engines.
```

This prevents Life Path, Sun Sign, Destiny Matrix, or any single system from dominating an output.

Domain scoring:

```txt
domainScore(signal) =
  signal.quality
  + tag match weight
  + source diversity bonus
  - duplicate field penalty
```

Duplicate field penalty avoids repeating the same system under multiple labels.

## 7. Integration Points

### Profile

Current:

- `synthesizeGaiaProfile(blueprint)` creates many Profile cards from `GaiaSignal`.

Integration:

- Call `convergenceEngine.calculate(blueprint)` inside Profile synthesis.
- Use convergence outputs to strengthen:
  - `coreShadow` -> `recurringPatterns`, `coreWound`, `shadowIntegration`
  - `coreTalent` -> `talentDNA`, `coreStrengths`, `topTalents`
  - `careerDNA` -> `careerDNA`, `valueCreation`, `moneyBlock`
  - `relationshipDNA` -> `loveStyle`, `emotionalNeeds`, `relationshipLessons`
  - `soulMission` -> `soulMission`, `dharmaPath`, `soulPurpose`
  - `energyBlueprint` -> `chakraProfile`, `strongestEnergyArea`, `rechargePattern`

Profile cards should still display their existing detail structure, but their narrative should prefer convergence language when a domain has confidence `>= 70`.

### Daily Guidance

Current:

- `dailyGuidanceEngine.ts` builds `buildUnifiedBlueprintSynthesis(...)`.
- Prompts and local fallback already consume broad blueprint signals.

Integration:

- Add convergence outputs to `UnifiedBlueprintSynthesis`.
- Daily guidance should use:
  - `coreShadow` for emotional focus and blind spot reflection
  - `soulMission` for daily meaning
  - `energyBlueprint` for pacing and body guidance
  - `careerDNA` only when daily focus involves work/value/action

Daily output must remain short and meaning-first.

### Innerwork

Current:

- `innerworkIntelligence.getRecommendations(...)` already reads raw blueprint and `unifiedBlueprint`.

Integration:

- Pass convergence outputs into `InnerworkRecommendationInput`.
- Use:
  - `coreShadow` -> shadow work and reflection prompt
  - `energyBlueprint` -> meditation, breathwork, yoga, audio healing
  - `relationshipDNA` -> relational journaling
  - `careerDNA` -> manifestation/action practice

Innerwork should not show convergence metadata. It should translate the domain into:

- focus latihan
- fokus emosi
- fokus tubuh
- refleksi
- aksi kecil

### Career Intelligence

Current:

- `careerIntelligenceEngine.ts` has separate career-specific logic.

Integration:

- Use `careerDNA` convergence as the top-level career summary.
- Existing career fields can remain as supporting sections.

### Journal, Meditation, Healing, Retention

Current:

- Several engines call `buildUnifiedBlueprintSynthesis(...)`.

Integration:

- Once convergence is available inside unified synthesis, downstream modules can consume it without direct blueprint parsing.

Primary downstream fields:

- `coreShadow.pattern`
- `relationshipDNA.reflection`
- `soulMission.guidance`
- `energyBlueprint.action`

## V1 Implementation Boundary

Allowed:

- Add `lib/engines/convergenceEngine.ts`.
- Add convergence types to the same file or to an existing shared type file if needed.
- Reuse `normalizeGaiaSources`.
- Reuse `buildUnifiedBlueprintSynthesis`.
- Add `convergence` to `UnifiedBlueprintSynthesis`.
- Let Profile, Daily Guidance, Innerwork, and Career read convergence output.

Not allowed:

- No new blueprint engines.
- No V4 naming.
- No new UI redesign.
- No raw source codes in user-facing output.
- No replacing existing modules.
- No generating new birth-derived data.

## Minimum Acceptance Criteria

Convergence Engine V1 is complete when:

- It returns all six domains for a complete blueprint.
- Each domain reports contributing engines and confidence.
- Source balance caps any single engine at 40%.
- Creative tensions are detected and worded as integration guidance.
- Outputs use meaning, reflection, guidance, and action.
- No raw Gate, Channel, Arcana, House, Life Path number, longitude, or degree appears in user-facing convergence text.
- Profile can consume convergence outputs.
- Daily Guidance can consume convergence outputs through unified synthesis.
- Innerwork can consume convergence outputs through unified synthesis or direct input.
