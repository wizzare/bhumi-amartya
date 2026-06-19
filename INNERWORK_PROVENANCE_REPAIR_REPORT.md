# Innerwork Provenance Repair Report

## Preserved Structured Context

Innerwork no longer relies on Daily Guidance prose as its sole intelligence input. Before human-language rendering it preserves:

- `dominantIssue`
- `issueSource`
- `profileSignals`
- `astroSignals`
- `wellnessSignals`
- `journeySignals`

The structured values are passed independently into the practice mapper:

- profile meaning excerpts
- astrology summary and house activations
- navigator mode, emotional word, nervous-system state, and energy
- recent completed Journey practice IDs

Daily Guidance text is used only as an optional focus sentence. It does not replace the structured practice decision context.

## Persistence

The same provenance summary used during the session is saved with the Journey completion payload. This makes later practice selection and audit possible without reconstructing context from display prose.

## Safe Fallback

If upstream reads fail, provenance explicitly records:

- `issueSource: safeFallback`
- navigator fallback
- empty profile, astrology, and Journey signal arrays

The fallback remains complete and does not fabricate yesterday/history claims.
