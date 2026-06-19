# Zone B Theme Lock Audit

## Scenario

Zone A: Difficulty Resting.

## Before repair

Cards were aligned, but destination pages could display Family Dynamics, unrelated Meditation themes, every Yoga item, or every Workout item.

## After repair

| Category | Locked output |
|---|---|
| Journaling | Izin untuk Berhenti / Difficulty Resting questions |
| Meditation | Meditasi Istirahat Tanpa Syarat |
| Breathwork | Downshift Breath |
| Mudra | Apana Mudra |
| Yoga | Savasana |
| Workout | Rest Without Guilt Mobility |

The destination receives and preserves `difficulty_resting` and `body recovery`.

## Validation

- Engine simulation confirms all six support records carry `issueKey` and `sourceTheme`.
- TypeScript passes.
- Production Next.js build passes.

## Verdict

Theme lock is active for navigation originating from Zone A.
