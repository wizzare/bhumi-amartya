# Innerwork Navigator Audit

Audit date: 19 June 2026

| Navigator state | Expected recommendation behavior | Actual Innerwork behavior |
|---|---|---|
| RECOVERY | Low effort, short duration, rest/regulation first | Navigator state is not read. Full library, including HIIT and long exercises, remains available. |
| REFLECTION | Journaling, observation, and low-pressure meaning-making | Navigator state is not read. Labels and recommendations are not selected from REFLECTION actions. |
| GROWTH | Moderate challenge and forward action | Navigator state is not read. No systematic progression or challenge increase occurs. |

The Wellness Navigator does have distinct action definitions for all three modes. Those actions are selected inside `wellnessNavigatorEngine`; they do not flow into `/innerwork` or its recommendation engine.

This is more severe than “only labels change”: Innerwork receives neither the label nor the mode-specific actions.

## Verdict

**FAIL**
