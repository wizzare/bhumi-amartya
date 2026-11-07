# BHUMI AMARTYA — MASTER TRACKING TO-DO

## BUILD 121 Master Backlog & Operational Ledger — 2026-11-07

**Status:** LOCAL IMPLEMENTATION COMPLETE — WAITING FOUNDER REVIEW & DEPLOYMENT SIGN-OFF (Founder Directive 7 November 2026)  
**Target:** Android `versionCode 121`, tentative `versionName 5.0.21`, package `com.bhumiamartya.app` (konfirmasi Play Console sebelum rilis final).  
**Baseline Build 120 Carried Forward (DO NOT REOPEN):**
- [x] Dashboard Memorial Footer (Sheina Khazmalia) & removal of SATU TINDAKAN: `DONE_LOCAL`
- [x] Lilith Mean Black Moon IAU/ELP 2000-82 formula & global parity (< 18 arcsec): `DONE_LOCAL`
- [x] BaZi & Vedic in-memory calculation recovery (status ready, 0 client writes): `DONE_LOCAL`
- [x] 11 Blueprint calculation engines zero regression: `DONE_LOCAL`
- [x] Dashboard & Profile Arah Hari Ini 100% exact parity via `buildDailyGuidance().dailyDirection`: `DONE_LOCAL`
- [x] Setup & Settings canonical fallback sanitization (`stripCanonicalServerMetadata`, `stripServerOwnedAccessFields`, `stripClientBirthWrites`): `DONE_LOCAL`
- [x] Cloudflare canonical Worker POC (`services/canonical-worker/`, 27/27 checks PASS): `DONE_LOCAL`
- [x] Build 120 Signed AAB (`bhumi-amartya-release-v5.0.20-build120.aab`, SHA-256 `D0C9139C...`): `BUILD_VERIFIED` (Play upload unconfirmed)

### A. B121-00 — Baseline and Governance (P0)
- [x] `B121-00-01` **Version and worktree reconciliation** — Branch `hotfix/build110-indonesian-only` @ `6a8fe26`, working tree audited, Build 120 verified, code 121 target proposed: `DONE_LOCAL`
- [x] `B121-00-02` **Read and update governing docs** — Reconcile `docs/sot/SOT_INDEX.md`, `docs/tracking/MASTER_TODO.md`, `SPRINT_REGISTER.md`, `RISK_REGISTER.md`, `EVIDENCE_REGISTER.md`, `DECISION_LOG.md`, and `HANDOVER_LOG.md` without competing files: `DONE_LOCAL`
- [x] `B121-00-03` **Runtime truth map** — Map actual app/backend routes, Worker package, active Vercel URL, Firestore Rules status, screens, existing tests: `DONE_LOCAL`
- [x] `B121-00-04` **Ownership/scope gate** — No new costs, no Firebase Blaze, no production deployment or live write without explicit Founder approval: `DONE_LOCAL`

### B. B121-CF — Cloudflare Canonical Backend (P0) — SPRINT 121-01 COMPLETE
- [x] `B121-CF-01` **Recover local POC** — Confirm `services/canonical-worker/` status and re-verify affected checks in local environment (27/27 live checks PASS): `DONE_LOCAL`
- [x] `B121-CF-02` **Secure runtime packaging** — Route map, secrets, JWT + revocation, UID isolation, CORS, no credentials in client bundle: `DONE_LOCAL`
- [x] `B121-CF-03` **Transaction parity** — Revision/epoch, CAS, owner-attested legacy, receipt/idempotency, error mappings: `DONE_LOCAL`
- [x] `B121-CF-04` **Capacity/compliance gate** — Verify Workers Free current use terms, CPU and request limits: `DONE_LOCAL`
- [x] `B121-CF-05` **Client transport strategy** — Exact HTTPS base URI mapping and minimum client version; never reintroduce BaZi/Vedic dependency on canonical; verified Setup/Settings client integration: `DONE_LOCAL`
- [ ] `B121-CF-06` **Preview/deployment plan** — Document test environment, test account isolation, rollback; `WAITING_APPROVAL` before changing Cloudflare/Vercel/Firebase production.

### C. B121-BILL — Billing Verifier and Entitlement (P0)
- [x] `B121-BILL-01` **Current-state reconciliation** — Inventory 5 live Vercel routes: `/api/access/bootstrap-trial`, `/api/billing/google-play/verify`, `/api/billing/google-play/restore`, `/api/access/refresh-badge`, `/api/billing/reconcile`: `DONE_LOCAL`
- [x] `B121-BILL-02` **Worker port minimal** — Adapted 5 billing handlers to `services/canonical-worker/src/billing/` using native WebCrypto + `FirestoreRest`; zero external Node dependencies: `DONE_LOCAL`
- [x] `B121-BILL-03` **Token/UID security** — Verify idempotency, purchaseToken ownership, 1 token vs multiple accounts, revocation, invalid/replay, anti-downgrade (5/5 PASS): `DONE_LOCAL`
- [x] `B121-BILL-04` **Subscription lifecycle** — PURCHASE/PENDING/ACTIVE/GRACE/HOLD/CANCEL/EXPIRE/REFUND/VOID/RESTORE/REPLACE alignment with Google Play semantics: `DONE_LOCAL`
- [x] `B121-BILL-05` **Persist-before-ack + reconcile** — Retry failures/timeouts/duplicates, refund/revoke, observability without PII: `DONE_LOCAL`
- [ ] `B121-BILL-06` **Differential & rollout** — Vercel vs Worker fixtures, maintain `bhumi_premium_monthly`/`monthly`; Gate G2 explicit approval before cutover: `WAITING_APPROVAL`

### D. B121-SEC — Firestore Rules, Privacy, Legacy Rollout (P0)
- [x] `B121-SEC-01` **Live vs candidate gap matrix** — Read-only review of actual deployed rules vs candidate local rules (`firestore.rules`): `DONE_LOCAL`
- [x] `B121-SEC-02` **Authorization fixes** — Server trust, UID isolation, claim-based admin, no email-based role privilege: `DONE_LOCAL`
- [x] `B121-SEC-03` **Compatibility matrix** — Matrix of versions 118, 119, 120 and successor 121 regarding birth field edits and onboarding denial documented in `CLIENT_COMPATIBILITY_MATRIX_118_121.md` & verified (4/4 PASS): `DONE_LOCAL`
- [x] `B121-SEC-04` **Controlled transition** — Minimum supported version / update communication proposal without permissive Rules bypass (Founder decision): `DONE_LOCAL`
- [x] `B121-SEC-05` **Emulator test expansion** — Multi-user, cross-UID, admin claims, client versions 118/119/120/121 fixture suite in `build121-client-compatibility-matrix.test.ts` (4/4 PASS): `DONE_LOCAL`
- [ ] `B121-SEC-06` **Rollout / rollback** — Snapshot live rules, staged deployment order, mixed-version risk; `WAITING_APPROVAL` before production writes.

### E. B121-AKA — Arsip Akashi (P1)
- [x] `B121-AKA-01` **Actual source inventory** — Inspect `lib/arsipAkashi/`, `lib/services/humanMeaningService.ts`, `components/profile/details/ProfileSectionClient.tsx`; preserve existing structure & cards: `DONE_LOCAL`
- [x] `B121-AKA-02` **Blueprint-driven fact bundles** — 11 Blueprint systems contribute valid facts; fixed `safeFactCue` word-length filter to prevent dropping single/two-word facts (Manifestor, 8, etc.); non-literal framing: `DONE_LOCAL`
- [x] `B121-AKA-03` **Narrative quality** — Differentiated per blueprint; verified by `build121-arsip-akashi-grounding.test.ts` (3/3 PASS) and `arsip_akashi_3x3_contract.test.ts` (180/180 PASS, 100% 5x5 Soul Letters): `DONE_LOCAL`
- [x] `B121-AKA-04` **Privacy & consumers** — Per-UID isolation; safe fact bundle extraction for daily/weekly without leaking full prose: `DONE_LOCAL`
- [x] `B121-AKA-05` **Multi-profile acceptance** — 4 synthetic profiles, changed blueprint revision, sparse profile honest degradation to `unavailable`: `DONE_LOCAL`

### F. B121-WEEK — Panduan Minggu Ini Dashboard (P1)
- [x] `B121-WEEK-01` **Existing engine contract** — Inspect `components/dashboard/WeeklyGuidanceCard.tsx`, `lib/weeklyGuidance/weeklyGuidanceEngine.ts`, `weeklyTransitCalculator.ts`: `DONE_LOCAL`
- [x] `B121-WEEK-02` **Arsip + weekly astro + optional Journey** — Missing Journey not a blocker for new users; no fabricated Journey progress: `DONE_LOCAL`
- [x] `B121-WEEK-03` **Period correctness** — Monday-Sunday local timezone, current default, upcoming explicit, week rollover, cache isolation: `DONE_LOCAL`
- [x] `B121-WEEK-04` **Full content quality** — 9 approved sections (8 domain readings: 3-4 sentences + 1-2 sentences Saran Bhumi; Arah Minggu Ini: 4-6 sentences synthesis); verified by `build118-weekly-guidance.test.ts` (231/231 PASS): `DONE_LOCAL`
- [x] `B121-WEEK-05` **Dashboard QA** — Positioning verified, responsive mobile layout: `DONE_LOCAL`
- [x] `B121-WEEK-06` **Comparative tests** — 2 users, 2 consecutive weeks, missing Journey, partial astro, same-week stable, timezone change: `DONE_LOCAL`

### G. B121-DAILY — Catatan Hari Ini Profil (P1)
- [x] `B121-DAILY-01` **Existing daily parity inventory** — Inspect `components/profile/DailyGuidanceCard.tsx`, `lib/dailyGuidance/dailyGuidanceEngine.ts`; preserve BUILD 120 Dashboard Arah Hari Ini parity; verified by `build120-dashboard-insight-alignment.test.ts` (6/6 PASS): `DONE_LOCAL`
- [x] `B121-DAILY-02` **Blueprint personal context** — Connect available Blueprint/Arsip facts and Human Meaning appropriately with source provenance: `DONE_LOCAL`
- [x] `B121-DAILY-03` **Temporal differentiation** — Astro/transits, Weton, BaZi day pillar, Tzolkin; verified by `build118-daily-guidance.test.ts` (389/389 PASS): `DONE_LOCAL`
- [x] `B121-DAILY-04` **Presentation parity** — 3 domains, 8 accordions + Arah Hari Ini; Dashboard uses exact same Arah Hari Ini without duplicate greeting: `DONE_LOCAL`
- [x] `B121-DAILY-05` **Differential QA** — Synthetic users, consecutive days, unchanged context, partial data, cache isolation: `DONE_LOCAL`

### H. B121-WELL — Wellness Personal Companion (P2; after P0 gate)
- [x] `B121-WELL-01` **Inspect five-section owner** — Reuse existing curation/library/check-in mapping in `components/wellness/`, `lib/services/wellnessCurationService.ts`: `DONE_LOCAL`
- [x] `B121-WELL-02` **Preferences/opt-in** — Check `UserWellnessPreferences` propagation & `isWorldviewEligible`; opt-out respected: `DONE_LOCAL`
- [x] `B121-WELL-03` **Crystal catalog** — Symbolic/reflection meaning, practical safe usage, reuse `spiritual-crystal-holding`: `DONE_LOCAL`
- [x] `B121-WELL-04` **Aroma catalog** — Lavender/citrus/peppermint entries where safe; sensitivities, breathing, kids/pets, ventilation, no ingestion/topical misuse: `DONE_LOCAL`
- [x] `B121-WELL-05` **Deterministic selection** — 1 optional crystal & 1 optional aroma, localDate & revision context, cooldown, no cross-UID cache: `DONE_LOCAL`
- [x] `B121-WELL-06` **Section 03 UI only** — 2 small cards before Pagi/Siang/Malam; skip/not-have/dislike buttons; no new nav/page: `DONE_LOCAL`
- [x] `B121-WELL-07` **Safety + regression** — No medical claims, 5 sections intact, multi-user consent tests in `build121-wellness-companion.test.ts` (4/4 PASS): `DONE_LOCAL`

### I. B121-REL — Integration, Release & Tracking
- [x] `B121-REL-01` **Focused tests first** — TypeScript (`tsc --noEmit` exit 0), 16 core tests PASS, 231 weekly PASS, 389 daily PASS, 180 akashi PASS: `DONE_LOCAL`
- [x] `B121-REL-02` **Client/server parity** — Setup/Settings fallbacks and canonical constraints, authenticated API, billing, protected Firestore: `DONE_LOCAL`
- [ ] `B121-REL-03` **Build metadata** — Only at final accepted candidate: verify code 121 unused, set `121 / 5.0.21` upon authorization: `WAITING_APPROVAL`
- [ ] `B121-REL-04` **Static export & QA** — Next.js build pipeline, `out/`, Capacitor sync, signed APK/AAB, reviewer approval: `WAITING_APPROVAL`
- [x] `B121-REL-05` **Governance sync** — Update existing SoT index, Master TODO, Sprint/Evidence/Risk registers, Decision/Handover log; `BLOCKED` not `DONE` when not deployed: `DONE_LOCAL`
- [ ] `B121-REL-06` **Founder GO/NO-GO** — Explicit approval for any production service, Rules, Play upload, or paid service: `WAITING_APPROVAL`

---

## Current Release 119 gates — 2026-11-03

- [x] BP03 result contract closed for the local baseline by Founder decision; TypeScript, Build 115 regression and live normalizer accepted PASS. Earlier outstanding BP03 contract and TypeScript entries below are historical.
- [ ] Release QA: verify legacy Human Design records and non-destructive revalidation in a browser; synthetic legacy compatibility remains PARTIAL.
- [ ] Verify the integrated Settings → profile receipt → shared state → BP10 stale-profile race.
  Synthetic AuthProvider/BP10 Chromium coverage now passes, but real emulator receipt-to-render evidence remains blocked by the existing QA runtime/security gate; see `RELEASE119_BP10_FINAL_INTEGRATION_RESULT.md`.
- [ ] Close trusted Blueprint result persistence and Firestore security, including legitimate writes and provenance.
  BP06 now recomputes in memory from the accepted canonical profile; the real canonical adapter and BP06 hook passed 12 local emulator checks using a synthetic provider context. Verify actual provider-to-page integration and address the remaining Blueprint writer/consumer contracts and candidate Rules before global acceptance.
  BP07 now recomputes from the accepted canonical profile; 16 local emulator groups cover BP06/BP07 and canonical UID controls with a synthetic provider context. Setup still requires a persisted full Blueprint and Settings still writes one; a trusted replacement and browser-level verification remain open.
  Update: authenticated Settings no longer writes the full Blueprint and uses the existing server profile repository for preferences; Setup now reports its confirmed canonical save and remains incomplete until persisted-output dependencies are resolved. Actual browser flow and HD trusted writer remain open.
  Further update: Setup now has a receipt-verified canonical completion path and a nonpersisted dashboard calculation; local emulator and synthetic route predicates passed. Verify actual browser navigation/reload, other stored-Blueprint consumers and the HD trusted writer before release.
  Human Design update: client writers now fail closed on HD payloads, default recovery preserves stored data, and local Rules tests passed 15 groups. Mixed Blueprint writes containing HD are blocked; implement and verify an independent server-calculated HD writer bound to the authoritative birth revision, assess older records, and resolve dependent consumers before global persistence acceptance.
  Follow-up: mixed non-HD writes now work when HD and input exactly match stored values (20 current-local-Rules emulator groups); a strictly empty missing-result placeholder also works (unit evidence). New usable or changed HD/input still fail closed. Candidate Rules continue to restrict arbitrary derived writes. The independent HD writer, legacy provenance and remaining consumers stay open.
- [ ] Recover and verify the Firebase Functions main entrypoint and required exports.
- [ ] Verify legacy Android compatibility and complete final release QA. Release 119 remains BLOCKED.

---

## Release 119 / Build 120 Operational Ledger & Handover — 2026-11-07

### COMPLETED LOCALLY (DONE_LOCAL)
- [x] **Dashboard Memorial Footer**
  - **Status:** DONE_LOCAL
  - **Evidence / File:** `components/dashboard/DashboardClient.tsx`, `src/locales/id-ID/translation.json`.
  - **Details:** Replaced legacy quote with dedication to Sheina Khazmalia (17 Oktober 1988 – 5 November 2026), heart icon, responsive styling, clean TypeScript.
  - **Remaining Action:** Included in Build 120 release bundle.
  - **Blocker / Dependency:** None.

- [x] **Lilith Mean Black Moon Calculation Correction & Global Parity**
  - **Status:** DONE_LOCAL
  - **Evidence / File:** `lib/astrology/calculateNatalBasics.ts`, `lib/astrology/calculateNatalChart.ts`, `tests/unit/build119-bp04-differential.test.ts`, `tests/unit/lilith-parity.test.ts`, `scripts/validate_lilith_global.py`.
  - **Details:** Replaced broken linear formula (`315.2 + 0.1114 * days`, +51.74° error) with IAU/ELP 2000-82 lunar mean apogee with true ecliptic projection. Verified across 15 global fixtures (1900–2035) with max error 0.00491° (< 18 arcsec) vs Swiss Ephemeris (`SE_MEAN_APOG`). Founder chart corrected to Aries 26°47′, House 3.
  - **Remaining Action:** Included in Build 120 release bundle.
  - **Blocker / Dependency:** None.

- [x] **BaZi & Vedic Local Calculation Recovery**
  - **Status:** DONE_LOCAL
  - **Evidence / File:** `lib/bazi/useBaziData.ts`, `lib/vedic/useVedicData.ts`, `tests/unit/bazi-vedic-local-recovery.test.ts`.
  - **Details:** Removed non-canonical blocking gate (`revisionOf(profile)`). In-memory calculations now calculate `status: "ready"` for complete legacy profiles. Preserved UID security boundaries and 0 client Firestore writes.
  - **Remaining Action:** Included in Build 120 release bundle.
  - **Blocker / Dependency:** None.

- [x] **11 Blueprint Zero-Regression Verification**
  - **Status:** DONE_LOCAL
  - **Evidence / File:** BP01 (`tests/unit/build119-bp01-d2-calculation.test.ts`: 30/30 PASS), BP02 (`tests/unit/build119-bp02-parity-regression.test.ts`: 10/10 PASS), BP03 (`tests/unit/build119-bp03-native-engine-parity.test.ts`: 5/5 PASS), BP04 (`tests/unit/build119-bp04-differential.test.ts`: PASS), BP05 (`tests/unit/build120-bp05-calculation.test.ts`: 7/7 PASS), BP06 (`tests/unit/build121-bp06-sprint1.test.ts`: 8/8 PASS), BP07 (`tests/unit/build122-bp07-sprint1.test.ts`: 13/13 PASS), BP08 (`tests/unit/build123-bp08-sprint1.test.ts`: 791 assertions PASS), BP09 (`tests/unit/build124-bp09-sprint1.test.ts`: 112 assertions PASS), BP10 (`scripts/validateAstrocartographyR8A.ts`: 58/58 PASS), BP11 (`scripts/checkZiWei.ts`: 80/80 PASS).
  - **Details:** Zero regressions across all eleven core astrology and blueprint calculation engines.
  - **Remaining Action:** Maintain in continuous automated testing suite.
  - **Blocker / Dependency:** None.

- [x] **Dashboard Daily Insight Alignment & Action Section Removal**
  - **Status:** DONE_LOCAL
  - **Evidence / File:** `components/dashboard/SoulReflectionCard.tsx`, `components/dashboard/DashboardClient.tsx`, `components/dashboard/DashboardClient.module.css`, `tests/unit/build120-dashboard-insight-alignment.test.ts`, `tests/unit/dashboard-design1-invariants.test.ts`.
  - **Details:** Unified Dashboard "Insight Utama" with Profile "Catatan Hari Ini → Arah Hari Ini" using shared `buildDailyGuidance().dailyDirection.paragraphs`. Removed duplicate greeting ("Halo..."). Removed entire "SATU TINDAKAN" section and its container styling. 100% exact parity across accounts/dates, verified clean responsive rendering and TypeScript PASS.
  - **Remaining Action:** Included in Build 120 release bundle.
  - **Blocker / Dependency:** None.

- [x] **Setup & Settings Canonical Fallback Safety (Founder Gate Verified)**
  - **Status:** DONE_LOCAL (SAFE)
  - **Evidence / File:** `lib/profile/canonicalBirthFields.ts`, `lib/billing/serverOwnedAccessFields.ts`, `lib/repositories/userRepository.ts`, `app/setup/page.tsx`, `app/settings/page.tsx`, `tests/unit/build120-fallback-safety.test.ts`.
  - **Details:** Fallback verified against 5 safety requirements:
    1. Permitted legacy profile & birth fields (`fullName`, `birthDate`, `birthTime`, `birthCity`, `latitude`, `longitude`, `timezone`, `setupCompleted`) are preserved for uncanonicalized profiles.
    2. Server-owned canonical metadata (`canonicalBirthRevision`, `canonicalBirthEpoch`, `canonicalBirthOperationId`, etc.) is unconditionally stripped by `stripCanonicalServerMetadata`—no fake receipts/epochs can be written.
    3. Server-owned access & lifetime fields (`isLifetime`, `lifetime`, `isPremium`, `role`, etc.) are unconditionally stripped by `stripServerOwnedAccessFields`.
    4. Profiles with existing server-verified canonical records are protected via `stripClientBirthWrites`, preventing rogue client birth overwrites.
    5. Zero direct writes to `users/{uid}/canonical/*`, `users/{uid}/birthOperations/*`, or protected Blueprint paths. All authorization/validation failures fail closed and report errors to the user.
  - **Remaining Action:** Included in Build 120 release bundle.
  - **Blocker / Dependency:** None.

- [x] **Android Build 120 Local QA APK Assembly & Fresh Asset Verification**
  - **Status:** DONE_LOCAL (PASS)
  - **Evidence / File:** `android/app/build/outputs/apk/debug/app-debug.apk` (12.8 MB, assembled with exit code 0), `android/app/build/outputs/apk/debug/output-metadata.json`, `android/app/src/main/assets/public/`.
  - **Pipeline & QA Verification Breakdown:**
    - **Next.js Production Static Export:** PASS (`node scripts/run-prod-build.mjs`, 78/78 static routes generated, 110 RSC aliases created, exit code 0).
    - **Capacitor Android Sync:** PASS (`npx cap sync android`, synced web assets into `android/app/src/main/assets/public/` in 733ms).
    - **Fresh Web Asset Content:** VERIFIED (Inspected chunk `1456-1bd3201d383f2010.js` in assets: Sheina Khazmalia Memorial Footer present, unified Insight Utama `dailyDirection.paragraphs` present, Lilith IAU/ELP 2000-82 formula present, BaZi/Vedic recovery present).
    - **QA APK Binary:** Assembled `com.bhumiamartya.app.qa` (`versionCode = 120`, `versionName = "5.0.20-qa"`). Suffix `.qa` strictly prevents overwriting or conflicting with Google Play 119 production app (`com.bhumiamartya.app`).
    - **Localhost Runtime QA:** PASS in Chromium browser / node runtime across Dashboard (Memorial Sheina, no duplicate greeting, SATU TINDAKAN removed), Profile (100% exact parity on Arah Hari Ini), Lilith (Aries 26°47′, House 3), BaZi & Vedic (local calculation recovery with zero protected writes), and Setup/Settings fallback.
    - **Physical Android Device QA:** PENDING (ADB status: no physical USB device connected).
    - **Security Governance Note:** Client-side fallback guards (`stripCanonicalServerMetadata`, `stripServerOwnedAccessFields`, `stripClientBirthWrites`) fail closed safely, but do NOT replace production Firestore Rules hardening. Production rules remain unchanged on `bhumiamartya-fe85c` for backward compatibility with active Play Store release 119.
  - **Remaining Action:** Physical device QA when device is connected; Founder sign-off for final release AAB assembly (`gradlew bundleRelease`).
  - **Blocker / Dependency:** None.

- [x] **Build 120 Release Configuration Readiness**
  - **Status:** DONE_LOCAL / WAITING_APPROVAL
  - **Evidence / File:** `android/app/build.gradle` (`versionCode 120`, `versionName "5.0.20"`), `lib/config/buildInfo.ts` (`CURRENT_VERSION_CODE = 120`, `CURRENT_VERSION_NAME = "5.0.20"`), `tests/unit/version-reconciliation.test.ts` (24/24 PASS).
  - **Details:** VersionCode 120 verified unallocated in Play Console (current track is 119 / 5.0.19). AAB build, release signing, and upload withheld pending Founder authorization.
  - **Remaining Action:** Founder sign-off for final release build assembly.
  - **Blocker / Dependency:** WAITING_APPROVAL (Founder authorization required before AAB generation or store distribution).

- [x] **Canonical Vercel API Adapter & Local Tests**
  - **Status:** DONE_LOCAL
  - **Evidence / File:** `services/billing-verifier/api/canonical/`, `lib/profile/canonicalHttps.ts`, `tests/unit/build126-canonical-route.test.cjs`.
  - **Remaining Action:** Keep local until deployment authorization.
  - **Blocker / Dependency:** Production Vercel deployment not authorized.

- [x] **Cloudflare Workers Feasibility POC**
  - **Status:** DONE_LOCAL (27/27 checks PASS)
  - **Evidence / File:** `services/canonical-worker/`, `tests/integration/canonical-worker-emulator.test.mjs`.
  - **Remaining Action:** Standalone feasibility proven; no production deployment.
  - **Blocker / Dependency:** Phase D approved as local POC; production deployment deferred by Founder directive.

### BLOCKED / NOT DEPLOYED / WAITING_APPROVAL
- [x] **Android Build 120 Final AAB Assembly & Official Release Signing**
  - **Status:** BUILD_VERIFIED
  - **Evidence / File:** `android/app/build/outputs/bundle/release/app-release.aab`, `release-artifacts/build120/bhumi-amartya-release-v5.0.20-build120.aab`.
  - **Details:** 
    - Package ID: `com.bhumiamartya.app`
    - Version: `versionCode = 120`, `versionName = "5.0.20"`
    - Size: 9,770,389 bytes (9.77 MB)
    - SHA-256: `D0C9139CBB9EBFA4FB045897C97911530A39E8DDD740064C9D068385DF200750`
    - Signer: `CN=Bhumi Amartya, O=Bhumi Amartya, C=ID` (official keystore `bhumi-amartya-release.jks`, SHA-1 `B5:1C:84:D0:7B:86:95:80:C7:D5:9D:36:E8:FA:F8:52:F7:92:CC:52`, SHA-256 `1B:C1:30:61:AA:B6:F7:EB:36:2B:FD:0A:71:E3:DB:10:6D:B8:61:57:36:A3:37:B1:97:FC:5F:0D:B5:92:B5:18`)
    - Play Upload Certificate Match: `PLAY_UPLOAD_CERTIFICATE = MATCH` (exact certificate matching Build 119 and previous Google Play releases)
    - Source Runtime Provenance: `AAB_SOURCE_PROVENANCE = VERIFIED` (Setup, Settings, and Canonical Adapter dependencies reconciled into Git baseline)
    - Static Web Assets: Fresh (Next.js production static export 78 pages, synced via Capacitor)
  - **Remaining Action:** Google Play Console upload upon explicit Founder order.
  - **Blocker / Dependency:** None for local AAB.

- [ ] **Google Play Store Internal Track Upload**
  - **Status:** WAITING_APPROVAL (`PLAY_UPLOAD = NOT_PERFORMED`)
  - **Evidence / File:** Release bundle ready at `release-artifacts/build120/bhumi-amartya-release-v5.0.20-build120.aab`.
  - **Remaining Action:** Manual or automated upload to Google Play Internal Testing upon Founder directive.
  - **Blocker / Dependency:** Founder explicit upload authorization.

- [x] **Physical Android Device QA**
  - **Status:** WAIVED_BY_FOUNDER
  - **Evidence / File:** Founder directive: "Founder telah memeriksa aplikasi melalui localhost dan menyatakan hasilnya sesuai. Physical Android QA tidak diwajibkan untuk BUILD 120."
  - **Remaining Action:** None for Build 120.
  - **Blocker / Dependency:** None.

- [ ] **Production Cloudflare Backend Deployment**
  - **Status:** BLOCKED / NOT DEPLOYED (Fase D POC preserved locally only)
  - **Evidence / File:** `services/canonical-worker/`.
  - **Remaining Action:** Hold until explicit Founder deployment order.
  - **Blocker / Dependency:** Founder directive: "Pertahankan seluruh hasil Cloudflare Workers POC, tetapi jangan deploy produksi sekarang."

- [ ] **Billing Verifier Migration from Vercel Hobby**
  - **Status:** BLOCKED / NOT DEPLOYED
  - **Evidence / File:** `services/billing-verifier/`.
  - **Remaining Action:** Assess migration path when authorized.
  - **Blocker / Dependency:** Dependent on backend infrastructure decision.

- [ ] **Production Hardened Firestore Rules**
  - **Status:** BLOCKED / NOT DEPLOYED
  - **Evidence / File:** `firestore.rules`, `tests/integration/build126-hd-rules-local.cjs`.
  - **Security Implications of Currently Deployed Rules:**
    The deployed production rules on `bhumiamartya-fe85c` allow client-side writes to certain collections without strict server-verified canonical checks, meaning legacy 118/119 clients can still perform standard profile updates. Hardening rules prematurely would break legacy clients (118/119) that lack the canonical mutation protocol. Candidate rules remain in local emulator only.
  - **Remaining Action:** Maintain local rules testing; wait for 118/119 client phase-out plan.
  - **Blocker / Dependency:** Backward compatibility with active Play Store release 119.

- [ ] **Legacy 118/119 Compatibility with Hardened Rules**
  - **Status:** BLOCKED / NOT DEPLOYED
  - **Evidence / File:** `tests/integration/release119-legacy-attestation-emulator.cjs`.
  - **Remaining Action:** Test transition protocol without breaking active users.
  - **Blocker / Dependency:** Deployed Firestore Rules cannot be hardened until legacy client transition is verified.

- [x] **Final Real-Device Verification**
  - **Status:** WAIVED_BY_FOUNDER
  - **Evidence / File:** Founder explicit directive: "Physical Android QA tidak diwajibkan untuk BUILD 120." Localhost runtime verification accepted.
  - **Remaining Action:** None for Build 120 release gate.
  - **Blocker / Dependency:** None.

**Document ID:** `TODO-MASTER-001`  
**Current Workstream:** Build 119 - BP02 Destiny Matrix (BP02 ACTIVE; scope-locked)  
**Baseline Git Branch:** `hotfix/build110-indonesian-only`  
**Active HEAD:** `41e89d8da3c424c2b6775ec5ceb13f689cacd438` (`release: Bhumi Amartya v5.0.18 build 118`)  
**Last Updated:** 31 Oktober 2026 (Sinkronisasi BP02 — entri lama dipertahankan)  
**Status:** ACTIVE OPERATIONAL TRACKER  

---

## 1. WORKSTREAM ROADMAP OVERVIEW (FOUNDER ROADMAP DECISION)

Pengerjaan proyek Bhumi Amartya dibagi secara ketat berdasarkan keputusan Founder:

```
[ WORKSTREAM 1: HUMAN DESIGN STABILIZATION ] ──▶ (AUDITED & CLOSED / GATES OPEN)
       │ (HD-01 s/d HD-05 PASS, HD-06A Reconciled, Local Tests 100% Green)
       ▼
[ WORKSTREAM 2: BILLING & ENTITLEMENT ]     ──▶ (AKTIF - IN PROGRESS)
       │ (BILL-00 Baseline Audit PASS, BILL-01 Ownership & Integrity PASS)
       ▼
[ WORKSTREAM 3: OTHER BLUEPRINT EXPANSIONS ]──▶ (TERKUNCI / DEFERRED)
         (Weton, BaZi, Vedic, Tzolkin, Destiny Matrix)
```

> [!IMPORTANT]
> Modul pada **Workstream 3** (Weton, BaZi, Vedic, Tzolkin, Destiny Matrix) berstatus **DEFERRED / LOCKED**. Tidak ada modifikasi kode yang diizinkan untuk modul-modul tersebut selama Workstream 2 berlangsung.

---

## 2. WORKSTREAM 1: HUMAN DESIGN STABILIZATION MASTER BACKLOG

### Legend:
* `[x] DONE` — Telah diimplementasikan dan diverifikasi dengan automated test.
* `[-] PARTIAL` — Sebagian pekerjaan selesai, sub-sprint penerimaan masih berjalan.
* `[ ] READY` — Skenario dan runner telah disiapkan.
* `[!] OPEN GATE` — Membutuhkan dependensi eksternal atau verifikasi hardware fisik.

---

### Sprint HD-01: Security & Authentication Gateway
* **Status:** `[x] DONE` (PASS LOCAL — 12 tests)
* **Lead Agent:** OpenCode
* **Verifikasi:** Antigravity Audited (20 Okt 2026)
* [x] **TODO-HD01-01:** Implementasi centralized fail-closed auth verification (`lib/auth/hdEndpointAuth.ts`).
* [x] **TODO-HD01-02:** Penguncian route `app/api/humandesign/calculate` dengan validasi Bearer ID Token.
* [x] **TODO-HD01-03:** Penguncian route `app/api/humandesign/astrology` dengan validasi token.
* [x] **TODO-HD01-04:** Penolakan header bypass dalam mode produksi (`NODE_ENV === 'production'`).
* [x] **TODO-HD01-05:** Pembatasan dev bypass hanya untuk loopback local (127.0.0.1/localhost).
* [x] **TODO-HD01-06:** Dekomisioning endpoint usang `app/api/humandesign/bodygraph` (HTTP 410 Gone).

---

### Sprint HD-02: Canonical & Chart Structural Integrity
* **Status:** `[x] DONE` (PASS LOCAL — 10 tests)
* **Lead Agent:** OpenCode
* **Verifikasi:** Antigravity Audited (20 Okt 2026)
* [x] **TODO-HD02-01:** Pemisahan canonical provenance dari status core completeness (`lib/humandesign/completeness.ts`).
* [x] **TODO-HD02-02:** Penolakan response metadata-only tanpa field struktural riil.
* [x] **TODO-HD02-03:** Kontrak integritas tipe Reflector (semua 9 centers open dan 0 channels aktif diakui valid).
* [x] **TODO-HD02-04:** Isolasi data opsional (variabel digestion, sense) agar tidak membatalkan kelengkapan core.
* [x] **TODO-HD02-05:** Proteksi chart canonical yang tersimpan dari penimpaan data parsial.

---

### Sprint HD-03: Birth Input Binding & Concurrency
* **Status:** `[x] DONE` (PASS LOCAL — 10 TS + 7 Python tests)
* **Lead Agent:** OpenCode
* **Verifikasi:** Antigravity Audited (20 Okt 2026)
* [x] **TODO-HD03-01:** Implementasi fungsi sidik jari deterministik `computeBirthInputFingerprint` (`bip_v1_<fnv1a32>`).
* [x] **TODO-HD03-02:** Deteksi perubahan menit lahir, kota, atau koordinat geografis sebagai revisi baru.
* [x] **TODO-HD03-03:** Pembatalan kalkulasi in-flight jika data lahir diubah saat kalkulasi berjalan.
* [x] **TODO-HD03-04:** Deduplikasi pemanggilan engine untuk UID dan revisi yang sama (shared promise).
* [x] **TODO-HD03-05:** Pembatalan proses simpan jika pengguna melakukan logout di tengah kalkulasi.
* [x] **TODO-HD03-06:** Resolusi IANA timezone dan transisi DST historis di engine Python (`main.py`).

---

### Sprint HD-04: Engine Reliability & Recovery
* **Status:** `[x] DONE` (PASS LOCAL — 13 transport + 20 scenario checks)
* **Lead Agent:** OpenCode
* **Verifikasi:** Antigravity Audited (20 Okt 2026)
* [x] **TODO-HD04-01:** Pembatasan batas waktu klien 25 detik dan gateway proxy 15 detik.
* [x] **TODO-HD04-02:** Akuisisi token Firebase dan pembacaan body response berada dalam deadline terikat.
* [x] **TODO-HD04-03:** Klasifikasi error HTTP dan kebijakan bounded retry (hanya 429 & 500 yang di-retry).
* [x] **TODO-HD04-04:** Implementasi shared recovery executor (`lib/humandesign/hdRecovery.ts`).
* [x] **TODO-HD04-05:** Authoritative round-trip reread dari Firestore sebelum mengonfirmasi status sukses.
* [x] **TODO-HD04-06:** Transactional write guard mencegah penimpaan chart lengkap oleh state pending.

---

### Sprint HD-05: UI Resilience & Cache
* **Status:** `[x] DONE` (PASS LOCAL BROWSER — 90 unit tests + 55 browser scenarios PASS)
* **Lead Agent:** OpenCode / Antigravity
* [x] **TODO-HD05-01:** Pembuatan komponen status eksplisit `HdStatus.tsx` dan `HdStoredStatus.tsx`.
* [x] **TODO-HD05-02:** Pencegahan infinite loading pada akun tanpa blueprint (`missing_blueprint`).
* [x] **TODO-HD05-03:** In-memory session cache dengan TTL 5 menit diisolasi per UID dan revision hash.
* [x] **TODO-HD05-04:** Penyelarasan banner pending di dashboard (`PendingHdRecoveryBanner.tsx`).
* [x] **TODO-HD05C:** Pembuatan local browser harness, network guard, dan mock synthetic Firebase.
* [x] **TODO-HD05D-01 (Flow D — Account Isolation):** `[x] DONE` (Playwright Chromium, 7/7 scenarios PASS, 104 checks, 0 unhandled).
* [x] **TODO-HD05D-02 (Flow A — New User Onboarding):** `[x] DONE` (Playwright Chromium, 10/10 scenarios PASS, 110 assertions, 0 unhandled).
* [x] **TODO-HD05D-03 (Flow B — Birth Data Correction):** `[x] DONE` (Playwright Chromium, 13/13 scenarios PASS, 67 assertions in runner / 70 total checks verified, 0 unhandled).
* [x] **TODO-HD05D-04 (Flow C — Dashboard Pending & Recovery):** `[x] DONE` (Playwright Chromium, 15/15 scenarios PASS, 100% assertions green, 0 unhandled).
* [x] **TODO-HD05D-05 (Acceptance Closure):** `[x] DONE` (55/55 browser scenarios verified).

---

### Sprint HD-06A: Release Gate Reconciliation & Safe Build Validation
* **Status:** `[x] AUDITED (PARTIAL / RELEASE GATES OPEN)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-HD06A-01:** Rekonsiliasi 10 Release Gates dengan status eksplisit.
* [x] **TODO-HD06A-02:** Verifikasi integritas working tree dan penyusunan `PATCH_MANIFEST.json` (108 entri).
* [x] **TODO-HD06A-03:** Validasi safe local build (Webpack 64s PASS, Typecheck PASS, static export dual-mode terpetakan).
* [x] **TODO-HD06A-04:** Penyelarasan test suite Build 107 contract & mitigasi collision hash FNV-1a.
* [!] **TODO-HD06A-05:** Release Gates Open: GATE-06 (Android Device), GATE-07 (Real Engine Endpoint), GATE-09 (Production Parity).

---

## 3. WORKSTREAM 2: BILLING & ENTITLEMENT MASTER BACKLOG

### Sprint BILL-00: Billing Source Audit & Baseline
* **Status:** `[x] DONE (BASELINE AUDIT COMPLETE)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-BILL00-01:** Audit jalur Google Play purchase & native Capacitor bridge (`lib/billing/googlePlayBilling.ts`).
* [x] **TODO-BILL00-02:** Audit backend verifier microservice (`services/billing-verifier/api/billing/google-play/verify.ts`).
* [x] **TODO-BILL00-03:** Audit purchase token ownership & UID switching (`TOKEN_OWNERSHIP_CONFLICT` & `billing_purchase_tokens`).
* [x] **TODO-BILL00-04:** Audit subscription renewal, grace period, cancellation, & cron reconciliation (`api/billing/reconcile.ts`).
* [x] **TODO-BILL00-05:** Audit entitlement precedence unioning (`lib/billing/entitlementService.ts`).
* [x] **TODO-BILL00-06:** Audit Trial/Founder/Lifetime/Grant states & canonical Firestore synchronization.
* [x] **TODO-BILL00-07:** Audit restore purchase & recovery state machine (`lib/billing/premiumRecovery.ts`).
* [x] **TODO-BILL00-08:** Inventarisasi technical debt & dead code (legacy `MOANA_` mocks, obsolete 3-day grant, `UserPlan` localStorage).
* [x] **TODO-BILL00-09:** Rekomendasi sprint perbaikan BILL-01 s/d BILL-04.

---

### Sprint BILL-01: Purchase Ownership & Canonical Entitlement Integrity
* **Status:** `[x] DONE (PASS LOCAL / POLICY PENDING)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-BILL01-01 (Ownership Matrix):** Implementasi & eksekusi BILL01-01 s/d BILL01-10 di `services/billing-verifier/tests/unit/bill01-ownership-and-verifier.test.ts`.
* [x] **TODO-BILL01-02 (Integrity Matrix):** Implementasi & eksekusi BILL01-11 s/d BILL01-20 di `tests/unit/bill01-entitlement-integrity-client.test.ts`.
* [x] **TODO-BILL01-03 (Bug Fix):** Perbaikan `persistEntitlement` agar token expired tidak mendowngrade active future subscription (`isStaleOlderToken`).
* [x] **TODO-BILL01-04 (Precedence Conflict Record):** Dokumentasi formal perbedaan Option A (Paid > Tester Grant) vs Option B (Tester Grant > Paid).
* [x] **TODO-BILL01-05 (Security Audit):** Audit `firestore.rules` dan `stripServerOwnedAccessFields` (fail-closed boundary).

---

### Sprint BILL-02: Google Play Verification, Restore & Failure Resilience
* **Status:** `[x] DONE (PASS LOCAL — 41 CHECKS)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-BILL02-01 (Security Carryover):** Verifikasi ulang 7 skenario carryover BILL-01 di `services/billing-verifier/tests/unit/bill02-carryover-and-verifier.test.ts` (PASS 7/7).
* [x] **TODO-BILL02-02 (Older Voided Token Bug Fix):** Perbaikan `isStaleOlderToken` di `services/billing-verifier/lib/entitlement.ts` agar token voided/refunded lampau tidak mendowngrade subscription aktif (PASS).
* [x] **TODO-BILL02-03 (Verifier API Acceptance):** Implementasi & verifikasi HTTP contracts (200, 400, 401, 403, 409, 500, 502, 504) di `services/billing-verifier/tests/unit/bill02-verifier-api-acceptance.test.ts` (PASS 14/14).
* [x] **TODO-BILL02-04 (Background Reconcile Worker):** Audit & verifikasi cron authentication, pagination 25, lease ownership, backoff, dan dead-lettering di `api/billing/reconcile.ts` (PASS 5/5).
* [x] **TODO-BILL02-05 (Restore Purchases Acceptance):** Implementasi & verifikasi BILL02-01 s/d BILL02-12 di `tests/unit/bill02-restore-and-client-lifecycle.test.ts` (PASS 12/12).
* [x] **TODO-BILL02-06 (Client Boundary Hardening):** Validasi fail-closed Web platform, isolasi SecureStorage UID partitioning, dan offline ECDSA signed entitlement (PASS 3/3).

---

### Sprint BILL-03: Subscription Lifecycle, Expiry, Refund & Reconciliation Integrity
* **Status:** `[x] AUDITED (PARTIAL — CLOSED IN BILL-03A)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-BILL03-01 (Security Carryover Audit):** Re-audit `isStaleOlderToken` & minimal patch untuk token non-authoritative dan dateless token di `services/billing-verifier/lib/entitlement.ts` (PASS 7/7).
* [x] **TODO-BILL03-02 (Lifecycle Matrix BILL03-01 s/d BILL03-20):** Implementasi & verifikasi 20 skenario lifecycle (renewal, out-of-order, cancellation, grace period, account hold, refund, pending, replacement) di `services/billing-verifier/tests/unit/bill03-lifecycle-and-reconcile.test.ts` (PASS 20/20).
* [x] **TODO-BILL03-03 (Authority & Expiration 1 s/d 10):** Verifikasi keabsahan provider expiry, anti-tampering timestamp klien, immutability trial habis, founder permanence, dan anti self-grant di `tests/unit/bill03-authority-and-offline.test.ts` (PASS 10/10).
* [x] **TODO-BILL03-04 (Offline Entitlement & Clock Rollback 1 s/d 6):** Audit kriptografis ECDSA ES256, UID binding, batas 72 jam grace offline, dan penolakan clock rollback di `tests/unit/bill03-authority-and-offline.test.ts` (PASS 6/6).
* [x] **TODO-BILL03-05 (Reconciliation & Deferred Ack BILL03-21 s/d BILL03-30):** Verifikasi durable ack job, worker retry, lease locking, backoff, dead-lettering, operator recovery, dan deadline safety di `services/billing-verifier/tests/unit/bill03-lifecycle-and-reconcile.test.ts` (PASS 10/10).
* [x] **TODO-BILL03-06 (Multi-Token Data Model Audit):** Audit batasan model dokumen flat Firestore vs registry token aktif & dokumentasi proposal migrasi aman tanpa mutasi skema prematur (AUDITED).

---

### Sprint BILL-03A: Critical Entitlement Integrity Closure
* **Status:** `[x] DONE (PASS LOCAL — 30 CHECKS)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-BILL03A-01 (Section A: Critical Refund Guard A01 - A08):** Perbaikan bug `isStaleOlderToken` via `isAuthoritativeActiveToken` di `services/billing-verifier/lib/entitlement.ts` sehingga refund dengan `date = null` atau `date < existingExpiry` serta akun legacy mencabut akses Premium secara fail-closed, tanpa menyentuh langganan aktif independen atau hak Founder/Tester (`bill03a-critical-integrity.test.ts`, PASS 8/8).
* [x] **TODO-BILL03A-02 (Section B: Active Token Hash Correctness B01 - B06):** Penghapusan bug "last-token-wins" pada `activeTokenHash`; token dengan masa aktif terpanjang (Dec 1 vs Nov 1) dipertahankan sebagai hash otoritatif (`bill03a-critical-integrity.test.ts`, PASS 6/6).
* [x] **TODO-BILL03A-03 (Section C: Acknowledgement Durability C01 - C08):** Validasi queue PostgreSQL, status `[LEDGER_TX_DEGRADED]`, lease timeout 5 menit, dead-lettering setelah 5 attempt, dan batas 72 jam Play Store (`bill03a-ack-durability.test.ts`, PASS 8/8).
* [x] **TODO-BILL03A-04 (Section D: Offline Entitlement Safety D01 - D08):** Pengujian ketat offline grace 72 jam, penolakan device clock rollback, clock skew tolerance 60 detik, isolasi UID, dan kegagalan fail-closed pada tamper cache (`bill03a-offline-safety.test.ts`, PASS 8/8).
* [x] **TODO-BILL03A-05 (Multi-Token Schema Blocker & Founder Proposal):** Identifikasi batasan flat `users/{uid}` schema sebagai formal **DESIGN BLOCKER** dan penyusunan proposal migrasi koleksi token untuk evaluasi Founder.
* [x] **TODO-BILL03A-06 (Full Regression Gate):** Verifikasi seluruh 142 billing tests (92 server + 50 client), TypeScript check clean (0 error), ESLint clean (0 error).

---

### Sprint BILL-03B: Multi-Token Fallback & Acknowledgement Recovery
* **Status:** `[x] AUDITED (PARTIAL — CLOSED IN BILL-03B.1)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-BILL03B-01 (Option A Multi-Token Fallback Implementation):** Implementasi server-side fallback di `services/billing-verifier/lib/entitlement.ts` menggunakan kueri single-field `billing_purchase_tokens.where("uid", "==", uid)` di dalam transaksi Firestore tanpa perubahan skema maupun migrasi.
* [x] **TODO-BILL03B-02 (Multi-Token Fallback Matrix MT-01 s/d MT-10):** Verifikasi lengkap 10 skenario fallback multi-token di `services/billing-verifier/tests/unit/bill03b-multi-token-fallback.test.ts` (PASS 10/10), membuktikan server memulihkan akses tanpa bergantung pada aplikasi dibuka kembali (MT-01 & MT-10 terbukti).
* [x] **TODO-BILL03B-03 (Acknowledgement Recovery ACK-01 s/d ACK-10):** Verifikasi jalur pemulihan durable queue, klarifikasi `MAX_ATTEMPTS = 10` dari `reconcile.ts`, lease timeout 5 menit, dead-lettering, dan prosedur pemulihan operator di `services/billing-verifier/tests/unit/bill03b-ack-recovery.test.ts` (PASS 10/10).
* [x] **TODO-BILL03B-04 (Offline Clock Safety CLK-01 s/d CLK-08):** Verifikasi anti-clock rollback, toleransi clock skew 60 detik, penegakan batas 72 jam grace offline, stabilitas epoch UTC terhadap timezone, dan pembatalan fail-closed saat reconnect di `tests/unit/bill03b-offline-clock-safety.test.ts` (PASS 8/8).
* [x] **TODO-BILL03B-05 (RSK-18 Resolution):** Status RSK-18 direview kembali pada BILL-03B.1 untuk verifikasi kegagalan kueri dan semantik transaksi.
* [x] **TODO-BILL03B-06 (Full Regression Suite):** Verifikasi seluruh 170 billing tests (112 backend + 58 client), TypeScript checks clean (0 error), ESLint clean (0 error).

---

### Sprint BILL-03B.1: Multi-Token Fallback Failure Safety & Transaction Integrity
* **Status:** `[x] DONE (PASS LOCAL — 15 NEW SCENARIOS, 191/191 TOTAL)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-BILL03B1-01 (MT-07 Contradiction Resolution):** Menghapus `try...catch` yang menelan error kueri token alternatif di `services/billing-verifier/lib/entitlement.ts`. Kueri yang gagal/timeout kini melempar error retryable dan membatalkan (ABORT) transaksi Firestore, mencegah downgrade destruktif ke FREE saat transient error terjadi.
* [x] **TODO-BILL03B1-02 (Firestore Transaction Read-Before-Write Invariant):** Menata ulang urutan operasi di `persistEntitlement` sehingga seluruh pembacaan (`tokenSnap`, `userSnap`, `tokensQuery`) dieksekusi sebelum penulisan (`transaction.set`), sesuai kontrak Firestore Admin SDK.
* [x] **TODO-BILL03B1-03 (Fallback Acceptance Matrix BF-01 s/d BF-15):** Mengimplementasikan dan meloloskan 15 skenario pengujian di `services/billing-verifier/tests/unit/bill03b1-fallback-safety.test.ts` (PASS 15/15), mencakup kegagalan kueri, timeout, pembatalan bersamaan, rollback penulisan, dan akun legacy.
* [x] **TODO-BILL03B1-04 (Registry Freshness & Validation Policy):** Memperketat validasi kandidat token alternatif (hash pengecualian, status non-voided, masa berlaku di masa depan, penolakan `lastVerifiedAt` malformed) serta mendokumentasikan kebijakan verifikasi ulang ke Google Play.
* [x] **TODO-BILL03B1-05 (ACK-03 & Offline Clock Durability Verification):** Memastikan kembali ACK-03 degradasi ledger status saat Neon offline dan batasan residual rollback jam offline tetap terdokumentasi tanpa overclaim.
* [x] **TODO-BILL03B1-06 (Full Regression Suite Gate):** 191 billing checks pass (133 backend + 58 client), 0 regressions, TypeScript & ESLint 0 errors.

---

### Sprint BILL-04: Premium UI Harmonization, Paywall Consistency & Safe Legacy Cleanup
* **Status:** `[x] DONE (PASS LOCAL — 25 NEW SCENARIOS, 216/216 TOTAL)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-BILL04-01 (Dual-Display Presentation Architecture):** Mengimplementasikan dual-display presentation mapper di `lib/billing/entitlementPresentation.ts` (`commercialStatus`, `communityBadge`, `isDualDisplay`, `isLifetime`, `formattedExpiry`, `daysRemaining`) memisahkan status komersial dari lencana komunitas tanpa saling menimpa (`tests/unit/billing-entitlement-presentation.test.ts`, PASS 18/18).
* [x] **TODO-BILL04-02 (Canonical UI Surface Implementation):** Membangun komponen antarmuka kanonikal `components/billing/CanonicalPremiumScreen.tsx` dan memperbarui `app/premium-bhumi/page.tsx` dengan dual-display, Google Play live pricing via `queryPremiumSubscription()`, fallback netral tanpa hardcoded authority, dan guard platform web (`tests/unit/v5-08-premium-residual.test.ts`, PASS 46/46).
* [x] **TODO-BILL04-03 (Settings Surface Normalization):** Menyelaraskan `app/settings/page.tsx` untuk mengonsumsi `getBillingPresentation(entitlement, originalProfile, testerRecord)`, menampilkan `membershipDisplay.formattedExpiry` & `communityBadge`, membersihkan mutasi `localStorage.setItem(USER_PLAN_STORAGE_KEY)`, dan memelihara kompatibilitas date locale formatting (`build108-sprint07-settings-legal-paywall.test.ts`, PASS 64/64).
* [x] **TODO-BILL04-04 (Legacy Code & Mock Cleanup):** Memperbarui konstanta usang `TODO_PLAY_CONSOLE_...` di `lib/billing/billingPreparation.ts` menjadi `bhumi_premium_monthly` / `bhumi_premium_yearly` dengan deprecation tag resmi.
* [x] **TODO-BILL04-05 (UI Acceptance Matrix UI-01 s/d UI-25):** Mengimplementasikan dan meloloskan seluruh 25 skenario penerimaan antarmuka di `tests/unit/bill04-ui-acceptance.test.ts` (PASS 25/25).
* [x] **TODO-BILL04-06 (Full Regression Gate):** 216 checks billing tests pass (133 backend + 83 client), TypeScript check root & billing-verifier 0 errors, ESLint 0 errors.

---

### Sprint BILL-04A: Premium UI Real-Browser Acceptance & Regression Closure
* **Status:** `[x] DONE (PASS LOCAL BROWSER — 25/25 SCENARIOS PASS, 0 FAILED)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-BILL04A-01 (Playwright Chromium Real-Browser Harness):** Menyiapkan harness peramban Chromium Playwright lokal dengan synthetic Firebase Auth/Firestore dan synthetic Capacitor native billing bridge tanpa koneksi ke cloud produksi.
* [x] **TODO-BILL04A-02 (Browser Acceptance Scenarios UI-01 s/d UI-25):** Menjalankan dan membuktikan 25 skenario penerimaan antarmuka aktual di `tests/qa/bill04a-browser-acceptance.ts` (PASS 25/25).
* [x] **TODO-BILL04A-03 (Screenshot Artifacts Generation):** Menghasilkan 22 artefak tangkapan layar di `qa-artifacts/bill04a-browser/` yang memvalidasi rendering mobile (390x844) dan desktop (1440x900) dengan zero horizontal overflow (`scrollWidth <= clientWidth`).
* [x] **TODO-BILL04A-04 (In-Flight Click Deduplication):** Memverifikasi deduplikasi klik cepat simultan pada tombol pembelian (UI-24); in-flight lock memastikan tepat 1 verifier call dipicu.
* [x] **TODO-BILL04A-05 (Session Switching & Isolation):** Memverifikasi isolasi sesi penuh antar-pengguna (UI-20) dan pembuangan respon verifikasi yang terlambat via invarian `AUTH_CHANGED` (UI-21).
* [x] **TODO-BILL04A-06 (Full Regression & Scope Non-Claims):** 133 unit tests backend verifier PASS, 85 unit tests client billing & residual contracts PASS, TypeScript 0 errors. Android native dan transaksi Google Play nyata ditegaskan berstatus **STRICTLY NOT VERIFIED**.

---

### Sprint BILL-05A: Android Billing Readiness, Capacitor Native Contract & Safe Local Build
* **Status:** `[x] AUDITED (CONTRACT PASS / BUILD & EMULATOR GATES OPEN)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-BILL05A-01 (Environment & Toolchain Audit):** Audit tepat versi toolchain aktif: Next.js 16.2.6, React 19.2.4, Capacitor 8.3.4, Google Play Billing 9.1.0, Gradle 9.4.1, AGP 9.2.1, JDK 17.0.20.1, Android SDK 36 (compileSdk 36, targetSdk 36, minSdk 24). Rekonsiliasi versi Next.js tercatat.
* [x] **TODO-BILL05A-02 (Next.js Static Export & Human Design Blocker Resolution):** Audit blocker `/api/humandesign/bodygraph` (HTTP 410) pada static export (`output: 'export'`). Identifikasi dual-mode build (Serverless web deployment vs Capacitor static client shell). Usulan perbaikan ditandai `CROSS-WORKSTREAM APPROVAL REQUIRED` tanpa memodifikasi file Human Design secara sepihak.
* [x] **TODO-BILL05A-03 (Capacitor Android Contract Audit):** Audit `MainActivity.java`, `BhumiBillingPlugin.java`, permissions `com.android.vending.BILLING`, internet, network state. Verifikasi ProGuard/R8 rules di `proguard-android-optimize.txt` dan `capacitor.community.securestorage`.
* [x] **TODO-BILL05A-04 (Google Play Billing Native Contract Audit):** Audit `BillingClient` init dengan `enablePendingPurchases()`, query `QueryProductDetailsParams` untuk `bhumi_premium_monthly` / `monthly`, purchase launch dengan `setObfuscatedAccountId(uid)`, native-level handling `ITEM_ALREADY_OWNED` via in-flight fetch recovery, zero logging token di release, dan deferred acknowledgement ke backend verifier.
* [x] **TODO-BILL05A-05 (Local Android Build & Emulator Gate Evaluation):** Eksekusi evaluasi build debug: identifikasi error `processDebugGoogleServices` akibat suffix `.qa` di `buildTypes.debug` yang tidak terdaftar di `google-services.json`. Evaluasi transparan 20 skenario Android (NATIVE-01..20: 10 static contract PASS, 10 build/emulator open gates).
* [x] **TODO-BILL05A-06 (Browser vs Native Gap Matrix & BILL-05B Design):** Formulasi gap matrix (Playwright mock vs Android runtime vs Live Play API) dan perancangan dokumen kendali uji Google Play Internal Testing BILL-05B (9 skenario lisensi, exit criteria, monitoring, rollback, zero production execution).

---

### Sprint BILL-05B: Google Play Internal Testing & Native End-to-End Verification
* **Status:** `[ ] PENDING AUTHORIZATION (NOT AUTHORIZED / DESIGN ONLY)`
* [ ] **TODO-BILL05B-01:** Verifikasi transaksi nyata Google Play License Testing pada perangkat fisik Android (Slow test renewal, pending purchase, cancel paid-through, restore multi-device, account hold).
* [ ] **TODO-BILL05B-02:** Verifikasi sinkronisasi Real-time Developer Notifications (RTDN) Pub/Sub ke backend billing verifier.

---

### Sprint BILL-06: Production Readiness, Security & Final Release Gate
* **Status:** `[ ] BLOCKED (NOT AUTHORIZED / PENDING FOUNDER REVIEW)`
* [ ] **TODO-BILL06-01:** Audit akhir kesiapan rilis produksi Play Store AAB/APK dan Firebase/Postgres production deploy.

---

### Sprint DASH-LOCK-01: Dashboard Final Lock & Android Build Readiness Hygiene
* **Status:** `[x] AUDITED (LOCAL PASS / BUILD PREPARATION READY / RELEASE GATES OPEN)`
* **Lead Agent:** Google Antigravity
* [x] **TODO-DASHLOCK-01 (Preflight & Git Worktree Audit):** Verifikasi working tree, HEAD `608f61c4`, 6 modified files, 1 untracked production file (`lib/astrology/transitEvents.ts`), zero secret leakage.
* [x] **TODO-DASHLOCK-02 (Dashboard Runtime & Source Completeness):** Verifikasi 7 file runtime Dashboard (`CoreIdentity.tsx`, `DashboardClient.tsx`, `AstroTodayCard.tsx`, `CelestialMoon.tsx`, `transitEvents.ts`, `calculateCurrentSky.ts`, `dailyAstroSynthesis.ts`).
* [x] **TODO-DASHLOCK-03 (Test Route Containment Strategy):** Audit 3 test routes di `app/` (`test-astro-transit`, `test-identitas-inti`, `test-3d-poc`) dan dampaknya pada static export Capacitor. Strategi isolasi disusun untuk persetujuan Founder.
* [x] **TODO-DASHLOCK-04 (Generated Types Reproducibility):** Audit `.next/dev/types/validator.ts` ephemeral status; typecheck bebas error tanpa manual patching (`npx tsc --noEmit` exit 0).
* [x] **TODO-DASHLOCK-05 (Dashboard & Astro Regression Gate):** 44 Astro transit tests PASS, 20 V5 Astro core tests PASS, 29 Build106 regression assertions PASS, 11 Canonical Today tests PASS, 22 V5 synthesis tests PASS, 43 Playwright browser assertions PASS (3 viewports), 4 natal vs transit isolation checks PASS.
* [x] **TODO-DASHLOCK-06 (Build Config & Static Export Audit):** Audit `next.config.ts`, `capacitor.config.ts`, `package.json`, asset parity path, dan HTTP 410 decommissioned endpoints.


---

## 4. SUMMARY METRICS

| Kategori | Jumlah Item | Persentase |
|---|---|---|
| **Selesai (DONE / AUDITED)** | 87 item | 94.6% |
| **Sedang Berjalan (PARTIAL / READY)** | 1 item | 1.1% |
| **Menunggu (PENDING)** | 2 item | 2.2% |
| **Terkunci / Open Gates (BLOCKED / GATES OPEN)** | 2 item | 2.2% |
| **Total Tracking Items** | **92 item** | **100%** |


---

### Sprint DASH-WEEKLY-01: Build 118 Personal Weekly Cosmic & Soul Guidance
* **Status:** `[x] DONE (PASS LOCAL — 93 tests)`
* **Lead Agent:** Google Antigravity
* **Target Build:** **BUILD 118** (`versionCode = 118`, `versionName = "5.0.18"`)
* [x] **TODO-B118-01 (Timing & ISO-8601 Week Engine):** Eliminasi bug tabrakan kunci minggu; implementasi penghitungan minggu ISO-8601 berbasis Luxon (`lib/weeklyGuidance/weeklyTransitCalculator.ts`).
* [x] **TODO-B118-02 (Weekly Ephemeris & Collective Sky):** Perhitungan posisi Sun, Moon, dan 8 planet SwissEph apparent geocentric; fase Bulan numerik & iluminasi; deteksi planet retrograde/direct; station & ingress diskrit mingguan.
* [x] **TODO-B118-03 (Placidus Natal Transits & Cusp Crossings):** Perhitungan rumah Placidus yang dilintasi transit planet; deteksi penyeberangan cusp; perhitungan 5 aspek utama terhadap natal Sun, Moon, Ascendant, placements natal, orb, dan waktu puncak eksak.
* [x] **TODO-B118-04 (Eight Life Domains Integration):** Pemetaan transit personal ke 8 domain kehidupan dengan bukti astrologi eksplisit (derajat, rumah, aspek), makna astrologis, makna spiritual mendalam, dan Saran Bhumi spesifik.
* [x] **TODO-B118-05 (Canonical Blueprint Depth):** Integrasi kontribusi pendalaman Life Path 1–9/11/22/33, Human Design (Type, Strategy, Authority), dan Pusat Arcana Matrix Destiny.
* [x] **TODO-B118-06 (Spiritual Safety Protocols):** Penegakan batas etis: tanpa diagnosis gangguan jiwa klinis, tanpa ramalan kutukan/serangan gaib, tanpa romanticizing depresi/trauma.
* [x] **TODO-B118-07 (Copy Glitch & Chinese Characters Cleanup):** Pembersihan total karakter Mandarin ('jangan等到') dan normalisasi kalimat Bahasa Indonesia baku dan reflektif.
* [x] **TODO-B118-08 (Dashboard Cosmic Summary & UI Refinement):** Ringkasan kosmik di Dashboard (rentang, iklim kolektif, transit terkuat, 3 domain highlight, pesan spiritual); tampilan 8 domain interaktif via tab selector mobile-friendly dengan CTA.
* [x] **TODO-B118-09 (Lifecycle State Reset & Efficiency Guard):** Reset `setWeeklyGuidance(null)` saat pergantian UID; pelepasan timer 30 detik dari effect kalkulasi mingguan.
* [x] **TODO-B118-10 (Version Convergence 118 / 5.0.18):** Penyelarasan versi Android native `versionCode 118` dan `5.0.18` di `build.gradle`, `buildInfo.ts`, dan tes rekonsiliasi.

---

### Sprint DASH-WEEKLY-02: Build 118 Vertical Accordion UI & Canonical Cross-System Synthesis & Narrative Humanization
* **Status:** `[x] DONE (PASS LOCAL — 136 tests)`
* **Lead Agent:** Google Antigravity
* **Target Build:** **BUILD 118** (`versionCode = 118`, `versionName = "5.0.18"`)
* [x] **TODO-B118-11 (Vertical Accordion Domain Cards UI):** Menghapus horizontal pill scroll bar; mengganti dengan 8 kartu vertikal full-width dengan ikon SVG, judul lengkap tanpa terpotong, ringkasan personal 1–2 baris, badge aktivasi transit, dan chevron toggle. Menghubungkan klik 3 kartu domain highlight di `DashboardClient.tsx` untuk membuka accordion target dengan smooth scroll.
* [x] **TODO-B118-12 (Canonical Cross-System Synthesis Engine):** Mengekstrak data kanonikal lengkap via `extractFullCanonicalBlueprint()` (Destiny Matrix Love Line, Money Line, Karmic Tail, Arcana Tahunan, Talenta; Human Design Type, Authority, Profile, Centers, Not-Self; BaZi Day Master; Vedic Nakshatra; Weton; Tzolkin; Numerology). Mengintegrasikannya ke dalam 8 domain narasi personal.
* [x] **TODO-B118-13 (Humanized Spiritual Tone & Boilerplate Elimination):** Menghapus pola kalimat AI yang berulang ("Awal pekan dimulai dengan kesadaran penuh...", "Arus keuangan terhubung dengan rumah...", "Kosmos mengarahkan kita..."). Mengadopsi nada pendamping spiritual yang hangat, peka tema karma, shadow work, dan pertumbuhan batin. Memperbaiki duplikasi rumah ("rumah ke-9 dan rumah ke-9") via `formatHousePair()`.
* [x] **TODO-B118-14 (Foundations Drawer / Dasar Pembacaan):** Mengimplementasikan laci teknis `<details>` di setiap kartu domain yang memaparkan secara transparan seluruh indikator sistem yang digunakan (planet transit, derajat, rumah Placidus, aspek, orb, fase, arcana, center HD).
* [x] **TODO-B118-15 (Comprehensive Test Suite Expansion):** Memperluas `tests/unit/build118-weekly-guidance.test.ts` menjadi 136 assertion mencakup verifikasi sintesis kanonikal, diferensiasi User A vs User B, ketiadaan duplikasi rumah, dan ketiadaan formula AI klise. Seluruh 136 checks PASS LOCAL.

---

### Sprint DASH-WEEKLY-03: Canonical Love Path Data Integrity & Asmara Relationship Status Personalization
* **Status:** `[x] DONE (PASS LOCAL — 187 checks, Typecheck PASS, HTTP 200)`
* **Lead Agent:** Google Antigravity
* **Target Build:** **BUILD 118** (`versionCode = 118`, `versionName = "5.0.18"`)
* [x] **TODO-B118-16 (Root Cause Investigation & MapToBlueprint Fix):** Menyelidiki akar masalah bug `8–10–7` pada akun Founder (1985-05-03) yang sebelumnya merender Arcana 8 (Justice) di Love Line akibat `mapToBlueprint.ts` legacy yang menyisipkan `epoint` (pusat). Mengalihkan `calculateDestinyMatrixForBlueprint` ke `calculateCanonicalDestinyMatrixBlueprint`, menghasilkan simpul kanonikal `[7, 10, 21]` (7 The Chariot, 10 Wheel of Fortune, 21 The World).
* [x] **TODO-B118-17 (Hydration & Self-Healing Guard):** Menambahkan deteksi otomatis di `extractFullCanonicalBlueprint` dan `DashboardClient.tsx` untuk merehidrasi data kanonikal jika blueprint tersimpan memiliki pola bug legacy (`loveLine[0] === center`).
* [x] **TODO-B118-18 (Non-Generic Dynamic Arcana Interpretation):** Mengeliminasi hardcode "pengorbanan sepihak" dari pembacaan Asmara. Mengimplementasikan `interpretLovePathArcana()` yang secara dinamis mengekstrak arketipe dan makna hubungan nyata dari `destinyMatrixArcanaDictionary` sesuai nomor arcana pengguna.
* [x] **TODO-B118-19 (Asmara Relationship Status Personalization):** Mengintegrasikan status hubungan pengguna (`single` / lajang vs `in_relationship` / berpasangan vs `unspecified`). Membedah kesiapan batin, pola memilih pasangan, dan shadow work untuk `single` (tanpa janji jodoh palsu); membedah komunikasi, keintiman, komitmen, dan penyelesaian konflik untuk `in_relationship` (tanpa tuduhan selingkuh/ramalan putus); serta narasi universal untuk `unspecified`.
* [x] **TODO-B118-20 (Settings UI Selector & Profile Repository Persistence):** Menambahkan field kanonikal `relationshipStatus?: "single" | "in_relationship" | "unspecified" | null` ke `UserProfile`, selektor UI 3 opsi di `app/settings/page.tsx` Data Diri, penyimpanan aman via `userRepository` / `storageProvider` terikat UID, persisten lintas restart, dan terisolasi privat.
* [x] **TODO-B118-21 (Regression Verification & Release Containment):** Memperluas test suite `build118-weekly-guidance.test.ts` menjadi 187 checks (Sections 1–15 PASS), verifikasi version reconciliation (24 checks PASS), `npx tsc --noEmit` exit 0, dan verifikasi localhost HTTP 200. APK/AAB build tetap diblokir menunggu review Founder.

---

### Sprint DASH-WEEKLY-04: Weekly Guidance Accuracy, Activation Scoring & Narrative Refinement
* **Status:** `[x] DONE (PASS LOCAL — 231 checks, Typecheck PASS, HTTP 200)`
* **Lead Agent:** Google Antigravity
* **Target Build:** **BUILD 118** (`versionCode = 118`, `versionName = "5.0.18"`)
* [x] **TODO-B118-22 (Proportional Activation Intensity Scoring):** Menghapus penentuan intensitas biner (orb <= 2.5° = Kuat) yang sebelumnya menyebabkan hampir seluruh domain berlabel 'Aktivasi Kuat'. Mengimplementasikan `scoreAspectForDomain()` bertingkat yang menghitung kecocokan rumah (+14/9/8), planet (+8/5), aspek (+7/5/3/1), dan luminary (+3); ambang Kuat (score >= 24 & orb <= 2.2°), Sedang (score >= 14), dan Ritme Tenang (score < 14); menghasilkan distribusi realistis (1 Kuat, 6 Sedang, 1 Ritme Tenang pada chart uji).
* [x] **TODO-B118-23 (Zero Triple Advice Duplication):** Menghapus duplikasi Saran Bhumi pada 3 tempat berbeda (highlight dashboard, preview kartu accordion, dan kotak Saran Bhumi). Menambahkan field kanonikal `summary: string;` pada `WeeklyGuidanceSection` yang memuat ringkasan eksekutif 1 kalimat khusus; preview kartu accordion dan highlight dashboard menampilkan `summary`, sedangkan kotak Saran Bhumi tetap fokus pada arahan aksi praktis.
* [x] **TODO-B118-24 (Astronomical Dynamic Phase Dynamics):** Menghapus formula fase tetap (Awal/Tengah/Akhir pekan statis). Mengimplementasikan `buildDynamicPhases()` yang menautkan narasi fase dengan timing puncak astronomis: aspek dengan puncak di awal pekan (Senin–Rabu) menjadi sorotan utama di awal pekan; aspek di tengah pekan (Kamis–Jumat) mencapai kulminasi di tengah pekan; aspek di akhir pekan (Sabtu–Minggu) mencapai kulminasi di akhir pekan; aspek 'separating' disajikan sebagai fase melandai dan pemulihan; serta domain dengan 'Ritme Tenang' disajikan dalam ritme harian yang stabil.
* [x] **TODO-B118-25 (Multi-Arcana Karmic Tail Synthesis):** Mengembangkan sintesis multi-arcana mendalam pada Ekor Karma Destiny Matrix (seperti 21–7–13: interaksi batas keterikatan 21 The World, dorongan ambisi ego 7 The Chariot, dan transformasi radikal 13 Death) serta Love Path 7–10–21 dalam konteks shadow work, tidak lagi sekadar mendeskripsikan arcana satu per satu secara terpisah.
* [x] **TODO-B118-26 (14-Subinterval Exact Timing & Fast Moon Traversal):** Mengimplementasikan deteksi zero-crossing sudut aspek menggunakan 14 sub-interval setengah harian dengan biseksi sub-menit; hanya mencantumkan timestamp jika aspek benar-benar mencapai titik eksak pada minggu berjalan; diformat transparan dengan label 'sekitar ... WIB'. Membedakan pergerakan cepat Bulan yang melintasi 3–4 rumah Placidus dalam sepekan (`Sepanjang minggu ini, lintasan cepat Bulan bergerak melintasi rumah ke-X hingga ke-Y Placidus...`) dari posisi snapshot tengah pekan.
* [x] **TODO-B118-27 (Comprehensive Test Suite Expansion):** Menambahkan Section 16 pada `tests/unit/build118-weekly-guidance.test.ts` memverifikasi proporsionalitas aktivasi (<8 Kuat, >0 Sedang/Tenang), diferensiasi summary vs advice, validitas 3 fase per domain, dan preview UI tanpa duplikasi Saran Bhumi. Seluruh 231 checks PASS LOCAL; TypeScript 0 errors; localhost HTTP 200. APK/AAB build tetap diblokir menunggu review Founder.

---

### Sprint DASH-WEEKLY-05: Weekly Guidance Final Acceptance & Scope Closure
* **Status:** `[x] CLOSED / FROZEN (LOCAL ACCEPTANCE)`
* **Lead Agent:** Google Antigravity
* **Target Build:** **BUILD 118** (`versionCode = 118`, `versionName = "5.0.18"`)
* [x] **TODO-B118-28 (Comprehensive 8-Domain Cross-System Audit):** Pemeriksaan menyeluruh 8 domain (Kabar Minggu Ini, Pikiran, Ekonomi, Asmara, Orang Terdekat, Makna Batin, Berat, Peluang). Astrological relevance, derajat/orb/rumah/aspek, applying/exact/separating, timing 'sekitar ... WIB', scoring proporsional, integrasi blueprint multi-sistem, kedalaman spiritual, zero saran generik, dan Dasar Pembacaan transparan.
* [x] **TODO-B118-29 (Canonical Blueprint Temporal Alignment):** Mengintegrasikan `resolveDestinyMatrixArcanaAtAge` dari `@/lib/destiny-matrix/annualArcana` berbasis simpul graf kanonikal; verifikasi integritas formula arcana tahunan tanpa asumsi; verifikasi guard rehidrasi Love Path aman dari false-trigger.
* [x] **TODO-B118-30 (Final UI/UX & Responsive Behavior Check):** 8 akordeon vertikal full-width dengan ikon SVG, judul lengkap, badge aktivasi, preview summary independen, auto-scroll & toggle dari 3 domain teratas, dan perilaku accordion tunggal terverifikasi pada localhost:3000 (HTTP 200).
* [x] **TODO-B118-31 (Asmara Acceptance Across 3 Relationship States):** Evaluasi komparatif 3 status hubungan (`single`, `in_relationship`, `unspecified`) pada chart sintetis identik (1985-05-03 Scorpio Rising). Terbukti menghasilkan 3 teks, refleksi kosmik, dan Saran Bhumi yang berbeda konteks secara tajam tanpa mengubah nomor natal atau mengarang data pasangan.
* [x] **TODO-B118-32 (Localhost Firestore Analytics Conflict Hardening):** Penanganan idempotensi error `ALREADY_EXISTS` (code 6) pada `analyticsRepository.ts` dan deduplikasi 3000ms pada `usageAnalytics.ts`. Risiko dev-to-prod Firebase didokumentasikan terbuka.
* [x] **TODO-B118-33 (Quality Gate Fixture Execution):** Eksekusi aktual engine pada 2 profil berbeda (User A: Scorpio Rising 2026-W44 vs User B: Leo Rising 2026-W46) tersimpan di `scratch/acceptance-fixture-output.json` dan disertakan dalam laporan tanpa rekayasa teks.
* [x] **TODO-B118-34 (Scope Freeze & Next Module Inventory):** Fitur Panduan Minggu Ini resmi dibekukan (SCOPE FROZEN). Inventarisasi modul aplikasi lainnya disusun untuk prioritas sprint Founder berikutnya.

---

### Sprint PROFILE-DAILY-01: Build 118 Catatan Hari Ini (Profile Page) — Daily Personal Cosmic & Soul Journal
* **Status:** `[x] DONE (PASS LOCAL - 76 checks, Typecheck PASS, HTTP 200)`
* **Lead Agent:** Google Antigravity
* **Target Build:** **BUILD 118** (`versionCode = 118`, `versionName = "5.0.18"`)
* [x] **TODO-B118-35 (Daily Cosmic & Soul Journal Engine):** Mengimplementasikan engine deterministik murni `lib/dailyGuidance/dailySoulJournalEngine.ts` yang mengintegrasikan cuaca kosmik riil harian SwissEph (Matahari, Bulan [zodiak, derajat, menit, fase, % iluminasi], planet retrograde), transit harian personal terhadap natal chart Placidus (aspek, orb <= 5.5°, status applying/exact/separating, aktivasi rumah 1..12), dan sintesis lintas sistem kanonikal (Destiny Matrix Love Path 7–10–21, Ekor Karma 21–7–13, Center Arcana, Human Design Type/Authority/Profile/Not-Self, Life Path, Personal Year, BaZi Day Master, dan Weton kelahiran vs harian).
* [x] **TODO-B118-36 (2-Layer Mobile-First UI Architecture):** Membangun komponen modern `components/profile/DailySoulJournalCard.tsx` dengan arsitektur 2-lapisan:
  - Lapisan 1 (Daily Card - Ringkas ~180-220px): Tanggal & Weton harian, headline personal, 1–2 kalimat rangkuman energi inti, 2–3 micro-badges (Bulan, Transit, Kanonikal), dan tombol toggle "Buka/Tutup Pembacaan Lengkap".
  - Lapisan 2 (Daily Deep Reading - Expandable): 7 bagian terstruktur (A. Langit Hari Ini, B. Yang Sedang Bergerak Dalam Dirimu, C. Pesan Jiwa Hari Ini, D. Yang Perlu Kamu Sadari, E. Ruang yang Terbuka, F. Saran Bhumi [tepat SATU saran praktis membumi], G. Dasar Pembacaan [dropdown details transparansi teknis derajat, orb, aspek, dan angka blueprint]).
* [x] **TODO-B118-37 (Profile Surface Integration):** Memperbarui `app/profile/page.tsx` untuk memuat `buildDailySoulJournal()` dan merender `DailySoulJournalCard`, mempertahankan fallback aman saat data profil/blueprint minimum, dan membungkus legacy `DailyNoteV2` dalam container non-invasif untuk menjaga kompatibilitas penuh.
* [x] **TODO-B118-38 (Quality Gate & Automated Test Suite):** Menyusun dan meloloskan test suite komprehensif `tests/unit/build118-daily-guidance.test.ts` (76/76 PASS LOCAL), memverifikasi cuaca kosmik, transit-to-natal, struktur 2-lapisan 7-bagian, integrasi blueprint kanonikal, diferensiasi dua pengguna, diferensiasi temporal, blacklist frasa klise AI, penanganan data parsial, midnight rollover timezone, dan pencegahan triplikasi saran. `npx tsc --noEmit` 0 errors; HTTP 200 localhost:3000/profile.
* [x] **TODO-B118-39 (Dual-Fixture Execution & Acceptance Evidence):** Mengeksekusi engine aktual pada User A (Scorpio Rising, Projector 1/3, Love Path 7–10–21, Ekor Karma 21–7–13) dan User B (Virgo Rising, Generator 2/4, Love Path 6–12–18, Ekor Karma 18–6–15) pada 28 Oktober 2026 dan 5 November 2026; output aktual tersimpan di `scratch/build118-daily-journal-outputs.json`. Release tetap dibatasi (PENDING FOUNDER REVIEW).

---

### Sprint PROFILE-DAILY-02: Build 118 Catatan Hari Ini (Profile Page) — Exact Weekly Guidance Parity & Temporal Richness Addendum
* **Status:** `[x] DONE (PASS LOCAL - 239 checks, 706 total assertions across 7 suites, Typecheck PASS, HTTP 200)`
* **Lead Agent:** Google Antigravity
* **Target Build:** **BUILD 118** (`versionCode = 118`, `versionName = "5.0.18"`)
* [x] **TODO-B118-40 (Exact 8-Domain Vertical Accordion UI Parity):** Membangun `components/profile/DailyGuidanceCard.tsx` dengan desain dan arsitektur 100% identik dengan Panduan Minggu Ini:
  - Header banner "CATATAN HARI INI", tanggal lengkap, zona waktu (WIB), dan 3 micro-badges siklus harian (Weton, BaZi/Day Ren, Tzolkin Kin).
  - Ringkasan Langit & Siklus Hari Ini (posisi dan fase Bulan, planet retrograde, tema kolektif, catatan khusus Day Ren, peristiwa kosmik hari ini).
  - Transit Paling Aktif Terhadap Chart Milikmu (kotak bukti astrologis aspek transit paling ketat dengan derajat, menit, rumah Placidus, orb, dan perkiraan waktu eksak 'sekitar HH:mm WIB').
  - 3 Domain Kehidupan Paling Menonjol Hari Ini (kartu sorotan harian interaktif yang membuka akordeon target secara otomatis dan melakukan smooth scroll).
  - 8 Kartu Akordeon Vertikal Full-Width: 1. Kabar Hari Ini (`kabarHariIni`), 2. Pikiran (`pikiran`), 3. Ekonomi & Rezeki (`ekonomi`), 4. Asmara & Percintaan (`asmara`), 5. Orang Terdekat (`orangTerdekat`), 6. Makna Batin (`maknaBatin`), 7. Yang Mungkin Terasa Berat (`yangMungkinTerasaBerat`), 8. Peluang yang Terbuka (`ruangYangSedangTerbuka`). Setiap kartu memiliki ikon SVG, badge intensitas aktivasi, summary 1–2 baris independen, kotak bukti transit Placidus, makna astrologis, makna spiritual, sintesis lintas sistem, Saran Bhumi praktis, dinamika 3 fase harian (Pagi, Siang, Malam), dan drawer `<details>` Dasar Pembacaan teknis transparan.
  - Arah Hari Ini (kartu penutup ringkasan dengan CTA menuju `/wellness` dan `/journal`).
* [x] **TODO-B118-41 (Temporal Richness Integration — Astro Hari Ini Parity):** Menghubungkan perhitungan temporal kanonikal harian yang memasok Astro Hari Ini ke Catatan Hari Ini tanpa menghitung ulang secara inkonsisten:
  - Weton Jawa hari ini: Hari, pasaran, neptu, dan wuku dari `synthesis.eastern.weton`.
  - BaZi hari ini & Deteksi Eksplisit Day Ren: Pilar harian (Heavenly Stem + Earthly Branch) via `calculateBazi({ birthDate: dateKey, ... })`; deteksi otomatis **Day Ren** (壬, Air Yang, e.g. 2026-10-26 Ren Shen); penentuan relasi Shishen / Ten Gods terhadap Day Master natal pengguna.
  - Tzolkin Maya hari ini: Nomor Kin, nama Kin, Solar Seal, Galactic Tone, dan Wavespell dari `synthesis.eastern.tzolkin`.
  - Cuaca Astronomis SwissEph: Posisi zodiak Bulan, fase sudut, nama fase, persentase iluminasi, dan status retrograde planet.
* [x] **TODO-B118-42 (Sub-Minute Daily Transit Root Finding):** Mengimplementasikan `lib/dailyGuidance/dailyTransitCalculator.ts` dengan jendela waktu 1 hari (00:00:00 s/d 23:59:59.999 lokal), 24 sub-interval per jam, dan biseksi sub-menit untuk menentukan waktu kontak transit eksak ('sekitar HH:mm WIB'). Menghitung 10 benda langit transit terhadap 10 planet natal, Ascendant, Midheaven, dan 12 rumah Placidus.
* [x] **TODO-B118-43 (Collision-Free Scoring & Activation Intensity Balance):** Menerapkan pelacakan `usedAspectIndices` pada `lib/dailyGuidance/dailyGuidanceEngine.ts` agar satu aspek transit tidak dimonopoli oleh banyak domain. Ambang batas relevansi minimum 14 mencegah inflasi aktivasi semu, menghasilkan sebaran intensitas realistis (Kuat / Sedang / Ritme Tenang) dan zero triplikasi saran.
* [x] **TODO-B118-44 (Canonical Blueprint Personal Integration):** Mengintegrasikan Love Path 7–10–21 (dengan diferensiasi status hubungan Asmara Single vs Berpasangan), Ekor Karma 21–7–13, Center Arcana, Human Design Type/Authority/Profile/Not-Self, Life Path Number & Personal Year ke dalam narasi 8 domain harian.
* [x] **TODO-B118-45 (Profile Page Surface Parity):** Memperbarui `app/profile/page.tsx` untuk memuat `buildDailyGuidance()`, merender `DailyGuidanceCard`, dan menjaga kompatibilitas dengan menyematkan legacy `DailyNoteV2` dalam kontainer tersembunyi.
* [x] **TODO-B118-46 (Comprehensive Test Suite & Quality Gate):** Memperluas `tests/unit/build118-daily-guidance.test.ts` menjadi 239 checks mencakup paritas 8 domain, paritas Astro Hari Ini, deteksi BaZi Day Ren, Top 3 highlights, Asmara single vs berpasangan, diferensiasi dual user & temporal, zero AI clichés, dan zero triplikasi saran. Seluruh 239 checks PASS LOCAL; total 706 assertions lolos di seluruh 7 test suite; `npx tsc --noEmit` 0 errors; localhost:3000/profile HTTP 200 OK.
* [x] **TODO-B118-47 (Dual-Fixture Parity Output Evidence):** Mengeksekusi script `scripts/capture-daily-guidance-outputs.ts` menghasilkan output aktual User Aria (Single, Projector 1/3) dan User Maya (Berpasangan, Generator 2/4) pada 28 Oktober 2026, serta User Aria pada 26 Oktober 2026 (kondisi Day Ren); output tersimpan di `scratch/build118-daily-guidance-parity-outputs.json`. Release tetap dibatasi (SUPERSEDED BY SPRINT PROFILE-DAILY-03).

---

### Sprint PROFILE-DAILY-03: Build 118 Catatan Hari Ini (Profile Page) — Deep Daily Cross-System Synthesis (Four Foundations × Canonical Blueprint)
* **Status:** `[x] DONE (PASS LOCAL - 389 checks, 856 total assertions across 7 suites, Typecheck PASS, HTTP 200)`
* **Lead Agent:** Google Antigravity
* **Target Build:** **BUILD 118** (`versionCode = 118`, `versionName = "5.0.18"`)
* [x] **TODO-B118-48 (Four Foundations Domain-Aware Architecture):** Mengintegrasikan secara mendalam 4 lapisan temporal harian (Western Transit SwissEph, Weton Jawa, BaZi, Tzolkin Maya) dengan Cetak Biru Kanonikal (Destiny Matrix, Human Design, Life Path, Vedic) ke dalam narasi 8 domain tanpa pemaksaan (domain-aware distribution).
* [x] **TODO-B118-49 (Ten Gods / Shi Shen Classical Matrix):** Mengimplementasikan mesin matematis 10 relasi Ten Gods (`computeBaziTenGod`) berbasis interaksi lima elemen & polaritas antara Day Master natal dan Heavenly Stem pilar harian: Friend (*Bi Jian*), Rob Wealth (*Jie Cai*), Eating God (*Shi Shen*), Hurting Officer (*Shang Guan*), Indirect Wealth (*Pian Cai*), Direct Wealth (*Zheng Cai*), Seven Killings (*Qi Sha*), Direct Officer (*Zheng Guan*), Indirect Resource (*Pian Yin*), Direct Resource (*Zheng Yin*), memandu domain Pikiran, Ekonomi, dan Arah Hidup.
* [x] **TODO-B118-50 (Explicit Day Ren Indicator Guard):** Menjaga deteksi Day Ren (壬, Air Yang) berlaku HANYA pada hari di mana pilar harian memiliki Heavenly Stem Ren (seperti 26 Oktober 2026 Ren Shen). Pada non-Ren day (seperti 28 Oktober 2026 Jia Xu), `isDayRen: false`, `dayRenNote: undefined`, dan energi pilar Jia Kayu Yang dipaparkan sesuai karakternya.
* [x] **TODO-B118-51 (Weton Jawa Classical Dictionaries Integration):** Mengintegrasikan kamus otentik Weton Jawa (`DAY_INTERPRETATIONS`, `PASARAN_INTERPRETATIONS`, `NEPTU_INTERPRETATIONS`, `WUKU_DATA`) mencakup watak hari, kekuatan, tantangan, dan pola rezeki/relasi pasaran. Mempertahankan isolasi ketat antara weton kelahiran (natal) dan weton harian (transit).
* [x] **TODO-B118-52 (Tzolkin Maya Cycle Integration):** Mengintegrasikan kalkulasi otentik Tzolkin Maya harian mencakup Kin, Solar Seal (keyword, gift, challenge, purpose), Galactic Tone (function, gift, lesson), dan Wavespell 13 hari ke dalam domain Makna Batin, Kabar Hari Ini, dan Peluang yang Terbuka.
* [x] **TODO-B118-53 (Continuous Signed Angular Root-Finding):** Memperbaiki deteksi kulminasi transit pada `dailyTransitCalculator.ts` menggunakan fungsi sudut bertanda berkelanjutan (`signedDiff`) sehingga transisi nol derajat pada konjungsi (0°), oposisi (180°), dan seluruh aspek mayor dapat terdeteksi akurat hingga sub-menit ('sekitar HH:mm WIB').
* [x] **TODO-B118-54 (Foundations Drawer Deep Transparency):** Menghadirkan 3 hingga 6 entri teknis terstruktur per domain pada drawer `<details>` "Dasar Pembacaan", memaparkan derajat orb transit, rumah Placidus, Weton, BaZi, Tzolkin, dan Cetak Biru Kanonikal secara transparan kepada pengguna.
* [x] **TODO-B118-55 (Comprehensive Test Suite & Quality Gate):** Memperluas `tests/unit/build118-daily-guidance.test.ts` menjadi 389 automated checks mencakup 16 Sections pengujian ketat. Total 856 assertions lulus di 7 test suites tanpa kegagalan; `npx tsc --noEmit` 0 errors; HTTP 200 OK localhost:3000/profile.
* [x] **TODO-B118-56 (Dual-Fixture Synthesis Output Capture):** Mengeksekusi script `scripts/capture-daily-guidance-outputs.ts` menghasilkan output aktual lengkap tersimpan di `scratch/build118-daily-guidance-parity-outputs.json`. Release tetap dibatasi (STOP AND WAIT FOR FOUNDER REVIEW).

---

## 5. BUILD 119 — BLUEPRINT SPRINT PROGRAM: BP02 DESTINY MATRIX (SCOPE-LOCKED)

> **Scope-lock Founder (31 Okt 2026):** Pekerjaan & dokumentasi fokus **eksklusif BP02 — Destiny Matrix**. Status resmi BP01 dan Blueprint lain TIDAK diubah; hanya dependency yang relevan dicatat. **Build 119 status: `IN PROGRESS — NOT PRODUCTION READY`.** Build 118 (`versionCode = 118`, `versionName = "5.0.18"`, HEAD `41e89d8d`) tetap baseline rilis; tidak dipromosikan. Tanpa commit/push/deploy/migration. Status skema: PLANNED, IN PROGRESS, BLOCKED, PASS LOCAL, ACCEPTED, FROZEN, CLOSED.

### 5.1 BP02 — Status Aktual

| Sprint BP02 | Status | Tests / Evidence (aktual, exit code) | Catatan |
|---|---|---|---|
| **BP02-A / A1 — Complete Audit & Gap Analysis** | **COMPLETE — READY WITH FOUNDER DECISIONS** | `scripts/acceptDestinyMatrixV1.ts` 74/74 PASS exit 0; R5 validator PASS; annual/ancestral/health PASS; `npm run check:matrix` exit 1 (stale — didokumentasikan, TIDAK diperbaiki); `scripts/validateBhumiMatrixV1.ts` exit 1 (stale — didokumentasikan) | Laporan: `BUILD119_OPENCODE_BP02_A_DESTINY_MATRIX_COMPLETE_AUDIT_REPORT.md`; 4 keputusan Founder D-02-1..D-02-4 pending keputusan lanjutan |
| **BP02-B — Content Architecture (22 Arcana × Posisi)** | **IN PROGRESS — PROPOSAL, MENUNGGU FOUNDER REVIEW** | Engine canonical read-only exit 0 (fixture-dump / annual / dict drivers di Temp\opencode); engine frozen; 0 mutasi source | Laporan: `BUILD119_OPENCODE_BP02_B_DESTINY_MATRIX_CONTENT_ARCHITECTURE_REPORT.md`; keputusan arsitektur D-B-1..D-B-8 pending Founder |
| **BP02-C / C1 / C2 — UI/UX & Editorial Proposal** | **IN PROGRESS — PROPOSAL, MENUNGGU FOUNDER REVIEW** | Proposal desain UI/UX 10 bab + diagram interaktif + Health Card Option A + states isolasi UID; nol implementasi source | Laporan: `BUILD119_OPENCODE_BP02_C_PREMIUM_DESTINY_MATRIX_UI_UX_PROPOSAL.md`; realisasi gate BP02-D1..D6 (izin per sprint) |
| **BP02-D1 — Data Integrity & Ownership** | **PLANNED / NOT STARTED** | belum ada | Termasuk user data isolation khusus Destiny Matrix (§25 PRM) |
| **BP02-D2 — Contract & Calculation Verification** | **PLANNED / NOT STARTED** | belum ada | Engine frozen sepanjang sprint |
| **BP02-D3 — Arcana & Channel Editorial Corpus** | **PLANNED / NOT STARTED** | belum ada | Korpus `BHUMI_EDITORIAL_DEVELOPMENT-v1` (D-B-1) |
| **BP02-D4 / D4.1 — Cross-Position Synthesis & Editorial Polish** | **PLANNED / NOT STARTED** | belum ada | — |
| **BP02-D5 — Premium Destiny Matrix UI/UX** | **PLANNED / NOT STARTED** | belum ada | Tanpa "Keterangan selengkapnya" pada pembacaan wajib |
| **BP02-D6 — Final QA & Acceptance** | **PLANNED / NOT STARTED** | belum ada | — |
| **BP02-E — Founder Acceptance, Freeze & Closure** | **PLANNED / NOT STARTED** | belum ada | Founder Gate — tanpa persetujuan Founder tidak ada FROZEN/CLOSED |

**Scope & larangan (dari Founder):** BP01 (termasuk D6 yang masih berjalan — workstream terpisah, **tidak ditutup, tidak diubah statusnya**), BP03 Human Design, BP04–BP11, Dashboard & guidance system, shared calculators/engines/translators lintas sistem, Firebase Auth/Firestore Rules/schema/billing/Premium, komponen global & konfigurasi aplikasi — **dilarang diubah**. Jika perbaikan BP02 membutuhkan perubahan shared code → laporkan dependency & blast radius dulu; tidak ada perubahan lintas sistem otomatis.

**Technical Debt & keputusan formula terbuka (didokumentasikan):** D-02-1 (ADR-DASH-05 validator drift), D-02-2 (legacy chartHeart mismatch — "BLOCKED BY FORMULA AMBIGUITY"), D-B-1..D-B-7 (pending approval per item); D-B-8 **RESOLVED — Option A** (Health Card angka canonical engine, ADR-DM-04), stale checkpoints `check:matrix` / `validateBhumiMatrixV1`.

### 5.2 Backlog BP02 (Master Directive)

* [x] **BP02-A / A1** — Audit & Gap Analysis (COMPLETE — READY WITH FOUNDER DECISIONS)
* [~] **BP02-B** — Content Architecture (IN PROGRESS — menunggu Founder Review)
* [ ] **BP02-C / C1 / C2** — UI/UX & Editorial Proposal (IN PROGRESS — proposal ditulis, menunggu Founder Review; D-B-8 Option A tercatat ADR-DM-04)
* [ ] **BP02-D1** — Data Integrity & Ownership (PLANNED / NOT STARTED)
* [ ] **BP02-D2** — Contract & Calculation Verification (PLANNED / NOT STARTED)
* [ ] **BP02-D3** — Arcana & Channel Editorial Corpus (PLANNED / NOT STARTED)
* [ ] **BP02-D4 / D4.1** — Cross-Position Synthesis & Editorial Polish (PLANNED / NOT STARTED)
* [ ] **BP02-D5** — Premium Destiny Matrix UI/UX (PLANNED / NOT STARTED)
* [ ] **BP02-D6** — Final QA & Acceptance (PLANNED / NOT STARTED)
* [ ] **BP02-E** — Founder Acceptance, Freeze & Closure (PLANNED / NOT STARTED)

### 5.3 Kebijakan Permanent Continuous Governance (Build 119 → 120+)

Wajib untuk **seluruh 11 Blueprint** pada setiap sprint (1) Preflight read; (2) Implementation dengan scope-lock; (3) Verification dengan evidence exit-code aktual; (4) Documentation Sync (SOT Index, Master TODO, PRM, Sprint Register, Decision Log, Risk Register, Evidence Register, Handover Log, Patch Manifest); (5) Traceability `Requirement ID → Sprint → Source Change → Test Evidence → Founder Decision → Final Status`; (6) Status Control (PLANNED/IN PROGRESS/BLOCKED/PASS LOCAL/ACCEPTED/FROZEN/CLOSED); (7) **Founder Gate** — tanpa persetujuan Founder tidak ada FROZEN/CLOSED, promosi build, commit/push/deploy.

**User Data Isolation & Personalization (PERMANEN, saat ini bersifat BP02-scope sesuai scope-lock):** setiap hasil Destiny Matrix wajib berasal dari input valid pengguna aktif; tidak ada pembacaan milik pengguna lain; diuji dengan dua UID berbeda (tanggal lahir sama/berbeda), logout, account switching, stale data, dan request race. Seluruh isu wajib lolos acceptance sebelum BP02 FROZEN/CLOSED. Rincian: `docs/requirements/PROJECT_REQUIREMENTS_MATRIX.md` §25.

### 5.4 Persiapan Readiness Build 120

Saat Build 120 dimulai: susun **`BUILD119_TO_BUILD120_READINESS_AND_GAP_REPORT.md`** — baseline terakhir yang disetujui; status 11 Blueprint; fitur frozen & closed; open bugs; technical debt; unresolved decisions; pending enhancements; regression baseline; rekomendasi prioritas Build 120. Pembaruan governance bersifat inkremental per sprint (tidak menunggu Build 119 selesai).

### 2026-11-03 — Release 119/120 profile integrity roadmap addendum

- [ ] Release 119 blocker: establish an authorized, authoritative shared birth-profile freshness contract and truthful server persistence acknowledgment; same-account stale completion and resolved-false save helper are reproduced only in synthetic tests.
- [ ] Founder review of `BUILD126_SHARED_PROFILE_AUTHORITATIVE_REVISION_AND_PERSISTENCE_ACK_DESIGN.md`; preferred persisted server revision is PROPOSED, schema necessity remains UNVERIFIED, implementation not authorized.
- [ ] Resolve BP10 P0/P1, obtain Founder local-freeze approval, then run consolidated Blueprint, minimum security and Android readiness gates. No production access, Git writes, build or Play action is authorized by this entry.
- [ ] Release 120, after Release 119 completion: broader Security & Authorization, shared profile delegation, Founder/Admin, Firestore Rules closure, communications, Arsip and Billing/Entitlement. Release-critical minimum security remains a Release 119 gate.


### 2026-11-03 — Profile revision final design gate

- [ ] Founder review of NEW_SERVER_REVISION recommendation and explicit authorization for separate schema, trusted server, Rules, compatibility, migration and implementation.
- [ ] Verify all released client write paths, true old-client update/read-only behavior, authoritative profile deletion and receipt lifecycle; legacy migration and minimum security remain BLOCKED.
- [ ] Close BP10 freshness before Founder freeze and Release 119 readiness; broader Security/Authorization and Billing remain Release 120 after actual Release 119 completion. No build, production access or Git write is authorized by this entry.
- Evidence: `BUILD126_PROFILE_REVISION_FINAL_IMPLEMENTATION_SECURITY_AND_LEGACY_DESIGN.md`.


### 2026-11-03 — Profile revision local implementation blocked

- [ ] Establish the trusted server host/token/owner/IAM and Android static-export routing; finish known-writer/alias and legacy-client compatibility verification.
- [ ] Design/test truthful rejected/offline write behavior in older binaries before Rules fence; current synthetic emulator permits owner unversioned birth writes and arbitrary revision-like fields.
- [ ] Only after the Phase A gate, implement approved canonical revision/receipt, client acknowledgment, Rules candidate and emulator regressions. No schema, endpoint or candidate was implemented by this task.
- [ ] BP10 freeze and Release 119 remain blocked; full Security & Authorization/Billing remain Release 120 after Release 119, with minimum safety still mandatory for Release 119.
- Evidence: `BUILD126_PROFILE_REVISION_SERVER_CONTRACT_LOCAL_IMPLEMENTATION_REPORT.md`.


### 2026-11-03 — Build 126 current baseline and profile boundary

[ ] Release 119 roadmap / known issue: close candidate Rules bypasses, reconcile integrated canonical state and truthful receipts, verify legacy Android, rerun emulator and BP10 Chromium gates. Current baseline accepted; isolated prototype is not application integration. See BUILD126_RELEASE119_CURRENT_BASELINE_AND_PROFILE_IMPLEMENTATION_REPORT.md.


### 2026-11-03 — Build 126 profile security closure

[ ] Release 119 roadmap / known issue: provide and test a trusted Blueprint input writer before restricting legacy writes; complete server initialization/receipt and Rules bypass/negative-control suite before shared freshness integration. BP10 remains unresolved. See BUILD126_RELEASE119_PROFILE_SECURITY_CLOSURE_AND_BP10_INTEGRATION_REPORT.md.


### 2026-11-03 — Build 126 Blueprint writer prototype

[ ] Release 119 roadmap / known issue: migrate Blueprint writers and consumers safely, secure computed outputs and provenance, close profile initialization and receipt gates, then re-run full Phase A. The local input-only prototype is not an integrated writer. See BUILD126_RELEASE119_TRUSTED_BLUEPRINT_WRITER_AND_PROFILE_CONTRACT_CLOSURE_REPORT.md.


### 2026-11-03 — Build 126 Phase A security integration

[ ] Release 119 roadmap / known issue: restore a trustworthy Blueprint computation/persistence path, resolve missing Functions entrypoint modules, repair legacy initialization and receipt behavior, and finish Phase A before shared profile/BP10 integration. See BUILD126_RELEASE119_PHASE_A_FINAL_SECURITY_AND_BP10_INTEGRATION_REPORT.md.


### 2026-11-03 — Build 126 Functions integration recovery

[ ] Release 119 roadmap / known issue: recover verified Functions welcomeMessage, birthdayScheduler and broadcastEmail sources; verify existing exports, then integrate and test the canonical callable and legitimate Blueprint contract before Phase B. See BUILD126_RELEASE119_FUNCTIONS_BLUEPRINT_WRITER_AND_PROFILE_INTEGRATION_CLOSURE_REPORT.md.


### 2026-11-03 — Build 126 local Functions continuation

[ ] Release 119 roadmap / known issue: recover verified missing Functions modules and finish legacy alias/data preservation, callable receipt/client retry, trusted Blueprint writer and integrated consumers before shared freshness or BP10 freeze. Local emulator success is not production evidence. See BUILD126_RELEASE119_FUNCTIONS_RECOVERY_AND_TRUSTED_PROFILE_CONTINUATION_REPORT.md.


### 2026-11-03 — Build 126 profile alias integration gate

[ ] Release 119 roadmap / known issue: close full alias/timeout/receipt handling and actual Blueprint writer/consumer security before shared freshness and BP10 integration; recover main Functions modules and verify legacy Android separately. See BUILD126_RELEASE119_LOCAL_PROFILE_BLUEPRINT_AND_BP10_INTEGRATION_REPORT.md.


### 2026-11-03 — Build 126 profile and Blueprint integration gates

[ ] Release 119 roadmap / known issue: validate real timeout recovery and persistent idempotency identity, complete profile security/Rules gates, integrate a secure Blueprint writer and actual consumer, and only then close BP10 freshness. See BUILD126_RELEASE119_CANONICAL_PROFILE_BP10_AND_BLUEPRINT_E2E_CLOSURE_REPORT.md.


### 2026-11-03 — Build 126 application save integration

[ ] Release 119 roadmap / known issue: complete pending save recovery across tab closure and revision changes, Blueprint writer/consumer, authoritative shared state and integrated BP10 race; investigate four failing Build 115 tests. Main Functions and Android remain separate release blockers. See BUILD126_RELEASE119_ACTUAL_APPLICATION_INTEGRATION_REPORT.md.


### 2026-11-03 — Build 126 shared profile and HD triage

[ ] Release 119 roadmap / known issue: establish authoritative server/cache provenance and full Settings-to-receipt-to-BP10 browser flow; resolve four Build 115 fixture/contract mismatches without weakening authentication; secure Blueprint writer. See BUILD126_RELEASE119_SHARED_PROFILE_BP10_AND_HD_REGRESSION_CLOSURE_REPORT.md.


### 2026-11-03 — Build 126 Settings provider integration

[ ] Release 119 roadmap / known issue: review a safe combined-emulator QA runtime configuration without bypassing guards, then run the real Settings-to-receipt-to-provider-to-BP10 sequence. Complete Blueprint writer, HD fixture/contract decisions and legacy Android gates. See BUILD126_RELEASE119_SETTINGS_AUTHPROVIDER_BP10_INTEGRATED_E2E_REPORT.md.


### 2026-11-03 — Build 126 QA runtime and HD token evidence

[ ] Release 119 roadmap / known issue: obtain Founder decision on a narrowly scoped fail-closed test-only execution contract compatible with the deliberate QA runtime guard; complete authenticated HD fixtures and writer/normalizer contract reconciliation, then run actual BP10 E2E. See BUILD126_RELEASE119_QA_RUNTIME_AND_BP10_TRUE_E2E_CLOSURE_REPORT.md.


### 2026-11-03 — Build 126 OpenCode QA reconciliation

[ ] Release 119 roadmap / known issue: review a production-isolated QA build identity and fully bound emulator execution before enabling qaOnly; current candidate is quarantined. Complete integrated BP10, Blueprint and other release gates. See BUILD126_OPENCODE_QA_GUARD_RECONCILIATION_REPORT.md.


### 2026-11-03 — Build 126 QA build isolation execution gate

QA-only runtime and BP10 integrated E2E remain blocked: independently verified build identity and production artifact isolation are absent. Guard 568/538, standalone helper 42 and BP10 math 6,948/1,444 passed locally; the old freshness probe failed against the current fail-closed save contract. See BUILD126_RELEASE119_QA_BUILD_ISOLATION_AND_TRUE_BP10_E2E_REPORT.md. No feature freeze or release approval.


### 2026-11-03 — Build 126 freshness probe reconciliation

The old helper probe now verifies explicit failure and no subsequent Blueprint callback on rejected profile persistence: 10 checks passed. Actual isolated QA harness and BP10 integrated E2E remain blocked and unimplemented; no freeze recommendation. See BUILD126_RELEASE119_QA_HARNESS_EXECUTION_AND_BP10_E2E_ACCEPTANCE_REPORT.md.


### 2026-11-03 — Build 126 isolated QA login smoke

A dedicated local Next target started against three synthetic loopback emulators; actual login and Auth Emulator smoke passed (3 checks). Production artifact isolation and the full QA security contract remain blocked; BP10 E2E was not run. See BUILD126_RELEASE119_QA_HARNESS_IMPLEMENTATION_RESULT.md.


### 2026-11-03 — Build 126 QA security acceptance

Candidate Rules passed 13 scoped authenticated emulator checks and the actual login smoke passed. Process identity remains blocked on independent lineage and complete fallback evidence; production artifact isolation remains blocked because the isolated release build fails TypeScript. BP10 E2E not run. See BUILD126_RELEASE119_QA_SECURITY_ACCEPTANCE_AND_BP10_E2E_REPORT.md.


### 2026-11-03 — Build 126 owned QA stack and TypeScript progress

Owned local emulator stack, app-scope loopback and login smoke executed; continuous listener ownership and comprehensive browser egress isolation remain blocked, so BP10 E2E was not run. TypeScript improved from 18 to two Human Design status-contract diagnostics; repository TSC remains FAIL. See BUILD126_RELEASE119_QA_UNBLOCK_AND_BP10_INTEGRATED_EXECUTION_REPORT.md.


### 2026-11-03 — Build 126 launcher and browser boundary

Launcher IPC challenge, parent checks and periodic process/listener monitoring were exercised; owned Firestore termination closed the QA session. Chromium WebRTC bypassed HTTP interception; added browser defense-in-depth did not establish OS egress isolation. Local BP10 E2E remains blocked. Two protected Human Design status-contract TypeScript diagnostics remain. See BUILD126_RELEASE119_QA_SECURITY_AND_BP10_E2E_FINAL_CLOSURE_REPORT.md.


### 2026-11-03 — Build 126 offline namespace capability

A disposable WSL network namespace passed loopback and external TCP/UDP/DNS denial checks, but the actual app/emulators/Chromium were not run inside it and sandbox acceptance remains blocked. Two Human Design calculationStatus diagnostics remain unresolved; a separate existing live normalizer test failed. See BUILD126_RELEASE119_OFFLINE_QA_AND_BP10_E2E_REPORT.md.
# Release 119 Functions main local recovery

- [x] Load actual main entrypoint and exercise scoped canonical authentication, revision, receipt and candidate Rules in local emulator (10 checks, exit 0).
- [ ] Verify restored historical privileged and scheduled functions, production provenance, and remaining release gates before release; no deployment is authorized.
# Build 126R3 admin follow-up

- [x] Verify broadcast token revocation and bounded payload locally with synthetic emulator and fake-provider tests.
- [ ] Complete claim-authorized list/search, communications, analytics and entitlement integration; verify expired tokens and authenticated browser behavior before release.
# R3 continuation — admin reply

- [x] Move the scoped admin inbox reply to a non-revoked claim-authorized callable and verify locally with synthetic emulator data.
- [ ] Complete secure inbox listing, user list/search, analytics and entitlement boundaries; verify the integrated browser journey.
# R3 targeted entitlement blocker

- [ ] Replace profile-role/badge premium decisions with validated claim or server-grant inputs while preserving legitimate legacy and billing access; two synthetic negative assertions currently fail.
- [x] Verify candidate Rules reject protected entitlement changes and direct privileged collection reads locally (29 authorization groups; exit 0).
