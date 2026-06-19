# Zone B Legacy Leak Report

## Former leaks

- Journaling date/blueprint theme generator.
- Meditation blueprint/date/history generator.
- Mudra selected from independent Meditation theme.
- Yoga full static database.
- Workout full static and variation databases.
- Breathwork redirected to a generic Meditation flow.

Example before repair:

```text
Difficulty Resting
→ Journaling card “Izin untuk Berhenti”
→ /innerwork/journaling
→ date + blueprint generator
→ Family Dynamics
```

## Runtime after repair

When context exists:

- Journaling replaces its prompt with the incoming issue guide.
- Meditation replaces its practice with the incoming issue guide.
- Breathwork uses the incoming breathwork guide on Meditation.
- Mudra resolves the requested Mudra and issue guide.
- Yoga renders only the incoming contextual practice.
- Workout renders only the incoming contextual practice.

Static and legacy generators remain available for direct library entry. They no longer override a contextual entry from Zone A.

## Remaining non-blocking fallback

Direct navigation without Zone A context intentionally opens the general learning library.
