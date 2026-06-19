# HD Activation Storage Audit

## Stored

- Aggregate active gates
- Active channels
- Defined center state
- Variables summary fields

## Not Stored Before V2

- `raw_design_gates`
- `raw_personality_gates`
- Planet-to-activation relationship
- Gate line
- Color
- Tone
- Base

## Available

The Human Design Python response exposes structured personality and design gate objects. The calculate route also receives optional diagnostic activation arrays.

## Missing

Historical blueprints created before V2 do not contain activation detail and cannot be losslessly reconstructed from aggregate gates.

## V2 Storage Path

- `humanDesign.diagnostic.raw_design_gates`
- `humanDesign.diagnostic.raw_personality_gates`
- `humanDesign.raw_design_gates`
- `humanDesign.raw_personality_gates`

Each activation preserves `planet`, `gate`, `line`, and available `color`, `tone`, and `base` values directly from the engine response.
