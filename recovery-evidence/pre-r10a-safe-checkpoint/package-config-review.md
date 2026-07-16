# Package and Configuration Review

## package.json
- Modification: 4 lines (per `git diff --stat`).
- Owner: V4 recovery (likely AI gateway/provider additions or type
  package updates).
- Required: indeterminate without full diff inspection.
- Recommended action: do NOT include package.json in any commit
  until the diff is opened and the change is classified as
  intentional. Per Founder Phase 10:
  "Commit package-lock.json only when package.json has an
  intentional dependency change."

## package-lock.json
- Modification: 70 lines.
- Owner: should mirror package.json exactly.
- Recommended action: if and only if package.json change is
  confirmed intentional and minimal, include package-lock.json
  alongside it. Otherwise, EXCLUDE.
- Risk: cross-package-manager lockfile churn could leak unrelated
  changes.

## tsconfig.json
- Modification: 3 lines.
- Owner: indeterminate (could be path include or compiler option).
- Recommended action: defer to Group 1 commit if the change
  relates to a new blueprint module path. Otherwise EXCLUDE.

## tsconfig.tsbuildinfo
- Modification: 2 lines.
- Owner: GENERATED. Auto-updated by `tsc --build`.
- Recommended action: EXCLUDE per Founder Phase 7
  (`tsconfig.tsbuildinfo` in exclusion list).
- Do NOT commit.

## android/app/build.gradle
- Modification: 6 lines.
- Owner: indeterminate. Could be version bump, SDK level change,
  or Capacitor plugin sync.
- Recommended action: EXCLUDE for now. Android packaging experiments
  are excluded per Founder Phase 6 ("Android packaging experiments").
  No commit proposed.

## Summary table
| File                          | Owner     | Recommendation |
|-------------------------------|-----------|----------------|
| package.json                  | V4/AI?    | Defer / Exclude until diff classified |
| package-lock.json             | package   | Exclude unless package.json is intentional and minimal |
| tsconfig.json                 | V4?       | Defer / Exclude unless proven Blueprint-related |
| tsconfig.tsbuildinfo          | Generated | EXCLUDE (always) |
| android/app/build.gradle      | Android?  | EXCLUDE (Android packaging experiments) |

No commit should bundle any of these without explicit
classification and Founder approval.