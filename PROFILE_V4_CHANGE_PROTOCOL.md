# PROFILE V4 CHANGE PROTOCOL

This protocol is mandatory whenever Profile V4 evolves.

## 1. Authorize Inventory Change

Before code changes:

1. Update `PROFILE_V4_FINAL_IDENTITY_WAREHOUSE.md`.
2. Update `PROFILE_V4_CARD_INVENTORY.md`.
3. State the affected section, card name, purpose, owner, existing source fields, and expected output.
4. Confirm that the change does not create an unapproved domain, duplicate card, or substitute card.

No downstream layer may change before Warehouse and Inventory agree.

## 2. Canonical First

1. Identify the existing Canonical domain that owns the card.
2. Add or update only the required field in `lib/types/canonical.ts`.
3. Map existing Blueprint data in `lib/services/canonicalTranslatorService.ts`.
4. Do not create synthetic values.
5. Do not read Runtime, UI, Journey, Dashboard, Gaia, or Innerwork data to patch a Profile gap.

Canonical gate:

- The field exists in the approved domain.
- Translator mapping exists.
- Mapping uses an existing authoritative source.
- No consumer-layer fallback is required.

## 3. Human Meaning Second

1. Add or update the card narrative contract in `lib/types/humanMeaning.ts`.
2. Generate the narrative in `lib/services/humanMeaningService.ts`.
3. Consume Canonical only.
4. Produce `short`, `medium`, and `long`.
5. Preserve compatibility summaries used by existing consumers when required.

Meaning gate:

- Every narrative has a Canonical dependency.
- No Blueprint access exists.
- No orphan narrative is introduced.

## 4. Runtime Third

1. Add or update the card mapping in `lib/services/profileRuntimeAdapter.ts`.
2. Preserve Warehouse section, name, and order.
3. Map:
   - `shortMeaning` from Human Meaning `short`
   - `expandableInsight` from Human Meaning `medium`
   - `actionableReflection` from Human Meaning `long`
4. Do not place narrative literals in Runtime.
5. Do not import Blueprint or derive content in Runtime.

Runtime gate:

- Card count matches Warehouse.
- Every card reads Human Meaning.
- No extra, fallback, duplicate, or orphan card exists.

## 5. UI Last

UI changes are permitted only after the Runtime gate passes.

1. UI renders `ProfileSection[]` and `ProfileCard`.
2. UI must not construct cards, meanings, or Canonical mappings.
3. UI route names must continue to resolve the Warehouse section.
4. UI visibility must not silently filter valid Runtime cards.

UI gate:

- Every Runtime card remains renderable.
- No UI-only card exists.
- No Runtime card is hidden without an approved Warehouse rule.

## 6. Required Validation

Run source verification for every card:

`Warehouse → Canonical field → Translator mapping → Human Meaning path → Runtime card`

Required checks:

1. Expected section count.
2. Expected card count.
3. Connected card count.
4. Broken card count.
5. Runtime narrative literal count.
6. Fallback card count.
7. Duplicate card count.
8. Orphan Canonical count.
9. Orphan Meaning count.
10. Orphan Runtime count.
11. Focused TypeScript and ESLint checks for changed Profile-chain files.
12. Repository-wide failures must be separated into change-related and pre-existing failures.

## 7. Baseline Update

After all checks pass:

1. Update or supersede `PROFILE_V4_42_OF_42_VALIDATION.md`.
2. Update or supersede `PROFILE_V4_COMPLETION_REPORT.md`.
3. Update `PROFILE_V4_BASELINE.md`.
4. Update guardrail counts only when the Warehouse change was formally approved.
5. Record the new section/card totals and dependency paths.

The change is incomplete until the baseline documents and source code agree.

## Mandatory Order

1. Warehouse
2. Inventory
3. Canonical type
4. Canonical translator
5. Human Meaning type
6. Human Meaning generator
7. Runtime mapping
8. UI rendering
9. Validation
10. Baseline lock

Skipping or reversing this order is a conformance failure.
