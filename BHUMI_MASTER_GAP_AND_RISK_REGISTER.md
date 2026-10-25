# BHUMI AMARTYA — MASTER GAP AND RISK REGISTER
**Document ID:** `RISK-REG-001`  
**Baseline Git Branch:** `hotfix/build110-indonesian-only`  
**Baseline HEAD:** `e63f334cf0ac20cc076bc88e98e3e06808b024f3`  
**Status:** ACTIVE LIVE REGISTER (inventory capture only; zero source mutation)  
**Last Updated:** 23 October 2026  

## Founder Play baseline / closeout risk update (2026-10-24)

Current **Founder-provided Play baseline: versionCode 115, versionName 5.0.15**; local `android/app/build.gradle:10-11` defaults **115 / "5.0.15" EXACTLY MATCH**. This is not independent Play Console verification. Highest-ever used code across **internal/closed/open/production**, including inactive uploads, remains UNKNOWN; **116 is not automatically safe**. Verify complete historical maximum before selecting a strictly greater next production code. **No release version bump now**.

RSK-01/08 remain OPEN / PROTECTED: audited branch `hotfix/build110-indonesian-only`, HEAD `e63f334cf0ac20cc076bc88e98e3e06808b024f3`, 72 tracked modified, 130 collapsed untracked entries / 216 recursive files, zero staged. Expected dirty baseline explicitly authorized for documentation review; preserve all existing changes. Mandatory exact inventory, exclusions and eight-step Git/GitHub closeout plan: `BHUMI_REMAINING_WORK_EXECUTION_PLAN.md`. No staging/commit/push now; security review is a fail-closed staging gate, not a claim all untracked files are safe.

RCV-42/43 release evidence remains gated; RSK-22/23 and all existing requirement/risk statuses and totals remain unchanged. Next: Founder review of closeout plan and authoritative all-track Play history. No upload/publish/build/device or destructive Git action authorized.

## 1. Risk Register — All IDs Mapped (P0 / P1 / P2)

| ID | Category | Severity | Status | Description | Evidence / Reference | Owner | Blocking Type |
|---|---|---|---|---|---|---|---|
| RSK-01 | Repository & Environment Integrity | P0 (CRITICAL) | OPEN / PROTECTED | 108 file modified & untracked; git clean/reset/stash prohibited without Founder | PATCH_MANIFEST.json (108 entri); tracked hash baseline | — | Hard block on git mutation |
| RSK-02 | Production Verification Void | P0 (CRITICAL) | OPEN / BLOCKED | No verifikasi engine produksi identik dengan hasil uji lokal | — | Production gate locked |
| RSK-03 | Billing Entitlement Integrity | P0 (CRITICAL - MITIGATED) | MITIGATED & VERIFIED | Expired token overwrite active subscription (fixed BILL-01) | BILL01-06 PASS; isStaleOlderToken invariant | — | Mitigated |
| RSK-04 | Android Physical Device Execution Gap | P1 (MEDIUM) | OPEN / GATE NOT VERIFIED | Fisik device Android API 36 Google Play internal track belum diuji | RSK-23 evidence | — | Gated on QA config |
| RSK-05 | Multi-Source Entitlement Precedence | P1 (RESOLVED) | RESOLVED & VERIFIED | Dual-display: commercialStatus + communityBadge (BILL-04) | UI-10 test PASS; bill04-ui-acceptance | — | Closed |
| RSK-05a | Google Play Live In-App Billing | P1 (DEPENDENT) | OPEN / GATE NOT VERIFIED | Native BhumiBillingPlugin reqs live Google Play API sandbox + tester license | — | Gated on BILL-05B |
| RSK-06 | Older Voided Purchase Token | P0 (MITIGATED) | MITIGATED & VERIFIED | isStaleOlderToken fixed; token lampau tidak mendowngrade subscription | BILL02-02 PASS | — | Closed |
| RSK-07 | Last-Token-Wins activeTokenHash | P1 (DATA INTEGRITY - MITIGATED) | MITIGATED & VERIFIED | activeTokenHash seleksi dengan existingProvidesLaterExpiry | BILL03A B01 PASS | — | Closed |
| RSK-08 | Uncommitted Working Tree Drift | P0 (CRITICAL) | OPEN / PROTECTED | Dilarang keras git checkout/clean/reset/pull/rebase/commit tanpa otorisasi Founder | 53 modified, 38 untracked files | — | Hard block |
| RSK-09 | FNV-1a 32-bit Hash Space | P2 (LOW / MONITORED) | AUDITED / ACCEPTABLE TECHNICAL DEBIT | Probabilitas tabrakan < 1.2×10⁻⁶ untuk 100 perubahan per user | — | Monitored only |
| RSK-10 | Production Telemetry Audit | P1 (HIGH) | NOT VERIFIED | No telemetri live dari Cloud Firestore produksi | — | Requires founder credential access |
| RSK-11 | Legacy Admin Route Artifacts | P2 (LOW) | SCHEDULED FOR DECOMMISSION | `/app/admin/**` masih di working tree meskipun Founder Dashboard dipisah | — | Deferred; no code mutation |
| RSK-12 | FNV-1a 32-bit Hash Space (duplicate) | P2 (LOW) | — | — | — | — | — |
| RSK-13 | FNV-1a 32-bit Hash Space (duplicate) | P2 (LOW) | — | — | — | — | — |
| RSK-14 | Android Physical Device Execution Gap | P1 (MEDIUM) | OPEN / GATE NOT VERIFIED | Fisik device Android API 36 Google Play internal track belum diuji | — | Gated on QA config |
| RSK-15 | Multi-Source Entitlement Precedence | P1 (RESOLVED) | RESOLVED & VERIFIED | BILL-04 dual-display representation | bill04-ui-acceptance test PASS | — | Closed |
| RSK-16 | Older Voided Purchase Token Downgrade | P0 (MITIGATED) | MITIGATED & VERIFIED | isStaleOlderToken fixed; token voided/refunded lampau tidak memblokir langganan aktif | BILL03A A01-A08 PASS | — | Closed |
| RSK-17 | Google Play Live In-App Billing Bridge | P1 (DEPENDENT) | OPEN / GATE NOT VERIFIED | Native plugin runtime verifikasi memerlukan Google Play API sandbox | — | Gated on BILL-05B |
| RSK-18 | Multi-Token Active Registry | P1 (RESOLVED) | CLOSED LOCAL / PRODUCTION RECONCILE MONITORED | MT-18 resolved: read-before-write invariant; 191/191 full billing regression PASS | bill03b1-fallback-safety test | — | Closed |
| RSK-19 | Dateless Refund Token Bug | P0 (CRITICAL - MITIGATED) | MITIGATED & VERIFIED | isAuthoritativeActiveToken introduced; !isAuthoritativeActiveToken false | bill03a-critical-integrity A01-A08 PASS | — | Closed |
| RSK-20 | Last-Token-Wins activeTokenHash | P1 (DATA INTEGRITY - MITIGATED) | MITIGATED & VERIFIED | activeTokenHash memilih masa aktif terlama (anti last-token-wins) | BILL03A B01-B06 PASS | — | Closed |
| RSK-21 | Browser UI Verification vs Physical Android | P1 (PLATFORM SCOPE) | MITIGATED & MONITORED | 25 skenario browser PASS LOCAL; native/device boundary retained | bill04a-browser-acceptance 25/25 PASS | — | Browser gate closed / native retained |
| RSK-22 | Next.js Static Export vs HTTP 410 | P1 (CROSS-WORKSTREAM) | ADDRESSED / ISOLATED | Staging export resolves via disposable tree; `app/api/**` excluded from mobile bundle | PLATFORM-02C; BILL-05A.4 evidence | — | Resolved via staging architecture |
| RSK-23 | Android Debug `.qa` Mismatch | P1 (BUILD TOOLCHAIN) | OPEN / IDENTIFIED & DOCUMENTED | `applicationIdSuffix ".qa"` tidak memiliki client di google-services.json | BILL-05A.4 ANDROID QA BUILD ACCEPTANCE REPORT | Founder | Requires Founder QA config |
| RSK-24+ | (Reserved for future) | — | — | — | — | — | — |

## 2. Gap Register — Missing / Deferred Items (DS-* Register)

| DS-ID | Associated Requirement | Why Deferred | Owner / Verification Step | Status |
|---|---|---|---|---|
| DS-J1 | R-PRD-12/13/16 (journaling UI) | Waiting DS-J2/3 completion | journaling/UI sub-step + DS-M1 dependency | OPEN |
| DS-J2 | R-PRD-15/16/19/25/12 (UI wiring, upsertFromEntry call site) | DS-J1 dependency | UI behaviour wiring + `upsertFromEntry` call site | OPEN |
| DS-J3 | R-PRD-12/13/15/16/19 (full acceptance rows + journaling E2E) | DS-J1/DS-J2 dependency | journaling E2E acceptance + browser check | OPEN |
| DS-J4 | R-PRD-18 (mood trend, no-streak) | Step 11 de-streaked engine + browser check | `progressCalculationEngine` de-streak + `lib/insights/createInsightProgress.ts` | PARTIAL (Step 12 cont.) — unit-verified; browser needs seeded data |
| DS-I1 | R-PRD-29..34 full UI localization | localization component-migration sprint | `useTranslation()` migration + 3-button switcher round-trip | OPEN |
| DS-I2 | R-PRD-29/30 extended (`v5-i18n.test.ts`) | Step 7 | 28/28 in manifest; DONE | DONE |
| DS-AI1 | R-PRD-31 (AI in user locale + attribution) | AI-output reconciliation sub-step | daily-guidance prompt locale/attribution contract + id/en/ms plumbing + native Bahasa Melayu | PARTIAL (Step 12 cont.) — emulator PASS; DS-AI1-themes body prose OPEN |
| DS-AI1-themes | R-PRD-31 deterministic-fallback completeness | i18n follow-up sprint (post browser pass) | Indonesian-only theme-label dictionaries + full `localDailyGuidanceFallback` ms (~70 sites) | OPEN (new — Step 11) |
| DS-2C1 | new-user gate Invariant E secondary path (`lib/firebase/service.ts` read-error swallow) | auth-hardening follow-up | read failure propagates; guard + state-machine "I" step updated; emulator PASS=23/23 | CLOSED (Step 11) |
| DS-2C2 | GATE_07, R-PRD-33/34 browser | verification | setup→dashboard, dashboard hard-reload, logout→login exercised in emulator-hydration; scripted Playwright regression + locale visible-copy round-trip needs DS-I1 | PARTIAL (Step 12) |
| DS-2C3 | GATE_07 residual trap (feature-page trigger) | auth-hardening follow-up | `isCompletedProfileForUser` helper; `app/setup/page.tsx` mount guard; `resolveActiveProfile` authoritative cold-context re-read | CLOSED (Step 12 cont., 2026-09-03) — Founder OPTION A adopted |
| DS-M1 | R-PRD-23 (Memory Dashboard UI), R-PRD-21 browser | Memory-Dashboard UI sub-step (DS-I1 first) | `memoryCandidateRepository.upsertFromEntry` has zero callers; dashboard UI + extraction call site land together post-Build 106 | OPEN |
| DS-M2 | R-PRD-03 Dashboard surfacing, Master SOT §5 | Founder reconciliation decision, then Daily Rhythm/Dashboard step | OPEN (decision) | OPEN |
| DS-M3 | R-PRD-28 | Daily Rhythm/Memory consumer work | PARTIAL (decay + eligibility done; synthesis/persistence/UI open) | PARTIAL |
| DS-DC1 | R-PRD-03 astro source typing | Step 6 | DONE | DONE |
| DS-A1 | R-PRD-36 consumer wiring | astro-integration sub-step | OPEN | OPEN |
| DS-A2 | R-PRD-35 large-cycle scope | Founder decision, then wire | OPEN (decision) | OPEN |
| DS-E1 | R-PRD-45 browser, R-PRD-44 rendered unavailable | verification | emulator-hydration browser: `/dashboard/environment` reachable, Schumann "Data belum tersedia" with no fabricated "Stabil" ⇒ R-PRD-44 honest-unavailable rendered PASS; remainder: fully-populated 3-layer render + provenance labels | PARTIAL (Step 12 cont.) |
| DS-R1 | R-PRD-01/02/04..10/14/17/28 consumer UI | consumer/UI work Steps 10–11; browser in Step 11 | OPEN | OPEN |
| DS-N1 | R-PRD-32 remote delivery | notification external/integration acceptance | OPEN (external/config + impl) | OPEN |
| DS-P1 | R-PRD-20 + privacy/deletion acceptance | privacy consumer + account-deletion hardening, before Step 11 | OPEN | OPEN |

## 3. Historical reconciliation — SUPERSEDED by finite recovery below

Seluruh baris RSK/DS di atas dipertahankan sebagai catatan dengan scope bukti asal. Judul lama “All IDs Mapped” tidak membuktikan coverage produk. Ringkasan lama 42 RSK / 33 DS dan gabungan OPEN/PARTIAL/CLOSED/DONE disupersede karena tidak sesuai tabel. Status resolved/closed historis bukan acceptance baru atau closure produksi.

| Inventaris aktual | Jumlah | Aturan hitung |
|---|---|---|
| Baris RSK termasuk reserved | 25 | RSK-01..23, RSK-05a, RSK-24+ |
| ID RSK konkret termasuk alias | 24 | Reserved RSK-24+ dikecualikan; bukan 24 risiko semantik unik |
| Reserved | 1 | RSK-24+ bukan risiko aktif |
| ID DS konkret | 21 | Header DS-ID dikecualikan |
| DS OPEN | 12 | Status awalan OPEN |
| DS PARTIAL | 5 | Status awalan PARTIAL |
| DS DONE | 2 | DS-I2, DS-DC1 |
| DS CLOSED | 2 | DS-2C1, DS-2C3; scope historis saja |

### Distribusi label RSK konkret (bukan de-duplikasi semantik)

| Label status tersimpan | Jumlah |
|---|---|
| OPEN / PROTECTED | 2 |
| OPEN / BLOCKED | 1 |
| MITIGATED & VERIFIED | 6 |
| OPEN / GATE NOT VERIFIED | 4 |
| RESOLVED & VERIFIED | 2 |
| AUDITED / ACCEPTABLE TECHNICAL DEBIT | 1 |
| NOT VERIFIED | 1 |
| SCHEDULED FOR DECOMMISSION | 1 |
| — | 2 |
| CLOSED LOCAL / PRODUCTION RECONCILE MONITORED | 1 |
| MITIGATED & MONITORED | 1 |
| ADDRESSED / ISOLATED | 1 |
| OPEN / IDENTIFIED & DOCUMENTED | 1 |
| Total konkret | 24 |

RSK-12/13 tetap alias berlabel duplicate tanpa status; tidak dinyatakan closed. Kemiripan RSK-04/14, 05/15, 05a/17, 06/16, 07/20 tidak membuktikan closure atau penggabungan semantik. Semua ID, aliases dan DS gaps tetap dipertahankan.

### Overlay bukti terkini dan pekerjaan tersisa

- **Finite recovery COMPLETE; historical coverage UNKNOWN:** **HISTORICAL LEDGER NOT RECOVERABLE FROM AVAILABLE EVIDENCE.** Actual recovery inventory **44** scoped requirements (RCV-01..RCV-44), not 84/22. Counts: **21 SYNTHETIC PASS — RUNTIME PENDING; 7 IMPLEMENTED — NOT VERIFIED; 7 BLOCKED; 8 EVIDENCE MISSING; 1 IN PROGRESS; 0 VERIFIED COMPLETE; 0 NOT STARTED; 0 NOT APPLICABLE**. No 80 missing IDs. Earliest observable combined claim is the pre-edit master snapshot, not proven chronological origin; finite search/provenance and original-ID crosswalk are in checklist sections A–D. Old Item 1→RCV-21, 2→RCV-22, 3→RCV-23, duplicate 5→3→RCV-23, 6→RCV-30 (export criteria RCV-24). The prior distribution totaling 100 is invalid. Next is authorized local QA-isolation preflight, not another recovery batch.
- **RSK-01/08:** angka 108 entri manifest dan 53/38 pada baris lama adalah snapshot historis, bukan keadaan sesi ini. Baseline kini 62 tracked modified, 105 untracked status entries, 0 staged; semua perubahan awal dilindungi. Hash sesi ini tidak membuktikan no-mutation historis sebelum baseline.
- **RSK-23:** QA isolation tetap OPEN. Butuh Founder untuk project QA terpisah, package `.qa`, client/debug SHA, auth provider, web SDK dan backend/rules QA yang selaras; tidak memakai workaround non-suffixed/produksi.
- **RSK-22 / AUTH-NEW-02:** export PLATFORM-02C lama bukan source auth terbaru. NEXT export harus menggunakan AUTH-NEW-02 terbaru yang disetujui, kemudian parity ulang; staging historis tidak menutup RSK-22 untuk export baru.
- **Native auth / DS-2C2:** AUTH-NEW-02 SYNTHETIC PASS, runtime NOT VERIFIED. Native Google Sign-In, first-login bootstrap/profile creation, onboarding, account switching dan recovery memerlukan acceptance QA terisolasi; DS-2C1/2C3 closed lokal tidak menutup native flow.
- **Compile / parity:** BILL-05A.4H COMPILE-ONLY APK PASS; Gradle 234 tasks = 110 executed + 124 up-to-date. ANDROID-APK-01 complete SHA256 parity PASS **808 file / 66 HTML / 9213286 byte**, missing/unexpected/changed 0; 202 adalah filtered count tidak valid untuk total aset. Sumber: BHUMI_BILL-05A.4H_ANDROID_APK_FINAL_ACCEPTANCE_REPORT.md (typo total disupersede) dan BHUMI_ANDROID_APK_01_ASSET_PARITY_REPORT.md; bukan runtime/release PASS.
- **RSK-04/14/21, RSK-05a/17:** native device dan billing runtime tetap terbuka; purchase/restore/cancel/expiry, token ownership dan UID isolation harus dibuktikan pada QA/Play test yang diotorisasi. NAT-01/NAT-04 memerlukan review bukti sebelum menyatakan perbaikan atau closure.
- **RSK-02/10/18, DS-P1:** production parity/telemetry, reconcile serta privacy/account deletion tetap membutuhkan bukti scoped dan izin eksplisit; lokal PASS bukan deploy atau produksi PASS.
- **DS lainnya:** journaling, Memory, localization/AI, environment provenance, astro, consumer UI dan remote notification tidak dihapus. Label lama termasuk locale scope perlu keputusan Founder/bukti terbaru sebelum dianggap kebutuhan aktif atau closed; DS-N1 bukan pengganti gate billing.

## 4. Finite recovery mapping overlay — authoritative for current scope

Original RSK rows 12–36 and DS rows 42–62 are preserved verbatim as historical evidence, including imperfect column structure and labels. Their stored statuses are not fresh acceptance. Counts remain **25 RSK rows = 24 concrete IDs including aliases + 1 reserved; 21 DS = 12 OPEN + 5 PARTIAL + 2 DONE + 2 CLOSED**. None is silently removed. The old title “All IDs Mapped” is historical, not proof of full coverage.

| Risk / gap IDs | Recovery mapping | Current acceptance / remaining action |
|---|---|---|
| RSK-01, RSK-08 | RCV-41 | P0 preserve dirty state; final non-target byte/path comparison; historical inventory counts obsolete |
| RSK-02 | RCV-28, RCV-42 | P0 production NOT VERIFIED; explicit production permissions and release gates, not a blocker to safe local QA |
| RSK-03, RSK-06, RSK-16 | RCV-10, RCV-15 | P0 old-token/refund protection historical local only; verify independent active rights and dateless cases |
| RSK-04, RSK-14 | RCV-21, RCV-22, RCV-27 | Same device-gap family, retain both legacy IDs; compile/browser not device PASS |
| RSK-05, RSK-15 | RCV-17 | Dual-display decision recorded at docs/tracking/RISK_REGISTER.md:75-81; local closure only |
| RSK-05a, RSK-17 | RCV-27 | P1 native billing/Play runtime pending authorization; no real purchase now |
| RSK-07, RSK-20 | RCV-15 | Same anti-last-token-wins family; preserve both IDs; local tests not production |
| RSK-09, RSK-12, RSK-13 | RCV-03 | RSK-12/13 explicit duplicate aliases; FNV debt monitored, not three independent requirements |
| RSK-10 | RCV-43 | P1 sanitized production telemetry unavailable; explicit read authorization required |
| RSK-11 | RCV-44 | Legacy evidence gap remains open; no new route audit or decommission authorization |
| RSK-18 | RCV-16, RCV-12 | Local transaction safety recorded; production registry/reconcile/scheduler NOT VERIFIED |
| RSK-19 | RCV-15 | P0 dateless authoritative refund local mitigation; current runtime acceptance pending |
| RSK-21 | RCV-17, RCV-27 | Browser-only historical 25 scenarios; native/Play boundary retained |
| RSK-22 | RCV-24 | Old staging addressed export only; latest AUTH-NEW-02 QA export and dependency/config acceptance pending |
| RSK-23 | RCV-25, RCV-22 | P0 isolation prerequisite/P1 native blocker; Founder separate QA project, OAuth, signer, web/backend/rules alignment |
| RSK-24+ | RESERVED | Not active, no requirement count, no false closure |
| DS-J1, DS-J2, DS-J3 | RCV-33 | Open journaling wiring/E2E; dependent steps counted once |
| DS-J4 | RCV-34 | Unit scope only; seeded no-streak browser acceptance remains |
| DS-I1, DS-I2, DS-AI1, DS-AI1-themes | RCV-32 | Legacy multilingual vs Indonesian-only provenance conflict; no automatic resurrection or false closure |
| DS-2C1, DS-2C2, DS-2C3 | RCV-26 | Local CLOSED/PARTIAL labels retained; read failure vs missing, pending bootstrap, retry/setup still need current acceptance |
| DS-M1, DS-M2 | RCV-35 | Memory consumer/dashboard decision and extraction evidence gap |
| DS-M3 | RCV-36 | Partial decay/eligibility; synthesis/persistence/UI remain |
| DS-DC1, DS-A1, DS-A2 | RCV-37 | Typing historically DONE; large-cycle decision/consumer wiring open |
| DS-E1 | RCV-38 | Honest-unavailable partial; populated layers/provenance labels remain |
| DS-R1 | RCV-39, RCV-36 | Remaining consumer criterion provenance unresolved; R-PRD-28 counted only RCV-36 |
| DS-N1 | RCV-40 | Remote notification delivery, not BILL-05B |
| DS-P1 | RCV-29 | P1 privacy/deletion current inventory, owner isolation, retention and failure recovery unverified |

Unmapped evidence is explicit: no assertion that all R-PRD historical rows were recovered; DS-R1 criteria and locale decision provenance remain EM rather than invented independent requirements. `docs/tracking/RISK_REGISTER.md:52,85` uses **RSK-16 twice for different old-token descriptions**; this is a source-ID collision, not proof of two new risks. This master retains its existing RSK-03/06/16 identities and maps the family without renumbering source history. RSK-04/14, 05/15, 05a/17, 07/20 are family overlaps rather than newly closed aliases.

Additional explicit current gaps (no invented RSK numbers): RCV-23 timestamp fallback has no explicit uncertainty flag despite acceptance wording; RCV-26 read errors may route as absent profiles; RCV-24 runner has production defaults and incomplete input binding; RCV-25 backend production project pin needs authorized adaptation. Sources: `BHUMI_AUTH_NATIVE_QA_01_PREPARATION_REPORT.md:15-21,49-57,77-84`. Privacy June trace does not close DS-P1 for current collections (`ACCOUNT_DELETION_QA_FINAL.md:21-42`).

P0: RCV-25/28/41 isolation and data/worktree protection, RCV-09/10/15/16/20 security acceptance. P1: RCV-22/23/24/26/27 auth/export/native billing, RCV-29 privacy, RCV-43 telemetry under separate production permission. Historical coverage UNKNOWN is not a blanket stop on independently safe local QA.

## QA-ISOLATION-PREFLIGHT-01 — current evidence overlay

[Preflight report](BHUMI_QA_ISOLATION_PREFLIGHT_01_REPORT.md): **PASS static inspection; runtime BLOCKED**. RSK-23 remains OPEN: native/Web Firebase locally target production; QA registration/provider/signing/backend/rules external state UNKNOWN. Installed native plugin uses generated default_web_client_id, not merely JS webClientId. Backend production pin, staging production defaults, copied production FCM worker and incomplete preventive network guards require separately authorized isolation adaptation (report sections 2–5). No new risk ID: these are existing RSK-23 isolation and RSK-22 export acceptance gaps.

RCV-25/22/24/28 remain BL; RCV-23/20/21 SP, RCV-26/30/31 IV, RCV-41 IP, RCV-27 BL. No runtime tests or status upgrades. Preserve all 25 RSK / 21 DS historical rows and all blockers. RSK-01/08 preservation is scoped to 2879 Git-listed non-target hashes, not ignored artifacts. DS-2C1/2C2/2C3 require absent/pending/read-error acceptance; old APK lacks latest AUTH-NEW-02. Aura API manifest label differs from WEB_ONLY decision while mobile EXCLUDE is intact; RCV-24/30 retain reconciliation action. Billing bridge has no demonstrated QA prevention gate; no billing operation authorized.

Next: **QA-BACKEND-AUTH-DB-CONFIG-01**, RCV-25/20/28/41 and RSK-23; approve narrow QA Auth/backend/database/rules/deny-boundary scope, then Android OAuth identity, fresh export and separately authorized APK/device tests. External configuration/build permissions are distinct; no service-account creation this sprint. Future reports must update these IDs and acceptance, not treat inspection as runtime closure.

## 5. Aturan pembaruan wajib

Setiap laporan implementasi/acceptance berikutnya WAJIB memperbarui **BHUMI_MASTER_PROJECT_CHECKLIST.md** dan **BHUMI_MASTER_GAP_AND_RISK_REGISTER.md** dengan ID, evidence, status, scope verifikasi/closure dan remaining work. Tidak ada silent removal: simpan ID/alias/gap serta alasan dan rujukan retirement. Closure hanya untuk scope yang dibuktikan, tidak mengangkat synthetic/compile/browser menjadi native atau produksi.

**Final Status: finite recovery completed; historical/product coverage PARTIAL; native/production gates remain open.** Every future sprint references RCV IDs and updates checklist+risk acceptance/evidence/status; new IDs require exact sources and non-overlap rationale. Next: separately authorize QA-BACKEND-AUTH-DB-CONFIG-01 after completed read-only preflight; NOT another recovery batch. No fourth master tracker.
## QA-BACKEND-AUTH-DB-CONFIG-01 — local acceptance overlay

[Implementation report](BHUMI_QA_BACKEND_AUTH_DB_CONFIG_01_REPORT.md): RSK-23 has scoped synthetic stop-gate evidence, NOT runtime closure. Selected QA rejects Firebase initialization, login/bootstrap/Admin access and billing plugin invocation; candidate staging rejects before staging side effects even with missing/false selector. All realQA/OAuth configurations remain unsupported pending independently approved evidence. RSK-22 remains open for fresh export; old runner defaults are unreachable behind unconditional staging denial, not a safe export implementation. Direct unrelated execution/legacy flags and transitive network containment remain unverified; do not run the application as QA by omitting the selector.

Preserve original **25 RSK / 21 DS** rows verbatim and **44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP**. RCV-25/28 BL, RCV-41 IP; RCV-20/21/23 SP, RCV-22/24/27 BL, RCV-26/30/31 IV unchanged. DS-2C1/2C2/2C3 runtime profile acceptance remains outstanding. Next **QA-EXTERNAL-CONFIG-EVIDENCE-01** requires Founder approval and separately scoped external permission; native signer/provider/backend deployment/rules are not verified by local mocks.

## QA-EXTERNAL-CONFIG-EVIDENCE-01 — readiness overlay

[Targeted report](BHUMI_QA_EXTERNAL_CONFIG_EVIDENCE_01_REPORT.md): **READY FOR FOUNDER QA RESOURCE APPROVAL, runtime BLOCKED**. RSK-23: retry 23 October identifies activation-critical legacy-selector isolation and unguarded direct billing verification; current cold-load denial is not durable billing-disable acceptance (report sections 3/7). No current live escape demonstrated; activation requires browser/public build binding, legacy absent-selector rejection, verified isolated resources and exact signer. Imports/helper bypass coverage is limited, not a network firewall. Historical debug fingerprints do not certify next APK. External existence/hosting/cost UNKNOWN; Functions deployment requires Blaze billing approval if chosen, not an assumed free backend.

RSK-22 remains open: ONE separately authorized **QA-ISOLATED-CONFIG-AND-CANDIDATE-01** batch may configure QA resources/backend and replace stops only after verified configuration/exact scope approval, then fresh AUTH-NEW-02 export and QA APK identity/config/parity verification. Install/login needs another approval; billing/Play remains gated. RCV-20/21/23 SP; RCV-22/24/25/27/28 BL; RCV-26/30/31 IV; RCV-41 IP unchanged. **44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP**; preserve all 25 RSK / 21 DS historical rows and unfinished work, including profile and device gaps. RSK-01/08 non-target hash preservation is documented in this report; no source edit or runtime acceptance.

## QA-ISOLATED-CONFIG-AND-CANDIDATE-01 — current guard evidence

[Current report](BHUMI_QA_ISOLATED_CONFIG_AND_CANDIDATE_01_REPORT.md): RSK-23 legacy active-selector and direct billing/recovery denial locally verified, 512 assertions / exit 0 / zero protected callbacks; no total network-containment claim. A PARTIAL: repo TSC/lint exit 0, separate backend TSC pre-existing TS7016 exit 2. RSK-22 latest export remains open; B Spark creation authorized but authenticated operator/tool and exact independent project unverified; C NOT RUN.

RCV-25/28 BL, RCV-41 IP; all 44 requirements remain 21 SP + 7 IV + 7 BL + 8 EM + 1 IP, 0 complete. Original 25 RSK / 21 DS rows retained verbatim, including DS-2C1/2C2/2C3 and RSK-04/14/21/05a/17. RSK-01/08 preservation uses scoped baseline hash comparison. Next requires operator/project identity and trusted isolated bootstrap hosting evidence, not another Spark approval; Blaze/paid resources remain prohibited.

**STOP AND WAIT FOR FOUNDER REVIEW**.

---
Quality Gate Validation (run: `npm run quality:gate`)
Result: see reports-qualitygate/BHUMI_QUALITY_GATE_REPORT.md
Linked requirement IDs: RCV-21 .. RCV-28 (44-item ledger)
Preserved: 25 RSK rows, 21 DS rows, 44-item ledger.
---\n
---
Phase A — QA-ISOLATED-CONFIG-AND-CANDIDATE-01
Result: see BHUMI_QA_ISOLATED_CONFIG_AND_CANDIDATE_01_PHASE_A_REPORT.md
Linked requirement IDs: RCV-21 .. RCV-28 (44-item ledger)
Preserved: 25 RSK rows, 21 DS rows, 44-item ledger.
---\n
---
Phase B — QA-ISOLATED-CONFIG-AND-CANDIDATE-01 (FIREBASE SPARK EXECUTION)
Result: see BHUMI_QA_PHASE_B_FIREBASE_SPARK_EXECUTION_REPORT.md
RSK-23 partial progress only: isolated QA project `bhumi-amartya-qa` created on Spark (billingEnabled=False), Firestore `(default)` asia-southeast2 with deny-all rules release verified, Web/Android apps registered, Android `.qa` SHA-1/SHA-256 from actual local debug signer registered.
RSK-23 remains OPEN: Google Auth `BILLING_NOT_ENABLED`, OAuth/`default_web_client_id` absent, QA backend bootstrap/token verification absent, no runtime/device verification.
RSK-22 remains OPEN. Preserved: 25 RSK / 21 DS rows; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; RCV-25/28 BL, RCV-41 IP.
---
---
QA-GOOGLE-AUTH-VERIFY-01 (2026-10-22)
Result: see BHUMI_QA_GOOGLE_AUTH_VERIFY_01_REPORT.md
RSK-23 partial progress: Google provider ENABLED; authorized domains verified; Web OAuth client matches `default_web_client_id`; QA project/package/SHA-1/SHA-256 match; Spark `billingEnabled=False`; Firestore deny-all intact.
RSK-23 remains OPEN: Android OAuth client (type 1) absent from QA SDK config; `lib/auth/authActions.ts:344` hardcodes production Web client; realQA/OAuth fail-closed; backend bootstrap/token verification BLOCKED.
Preserved: 25 RSK / 21 DS; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; no status upgrade.
---
---
QA-ANDROID-OAUTH-AND-AUTH-SOURCE-FIX-01 (2026-10-23)
Result: see BHUMI_QA_ANDROID_OAUTH_AND_AUTH_SOURCE_FIX_01_REPORT.md
RSK-23 partial progress only: QA Web OAuth client (type 3) verified and matched to Google IdP `clientId`; SHA-1/SHA-256 retained; QA SDK refreshed.
RSK-23 remains OPEN: Android OAuth client (type 1) absent; no public API for standard Google Sign-In OAuth clients (`clientauthconfig` 403/404, IAM disabled and not applicable); Console action required per firebase-tools#2470. Production Web client literal removed from `lib/auth/authActions.ts`; QA resolver validates project/client and fails closed; runtime guard still blocks all QA selectors. QA backend bootstrap/token verification remains BLOCKED; no APK/device.
RSK-22 remains OPEN. Preserved: 25 RSK / 21 DS; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; RCV-25/28 BL, RCV-41 IP.
---
---
QA-DEDICATED-SIGNER-OAUTH-FIX-01 (2026-10-23)
Result: see BHUMI_QA_DEDICATED_SIGNER_OAUTH_FIX_REPORT.md
RSK-23 partial progress: dedicated QA signer created outside repo; new SHA-1/SHA-256 unique across 9 accessible projects; Firebase QA received the new fingerprints (QA project only; old debug SHAs retained); QA SDK now has Android `client_type 1` with package `com.bhumiamartya.app.qa` and Web `client_type 3` matching IdP; Spark/Billing-disabled/Firestore deny-all verified.
RSK-23 remains OPEN: backend token verification/first-login bootstrap BLOCKED; realQA runtime fail-closed; no APK/device/native sign-in. Old conflicting OAuth client in another project untouched; old debug SHAs retained in QA but unused by the `qa` build type.
RSK-22 remains OPEN. Preserved: 25 RSK / 21 DS; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; RCV-25/28 BL, RCV-41 IP.
---
---
QA-BACKEND-BOOTSTRAP-LOCAL-01 (2026-10-23)
Result: see BHUMI_QA_BACKEND_BOOTSTRAP_LOCAL_01_REPORT.md
RSK-23 partial progress only: isolated local harness under `qa/backend/` now verifies real RS256/JWKS token validation, canonical 7-day server grant, first-login profile creation, idempotency, higher-entitlement preservation, malformed-state fail-closed behavior, and cross-user isolation against Firestore emulator `demo-bhumi-qa-bootstrap`; production project/issuer/audience and production credentials are rejected; bind is loopback-only.
RSK-23 remains OPEN: no real QA ID token, no revocation check, no Vercel QA backend, no browser/device proof. Local Admin SDK tests bypass Firestore rules. No deploy/APK/device/real auth/Billing/production change/commit.
Verification: 43/43 bootstrap tests PASS exit 0; 31/31 non-emulator subset PASS; lint 421 warnings / 0 errors; TSC exit 0; Quality Gate DEVELOPMENT PASS / RELEASE BLOCKED exit 0.
RSK-22 remains OPEN. Preserved: 25 RSK / 21 DS; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; RCV-25/28 BL, RCV-41 IP.
Next: Founder decision on Option A local harness vs Option B isolated Vercel QA backend; no APK/device yet.
---
QA-VERCEL-BACKEND-CANDIDATE-02 (2026-10-23)
Result: see BHUMI_QA_VERCEL_BACKEND_CANDIDATE_02_REPORT.md
RSK-23 partial progress only: `/api/healthz` routing is fixed and tested through the actual Vercel entrypoint; the shared bootstrap implementation is packaged as `@bhumi/qa-backend` with `install-links=true`, and a clean-room `npm ci` with only `qa/vercel` + `qa/backend` passed. Lockfile added.
RSK-23 remains OPEN: no GCP WIF/service account, no Vercel QA project/deployment, no actual Vercel preview build with outside-root source enabled, no live OIDC/WIF or Firebase revocation, no browser/device proof. Local Admin SDK tests bypass Firestore rules.
Verification: candidate 25/25 PASS exit 0; non-emulator 17/17 PASS; clean-room 2/2 PASS; node --check 17/17; TSC exit 0; lint 421 warnings / 0 errors exit 0; Quality Gate DEVELOPMENT PASS / RELEASE BLOCKED exit 0.
RSK-22 remains OPEN. Preserved: 25 RSK / 21 DS; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; RCV-25/28 BL, RCV-41 IP.
Next: ONE Founder action after review - approve `QA-VERCEL-BACKEND-DEPLOYMENT-01` for isolated QA resources, preview build, deployment, and live verification. No deploy/APK/device/Billing/production change/commit.
---
QA-VERCEL-BACKEND-DEPLOYMENT-01 (2026-10-23)
Result: see BHUMI_QA_VERCEL_BACKEND_DEPLOYMENT_01_REPORT.md
RSK-23 partial preparation only: actual Vercel team is Hobby, one OWNER, 15 projects, no `bhumi-qa-bootstrap`; Hobby is non-commercial and Pro is `$20/month` plus tax with a `$20/month` credit. No plan upgrade/purchase. Isolated target/root selected; no project, domain, or protection created.
GCP: QA project active; `billingEnabled=False`; Firestore `(default)`/`asia-southeast2`; WIF pool/provider absent; `qa-bootstrap` SA NOT_FOUND; `iam`/`iamcredentials`/`sts` APIs disabled; no IAM binding/key. Rules API readback 403; local deny-all intact.
Minimum IAM correction: use `roles/iam.workloadIdentityUser` for WIF impersonation, not broader `roles/iam.serviceAccountTokenCreator`; custom runtime role limited to `datastore.entities.get/create/update` and `firebaseauth.users.get`. No key.
RSK-23 remains OPEN: no Pro plan, Vercel project, custom domain/protection, WIF APIs/resources, SA/IAM, actual Vercel build/outside-root, live OIDC/WIF, live Firebase revocation, Rules readback, Android/device QA, or verified usage cost.
Verification: 25/25 candidate PASS exit 0; 17/17 non-emulator PASS; clean-room `npm ci` exit 0 + 2/2 PASS; node --check 17/17; TSC 0; lint 421 warnings / 0 errors; Quality Gate DEVELOPMENT PASS / RELEASE BLOCKED exit 0.
RSK-22 remains OPEN. Preserved: 25 RSK / 21 DS; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; RCV-25/28 BL, RCV-41 IP.
Next: ONE Founder activation decision under a separate task; current approval is preparation only. No deploy/cloud/paid-plan/APK/Billing/production change/commit.
---
QA-FREE-BACKEND-SELECTION-01 (2026-10-23)
Result: local `qa/backend` selected as the only demonstrated `$0` QA backend route; Vercel Pro/GCP WIF/Netlify/Cloudflare/paid resources NOT selected. Documentation only; no source/config/runtime change.
RSK-23 remains OPEN: QA runtime and Firebase initialization fail closed; `realQA` is rejected; staging always throws and hardcodes production/synthetic Firebase plus production Vercel URLs; local backend is demo-only and lacks revocation; native/env defaults are production; QA SDK is outside the repo; no local HTTPS/trust/adb reverse; no device attached.
RSK-22 remains OPEN: no fresh QA export/APK or device acceptance.
Minimum correction: narrow fail-closed realQA allowance; local backend exact QA token project plus emulator writes and revocation via QA Identity Toolkit; QA-only HTTPS/TLS + debug trust + adb reverse; QA SDK/env/package and non-production HD/astrology routing. Real cloud Firestore/rules/backend remain unverified.
Cost: `$0/month` selected path; Netlify Free credit cap + no documented GCP WIF; Cloudflare Free 10 ms CPU unsuitable.
Preserved: 25 RSK / 21 DS; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; RCV-25/28 BL, RCV-41 IP.
Next: ONE authorization `QA-LOCAL-ANDROID-SIGNIN-01`; no deploy/build/device under current approval.
---
QA-LOCAL-ANDROID-SIGNIN-01 PHASE A (2026-10-24)
Result: see BHUMI_QA_LOCAL_ANDROID_SIGNIN_01_PHASE_A_REPORT.md
RSK-23 partial progress only: source/config readiness now supports a fail-closed realQA path for the exact QA project/package, QA Auth with isolated demo Firestore, local QA staging, QA billing disablement, backend auth/data split with strict auth_time and Identity Toolkit revocation, optional HTTPS, conditional dedicated QA signing, and debug-only cleartext/user-CA trust.
Verification: QA unit guard 530 assertions PASS exit 0; backend 53/53 PASS exit 0; TSC exit 0; lint 421 warnings / 0 errors exit 0; Quality Gate DEVELOPMENT PASS / RELEASE BLOCKED exit 0.
RSK-23 remains OPEN: external QA google-services not placed; no local TLS cert/key; no real QA token/Google Sign-In/live revocation/staging build/APK/install/adb reverse/device/browser acceptance. No production/cloud/deploy/paid/commit.
RSK-22 remains OPEN. Preserved: 25 RSK / 21 DS; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; RCV-25/28 BL, RCV-41 IP.
Next: separate Founder-authorized Phase B execution; STOP before APK/device/deploy.
---
QA-LOCAL-ANDROID-SIGNIN-01 PHASE B REMEDIATION (2026-10-24)
Result: see BHUMI_QA_LOCAL_ANDROID_SIGNIN_01_PHASE_B_REPORT.md
Verdict: PHASE B PASS — ISOLATION ACCEPTANCE RESOLVED, SIGNED QA APK BUILT.
Artifact: `C:\Users\shein\AppData\Local\Temp\opencode\mobile-staging-1792803200489\android\app\build\outputs\apk\qa\app-qa.apk`; SHA-256 `99F08D79F3DD023875D243F9190FD5DE1394A8D6943A03F068665D1C08E1D448`; 7,769,171 bytes; assembleQa/apksigner/aapt2 exit 0; dedicated QA signer; package com.bhumiamartya.app.qa, 115 / 5.0.15-qa. Parity: 808/808 matches, 0 mismatches.
Compiled module proof: `phaseb-compiled-proof.mjs` PASS, 36 checks exit 0 (0 native calls, 0 network). Compiled qaRuntime validated, loopback endpoints enforced, local bootstrap provisions trial, billing rejects all calls with QA_BILLING_DISABLED.
Regressions: QA guard 538, Google client 21, TLS 8, backend JDK21 53/53 all exit 0; AUTH-NEW-02 14 PASS via initTestEnv (loaded .env.local). TSC exit 0; lint 421 warnings / 0 errors exit 0; quality gate exit 0 DEVELOPMENT PASS / RELEASE BLOCKED.
RSK-23 remains OPEN pending device Google Sign-In and local backend live verification. RSK-22 remains OPEN. Preserved: 25 RSK / 21 DS; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; RCV-25/28 BL, RCV-41 IP.
Next: ONE Founder review of Phase B remediation pass and device authorization. STOP BEFORE DEVICE TESTING / STOP AND WAIT FOR FOUNDER REVIEW.
---
AUTOMATED EMULATOR ACCEPTANCE SMOKE TEST (2026-10-24)
Result: see BHUMI_ANDROID_AUTOMATED_ACCEPTANCE_REPORT.md
Verdict: AUTOMATED EMULATOR SMOKE TEST: PASS.
Execution: Headless Android Emulator `Pixel_8` (API 34+, system image `android-37.0` x86_64, 4096MB RAM); cold start in 5.6s (`Status: ok`), `dumpsys activity top` confirmed `com.bhumiamartya.app.qa/com.bhumiamartya.app.MainActivity` resumed and focused; window focused; `CapacitorWebView` element attached.
Stability: 0 fatal exceptions, 0 application ANRs.
Network isolation: 0 requests to production Firebase (`bhumiamartya-fe85c`), production Vercel endpoints, or production billing verifiers. Clean post-test uninstall and emulator teardown.
RSK-22: Physical device/interactive Google Sign-In inspection replaced per Founder directive with $0 automated emulator smoke test. Real Google OAuth exchange and cloud Firestore rules runtime remain unverified. RSK-22 partially mitigated; Release Gate remains BLOCKED pending Play Console upload history verification (highest-ever versionCode UNKNOWN; Founder baseline 115 / 5.0.15; 116 not safe without full track verification).
Preserved: 25 RSK / 21 DS; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; RCV-25/28 BL, RCV-41 IP.
Next: Founder review of automated smoke test report and decision on Play Console read-only export / release closeout. STOP AND WAIT FOR FOUNDER REVIEW.

---

## HUMANIZED LANGUAGE & NATURAL CONTENT REVIEW — Risk Register Update (2026-10-24)

### New Risk Mitigation: Copy Quality Regression (DS-I1 residual)

| Risk | Status | Mitigation |
|------|--------|------------|
| AI-sounding cliché regression in generated content | MITIGATED | Extended `normalizeUserFacingGuidance.ts` blacklist with 16 new patterns covering Founder's explicit avoid-list (semesta, resonansi, vibrasi, perjalanan jiwa, transformasi, keselarasan, hati nurani, penuh makna, etc.); catches at normalization time before render |
| Repetitive sentence skeletons in weekly guidance | MITIGATED | Rewrote `weeklyGuidanceEngine.ts` with per-section distinct `awalPekan` templates; varied `advice`/`development` copy; removed repeated "memberi ruang untuk" / "Minggu ini..." skeleton |
| Prompt instruction gaps for AI output | MITIGATED | Added `humanVoiceRule` and extended `genericFilterRule` in `dailyGuidancePrompt.ts` with explicit Founder voice principles and banned cliché list |
| Static dictionary clichés | MITIGATED | Rewrote ~40 strings in `src/locales/id-ID/translation.json` (dashboard, onboarding, environment, notifications, premium, journaling, wellness, kenaliDiri, astroToday) removing "ruang/jiwa" overuse, "semesta", "beresonansi", robotic phrasing |
| Transit narrative clichés | MITIGATED | Fixed 5 sites in `personalizedTransitNarrative.ts` (semesta, resonansi, energi, ruang) |
| Local fallback templates | MITIGATED | Fixed 4 template lines in `localDailyGuidanceFallback.ts` (jiwa→diri, ruang→kesempatan, pelan-pelan→tanpa tergesa) |
| Notification copy | MITIGATED | Rewrote all 4 categories in `notificationPolicy.ts` + updated test assertions |

### Test Verification

| Test | Result | Assertions |
|------|--------|------------|
| `build110-indonesian-only-production.test.ts` | PASS | 157 |
| `build106-step8-contracts.test.ts` | PASS | 63 |
| `daily-2000-reminder.test.ts` | PASS | 10 |
| `auth-new-02-bootstrap-telemetry.test.ts` | PASS | 14 |
| `version-reconciliation.test.ts` | PASS | 22 |
| TypeScript | PASS | 0 errors |
| ESLint | PASS | 0 errors |
| Quality Gate | DEV PASS / RELEASE BLOCKED | — |

### Humanized Content Acceptance: PASS

All acceptance criteria verified:
- Natural readability: conversational Indonesian, removed translated/formal tone
- Accurate meaning: no calculation/engine logic changed
- Consistent brand voice: "Peluk hangat dari Bhumi." retained; warm but grounded
- No unnatural repetitive templates: weekly guidance varied; blacklist active
- No excessive spiritual language: semesta/resonansi/vibrasi/hati nurani/penuh makna/transformasi reduced
- No forced motivational messages: "cukup hadir"/"pelan-pelan"/"jaga energi"/"tarik napas" removed
- No misleading claims: advice remains tentative/agency-preserving
- No broken UI layout: TypeScript/lint pass; key lengths comparable

**Overall Verdict: HUMANIZED CONTENT ACCEPTANCE = PASS**

---

---

## ANTIGRAVITY HANDOVER & RISK AUDIT (2026-10-25)

1. **Risk Register Invariant Preservation:**
   - All 25 historical risk rows (24 concrete IDs + 1 reserved) and 21 DS gap rows remain preserved intact.
   - RSK-01 / RSK-08 (Uncommitted working tree drift): 81 tracked modified files, 141 untracked entries, 0 staged files. All changes protected; zero destructive Git actions performed.
   - RSK-02 / RSK-10 (Production verification void / telemetry): Kept fail-closed; 0 production cloud reads/writes executed.
   - RSK-03 / RSK-06 / RSK-07 / RSK-16 / RSK-18 / RSK-19 / RSK-20 (Billing & multi-token integrity): All 67 client unit assertions PASS; server-authoritative token validation and dual-display preserved.
   - RSK-04 / RSK-14 / RSK-21 / RSK-23 (Android physical device gap / QA isolation): Physical device testing SKIPPED per Founder directive. Signed QA APK (`app-qa.apk`, SHA-256 `0B2B5490...`, dedicated QA signer) verified with 808/808 asset parity, 0 production endpoint leaks, and automated emulator acceptance.
   - RSK-22 (Next.js static export boundary): Disposable staging build runner isolates client bundle, excluding `app/api/**` and admin routes.
2. **Play Console Baseline Risk:**
   - Founder baseline: `versionCode 115`, `versionName 5.0.15`.
   - Highest-ever uploaded code across all Play tracks remains UNKNOWN (NOT VERIFIED). `versionCode 116` is strictly NOT approved without verified Play Console track history.
3. **Release Verdict:**
   - **RELEASE GATE BLOCKED (NO-GO FOR PRODUCTION PLAY RELEASE)**.
   - Development Gate: PASS.

---

STOP AND WAIT FOR FOUNDER REVIEW.


---

## FOUNDER-AUTHORIZED BUILD 116 UPGRADE & RISK STATUS (2026-10-25)

1. **Version Authorization:**
   - Explicit Founder directive: Upgrade production baseline to `versionCode = 116`, `versionName = "5.0.16"`, `applicationId = "com.bhumiamartya.app"`.
   - Local Gradle & source metadata synchronized across `build.gradle`, `buildInfo.ts`, and test suites.
2. **Local Production Build:**
   - Compiled APK: `android/app/build/outputs/apk/release/app-release.apk`
   - SHA-256: `5FE93E46A8540FBE213FB2D7D266BDECE0222B7CF31F3884B8AE94AC14CA1105`
   - Size: `8,109,069` bytes (~8.11 MB)
   - Verified v2 production scheme signed with `bhumi-amartya-release.jks` (SHA-1 `b51c84d0...`).
   - Badging: `com.bhumiamartya.app` (116 / 5.0.16), targetSdk 36, compileSdk 36.
3. **Play Console Upload Safety Risk (RSK-22 / RSK-23):**
   - No authenticated Play Console access exists in this local CLI environment: **PLAY HISTORY NOT VERIFIED**.
   - In accordance with safety protocol, 116 is NOT presented as upload-safe until verified against Play Console all-track history export.
4. **Release Gate Status:**
   - Development Gate: PASS.
   - Release Gate: **RELEASE GATE BLOCKED (NO-GO FOR PRODUCTION PLAY RELEASE)** pending Play history and upload sign-off.
