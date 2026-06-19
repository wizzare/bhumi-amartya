# Innerwork Runtime Ready Checklist

## Critical

- [ ] `.\node_modules\.bin\tsc.cmd --noEmit` exits with code 0.
- [ ] Authenticated user opens `/innerwork` without console/runtime errors.
- [ ] Authenticated reflection save creates or updates `dailyStates/{uid}/entries/{localDate}`.
- [ ] Reload reads the saved record successfully.
- [ ] Next-day load reads recent Journey history successfully.

## High

- [ ] Load and save use the same resolved profile timezone and local date key.
- [ ] Midnight boundary test confirms no UTC day drift.
- [ ] Reopened completed day shows a non-empty saved acknowledgement.
- [ ] Saved payload contains all required fields:
  - [ ] `date`
  - [ ] `userId`
  - [ ] `dominantIssue`
  - [ ] `navigatorMode`
  - [ ] `practiceId`
  - [ ] `practiceTitle`
  - [ ] `practiceCategory`
  - [ ] `durationMinutes`
  - [ ] `completed`
  - [ ] `reflectionResult`
  - [ ] `timestamp`
  - [ ] `sourceContextSummary`

## Medium

- [ ] Journey-read failure is observable and is not silently indistinguishable from genuine empty history.
- [ ] With recent history, the engine chooses a different practice when the issue has an alternative.
- [ ] With no history, UI does not claim anything about yesterday.

## Required Flow Verification

- [ ] Open Innerwork.
- [ ] Focus is visible and is neither empty nor `"."`.
- [ ] Complete practice card is visible.
- [ ] `Mulai Sekarang` is visible and works.
- [ ] Engine instructions become visible.
- [ ] `Saya Sudah Melakukan Ini` is visible and works.
- [ ] Reflection options become visible.
- [ ] Reflection saves successfully.
- [ ] Reload preserves completion and acknowledgement.
- [ ] Return on the next local date uses recent history.

## Runtime-ready Rule

Classify **RUNTIME READY** only when every Critical and High item above passes and the full Required Flow Verification is observed in an authenticated browser session.

## TOP 5 BLOCKERS ONLY

1. TypeScript gate is not green.
2. Authenticated E2E transaction is unverified.
3. Save date may drift to UTC.
4. Restored reflection response is empty.
5. Journey-read errors are silently suppressed.
