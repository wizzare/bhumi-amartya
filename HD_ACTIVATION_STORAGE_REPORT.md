# HD Activation Storage Report

## Activation Source Audit

The Human Design engine already calculates complete planet activations in:

- `diagnostic.raw_design_gates`
- `diagnostic.raw_personality_gates`

Each activation contains:

- `planet`
- `gate`
- `line`
- `color`
- `tone`
- `base`

The engine only includes this diagnostic payload when `debug: true` is supplied. The production calculation route previously omitted that flag, so activation arrays were empty even though the engine had calculated them.

## Persistence Fix

The internal engine request now includes `debug: true`.

Canonical blueprint fields are persisted as:

- `humanDesign.designActivations[]`
- `humanDesign.personalityActivations[]`

Legacy diagnostic and raw fields remain preserved for compatibility.

The complete path is:

`HD engine → calculate route → hdkit adapter → HumanDesignChart → blueprint repository → stored blueprint`

## UI Fix

The Design column reads `designActivations[]`.

The Personality column reads `personalityActivations[]`.

Legacy raw fields are read only as compatibility fallbacks for already-stored records.

## Golden User Regeneration

Regeneration was not executed from this workspace because:

- The local Human Design Python service is unavailable.
- Its checked-in virtual environment references a missing Python installation.
- No Firebase Admin credential is available for writing golden-user blueprints.
- Firestore client access is blocked by security rules.
- Sending named users' birth data to the external Railway service requires explicit approval for that sensitive-data transmission.

No mock activations or manual values were written.

## Validation

- TypeScript: **PASS**
- Next.js production build: **PASS**
- Static pages: **113 / 113**

## Remaining Operational Step

After approved engine access and authorized Firestore write access are available, regenerate each golden user's Human Design chart once. The new canonical activation arrays will then populate both columns without the missing-activation message.
