# Dashboard Mirror Source Map

## Scope

Artifact and source-code trace only. No browser validation and no implementation changes.

## Active Source Chain

```text
app/dashboard/page.tsx
↓
components/dashboard/DashboardClient.tsx
↓
components/dashboard/SoulReflectionCard.tsx
↓
DailyGuidance.soulReflectionText
↓
localStorage cache OR Firestore dailyGuidance OR /api/ai/daily-guidance OR client fallback
↓
lib/engines/dailyGuidanceEngine.ts OR lib/orchestrators/localDailyGuidanceFallback.ts
↓
Prompt-level Mirror synthesis OR legacy/local fallback synthesis
↓
Raw profile + raw blueprint + journey/state context
↓
Human Design / Destiny Matrix / astrology / numerology and related source engines
```

## Layer Trace

| LAYER | ACTIVE FILE / SERVICE | RESPONSIBILITY |
|---|---|---|
| Dashboard UI | `app/dashboard/page.tsx` | Mounts the protected Dashboard. |
| Dashboard runtime client | `components/dashboard/DashboardClient.tsx` | Resolves cached, stored, API-generated, or locally generated `DailyGuidance`. Passes `dailyGuidance.soulReflectionText` to the card. |
| Mirror component | `components/dashboard/SoulReflectionCard.tsx` | Cleans Markdown, adds a time-of-day greeting, and renders the supplied reflection. It does not generate meaning. |
| Persistence/runtime structure | `lib/repositories/dailyGuidanceRepository.ts` | Reads and writes `DailyGuidance` at `dailyGuidance/{uid_date}`. |
| API endpoint | `app/api/ai/daily-guidance/route.ts` | Sends profile, blueprint, state, memory, and sky inputs to `dailyGuidanceEngine`. |
| Primary generation service | `lib/engines/dailyGuidanceEngine.ts` | Generates AI guidance, maps `soulReflectionText`, or creates an engine fallback. |
| AI prompt meaning | `lib/prompts/dailyGuidancePrompt.ts` and `lib/prompts/bhumiSoulMirrorPrompt.ts` | Instructs the model to convert blueprint identity and journey memory into a human-facing Mirror. This is prompt-level meaning, not Profile V4 Human Meaning. |
| Blueprint synthesis | `lib/dailyGuidance/unifiedBlueprintSynthesis.ts` | Collects identity signals and full raw blueprint structures for generation. |
| Client fallback service | `lib/orchestrators/localDailyGuidanceFallback.ts` | Produces Mirror text locally from unified synthesis and legacy intelligence engines when the API path fails. |
| Display sanitizer | `lib/dailyGuidance/normalizeUserFacingGuidance.ts` | Performs limited phrase replacement and removes lines matching three named matrix terms or multi-number patterns. It is not a complete semantic translation layer. |

## Runtime Resolution Order

`DashboardClient` resolves Mirror content in this order:

1. Valid browser cache: `dailyGuidance:${uid}:${date}`.
2. Valid Firestore `dailyGuidance` document.
3. `POST /api/ai/daily-guidance`.
4. Client-side `generateLocalDailyGuidance(...)` fallback.

The API service has its own fallback:

1. AI output generated from `buildDailyGuidancePrompt(...)`.
2. `dailyGuidanceEngine.generateFallbackDailyGuidance(...)`.
3. Mirror text from `generateFallbackSoulReflection(...)`.

Consequently, the visible Mirror does not have one guaranteed semantic source. Its source depends on cache state, stored data, AI availability, and fallback execution.

## Dependency Verification

| DEPENDENCY | USED BY MIRROR? | EVIDENCE |
|---|---:|---|
| Profile V4 Human Meaning service | No | No `HumanMeaningService` dependency exists in the active Mirror chain. The AI prompt acts as an independent meaning mechanism. |
| Profile V4 Canonical Identity | No | No `CanonicalIdentity` or Canonical Translator dependency exists in the active Mirror chain. Raw profile and blueprint objects are supplied instead. |
| State Engine | Indirectly | `DashboardClient` reads daily state. Adaptive context, emotional state, healing progress, and safety context can influence generated guidance, but state does not directly provide the rendered text. |
| Journey Runtime | No direct runtime dependency | No Journey Runtime adapter supplies the Mirror. Journal, meditation, audio, activity, weekly reflection, and progress history are used as journey-like memory inputs. |
| Gaia Runtime | No | No Gaia Runtime service supplies `soulReflectionText`. |
| Legacy Gaia Profile | No direct Mirror source | `gaiaProfile` is passed to innerwork recommendation logic, not selected as the Mirror text source. |
| Raw blueprint | Yes | Dashboard and API paths pass the blueprint into unified synthesis and prompt/fallback generation. |
| Raw profile | Yes | Identity fields and profile context are read directly by generation services. |

## Current State or Static Identity

| BRANCH | BASIS |
|---|---|
| AI-generated Mirror | Hybrid. Static blueprint identity is the primary identity source; journey memory and adaptive/current-state context can modify the reflection. The Mirror prompt explicitly excludes transits from the core reflection. |
| API engine fallback | Predominantly static identity. It derives archetypes from Life Path, Human Design type/profile, Destiny Matrix center, and natal Sun/Moon, with date-based variation. |
| Client local fallback | Predominantly static identity synthesis, with optional weekday, wellness, memory, and activity context. |
| Cached or stored Mirror | Whatever source produced the persisted `soulReflectionText`; the component does not re-establish its semantic provenance. |

## Source Engines

The synthesis and fallback paths can consume outputs originating from:

- Human Design calculations and labels.
- Destiny Matrix values and intelligence.
- Natal astrology signs and chart interpretation.
- Numerology/Life Path.
- Chakra and wellness mappings where available.
- Journal, meditation, audio-healing, activity, and progress history.

## Machine-Language Entry Points

```text
Raw blueprint/profile structures
↓
unifiedBlueprintSynthesis identitySignals/fullBlueprint
↓
AI prompt or local/engine fallback
↓
limited text normalization
↓
DailyGuidance.soulReflectionText
↓
SoulReflectionCard
```

Machine language can enter at `unifiedBlueprintSynthesis`, legacy intelligence-engine outputs, archetype construction, or generated AI output. The final normalizer only recognizes a narrow set of terms and numeric-list patterns; it does not generally detect internal variable names, Human Design labels, zodiac lists, chakra field names, or all raw engine output.

## Conclusion

Dashboard Mirror is a separate Daily Guidance synthesis pipeline. It does not use Profile V4 Canonical Identity or Profile V4 Human Meaning as its required source. The AI branch attempts human translation through prompts, while the two fallback branches generate directly from raw/legacy blueprint-derived signals. This is where machine-language leakage can enter the user-facing Mirror.
