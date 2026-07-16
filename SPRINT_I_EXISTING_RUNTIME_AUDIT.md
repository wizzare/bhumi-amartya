# BHUMI V4 — Sprint I Existing Runtime Audit

Status: Migration preparation only. No existing consumer is changed in Sprint I.

## Direct interpretation logic identified

| Existing area | Current direct responsibility | Canonical runtime destination | Migration status |
|---|---|---|---|
| `lib/services/humanMeaningService.ts` | Creates narrative Human Meaning directly from identity fields | Human Meaning Engine followed later by Narrative Engine | Candidate; unchanged |
| `lib/services/canonicalHumanMeaningService.ts` | Repackages narratives as cross-feature meaning payload | Runtime facade and future compatibility adapter | Candidate; unchanged |
| `lib/dailyGuidance/unifiedBlueprintSynthesis.ts` | Creates archetypes, needs, patterns, and humanized interpretations | Extraction, Characteristic, Trait, Pattern, Meaning, and Need Engines | Candidate; unchanged |
| `lib/profile/gaia/normalizeSources.ts` | Normalizes blueprint signals into feature tags | Knowledge Extraction Engine | Candidate; unchanged |
| `lib/profile/gaia/synthesisEngine.ts` | Creates patterns, needs, challenges, guidance, and narratives | Pattern, Meaning, Need, Growth, and future Narrative Engines | Candidate; unchanged |
| `lib/profile/createProfileInsights.ts` | Creates profile patterns and needs locally | Pattern and Need Engines | Candidate; unchanged |
| `lib/livingIntelligence/*` | Creates feature-specific behavioral patterns and narrative summaries | Dynamic Pattern, Insight, and Memory Engines | Candidate; unchanged |
| `lib/intelligence/recommendation*Engine.ts` | Calculates preference, context, and capacity recommendation adjustments | Future canonical Recommendation Engine inputs | Candidate; unchanged |
| `lib/engines/wellnessRecommendationEngine.ts` | Selects recommendations | Future canonical Recommendation Engine | Candidate; unchanged |
| `lib/engines/dailyGuidanceEngine.ts` | Creates contextual narratives and fallback meanings | Future runtime consumer and Narrative Engine | Candidate; unchanged |
| `lib/prompts/*` and `lib/ai/prompts/*` | Contains interpretation rules inside prompt instructions | Future presentation-only prompting after runtime adoption | Candidate; unchanged |

## Migration rule

None of these modules may be redirected to Human Meaning Runtime v1 before Founder Acceptance. Future migration must use compatibility adapters that translate object shape only and must not preserve duplicate interpretation logic.
