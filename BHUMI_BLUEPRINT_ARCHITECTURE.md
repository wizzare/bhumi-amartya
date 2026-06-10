# BHUMI BLUEPRINT ARCHITECTURE

## Purpose

Bhumi Amartya is a unified blueprint platform for thousands of users with different birth data, behavioral histories, and innerwork rhythms.

Bhumi is not a founder-specific application.

## Blueprint

Blueprint means:

- Life Path
- Natal Chart
- Human Design
- Destiny Matrix

Blueprint is not a label system. It is a pattern language for understanding a user's tendencies, needs, rhythms, and growth edges.

No production interpretation may optimize for one person's blueprint.

## Unified Blueprint

All user-facing interpretation must be generated from Unified Blueprint Synthesis.

Unified Blueprint Synthesis combines:

- Life Path
- Natal Chart
- Human Design
- Destiny Matrix
- Current astrology context
- User progress
- User behavior history
- Previous guidance history

No feature may generate user-facing interpretation from only:

- Life Path
- Human Design
- Natal Chart
- Arcana or Destiny Matrix

Single modalities may contribute signals, but the final interpretation must be synthesized.

## Astrology

Astrology is not prediction.

Astrology is daily symbolic weather that may influence how a user's blueprint is experienced.

Astrology output must be classified internally as:

- Real astrology: calculated from a real transit source or verified ephemeris.
- Symbolic fallback: intentionally symbolic, used when real transit data is unavailable.
- Approximation: rough date/month-based estimation. This must not be presented as a real transit.

User-facing output should be framed as Astrology Influence On Blueprint, not generic transit description.

## Daily Guidance

Daily Guidance connects:

- Blueprint
- Current astrology
- User progress
- User history

into one daily reflection.

Daily Guidance must generate:

- Main reflection
- Astrology influence on blueprint
- Emotional focus
- Spiritual focus
- Grounded action
- Journal prompt
- Meditation suggestion
- Audio healing suggestion
- Daily practices

## Dashboard

The dashboard is the user's daily synthesis surface.

It must not be a collection of independent modality cards that each interpret the user separately.

Dashboard sections should share one unified interpretation context for the day.

## Notifications

Notifications should support continuity.

They should adapt to:

- Blueprint synthesis
- Current astrology context
- Progress
- Recent behavior
- Completion history

Generic reminders are acceptable only as fallback copy.

## Journaling

Journaling helps the user recognize themselves.

Journal prompts should emerge from Unified Blueprint Synthesis plus recent emotional and behavioral history.

## Meditation

Meditation helps the user return to presence.

Meditation suggestions should be selected from Unified Blueprint Synthesis plus current capacity and progress.

## Audio Healing

Audio Healing supports grounding and reflection.

Audio suggestions should be connected to Unified Blueprint Synthesis, current astrology context, and recent user behavior.

## Founder References

Safe founder references:

- Admin access control.
- Internal QA accounts.
- Non-production documentation clearly marked as QA/admin.

Unsafe founder references:

- Blueprint generation overrides.
- Human Design repair overrides.
- Daily guidance prompts.
- Interpretation logic.
- Astrology, healing, meditation, journaling, or notification personalization.
- Any production logic that identifies a founder profile and changes blueprint meaning.

## Coding Rule

When in doubt, ask:

"Apakah ini relevan untuk 10.000 user berbeda?"
