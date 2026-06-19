# Innerwork Practice Flow

## Selection chain

The page does not use `currentIssue` as the first practice selector.

Actual order:

1. Stored `dailyGuidance.innerworkRecommendations.journaling`
2. Stored `.meditation`
3. Stored `.manifestation`
4. Static `ISSUE_PRACTICE_MAP[currentIssue.key]`

Thus any stored journaling recommendation wins even when the selected issue maps to meditation.

## Mixed-source card

- Title comes from `primaryRec.title`.
- Duration always comes from static `ISSUE_PRACTICE_MAP[currentIssue].duration`, or `5 Menit`.
- Explanation comes from static issue-map description when available; stored `primaryRec.reason` is secondary.
- Benefits come from static issue-map benefits when available.

The card can therefore combine a dynamic/stored recommendation title with the duration, explanation, and benefits of a different issue-mapped practice.

## Engine status

`lib/engines/innerworkIntelligence.ts` currently returns `{}` and an empty reason. Daily Guidance calls this engine in several paths, so newly generated recommendations from that implementation are empty unless another stored/legacy path supplied them.

## Current runtime practice

Not verified. The authorized runtime did not leave the loading screen.

