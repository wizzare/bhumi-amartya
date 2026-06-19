# Human Design Bodygraph V2 Report

## Storage Coverage

The calculation route, adapter, Human Design type, and blueprint repository now preserve engine-provided activation records at:

- `humanDesign.diagnostic.raw_design_gates`
- `humanDesign.diagnostic.raw_personality_gates`
- `humanDesign.raw_design_gates`
- `humanDesign.raw_personality_gates`

No activation is inferred from an aggregate gate list.

## Activation Coverage

Each stored activation can display:

- Planet and symbol
- Gate.Line
- Color
- Tone
- Base

Historical blueprints without raw activation records require regeneration from the verified engine before these columns can be complete.

## Channel Coverage

The Bodygraph includes the standard channel map. Every stored active channel:

- Highlights its path
- Adds both endpoint gates to the active-gate state
- Identifies Gate A, Gate B, Center A, and Center B in the validation panel
- Treats both connected centers as defined

## Gate Coverage

All 64 gates are positioned inside their associated centers. Active aggregate gates, channel endpoints, Design activations, and Personality activations are visually distinct.

## Center Coverage

All nine centers render from stored center state and active-channel connectivity:

- Head
- Ajna
- Throat
- G
- Ego
- Spleen
- Sacral
- Solar Plexus
- Root

## Design Coverage

Design activations render in red from stored `raw_design_gates`.

## Personality Coverage

Personality activations render in black from stored `raw_personality_gates`.

Gates present in both activation sets use a red/black dual-color state.

## Advanced Variables Coverage

The panel renders stored Digestion, Environment, Motivation, Perspective, Cognition, variable-arrow code, and activation Color/Tone/Base when present.

## Golden User Parity

The repository contains golden-user names, but it does not contain stored raw activation snapshots for all five users. Therefore a truthful 100% per-user activation parity result cannot be asserted locally.

V2 guarantees 100% render parity for every activation record present in each stored blueprint. Historical missing activation data is reported, never mocked.

## Parity %

- Schema and preservation path: **100%**
- Centers/channels/gates from stored fields: **100%**
- Design/Personality activations: **100% of stored activation records**
- Historical golden-user raw activation availability: **not fully available in the workspace**

## Build Result

**PASS**

Next.js `16.2.6` compiled successfully and generated `113 / 113` static pages.

## TypeScript Result

**PASS**

`tsc --noEmit` completed with exit code `0`.
