# Innerwork Source Map

Audit date: 19 June 2026

## Active recommendation chain

```text
/innerwork UI
  ↓
DailyGuidanceRepository (today's cached document)
  ↓
DailyGuidance.innerworkRecommendations
  ↓
AI orchestration when available
  OR
innerworkIntelligence local fallback
  ↓
practice library item
```

The local fallback terminates at `innerworkIntelligence.getRecommendations()`, which currently returns an empty object and generates an empty reason. Therefore the non-AI chain does not produce valid recommendations.

## Source status

| Source | Status | Evidence and effect |
|---|---|---|
| Profile | USED / FALLBACK BROKEN | Included in the AI prompt and old generators. The active local recommendation engine accepts profile fields but ignores all inputs. |
| Wellness | BYPASSED in module selection | Scan completion gates recommendation visibility, but scores and low-domain conditions do not filter the library pages. Wellness is included in the AI prompt only. |
| Daily Scan | BYPASSED | Used as an access-style gate through `lastAssessmentAt`, not as decision data selecting effort, duration, or practice type. |
| Navigator | BYPASSED | RECOVERY, REFLECTION, and GROWTH actions have their own engine/library. `/innerwork` neither reads nor passes Navigator state. |
| Journey | PARTIALLY USED | Histories and progress can enter the AI prompt. Module pages record completions, but recommendations do not reliably exclude completed practices or continue the previous practice. |
| Astro | USED in AI / old generators | The AI prompt asks Astro to affect Innerwork. The old generator adjusts difficulty from Astro intensity. The local active fallback ignores it. |
| Catatan | PROMPT-ONLY / BYPASSED at UI | The prompt declares `Catatan → Innerwork`, but the V6 dominant issue produced in the Catatan component is not persisted or passed to `/innerwork`. |
| Static Library | USED | Workout, yoga, food, variation content, and the hub menu are directly rendered. |
| Hardcoded fallback | USED | Manifestasi has generic absolute fallback text. Audio uses one fixed playlist. |

## Dormant alternative paths

- `InnerworkRuntimeAdapter` maps profile fields to practices, but no active caller was found.
- `generateInnerwork` selects three practices primarily by Life Path and modifies only difficulty using Astro intensity. It is not the active recommendation source on `/innerwork`.
- `NAVIGATOR_ACTIONS` is used by the Wellness Navigator engine, not by Innerwork.

## Verdict

**FAIL** — source inputs exist across the repository, but the active runtime does not reliably combine them into a valid, state-aware recommendation.
