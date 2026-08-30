# Firestore Rules — Canonical Deployment Process

Production project: **`bhumiamartya-fe85c`**
Rules source of record: **`firestore.rules`** at the tip of the reviewed release
branch (`firebase.json` → `firestore.rules`).

## Why this document exists

On 2026‑08‑26 the production Firestore ruleset (`9008b06e‑…`) was deployed from
**dirty / uncommitted agent‑host‑checkpoint source**: parts of it (`fcmTokens`,
`telemetry_events`, `journalMemoryCandidates`, the `user_activity`
"PRODUCTION‑PRESERVED" block) existed in no committed branch. It was later
reconciled and re‑deployed as ruleset `6f895a5b‑e10e‑4125‑9588‑13d50c9e171e`
(2026‑08‑30), which is **byte/normalized‑equivalent to `9487ee2:firestore.rules`**
and to current `HEAD:firestore.rules` (LF SHA‑256
`a451945495434142b0498fd5f832e8778db960ebf3b7fd399f9cdaf11be198c3`).

Rules must never again be deployed from anything other than a clean, committed,
named branch.

## Mandatory procedure (production)

1. **Start from a clean committed branch.** Check out the reviewed release branch
   in a *pristine* worktree — `git status --porcelain` must be empty (no tracked,
   staged, **or untracked** changes). Remove throwaway scratch first (e.g. an
   untracked `tests/audit/`). Never deploy from a detached HEAD, an agent‑host
   checkpoint, or a worktree with uncommitted `firestore.rules`.
2. **Run the release regression** (Node 24): `npm ci && npm run test:release` —
   must be `PASS = TOTAL`, `FAIL = 0`, `SKIPPED = 0`.
3. **Run the Rules emulator suite:** `tests/integration/firestore-owner-isolation-emulator.test.ts`
   — 63/63, and the production‑preserved blocks (`fcmTokens`, `telemetry_events`,
   `journalMemoryCandidates`, `user_activity`) must still be covered.
4. **Run the deploy guard:**
   `npm run guard:firestore-rules -- --prod --project bhumiamartya-fe85c`
   It hard‑fails unless: git HEAD exists (A); on a named branch (B); worktree is
   fully clean (C/C1/C2); `firestore.rules` is tracked (D) and identical to HEAD
   (E); `firebase.json` points `firestore.rules` → `firestore.rules` (F); the
   project is named explicitly and, in `--prod`, is exactly `bhumiamartya-fe85c`
   (G). It performs **no** network calls or writes and **never deploys**.
   Optional read‑only drift check (needs a local `gcloud` token; no credentials
   in source): add `--check-production-drift`.
5. **Read current production Rules and review drift.** Read‑only, via the Firebase
   Rules API (`gcloud auth print-access-token` + header
   `x-goog-user-project: bhumiamartya-fe85c`, GET only):
   `GET .../projects/bhumiamartya-fe85c/releases/cloud.firestore` then
   `GET .../rulesets/{id}`. Diff the deployed source (LF‑normalized) against the
   branch's `firestore.rules`. The **only** expected functional delta is whatever
   the current reviewed change intends; anything else is drift → **STOP**.
6. **Explicit Founder authorization** for this specific deploy.
7. **Deploy — rules only, project named explicitly:**
   `firebase deploy --only firestore:rules --project bhumiamartya-fe85c`
   (or `npm run deploy:firestore-rules:prod`, which runs the guard first).
   Never an implicit Firebase alias. Never `--only firestore` (that includes
   indexes). Never any other target.
8. **Read back the deployed ruleset** (read‑only, same API as step 5): record the
   new ruleset id, release `updateTime`, and the deployed source LF SHA‑256.
9. **Verify `deployed source == committed source`.** LF‑normalized SHA‑256 of the
   deployed ruleset must equal that of `HEAD:firestore.rules`. Confirm the
   intended functional change is present and the production‑preserved blocks
   remain. If they differ → **STOP** and investigate.

## Prohibited

- Deploying Rules from a **dirty worktree**, an **agent‑host checkpoint**, a
  **detached / unreviewed** state, or with **uncommitted `firestore.rules`**.
- Deploying via an **implicit Firebase alias** or to any project other than
  `bhumiamartya-fe85c` for production.
- `firebase deploy` without `--only firestore:rules` when only rules changed.
- Hardcoding access tokens or service‑account credentials anywhere in source.

## Files

- `scripts/guard-firestore-rules-deploy.mjs` — the preflight guard (no deploy).
- `tests/unit/guard-firestore-rules-deploy.test.ts` — guard self‑tests (in the
  release manifest).
- `package.json`: `guard:firestore-rules`, `deploy:firestore-rules:prod`.
