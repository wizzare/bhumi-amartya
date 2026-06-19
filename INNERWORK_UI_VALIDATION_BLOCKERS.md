# Innerwork UI Validation Blockers

## Primary blocker

The required in-app browser cannot start. The runner exits before page control with:

`CreateProcessAsUserW failed: 5`

This prevents direct verification of rendered output, screenshots, clicks, authenticated state, and database effects.

## Consequences

The audit cannot currently establish:

- top/middle/bottom visual states;
- actual Focus, Why Bhumi, Practice, and reflection text;
- click count or dead ends;
- blank/fallback states;
- mode differentiation;
- successful save confirmation;
- Journey continuity;
- Zone B link behavior;
- responsive/mobile behavior.

## Secondary validation dependencies

Once browser control works, the test also requires:

- an authenticated test user with a completed profile/blueprint;
- known wellness/navigator inputs for Recovery, Reflection, and Growth;
- database read access for that test user;
- permission to create clearly labeled test records;
- a controlled date/timezone for next-day and 30-day checks.

## Integrity rule

Source presence, HTTP 200, old screenshots, simulated scripts, report files, and console statements must not be promoted to UI proof.

