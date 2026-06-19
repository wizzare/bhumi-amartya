# Innerwork Reload Completion Fix

## Previous Failure

Reload restored completion flags but could render an empty Bhumi response.

## Repair

When an existing daily state is completed:

- practice is marked started
- practice is marked completed
- reflection is marked submitted
- saved result is loaded from `innerworkJourney.reflectionResult` or legacy `innerworkReflection`
- the same Bhumi response mapping used during save is restored
- missing legacy result receives a non-empty completion acknowledgement

## Status

**PASS at source/build level**

Browser reload observation remains part of the blocked E2E test.
