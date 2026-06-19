# Innerwork Journey Read Failure Fix

## Previous Failure

Journey read errors were silently converted to an empty array.

## Repair

Journey reads now return an explicit result:

- success: `{ entries, failed: false }`
- failure: `{ entries: [], failed: true }`

On failure:

- `INNERWORK_JOURNEY_READ_FAILED` is logged with user/date context
- practice generation continues with a safe empty-history fallback
- provenance records `journeyRead:failed-safe-fallback`
- validation can distinguish read failure from genuine no-history state

When history is available, recent practice IDs remain supplied to repetition protection.

## Status

**PASS at source/build level**

Actual Firestore failure/success behavior remains unobserved because browser E2E is blocked.
