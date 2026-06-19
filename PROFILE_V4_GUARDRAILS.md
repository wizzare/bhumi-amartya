# PROFILE V4 GUARDRAILS

These rules protect the frozen 42-card Profile V4 baseline.

## Conformance Rules

1. Every Profile section and card must originate in `PROFILE_V4_FINAL_IDENTITY_WAREHOUSE.md`.
2. `PROFILE_V4_CARD_INVENTORY.md` must match the Warehouse card names, section placement, and counts.
3. Every card must complete `Warehouse → Canonical → Human Meaning → Runtime → UI`.
4. No Profile Runtime card may bypass `HumanMeaning`.
5. No Profile Runtime narrative field may contain a literal narrative.
6. Runtime may contain structural card titles only; `shortMeaning`, `expandableInsight`, and `actionableReflection` must come from `HumanMeaning`.
7. `ProfileRuntimeAdapter` must not import or read `Blueprint`.
8. UI components must render `ProfileSection` and `ProfileCard` data from Runtime; they must not construct card inventory or meaning.
9. No UI card may exist without a Runtime source.
10. No Runtime card may exist without a Warehouse card.
11. No Human Meaning card narrative may remain unused by Runtime.
12. No Canonical field added for Profile may remain unmapped by `CanonicalTranslatorService`.
13. No fallback, placeholder, “coming soon,” substitute, or graceful-derivation card may enter Profile inventory.
14. A missing source value must not cause Runtime to invent card content.
15. Section names, card names, order, and counts remain frozen until the formal change protocol is completed.

## Synchronized Files

| LAYER | AUTHORITATIVE FILES | SYNCHRONIZATION REQUIREMENT |
| :--- | :--- | :--- |
| Warehouse | `PROFILE_V4_FINAL_IDENTITY_WAREHOUSE.md` | Defines allowed sections, cards, ownership, and intent |
| Inventory | `PROFILE_V4_CARD_INVENTORY.md` | Must mirror Warehouse names and counts |
| Canonical types | `lib/types/canonical.ts` | Must expose every card dependency inside existing approved domains |
| Canonical mapping | `lib/services/canonicalTranslatorService.ts` | Must map existing Blueprint sources into every required Canonical field |
| Meaning types | `lib/types/humanMeaning.ts` | Must expose one Runtime-consumable narrative path per card |
| Meaning generation | `lib/services/humanMeaningService.ts` | Must consume Canonical only |
| Runtime types | `lib/types/profileRuntime.ts` | Defines card and section delivery contract |
| Runtime mapping | `lib/services/profileRuntimeAdapter.ts` | Must map all 42 cards exclusively from Human Meaning |
| Profile hub | `app/profile/page.tsx` | Must obtain sections through Translator → Meaning → Runtime |
| Section route | `app/profile/[section]/page.tsx` | Must route into the shared section renderer |
| UI renderer | `components/profile/details/ProfileSectionClient.tsx` | Must display Runtime cards without creating meaning or inventory |
| Validation baseline | `PROFILE_V4_42_OF_42_VALIDATION.md`, `PROFILE_V4_COMPLETION_REPORT.md`, `PROFILE_V4_BASELINE.md` | Must be regenerated or explicitly superseded after an approved inventory change |

## Required Static Checks

Every Profile change must confirm:

- Exactly 8 sections.
- Exactly 42 cards unless an inventory change was formally approved.
- Exactly 42 Runtime mappings for each narrative field.
- Zero literal `shortMeaning`, `expandableInsight`, or `actionableReflection` values in `ProfileRuntimeAdapter`.
- Zero Blueprint imports or reads in `ProfileRuntimeAdapter`.
- Zero Runtime cards absent from Warehouse.
- Zero Warehouse cards absent from Runtime.
- Zero Human Meaning card narratives unused by Runtime.
- Zero duplicate card titles.
- Zero fallback card titles.

## Erosion Conditions

Profile V4 loses baseline conformance immediately if any of these occur:

- A card is added only in UI or Runtime.
- A card is removed from Runtime while remaining in Warehouse.
- Runtime derives meaning directly from Canonical or Blueprint.
- UI derives meaning directly from Canonical, Human Meaning, or Blueprint instead of consuming Runtime.
- A narrative literal is placed in Runtime.
- A Canonical dependency is renamed without updating Meaning and validation.
- A Human Meaning path is renamed without updating Runtime and validation.
- Section or card ordering diverges from Warehouse.
- Baseline reports claim PASS while source inspection shows a broken layer.
