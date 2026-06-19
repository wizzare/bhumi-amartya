# Kenali Diri Source Map

## Complete Chain

```text
AppNav "Kenali Diri"
↓
/wellness-assessment
↓
WellnessAssessmentFlow
↓
Eight self-report answers
↓
assessmentScoringEngine
↓
wellnessMappingEngine
├── wellnessNavigatorEngine
└── wellnessSupportEngine
↓
Wellness result views
↓
UI
```

Saved-result branch:

```text
Firestore wellnessMappings/{uid}
↓
wellnessMappingRepository
↓
Mapping + derived Navigator + derived Support Path
↓
Results UI
```

## Section Source Audit

| SECTION | UI | RUNTIME | MEANING | CANONICAL | SOURCE |
|---|---|---|---|---|---|
| Intro | `WellnessAssessmentFlow` | Local stage state | Fixed translated copy | None | Translation dictionary |
| Questions | `WellnessAssessmentFlow` | Local answer state | Fixed questionnaire wording | None | Eight hardcoded questions |
| Tema Saat Ini | `WellnessNavigatorView` | `wellnessNavigatorEngine` | Rule-selected action library | None | Assessment dimension scores and top wellness category |
| Pola Diri | `WellnessMappingView` | `wellnessMappingEngine` | Fixed category labels/explanations | None | Assessment scores; optional check-in boosters in mapping model |
| Perhatian Ekstra | `WellnessMapView` | `assessmentScoringEngine` | Score bands | None | User answers |
| Jalur Aman | `WellnessSupportPathView` | `wellnessSupportEngine` | Fixed level/reason/resource library | None | Mapping category and dimension thresholds |
| Basic support CTAs | `WellnessAssessmentFlow` | Static link inventory | Fixed translated labels | None | Hardcoded routes |
| Community support CTAs | `WellnessAssessmentFlow` | Static configuration | Fixed translated labels | None | `COMMUNITY_CONFIG` and disabled placeholders |
| Next-step statement | `WellnessAssessmentFlow` | None | Fixed narrative | None | UI literal |

## Dependency Verification

| DEPENDENCY | USED? | FINDING |
|---|---:|---|
| Canonical Identity | No | No Canonical translator or Canonical type is imported by the route. |
| Human Meaning | No | No `HumanMeaningService` input is used. |
| Runtime Adapter | Partial | Dedicated wellness engines exist, but there is no KARA Canonical/Human Meaning runtime adapter. |
| Legacy Gaia | No | No Gaia profile or Gaia synthesis dependency exists. |
| Legacy Translator | No | No Profile Echo or legacy translator is used. |
| Raw Blueprint | No | The route does not load Blueprint. |
| AI-generated content | No | All results are deterministic/rule-based. |
| Cache/persistence | Yes | Firestore `wellnessMappings/{uid}` can restore the latest saved mapping. |
| Fallback | Yes | Default top category, default scores/modes, loading placeholders, error copy, and static action selection are present. |

## Generator Details

### Assessment scoring

`assessmentScoringEngine` converts 1–5 answers into five 0–100 dimensions:

- Body
- Emotion
- Relationship
- Meaning
- Spirituality

### Wellness mapping

`wellnessMappingEngine` calculates named probabilities including:

- Growth Phase
- Burnout
- Life Transition
- Life Crisis
- Loss and Grief
- Anxiety
- Loneliness
- Meaning Crisis
- Spiritual Awakening
- Spiritual Crisis

### Navigator

`wellnessNavigatorEngine` selects Recovery, Reflection, or Growth mode and chooses actions from a static library. Supporting actions are randomized with `Math.random()`.

### Support path

`wellnessSupportEngine` selects levels 1–6 through dimension thresholds and top-theme rules.

## Architecture Finding

Kenali Diri is a standalone deterministic wellness-assessment architecture:

```text
Self-report answers
↓
Scoring rules
↓
Wellness classification
↓
Action and support rules
↓
UI
```

It neither leaks Blueprint data nor connects to the expected KARA V3 identity chain.
