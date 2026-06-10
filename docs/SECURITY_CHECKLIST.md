# Security Checklist - Bhumi Amartya MVP

Date: 2026-05-31
Scope: pre-soft-launch audit for the local-first MVP, Next.js API routes, localStorage persistence, FastAPI Human Design service, and dependency posture.

## Passed Checks

- `.env`, `.env.local`, and `.env*` are ignored by `.gitignore`.
- No `dangerouslySetInnerHTML` usage was found in app UI code outside vendored/sample Human Design source.
- User-written journal/audio/meditation text is rendered through React text nodes and textareas, not injected as HTML.
- Firebase web config uses `NEXT_PUBLIC_FIREBASE_*`, which is expected for Firebase client identifiers and not treated as a server secret.
- Gemini and Human Design Hub keys are referenced server-side as `GEMINI_API_KEY` and `HUMAN_DESIGN_HUB_API_KEY`, not `NEXT_PUBLIC_*`.
- Free trial lock is present on `/journal`, `/meditation`, and `/healing/audio`.
- Dashboard, profile, setup, and settings remain accessible outside the wellness lock.
- Google setup flow uses popup auth and local profile matching, avoiding forced `/login` redirects in local-first mode.
- Human Design Next route does not expose stack traces to clients.

## Issues Found

- Local-first code had repeated direct `JSON.parse(...)` calls against localStorage values, which could crash pages when local data is malformed.
- `/api/ai/daily-guidance` returned a configuration-specific Gemini error message and could return internal error messages to the client.
- `/api/humandesign/bodygraph` returned raw upstream Human Design Hub payloads to clients.
- `/api/humandesign/calculate` accepted malformed JSON/date/time input too loosely.
- FastAPI Human Design service had no explicit CORS allowlist in `main.py` and returned raw exception text through HTTP error detail.
- Developer Pro override emails were hardcoded in a client-imported helper for all environments.
- Firestore debug helper stored `bhumi.lastFirestoreError` in localStorage in all environments.
- `npm audit` reported 9 vulnerabilities: 2 low, 2 moderate, 5 high.

## Fixes Applied

- Added `lib/storage/safeJson.ts` with safe JSON parsing helpers.
- Replaced brittle localStorage parsing in local repositories and local-first pages with safe parsing.
- Hardened `/api/ai/daily-guidance` to return generic client errors and validate malformed JSON bodies.
- Hardened `/api/humandesign/bodygraph` to validate JSON bodies and stop returning raw upstream payloads.
- Hardened `/api/humandesign/calculate` with malformed JSON, date, and time validation.
- Added FastAPI CORS middleware allowing `http://localhost:3000` plus optional `BHUMI_ALLOWED_ORIGINS` values for production domains.
- Changed FastAPI `/calculate` validation to constrain birth fields and return a generic calculation failure message instead of raw exception text.
- Disabled developer Pro email override in production builds while preserving it for local development.
- Gated Firestore debug localStorage writes to non-production only.

## localStorage Keys Audited

Expected MVP user/activity keys:

- `bhumiUserProfile`
- `bhumiUserBlueprint`
- `bhumiUserPlan`
- `bhumiLanguage`
- `bhumi-language`
- `bhumiJournalEntries`
- `bhumiMeditationEntries`
- `bhumiAudioHealingEntries`
- `bhumiHealingInsights`
- `bhumiJourneyData`
- `bhumiCompiledInnerwork`

Session/debug keys:

- `bhumi.googleRedirectPending` uses `sessionStorage`, not persistent localStorage.
- `bhumi.lastFirestoreError` is now development-only.
- `bhumi-sessions` exists in legacy session helper; review whether it is still needed before production.

## npm audit Result

`npm audit --json` reported:

- Total: 9 vulnerabilities
- Low: 2
- Moderate: 2
- High: 5
- Critical: 0

Main chains:

- `next` -> bundled `postcss` moderate XSS advisory. `npm audit` suggested a major/downgrade-style fix and was not auto-applied.
- `swisseph` -> `node-gyp` -> `make-fetch-happen` / `cacache` / `tar` high severity advisories. `npm audit` suggested changing `swisseph` to `0.5.5` with semver-major impact and was not auto-applied.

No dependency upgrades were applied because the available fixes require approval and may affect Human Design / astrology calculations.

## Remaining Risks Before Soft Launch

- Replace local-only developer override with a server-controlled entitlement system before production Pro launch.
- Confirm the production Human Design service domain and set it in `BHUMI_ALLOWED_ORIGINS`; do not use wildcard CORS.
- Review whether `bhumi-sessions` legacy storage is still needed; remove it if unused.
- Review `swisseph` dependency path and decide whether to pin/downgrade, replace, or isolate it before a public launch.
- Track Next.js/PostCSS advisory and upgrade Next.js when a compatible safe release path is available.
- localStorage is acceptable for MVP but not secure storage for sensitive data; avoid storing secrets, tokens, payment data, or private server credentials there.
- Add rate limiting and request size limits for public API routes before broader traffic.
