# Innerwork Browser Recovery Checklist

## Restore the test surface

- [ ] Restart the Codex/browser host and confirm the browser opens without error 5.
- [ ] Open `http://localhost:3000`.
- [ ] Confirm the page renders and hydrates, not merely returns HTTP 200.
- [ ] Sign in with a designated test account and record its UID, timezone, and test date.

## Core Innerwork flow

- [ ] Open Innerwork and capture top, middle, and bottom screenshots.
- [ ] Record the actual navigator mode.
- [ ] Verify and capture “Fokus Hari Ini.”
- [ ] Verify and capture “Kenapa Bhumi Mengajakmu?”
- [ ] Record the displayed dominant issue.
- [ ] Record the selected practice, reason, and duration.
- [ ] Click Start and capture the resulting state.
- [ ] Complete the practice and capture the resulting state.
- [ ] Submit each required reflection input and capture the response.
- [ ] Save and capture visible success or failure.
- [ ] Open Journey and confirm the new completion appears.
- [ ] Count clicks, dead ends, missing controls, fallback text, and blank states.

## Database verification

- [ ] Open the test user’s resulting database record.
- [ ] Capture the exact collection/document path.
- [ ] Capture the actual payload.
- [ ] Verify issue.
- [ ] Verify practice.
- [ ] Verify duration.
- [ ] Verify completion.
- [ ] Verify reflection.
- [ ] Verify timestamp and timezone/date key.
- [ ] Confirm the payload corresponds to the UI action just performed.

## Navigator modes

- [ ] Establish a Recovery input and repeat the visual/flow audit.
- [ ] Establish a Reflection input and repeat the visual/flow audit.
- [ ] Establish a Growth input and repeat the visual/flow audit.
- [ ] Compare actual rendered focus, reason, practice count, supporting content, and exploration.
- [ ] Ask whether mode is perceptible without exposing labels or source.

## Zone B

- [ ] Meditation: explanation, benefit, how-to, search phrase, save.
- [ ] Mudra: explanation, benefit, steps, reference links.
- [ ] Yoga: explanation, benefit, instructions, completion/save.
- [ ] Breathwork: locate actual surface and verify all required content.
- [ ] Journaling: explanation, prompt/how-to, reflection/save.
- [ ] Audio: explanation, benefit, playback/fallback link, Bhumi destination, save.

## Longitudinal test

- [ ] Use the same controlled user for Day 1, Day 7, Day 14, and Day 30.
- [ ] Preserve inputs and outputs for each day.
- [ ] Compare issue, practice, reason, wording, duration, and Journey memory.
- [ ] Determine whether the system evolves, meaningfully rotates, or repeats.

## Release gate

Release readiness may be judged only after all critical items above have evidence. Until then:

- ARCHITECTURE READY
- RUNTIME READY
- UI UNKNOWN
- RELEASE UNKNOWN

