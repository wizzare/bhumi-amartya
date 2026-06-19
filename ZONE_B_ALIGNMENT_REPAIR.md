# Zone B Alignment Repair

## Previous behavior

Unsupported issues were redirected:

- Over Responsibility → Love Block
- Anxiety and Low Energy → Money Block
- Grief and unknown issues → Inner Child

## Current behavior

1. Zone A normalizes the dominant issue.
2. Zone A selects its issue-specific main practice.
3. Zone B receives `mainPractice.issueKey`.
4. `supportForIssue()` selects only `SUPPORT_LIBRARY[issueKey]`.
5. Each of the six categories returns one doorway into that same issue.

Canonical aliases now include:

- `need_for_boundaries` → `boundary_issue`
- `fear_of_disappointing` → `fear_of_rejection`
- `achievement_worth` → `self_worth`
- camel-case and snake-case forms for all required issues

The cross-issue fallback was removed. An unknown key alone uses Low Energy as a safe default; all required issue keys have direct libraries.

Validation:

- TypeScript: PASS
- Production build: PASS
- Engine lint: no errors
