
<!-- BEGIN:kara-product-rules -->
# KARA_PRODUCT_RULES_V1

RULE #1
If data exists, render it. Do not hide it behind Coming Soon.

RULE #2
Coming Soon may only be used when: Data does not exist AND Translator does not exist AND Meaning Engine does not exist

RULE #3
Partial insight is better than empty insight.

RULE #4
Use progressive disclosure. Show what exists now. Expand later. Never hide existing value.

RULE #5
Bhumi is no longer a blueprint calculator. Bhumi is a Personal Intelligence Platform. Therefore: Human understanding has priority over system completeness.
<!-- END:kara-product-rules -->

<!-- BEGIN:kara-implementation-rules -->
# KARA_IMPLEMENTATION_RULES_V1

RULE #1
No Orphan Data. If data is calculated, it must be consumed somewhere. Profile, Dashboard, Journey, Innerwork, Gaia, or Admin.

RULE #2
No Orphan Translator. If a translator exists, its output must be rendered.

RULE #3
No Orphan Meaning. If HumanMeaning exists, it must be visible to users.

RULE #4
A feature is not complete when: Engine passes, TypeScript passes, Build passes. A feature is complete when: Data exists, Meaning exists, UI consumes it, User receives value.

RULE #5
Coming Soon is not a development shortcut. Coming Soon may only be used when: No data exists, No translator exists, No meaning exists. Otherwise: Render available insight.

RULE #6
Partial value beats hidden value. Use progressive disclosure. Show value now. Expand later. Never hide existing value.
<!-- END:kara-implementation-rules -->

<!-- BEGIN:kara-voice-architecture -->
# KARA_VOICE_ARCHITECTURE_V1

## Dashboard (Companion / Teman Duduk)
- Role: Companion
- Identity: Teman Duduk
- Mission: Menemani ("Aku ditemani")
- Priorities: Observasi, refleksi, kehadiran, empati, rasa ingin tahu.
- Reductions: Instruksi, ceramah, motivasi generik, daftar tugas.
- Language style: Use hybrid "Aku" and "Bhumi" naturally (e.g. "Aku memperhatikan...", "Aku penasaran...", "Hari ini terasa seperti...", "Mungkin...", "Bisa jadi..."). Avoid directive commands ("Kamu harus...", "Jangan lupa...", "Cobalah...").

## Wellness (Coach / Pendamping Pertumbuhan)
- Role: Coach
- Identity: Pendamping Pertumbuhan
- Mission: Membimbing ("Aku dibimbing")
- Priorities: Praktik, arahan lembut, eksperimen kecil, pertumbuhan bertahap. Avoid preachy/motivational speeches.

## Journey (Navigator / Pemandu Perjalanan)
- Role: Navigator
- Identity: Pemandu Perjalanan
- Mission: Menunjukkan posisi dan arah ("Aku tahu sedang berada di mana")
- Priorities: Konteks perjalanan, progres, pelajaran, integrasi. Avoid blank affirmations or clichés.

## Profile (Teacher / Penerjemah Diri)
- Role: Teacher
- Identity: Penerjemah Diri
- Mission: Menjelaskan ("Aku memahami diriku lebih baik")
- Priorities: Edukasi, interpretasi, penjelasan, pemahaman diri. Structured and informative.
<!-- END:kara-voice-architecture -->


<!-- BEGIN:bhumi-antigravity-system -->
# BHUMI AMARTYA — PERMANENT ANTIGRAVITY DEVELOPMENT SYSTEM

## 10 Mandatory Engineering Rules
1. Audit before edit — inspect provenance, branches, build artifacts, consumers, and contracts before editing.
2. Minimal diff — change only files authorized for the task; avoid speculative refactors.
3. Canonical data preservation — never alter ephemeris, house, or Human Design gate/channel math without separate authorization and failing proof.
4. No undocumented engine changes — all calculation changes require documented justification and golden-fixture regression tests.
5. No production database mutation during QA — use local emulators or synthetic fixtures; never touch live Firestore/Auth.
6. No authorization bypass — keep UID ownership, Firestore Rules, and server-side entitlement strict and fail-closed.
7. No secret exposure — never print keystore passwords, service-account keys, HMAC secrets, or user PII.
8. No destructive Git operation — no force push, `git clean`, hard reset, or unapproved rebase/stash.
9. No fabricated test evidence — compilation is NOT proof the app works. Classify checks strictly as `PASS`, `FAIL`, `BLOCKED`, `NOT_RUN`, or `HISTORICAL`.
10. No release without Founder approval — never bump/publish to Play Store or flip destructive production flags without explicit Founder sign-off.

## 5 Specialized Agent Roles (Skills in `.agents/skills/`)
1. `bhumi-architecture-audit` — Phase 0 provenance, dependency policy, blast radius & impact analysis.
2. `bhumi-frontend-visualization` — React/Next.js responsive SVG/UI, WebView rendering, collision & mobile overflow fixes.
3. `bhumi-backend-security` — Firebase Auth, Firestore Rules, atomic server eligibility, observe-first feature flags, Play Billing integrity.
4. `bhumi-qa-browser-emulator` — Playwright multi-viewport QA (`320x640` to `768x1024`), Firebase Emulator suites, screenshot evidence.
5. `bhumi-android-release` — Capacitor sync, Gradle `bundleRelease`, AAB/APK signing & checksum verification, Crashlytics/Play Integrity readiness.

Parallel subagent execution is allowed ONLY on independent tasks with disjoint file ownership.

## 8-Stage Delivery Lifecycle
`AUDIT -> PLAN -> IMPLEMENT -> SELF-REVIEW -> TEST -> SECURITY CHECK -> ANDROID QA -> RELEASE REVIEW`
See [BHUMI_ANTIGRAVITY_DEV_SYSTEM.md](docs/BHUMI_ANTIGRAVITY_DEV_SYSTEM.md).
<!-- END:bhumi-antigravity-system -->
