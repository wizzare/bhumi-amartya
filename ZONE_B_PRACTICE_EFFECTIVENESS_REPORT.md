# Zone B Practice Effectiveness Report

## Weighting

- Exact helpful practice: +14 per result.
- Helpful category: +5 per result.
- Exact heavy practice: −18 per result.
- Heavy category: −7 per result.
- Same result: small negative signal.
- Recently shown practice: −40.
- Calculated helpful/heavy practice groups: additional weighting.

## Runtime proof

Simulation:

- `difficulty_resting-journaling-stage-2`: Helpful ×10.
- `difficulty_resting-journaling-stage-4`: Heavy ×10.

Selected:

`difficulty_resting-journaling-stage-2`

This proves outcome weighting changes selection rather than being stored only.

Weekly, monthly, coach, effectiveness, and growth outputs are passed from `getDailyMemory()` into `buildInnerworkDailyDecision()`.
