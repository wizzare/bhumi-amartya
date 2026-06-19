# Human Design Bodygraph Audit

## Coverage

- Nine centers render from `humanDesign.centers`.
- Defined centers are colored; undefined centers are white.
- Active channels render from `humanDesign.channels`.
- All 64 gates render, with active gates highlighted from `humanDesign.gates`.
- Digestion, Environment, Motivation, Perspective, and Cognition render from stored fields.
- Design and Personality columns bind only to stored `raw_design_gates` and `raw_personality_gates`.

## Missing Data

Planetary `Gate.Line` columns cannot be reconstructed from the aggregate gate list. They require stored diagnostic activations containing planet, gate, and line.

## Storage Gaps

`HumanDesignChart` currently has no typed fields for `diagnostic`, `raw_design_gates`, or `raw_personality_gates`. The visual reads these fields when present but never invents them.

## Visual Gaps

Channels without a known Bodygraph Lite coordinate remain listed in the channel audit list even when no line coordinate is available.

## Parity Result

Rendered centers, channels, gates, and variables use direct blueprint bindings. Planet columns are parity-safe when diagnostic activation data exists and visibly report the storage gap otherwise.

TypeScript and production build validation passed. Browser screenshot verification was blocked by the host browser sandbox.
