# Journey Write Flow

## Dashboard load

`ensureDailyRecord()` creates today's record using the same local app date as Dashboard, Daily Scan, and Catatan. It writes wellness and scan status even if the user never opens Innerwork.

## Catatan availability

Dashboard updates:

- daily theme
- main direction
- challenge
- opportunity
- astro context
- profile signals
- source confidence

## Innerwork recommendation

Innerwork updates the recommended practice and current issue context.

## Completion

Completion changes the neutral skipped state to:

- `completed: true`
- `skipped: false`
- actual practice details
- reflection result and Bhumi response
- `practiceHelped`
