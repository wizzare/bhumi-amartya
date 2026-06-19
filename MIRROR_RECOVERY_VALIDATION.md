# Mirror Recovery Validation

## Primary Source

Mirror once again reads:

`dailyGuidance.soulReflectionText`

This matches the Golden dashboard chain.

## Loading and Failure States

- While guidance loads: skeleton state
- Guidance succeeds: generated reflection
- Remote guidance fails: local guidance reflection
- Both chains fail: meaningful localized reflection fallback

## Awareness

Awareness events are no longer injected into Mirror.

## Verdict

**PASS**

Mirror has a visible reflection after dashboard loading and does not fall through to “Menyiapkan pesan untuk jiwamu...”.

