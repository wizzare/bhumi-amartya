# BHUMI AMARTYA — PROJECT REQUIREMENTS MATRIX (PRM)

**Document ID:** `PRM-HD-001`  
**Tracking Convention Note:** Istilah *Project Requirements Matrix* (PRM) digunakan sebagai instrumen pelacakan operasional internal proyek, bukan kepanjangan resmi yang telah didefinisikan sebelumnya di repositori.  
**Workstream:** Phase 1 — Human Design Stabilization  
**Baseline Git Branch:** `hotfix/build110-indonesian-only`  
**Active HEAD:** `e63f334cf0ac20cc076bc88e98e3e06808b024f3`  
**Last Updated:** 20 Oktober 2026  
**Status:** ACTIVE AUDITED BASELINE  

---

## 1. AUTHENTICATION & SECURITY REQUIREMENTS (SPRINT HD-01)

| Req ID | Scope | Source File | Sprint | Acceptance Criteria | Test File | Evidence | Status | Remaining Gap |
|---|---|---|---|---|---|---|---|---|
| **HD-AUTH-01** | API Gateway Auth | `lib/auth/hdEndpointAuth.ts`<br>`app/api/humandesign/calculate/route.ts` | HD-01 | Request tanpa header `Authorization: Bearer <token>` wajib ditolak dengan status HTTP 401 Unauthorized secara fail-closed. | `tests/unit/hd-endpoint-auth.test.ts` | AUTH-01 PASS | **IMPLEMENTED** | Pengujian pada runtime produksi live belum dilakukan. |
| **HD-AUTH-02** | Transit API Auth | `app/api/humandesign/astrology/route.ts` | HD-01 | Endpoint kalkulasi astrologi transit wajib menolak request tanpa token Firebase yang sah (HTTP 401). | `tests/unit/hd-endpoint-auth.test.ts` | AUTH-02 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-AUTH-03** | Invalid Token Rejection | `lib/auth/hdEndpointAuth.ts` | HD-01 | Token yang rusak, tidak terformat, atau memiliki signature palsu ditolak dengan HTTP 403 Forbidden. | `tests/unit/hd-endpoint-auth.test.ts` | AUTH-03 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-AUTH-04** | Expired Token Rejection | `lib/auth/hdEndpointAuth.ts` | HD-01 | Token yang masa berlakunya telah habis wajib ditolak dengan HTTP 403 tanpa memicu fallback atau bypass. | `tests/unit/hd-endpoint-auth.test.ts` | AUTH-04 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-AUTH-05** | Cross-Project Rejection | `lib/auth/hdEndpointAuth.ts` | HD-01 | Token Firebase dari Firebase project ID yang berbeda wajib ditolak (HTTP 403). | `tests/unit/hd-endpoint-auth.test.ts` | AUTH-05 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-AUTH-06** | App Check Isolation | `lib/auth/hdEndpointAuth.ts` | HD-01 | Header App Check saja tanpa User Auth Token tidak boleh memberikan akses (HTTP 401). | `tests/unit/hd-endpoint-auth.test.ts` | AUTH-06 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-AUTH-07** | Production Bypass Lock | `lib/auth/hdEndpointAuth.ts` | HD-01 | Header bypass (`x-bhumi-test-bypass`) wajib diblokir total jika `NODE_ENV === 'production'` (HTTP 401). | `tests/unit/hd-endpoint-auth.test.ts` | AUTH-07 PASS | **IMPLEMENTED** | Verifikasi deployment build produksi final (HD-06). |
| **HD-AUTH-08** | External Dev Host Rejection | `lib/auth/hdEndpointAuth.ts` | HD-01 | Header bypass dalam mode development hanya diterima jika origin berasal dari loopback lokal (127.0.0.1 / localhost). | `tests/unit/hd-endpoint-auth.test.ts` | AUTH-08 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-AUTH-09** | Identity Propagation | `lib/auth/hdEndpointAuth.ts` | HD-01 | Token yang valid mengekstrak `uid` pengguna secara aman dan mengikat kalkulasi ke pemilik akun. | `tests/unit/hd-endpoint-auth.test.ts` | AUTH-09 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-AUTH-10** | Concurrent Auth Independence | `lib/auth/hdEndpointAuth.ts` | HD-01 | Request autentikasi paralel dari multi-user diselesaikan secara independen tanpa context leaking. | `tests/unit/hd-endpoint-auth.test.ts` | AUTH-10 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-AUTH-11** | Upstream Engine Guard | `app/api/humandesign/calculate/route.ts` | HD-01 | Request yang gagal lolos verifikasi autentikasi dilarang memicu pemanggilan ke backend Python. | `tests/unit/hd-endpoint-auth.test.ts` | AUTH-11 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-AUTH-12** | Bodygraph Decommission | `app/api/humandesign/bodygraph/route.ts` | HD-01 | Endpoint legasi `bodygraph` wajib mengembalikan HTTP 410 Gone untuk seluruh caller guna memotong vector usang. | `tests/unit/hd-endpoint-auth.test.ts` | AUTH-12 PASS | **IMPLEMENTED** | Tidak ada. |

---

## 2. CANONICAL INTEGRITY & COMPLETENESS (SPRINT HD-02)

| Req ID | Scope | Source File | Sprint | Acceptance Criteria | Test File | Evidence | Status | Remaining Gap |
|---|---|---|---|---|---|---|---|---|
| **HD-CANON-01** | Core Structural Completeness | `lib/humandesign/completeness.ts` | HD-02 | Chart hanya dinyatakan core complete jika memiliki Type, Profile, Authority, 9 Centers (boolean), Definition, Gates (non-empty), Channels, dan Incarnation Cross. | `tests/unit/hd-canonical-integrity.test.ts` | CANON-01 PASS | **IMPLEMENTED** | Validasi visual pada UI bergantung pada HD-05D. |
| **HD-CANON-02** | Metadata-Only Rejection | `lib/humandesign/completeness.ts` | HD-02 | Payload yang hanya berisi metadata atau status `ready` tanpa struktur chart riil ditolak oleh acceptance predicate. | `tests/unit/hd-canonical-integrity.test.ts` | CANON-02 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-CANON-03** | Legacy Historical Labeling | `lib/humandesign/completeness.ts`<br>`lib/humandesign/hdState.ts` | HD-02 | Chart legacy yang valid tetapi dibuat sebelum skema baru diklasifikasikan sebagai `FALLBACK_LABELED`, bukan error fatal. | `tests/unit/hd-canonical-integrity.test.ts` | CANON-03 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-CANON-04** | Reflector Validity Contract | `lib/humandesign/completeness.ts` | HD-02 | Chart tipe Reflector dengan seluruh 9 centers open dan 0 channels aktif diterima sebagai core complete yang valid (bukan dianggap korup). | `tests/unit/hd-canonical-integrity.test.ts` | CANON-04 PASS | **IMPLEMENTED** | Perlu skenario browser khusus Reflector di acceptance lanjutan. |
| **HD-CANON-05** | Optional Enrichment Separation | `lib/humandesign/completeness.ts` | HD-02 | Ketiadaan atau kegagalan data sekunder (variabel digestion, environment, sense) tidak boleh membatalkan kelengkapan core chart. | `tests/unit/hd-canonical-integrity.test.ts` | CANON-05 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-CANON-06** | Live Normalizer Nullification | `lib/humandesign/hdkitAdapter.ts` | HD-02 | Live response normalizer wajib mengembalikan `null` jika backend mengembalikan data yang kehilangan field esensial. | `tests/unit/hd-canonical-integrity.test.ts` | CANON-06 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-CANON-07** | Preservation Against Partial Overwrite | `lib/repositories/blueprintRepository.ts` | HD-02 | Operasi merge wajib melindungi chart canonical lengkap yang tersimpan agar tidak tertimpa oleh payload kalkulasi parsial. | `tests/unit/hd-canonical-integrity.test.ts` | CANON-07 PASS | **IMPLEMENTED** | Diuji lebih lanjut pada level emulator Firestore. |
| **HD-CANON-08** | Offline Fallback Selection | `lib/humandesign/hdRead.ts` | HD-02 | Saat engine atau jaringan mati, pembacaan chart memilih stored chart yang valid untuk dirender ke UI. | `tests/unit/hd-canonical-integrity.test.ts` | CANON-08 PASS | **IMPLEMENTED** | Keterbatasan memory-only cache di web (belum persistent offline). |
| **HD-CANON-09** | Backward Contract Compatibility | `lib/humandesign/hdState.ts` | HD-02 | Fungsi predicate legacy `getHdState` dan `isCanonicalHumanDesign` tetap kompatibel dengan caller modul lain. | `tests/unit/hd-canonical-integrity.test.ts` | CANON-09 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-CANON-10** | Recovery Due Precision | `lib/humandesign/hdRecovery.ts` | HD-02 | Evaluasi `getHdRecoveryDueForUid` membedakan secara tegas chart lengkap vs tidak lengkap vs pending. | `tests/unit/hd-canonical-integrity.test.ts` | CANON-10 PASS | **IMPLEMENTED** | Tidak ada. |

---

## 3. BIRTH INPUT BINDING & CONCURRENCY (SPRINT HD-03)

| Req ID | Scope | Source File | Sprint | Acceptance Criteria | Test File | Evidence | Status | Remaining Gap |
|---|---|---|---|---|---|---|---|---|
| **HD-BIND-01** | Deterministic Birth Fingerprint | `lib/humandesign/birthFingerprint.ts` | HD-03 | Input data lahir yang identik menghasilkan nilai fingerprint revision hash (`bip_v1_<fnv1a32>`) yang konsisten. | `tests/unit/hd-birth-binding.test.ts` | BIND-01 PASS | **IMPLEMENTED** | FNV-1a 32-bit memiliki potensi collision jangka panjang. |
| **HD-BIND-02** | Birth Time Revision Invalidation | `lib/humandesign/birthFingerprint.ts` | HD-03 | Perubahan menit lahir menghasilkan revision hash baru dan membatalkan hasil kalkulasi dari waktu lahir sebelumnya. | `tests/unit/hd-birth-binding.test.ts` | BIND-02 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-BIND-03** | Timezone/Coord Invalidation | `lib/humandesign/birthFingerprint.ts` | HD-03 | Perubahan kota lahir, timezone, atau koordinat geografis menghasilkan revision hash baru. | `tests/unit/hd-birth-binding.test.ts` | BIND-03 PASS | **IMPLEMENTED** | Pembulatan koordinat ke 4 desimal (~11m). |
| **HD-BIND-04** | Stale Calculation Abort | `lib/humandesign/hdRecovery.ts` | HD-03 | Kalkulasi in-flight yang selesai setelah data lahir pengguna diubah di UI dibatalkan dan tidak disimpan ke database. | `tests/unit/hd-birth-binding.test.ts`<br>`tests/helpers/hd05dBirthRevision.mjs` | BIND-04 PASS<br>B-06 PASS | **VERIFIED (PASS)** | Tidak ada gap. |
| **HD-BIND-05** | In-Flight Promise Dedup | `lib/humandesign/hdRecovery.ts` | HD-03 | Pemicu kalkulasi bersamaan untuk UID dan revisi yang sama membagi satu promise in-flight tanpa duplikasi request engine. | `tests/unit/hd-birth-binding.test.ts` | BIND-05 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-BIND-06** | Inactive/Logout Abort | `lib/humandesign/hdRecovery.ts` | HD-03 | Jika pengguna logout saat kalkulasi sedang berlangsung, proses penyimpanan ke database dibatalkan seketika. | `tests/unit/hd-birth-binding.test.ts` | BIND-06 PASS | **IMPLEMENTED** | Terbukti pada Flow D Playwright browser test. |
| **HD-BIND-07** | Cross-Account UID Mismatch Guard | `lib/humandesign/hdRecovery.ts` | HD-03 | Perbedaan antara UID konteks autentikasi dan UID dokumen blueprint membatalkan operasi recovery. | `tests/unit/hd-birth-binding.test.ts` | BIND-07 PASS | **IMPLEMENTED** | Terbukti pada Flow D Playwright browser test. |
| **HD-BIND-08** | Legacy Chart Unknown Classification | `lib/humandesign/birthFingerprint.ts` | HD-03 | Chart lama tanpa field `inputHash` diklasifikasikan sebagai `UNKNOWN_LEGACY`, bukan mismatch langsung. | `tests/unit/hd-birth-binding.test.ts` | BIND-08 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-BIND-09** | Matching Fingerprint Acknowledgment | `lib/humandesign/birthFingerprint.ts` | HD-03 | Evaluasi fingerprint mengembalikan status `MATCH` jika hash data tersimpan cocok dengan input aktif. | `tests/unit/hd-birth-binding.test.ts` | BIND-09 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-BIND-10** | Stored Canonical Immutability Guard | `lib/repositories/blueprintRepository.ts` | HD-03 | Chart canonical tersimpan dilindungi dari partial overwrite saat recovery parsial mencoba menulis data. | `tests/unit/hd-birth-binding.test.ts` | BIND-10 PASS | **IMPLEMENTED** | Diuji juga pada emulator SDK Firestore. |

---

## 4. TIMEZONE & HISTORICAL DST (SPRINT HD-03)

| Req ID | Scope | Source File | Sprint | Acceptance Criteria | Test File | Evidence | Status | Remaining Gap |
|---|---|---|---|---|---|---|---|---|
| **HD-TZ-01** | Numeric Offset Parsing | `services/humandesign-api/main.py` | HD-03 | Fungsi `parse_timezone_to_offset` memproses offset numerik (+7, -5, +08:00, -04:30, menit 420) secara akurat. | `test_timezone_dst_standalone.py` | Py Test 1 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-TZ-02** | Historical DST US Transition | `services/humandesign-api/main.py` | HD-03 | Timezone `America/New_York` menghasilkan -5.0 pada Januari dan -4.0 pada Juli untuk tahun kelahiran yang sama. | `test_timezone_dst_standalone.py` | Py Test 2 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-TZ-03** | Historical DST UK Transition | `services/humandesign-api/main.py` | HD-03 | Timezone `Europe/London` menghasilkan 0.0 (GMT) pada Januari dan +1.0 (BST) pada Juli. | `test_timezone_dst_standalone.py` | Py Test 3 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-TZ-04** | Constant Non-DST Timezone | `services/humandesign-api/main.py` | HD-03 | Timezone Indonesia (`Asia/Jakarta`) menghasilkan offset konstan +7.0 sepanjang tahun. | `test_timezone_dst_standalone.py` | Py Test 4 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-TZ-05** | Invalid Timezone Fail-Closed | `services/humandesign-api/main.py` | HD-03 | String timezone yang tidak valid melempar `ValueError` fail-closed dan tidak diam-diam mengasumsikan UTC+7. | `test_timezone_dst_standalone.py` | Py Test 5 PASS | **IMPLEMENTED** | UI setup harus memvalidasi kota sebelum submit. |
| **HD-TZ-06** | Empty Timezone Fail-Closed | `services/humandesign-api/main.py` | HD-03 | Input timezone kosong melempar `ValueError`. | `test_timezone_dst_standalone.py` | Py Test 6 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-TZ-07** | Deterministic Ambiguity Resolution | `services/humandesign-api/main.py` | HD-03 | Jam lahir yang jatuh pada masa rollback DST diselesaikan secara deterministik tanpa crash. | `test_timezone_dst_standalone.py` | Py Test 7 PASS | **IMPLEMENTED** | Dokumentasi penjelasan kepada user jika lahir di jam DST. |

---

## 5. TRANSPORT, TIMEOUT & RECOVERY (SPRINT HD-04)

| Req ID | Scope | Source File | Sprint | Acceptance Criteria | Test File | Evidence | Status | Remaining Gap |
|---|---|---|---|---|---|---|---|---|
| **HD-TIME-01** | Client 25s Timeout | `lib/humandesign/hdCommunication.ts` | HD-04 | Pemanggilan kalkulasi sisi klien membatalkan request jika tidak selesai dalam batas maksimal 25.000 ms. | `tests/unit/hd04-communication.test.ts` | Deadline test PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-TIME-02** | Proxy 15s Upstream Timeout | `app/api/humandesign/calculate/route.ts` | HD-04 | Next.js API route handler membatalkan koneksi ke Python engine jika engine menggantung lebih dari 15.000 ms. | `tests/unit/hd04-communication.test.ts` | Upstream test PASS | **IMPLEMENTED** | Konfigurasi timeout di Vercel/Railway harus sinkron. |
| **HD-TIME-03** | Token Acquisition In Deadline | `lib/humandesign/hdCommunication.ts` | HD-04 | Akuisisi token Firebase Auth diperhitungkan ke dalam total batas waktu deadline. | `tests/unit/hd04-communication.test.ts` | Hung token test PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-TIME-04** | Body Read In Deadline | `lib/humandesign/hdCommunication.ts` | HD-04 | Pembacaan body response yang lambat tetap berada dalam pengawasan batas waktu deadline. | `tests/unit/hd04-communication.test.ts` | Hung body test PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-TIME-05** | Signal Abort Propagation | `lib/humandesign/hdCommunication.ts` | HD-04 | Pembatalan melalui `AbortController` meneruskan sinyal abort ke fetch underlying secara tuntas. | `tests/unit/hd04-communication.test.ts` | Abort signal PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-TIME-06** | Zero Orphan Timers | `lib/humandesign/hdCommunication.ts` | HD-04 | Penyelesaian atau pembatalan request membersihkan seluruh timer internal tanpa kebocoran memori. | `tests/unit/hd04-scenarios.test.ts` | Scenario 18 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-REC-01** | HTTP Error Classification | `lib/humandesign/hdCommunication.ts` | HD-04 | Mengklasifikasikan error HTTP menjadi kategori eksplisit (`unauthorized`, `rate_limited`, `service_unavailable`, `invalid_input`, `endpoint_not_found`). | `tests/unit/hd04-communication.test.ts` | HTTP status tests PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-REC-02** | Bounded Retry Policy | `lib/humandesign/hdCommunication.ts` | HD-04 | Hanya error 429 dan 500 yang dapat di-retry; 400, 401, 403, dan 404 berstatus non-retryable fail-closed. | `tests/unit/hd04-communication.test.ts`<br>`tests/helpers/hd05cRecoveryRetries.mjs` | Retryability PASS<br>C-04, C-05, C-06 PASS | **VERIFIED (PASS)** | Terbukti pada Flow C browser runner. |
| **HD-REC-03** | Shared Recovery Execution | `lib/humandesign/hdRecovery.ts` | HD-04 | Recovery chart dikoordinasikan melalui single executor untuk mencegah balapan antar komponen UI. | `tests/unit/hd04-scenarios.test.ts` | Scenario 1 PASS | **IMPLEMENTED** | Tidak ada. |
| **HD-REC-04** | Authoritative Round-Trip Verification | `lib/humandesign/hdRecovery.ts` | HD-04 | Operasi recovery hanya dinyatakan sukses setelah data yang tersimpan dibaca ulang secara otoritatif dari Firestore. | `tests/unit/hd04-scenarios.test.ts` | Scenario 17 PASS | **IMPLEMENTED** | Terintegrasi di Flow A browser runner. |
| **HD-REC-05** | Transactional Write Guard | `lib/repositories/blueprintRepository.ts` | HD-04 | Firestore write guard menolak penimpaan chart canonical lengkap oleh proses yang membawa data stale/pending. | `tests/unit/hd-p0-write-guard-emulator.test.ts` | STRONG_REAL_SDK PASS | **IMPLEMENTED** | Tidak ada. |

---

## 6. UI RESILIENCE & CACHE (SPRINT HD-05)

| Req ID | Scope | Source File | Sprint | Acceptance Criteria | Test File | Evidence | Status | Remaining Gap |
|---|---|---|---|---|---|---|---|---|
| **HD-UI-01** | Explicit Status Chip States | `components/blueprint/HdStatus.tsx`<br>`lib/humandesign/hdView.ts` | HD-05 | UI merender state eksplisit: `ready_canonical`, `pending`, `missing_blueprint`, `stale_calculating`, `error`. | `tests/unit/hd05-view.test.ts`<br>`tests/unit/hd05-render-cache.test.ts` | SSR tests PASS | **IMPLEMENTED** | Visual design polishing pada dark/light theme. |
| **HD-UI-02** | Missing Blueprint No Freeze | `app/blueprint/human-design/page.tsx` | HD-05 | Jika user belum memiliki blueprint, UI menampilkan status informatif tanpa loading spinner tak terbatas (infinite loading). | `tests/unit/hd05-render-cache.test.ts` | missing_blueprint test | **IMPLEMENTED** | Verifikasi browser flow A-01. |
| **HD-UI-03** | In-Memory Cache Isolation | `lib/humandesign/hdLoad.ts` | HD-05 | Cache hanya disimpan di memory dengan TTL 5 menit, diisolasi per UID, session ID, dan revision hash. | `tests/unit/hd05-render-cache.test.ts` | Cache reject tests PASS | **IMPLEMENTED** | Tidak ada persistent storage offline untuk web. |
| **HD-UI-04** | Read Error Resilience | `lib/humandesign/hdRead.ts` | HD-05 | Kegagalan koneksi saat pembacaan menampilkan state error dengan tombol retry eksplisit, tidak blank white screen. | `tests/unit/hd05-view.test.ts`<br>`tests/helpers/hd05cRecoveryRetries.mjs` | Error view PASS<br>C-01, C-02, C-15 PASS | **VERIFIED (PASS)** | Terbukti pada Flow C browser runner. |
| **HD-UI-05** | Pending Banner Auto-Dismiss | `components/dashboard/PendingHdRecoveryBanner.tsx` | HD-05 | Banner pemulihan otomatis hilang dari dashboard segera setelah chart selesai diproses dan berstatus ready. | `tests/unit/hd05-view.test.ts` | Banner dismiss test | **IMPLEMENTED** | Flow A browser test (HD-05D.2). |
| **HD-UI-06** | Accessibility & ARIA Contract | `components/blueprint/HdStatus.tsx` | HD-05 | Indikator status HD menyertakan `aria-live="polite"` dan atribut `data-hd-state` untuk screen reader dan test automation. | `tests/unit/hd05-render-cache.test.ts` | ARIA markup test PASS | **IMPLEMENTED** | Audit formal WCAG belum dilakukan. |

---

## 7. BROWSER ACCEPTANCE REQUIREMENTS (SPRINT HD-05D)

| Req ID | Scope | Runner / File | Sub-Sprint | Acceptance Criteria | Test Evidence Path | Status | Remaining Gap |
|---|---|---|---|---|---|---|---|
| **HD-FLOW-D** | Account Isolation | `tests/helpers/hd05dFlowD.mjs` | HD-05D.1 | Skenario D01-D07: User A login, logout membersihkan DOM, User B login bersih, late deferred response A dibuang, guard write antar akun aktif, switch bolak-balik aman, unmount pending aman. | `C:\Users\shein\AppData\Local\Temp\opencode\hd05c-harness\HD05D1-1792348632275-3dz2XD\` | **PASS LOCAL BROWSER** (7/7 PASS, 104 assertions) | Pembuktian berlaku pada skenario lokal sandbox yang diuji. |
| **HD-FLOW-A** | New User Onboarding | `tests/helpers/hd05daFlowA.mjs` | HD-05D.2 | Skenario A01-A10: User baru login -> `/setup` -> isi form lahir -> pending state -> mock engine hit -> canonical validation -> persistence -> reread -> dashboard ready -> detail render -> reload consistency. | `C:\Users\shein\AppData\Local\Temp\opencode\hd05c-harness\HD05D2-1792471103979-Q40CQC\` | **PASS LOCAL BROWSER** (10/10 PASS, 110 assertions) | Pembuktian berlaku pada skenario lokal sandbox yang diuji. |
| **HD-FLOW-B** | Settings Data Correction | `tests/helpers/hd05dBirthRevision.mjs` | HD-05D.3 | Koreksi data lahir di `/settings` memicu revisi hash baru, membatalkan cache lama, menghitung ulang chart, dan menyimpan chart baru tanpa korupsi (13 skenario B-01 s/d B-13). | `C:\Users\shein\AppData\Local\Temp\opencode\hd05c-harness\HD05D2-1792474107608-bxOEDb\` | **PASS LOCAL BROWSER** (13/13 PASS, 67 assertions) | Pembuktian berlaku pada skenario lokal sandbox yang diuji. |
| **HD-FLOW-C** | Dashboard Recovery & Retries | `tests/helpers/hd05cRecoveryRetries.mjs` | HD-05D.4 | Pengujian skenario timeout, engine 500/429/404, deduplikasi klik retry, pemulihan otomatis di dashboard, dan verifikasi chart tersimpan tetap utuh. | `C:\Users\shein\AppData\Local\Temp\opencode\hd05c-harness\HD05D2-1792484931195-P89DEm\` | **PASS LOCAL BROWSER** (15/15 PASS) | Pembuktian berlaku pada skenario lokal sandbox yang diuji. |
| **HD-ACC-CLOSE** | Full Acceptance Closure | `tests/helpers/hd05cLocalPlaywrightHarness.mjs`<br>`tests/helpers/hd05dClosureAcceptance.mjs` | HD-05D.5 | Eksekusi seluruh 25 skenario acceptance HD-05 secara berurutan, verifikasi zero unhandled rejection, dan pembuatan laporan akhir browser acceptance. | `C:\Users\shein\AppData\Local\Temp\opencode\hd05c-harness\HD05D2-1792493686082-9JkA5d\` | **PASS LOCAL BROWSER** (55/55 PASS: C 15, A 10, B 13, D 7, Closure 10) | Seluruh 25 acceptance criteria diverifikasi secara otomatis. |

---

## 8. RELEASE READINESS GATE REQUIREMENTS (SPRINT HD-06 — BLOCKED)

| Req ID | Scope | Verification File | Sprint | Acceptance Criteria | Status | Gate Blocker Reason |
|---|---|---|---|---|---|---|
| **HD-REL-01** | End-to-End Regression Matrix | Full Regression Suites | HD-06 | Seluruh test suite HD (16 suite, 55 browser scenario) lolos di lingkungan terisolasi. | **PASS LOCAL** | 100% test hijau. |
| **HD-REL-02** | Gateway & Engine Configuration Audit | Next.js & Python Code | HD-06 | Verifikasi keselarasan variabel environment URL gateway, API key, dan header auth antara Vercel dan Railway/Python. | **AUDITED (ALIGNED)** | Live URL production NOT VERIFIED. |
| **HD-REL-03** | Production Telemetry Audit | Telemetry Logs | HD-06 | Audit telemetri non-sensitif agregat read-only untuk memastikan tidak ada 500 internal error pada pengguna live. | **NOT VERIFIED** | Akses kredensial produksi diblokir. |
| **HD-REL-04** | Android Capacitor Build & Signing | `android/` | HD-06 | Metadata compileSdk 36, versionCode 115, versionName 5.0.15 terverifikasi. | **DEVICE NOT VERIFIED** | Pengujian fisik belum dilakukan. |
| **HD-REL-05** | Production Release Approval | Sign-off Document | HD-06 | Persetujuan tertulis eksplisit dari Founder untuk perilisan versi ke publik. | **GATE REVIEW READY** | Menunggu keputusan Founder. |


---

## 9. BILLING & ENTITLEMENT REQUIREMENTS (SPRINT BILL-01)

| Req ID | Scope | Source File | Sprint | Acceptance Criteria | Test File | Evidence | Status | Remaining Gap |
|---|---|---|---|---|---|---|---|---|
| **BILL-OWN-01** | Token Ownership Binding | `services/billing-verifier/lib/entitlement.ts` | BILL-01 | Purchase token Google Play yang valid hanya diikat ke UID pembeli di `billing_purchase_tokens/${hash}`. | `services/billing-verifier/tests/unit/bill01-ownership-and-verifier.test.ts` | BILL01-01 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-OWN-02** | Token Hijacking Prevention | `services/billing-verifier/lib/entitlement.ts` | BILL-01 | Upaya restore atau verifikasi token milik UID A oleh UID B ditolak dengan HTTP 409 `TOKEN_OWNERSHIP_CONFLICT`. | `services/billing-verifier/tests/unit/bill01-ownership-and-verifier.test.ts` | BILL01-02 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-OWN-03** | Race Condition Guard | `services/billing-verifier/lib/entitlement.ts` | BILL-01 | Verifikasi paralel token yang sama dari multi-UID hanya mengizinkan satu pemilik sah secara atomik. | `services/billing-verifier/tests/unit/bill01-ownership-and-verifier.test.ts` | BILL01-03 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-OWN-04** | In-Flight Session Switch Guard | `lib/billing/premiumRecovery.ts` | BILL-01 | Logout atau pergantian UID saat verifikasi in-flight membatalkan penyimpanan ke akun baru (`AUTH_CHANGED`). | `tests/unit/bill01-entitlement-integrity-client.test.ts` | BILL01-04 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-OWN-05** | Idempotent Replay | `services/billing-verifier/lib/entitlement.ts` | BILL-01 | Verifikasi ulang token yang sama oleh UID yang sama bersifat idempoten tanpa duplikasi atau korupsi. | `services/billing-verifier/tests/unit/bill01-ownership-and-verifier.test.ts` | BILL01-05 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-ENT-01** | Active Paid Protection | `services/billing-verifier/lib/entitlement.ts` | BILL-01 | Token kadaluwarsa/lama tidak boleh menimpa atau mendowngrade langganan berbayar aktif yang masih berlaku. | `services/billing-verifier/tests/unit/bill01-ownership-and-verifier.test.ts` | BILL01-06 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-ENT-02** | Founder/Lifetime Immutability | `services/billing-verifier/lib/entitlement.ts` | BILL-01 | Status Founder atau Lifetime tidak pernah diturunkan oleh event expiry, cancellation, atau refund token. | `services/billing-verifier/tests/unit/bill01-ownership-and-verifier.test.ts` | BILL01-11, 12, 13 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-ENT-03** | Multi-Source Union Expiry | `lib/billing/entitlementService.ts` | BILL-01 | Pengguna dengan multi-entitlement aktif menerima tanggal kadaluwarsa terpanjang di antara semua sumber sah. | `tests/unit/bill01-entitlement-integrity-client.test.ts` | BILL01-14, 16 PASS | **IMPLEMENTED & VERIFIED** | Label display menunggu keputusan Founder. |
| **BILL-ENT-04** | Trial Immutability | `lib/billing/entitlementService.ts` | BILL-01 | Trial 7 hari yang telah habis tidak dapat di-reset atau di-grant ulang melalui re-login atau re-bootstrap. | `tests/unit/bill01-entitlement-integrity-client.test.ts` | BILL01-17 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-ENT-05** | Authority Boundary | `firestore.rules`<br>`lib/billing/serverOwnedAccessFields.ts` | BILL-01 | Klien tidak memiliki hak mutasi langsung pada field akses server; manipulasi localStorage ditolak total. | `tests/unit/bill01-entitlement-integrity-client.test.ts` | BILL01-19 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |

---

## 10. GOOGLE PLAY VERIFICATION, RESTORE & FAILURE RESILIENCE (SPRINT BILL-02)

| Req ID | Scope | Source File | Sprint | Acceptance Criteria | Test File | Evidence | Status | Remaining Gap |
|---|---|---|---|---|---|---|---|---|
| **BILL-VERIF-01** | Subscription State Matrix | `services/billing-verifier/lib/entitlement.ts`<br>`api/billing/google-play/verify.ts` | BILL-02 | Verifier mengevaluasi seluruh state Google Play secara tepat: `ACTIVE`, `GRACE_PERIOD`, `CANCELED_PAID_THROUGH`, `EXPIRED`, `SUBSCRIPTION_INACTIVE`, `VOIDED`. | `services/billing-verifier/tests/unit/bill02-verifier-api-acceptance.test.ts` | VERIFIER 1-7 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-VERIF-02** | Asymmetric Signed Entitlement | `services/billing-verifier/lib/signedEntitlement.ts`<br>`api/billing/google-play/verify.ts` | BILL-02 | Signed entitlement (ES256 ECDSA) diterbitkan hanya setelah dokumen Firestore canonical berhasil ditulis. | `services/billing-verifier/tests/unit/bill02-verifier-api-acceptance.test.ts` | VERIFIER-01 PASS | **IMPLEMENTED & VERIFIED** | Rotasi key v2 bergantung pada konfigurasi environment. |
| **BILL-VERIF-03** | Deferred Acknowledgement | `api/billing/google-play/verify.ts` | BILL-02 | Kegagalan ACK ke Google Play menandai `acknowledgementDeferred = true` tanpa memblokir pemberian akses pengguna. | `services/billing-verifier/tests/unit/bill02-verifier-api-acceptance.test.ts` | VERIFIER-08 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-VERIF-04** | HTTP Contract Standard | `api/billing/google-play/verify.ts` | BILL-02 | Status code 400, 401, 403, 409, 500, 502, dan 504 dipetakan secara akurat dengan payload error non-sensitif. | `services/billing-verifier/tests/unit/bill02-verifier-api-acceptance.test.ts` | VERIFIER 9-14 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-RECON-01** | Cron Auth & Pagination | `api/billing/reconcile.ts` | BILL-02 | Cron reconcile mewajibkan header Bearer secret `CRON_SECRET` dan membatasi klaim batch maksimal 25 job per run. | `services/billing-verifier/tests/unit/bill02-verifier-api-acceptance.test.ts` | RECONCILE 15-17 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-RECON-02** | Reconcile Backoff & Dead Letter | `api/billing/reconcile.ts` | BILL-02 | Kegagalan reconcile dijadwalkan ulang dengan exponential backoff $2^{\text{attempt}}$ menit dan dialihkan ke `DEAD_LETTER` setelah 10 percobaan. | `services/billing-verifier/tests/unit/bill02-verifier-api-acceptance.test.ts` | RECONCILE 18-19 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-REST-01** | Restore Purchases Lifecycle | `lib/billing/premiumRecovery.ts`<br>`lib/billing/googlePlayBilling.ts` | BILL-02 | Skenario restore aktif, expired, tidak ada pembelian, conflict multi-UID, dan mixed tokens ditangani dengan state yang presisi. | `tests/unit/bill02-restore-and-client-lifecycle.test.ts` | BILL02-01 s/d 05 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-REST-02** | Concurrent Deduplication | `lib/billing/googlePlayBilling.ts` | BILL-02 | Pemanggilan restore berulang secara simultan dideduplikasi ke promise yang sama tanpa memicu query native duplikat. | `tests/unit/bill02-restore-and-client-lifecycle.test.ts` | BILL02-06 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-REST-03** | Auth Invariant Isolation | `lib/billing/googlePlayBilling.ts`<br>`lib/billing/premiumRecovery.ts` | BILL-02 | Logout atau pergantian UID di tengah proses restore memicu `AUTH_CHANGED` dan membuang respons demi keamanan akun baru. | `tests/unit/bill02-restore-and-client-lifecycle.test.ts` | BILL02-07, 08 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-BOUND-01** | Web Fail-Closed Boundary | `lib/billing/googlePlayBilling.ts` | BILL-02 | `isGooglePlayBillingAvailable()` mereturn `false` pada Web dan verifikasi signed entitlement offline ditolak total di Web. | `tests/unit/bill02-restore-and-client-lifecycle.test.ts` | CLIENT-01 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-BOUND-02** | SecureStorage UID Partitioning | `lib/billing/googlePlayBilling.ts` | BILL-02 | Token signed entitlement disimpan terpisah per UID (`signed_entitlement_${uid}`); logout user A tidak menyentuh user B. | `tests/unit/bill02-restore-and-client-lifecycle.test.ts` | CLIENT-02 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-BOUND-03** | Offline Signed Entitlement Local Verify | `lib/billing/googlePlayBilling.ts` | BILL-02 | Token offline diverifikasi secara kriptografis menggunakan public key ECDSA, menolak token expired saat online, dan fail-closed jika data korup. | `tests/unit/bill02-restore-and-client-lifecycle.test.ts` | CLIENT-03 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |

---

## 11. SUBSCRIPTION LIFECYCLE, EXPIRY, REFUND & RECONCILIATION INTEGRITY (SPRINT BILL-03)

| Req ID | Scope | Source File | Sprint | Acceptance Criteria | Test File | Evidence | Status | Remaining Gap |
|---|---|---|---|---|---|---|---|---|
| **BILL-LIFE-01** | Subscription Lifecycle Matrix | `services/billing-verifier/lib/entitlement.ts` | BILL-03 | Menangani 20 skenario transisi siklus langganan (renewal, cancellation, grace period, account hold, refund, pending, replacement, multi-token). | `services/billing-verifier/tests/unit/bill03-lifecycle-and-reconcile.test.ts` | BILL03-01..20 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-LIFE-02** | Active Token Authoritative Guard | `services/billing-verifier/lib/entitlement.ts` | BILL-03 | Field `activeTokenHash` memastikan hanya token aktif otoritatif yang dapat mencabut aksesnya sendiri saat void/refund, bukan token lain. | `services/billing-verifier/tests/unit/bill03-lifecycle-and-reconcile.test.ts` | BILL03-14, 15 PASS | **IMPLEMENTED & VERIFIED** | Fallback antar multi-token aktif memerlukan subcollection query. |
| **BILL-LIFE-03** | Refund & Revocation Correctness | `services/billing-verifier/lib/entitlement.ts` | BILL-03 | Pembelian aktif yang di-refund mencabut status Premium, namun tidak mencabut hak Founder, Lifetime, atau Tester Grant independen. | `services/billing-verifier/tests/unit/bill03-lifecycle-and-reconcile.test.ts` | BILL03-13, 16 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-AUTH-01** | Authority Hierarchy & Expiry Source | `lib/billing/entitlementService.ts` | BILL-03 | Expiry berasal dari data provider otoritatif server; Founder/Lifetime permanen; trial habis tidak dapat di-reset. | `tests/unit/bill03-authority-and-offline.test.ts` | AUTHORITY 1..7 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-AUTH-02** | Anti-Tampering Immunity | `lib/billing/serverOwnedAccessFields.ts` | BILL-03 | Client timestamp dan manipulasi LocalStorage tidak memiliki otoritas atas dokumen Firestore canonical. | `tests/unit/bill03-authority-and-offline.test.ts` | AUTHORITY 8..10 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-OFFLINE-01** | Offline Signed Entitlement & Grace | `lib/billing/googlePlayBilling.ts` | BILL-03 | Token ES256 P-256 diverifikasi secara lokal; masa offline dibatasi ketat maksimal 72 jam sejak `iat`; token expired ditolak saat online. | `tests/unit/bill03-authority-and-offline.test.ts` | OFFLINE 1..3, 5 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-OFFLINE-02** | Device Clock Rollback Immunity | `lib/billing/googlePlayBilling.ts` | BILL-03 | Token dengan `iat` di masa depan (akibat clock rollback) langsung ditolak secara fail-closed. | `tests/unit/bill03-authority-and-offline.test.ts` | OFFLINE 4 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-DUR-01** | Durable Acknowledgement Durability | `services/billing-verifier/lib/purchaseLedger.ts`<br>`api/billing/reconcile.ts` | BILL-03 | Skenario deferred ack dicatat secara durable di PostgreSQL `entitlement_sync_jobs`, di-retry idempoten, dan dead-lettered setelah 10 kegagalan. | `services/billing-verifier/tests/unit/bill03-lifecycle-and-reconcile.test.ts` | BILL03-21..30 PASS | **IMPLEMENTED & VERIFIED** | Penjadwal cron live deployment berstatus SCHEDULER NOT VERIFIED. |

---

## 12. CRITICAL ENTITLEMENT INTEGRITY CLOSURE (SPRINT BILL-03A)

| Req ID | Scope | Source File | Sprint | Acceptance Criteria | Test File | Evidence | Status | Remaining Gap |
|---|---|---|---|---|---|---|---|---|
| **BILL-CRIT-01** | Critical Refund Guard | `services/billing-verifier/lib/entitlement.ts` | BILL-03A | Refund pada token aktif dengan `date = null` atau `date < existingExpiry` serta akun legacy wajib mencabut status Premium secara seketika dan fail-closed, tanpa membiarkan akses aktif palsu. | `services/billing-verifier/tests/unit/bill03a-critical-integrity.test.ts` | A01..A08 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-CRIT-02** | Anti Last-Token-Wins | `services/billing-verifier/lib/entitlement.ts` | BILL-03A | `activeTokenHash` wajib merepresentasikan token yang memberikan masa berlaku efektif terlama, bukan semata-mata token terakhir yang diverifikasi. | `services/billing-verifier/tests/unit/bill03a-critical-integrity.test.ts` | B01..B06 PASS | **IMPLEMENTED & VERIFIED** | Multi-token fallback tercatat sebagai DESIGN BLOCKER. |
| **BILL-CRIT-03** | Acknowledgement Durability Edge Cases | `services/billing-verifier/lib/purchaseLedger.ts` | BILL-03A | Validasi kegagalan acknowledgement dengan status `[LEDGER_TX_DEGRADED]`, retensi job persisten saat worker crash, dan penanganan provider already acknowledged. | `services/billing-verifier/tests/unit/bill03a-ack-durability.test.ts` | C01..C08 PASS | **IMPLEMENTED & VERIFIED** | Worker scheduler tetap berstatus SCHEDULER NOT VERIFIED. |
| **BILL-CRIT-04** | Offline Safety & Anti-Tamper | `lib/billing/googlePlayBilling.ts` | BILL-03A | Deteksi clock rollback, clock skew 60 detik, batas grace 72 jam, penolakan token antar akun, dan kegagalan verifikasi kriptografis ECDSA fail-closed. | `tests/unit/bill03a-offline-safety.test.ts` | D01..D08 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |

---

## 13. MULTI-TOKEN FALLBACK & ACKNOWLEDGEMENT RECOVERY (SPRINT BILL-03B)

| Req ID | Scope | Source File | Sprint | Acceptance Criteria | Test File | Evidence | Status | Remaining Gap |
|---|---|---|---|---|---|---|---|---|
| **BILL-MT-01** | Server-Side Multi-Token Fallback | `services/billing-verifier/lib/entitlement.ts` | BILL-03B | Server wajib memulihkan hak akses pengguna ke token aktif alternatif yang sah saat token primer di-refund tanpa menunggu pengguna membuka aplikasi (MT-01, MT-10). | `services/billing-verifier/tests/unit/bill03b-multi-token-fallback.test.ts` | MT-01..MT-10 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-ACK-RECOV** | Acknowledgement Recovery Queue | `services/billing-verifier/lib/purchaseLedger.ts`<br>`api/billing/reconcile.ts` | BILL-03B | Verifikasi jalur antrean tahan banting (`entitlement_sync_jobs`), konfirmasi `MAX_ATTEMPTS = 10`, timeout lease 5 menit, transisi dead-letter, dan pemulihan operator. | `services/billing-verifier/tests/unit/bill03b-ack-recovery.test.ts` | ACK-01..ACK-10 PASS | **IMPLEMENTED & VERIFIED** | Scheduler live cron tetap berstatus SCHEDULER NOT VERIFIED. |
| **BILL-CLK-SAFE** | Offline Wall-Clock Tamper Resistance | `lib/billing/googlePlayBilling.ts` | BILL-03B | Verifikasi penolakan pemunduran jam perangkat, toleransi skew 60 detik, penegakan batas 72 jam waktu nyata, dan pembatalan offline grace saat reconnect online. | `tests/unit/bill03b-offline-clock-safety.test.ts` | CLK-01..CLK-08 PASS | **IMPLEMENTED & VERIFIED** | Memerlukan trusted network time sync untuk keamanan di luar batas 72 jam. |

---

## 14. FALLBACK SAFETY & TRANSACTION INTEGRITY (SPRINT BILL-03B.1)

| Req ID | Scope | Source File | Sprint | Acceptance Criteria | Test File | Evidence | Status | Remaining Gap |
|---|---|---|---|---|---|---|---|---|
| **BILL-MT-SAFE-01** | Transaction Read-Before-Write Invariant | `services/billing-verifier/lib/entitlement.ts` | BILL-03B.1 | Seluruh transaksi Firestore wajib mengeksekusi semua operasi read (`tokenSnap`, `userSnap`, `tokensQuery`) sebelum operasi penulisan pertama (`transaction.set`) sesuai kontrak Firestore Admin SDK. | `services/billing-verifier/tests/unit/bill03b1-fallback-safety.test.ts` | BF-01, BF-13, BF-15 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-MT-SAFE-02** | Query Failure & Timeout Fail-Safe Abort | `services/billing-verifier/lib/entitlement.ts` | BILL-03B.1 | Kegagalan pembacaan kueri registry atau timeout wajib membatalkan (ABORT) seluruh transaksi dan melempar error retryable; DILARANG menelan error secara diam-diam dan menurunkan dokumen `users/{uid}` ke FREE pada transient error. | `services/billing-verifier/tests/unit/bill03b1-fallback-safety.test.ts` | BF-02, BF-03, BF-12 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-MT-SAFE-03** | Alternative Token Registry Validation | `services/billing-verifier/lib/entitlement.ts` | BILL-03B.1 | Token alternatif dari registry diverifikasi secara ketat: wajib status aktif (`ACTIVE`, `GRACE_PERIOD`, `CANCELED_PAID_THROUGH`), tidak berstatus voided, masa berlaku di masa depan, dan menolak timestamp `lastVerifiedAt` atau `accessUntil` yang malformed. | `services/billing-verifier/tests/unit/bill03b1-fallback-safety.test.ts` | BF-04..BF-08 PASS | **IMPLEMENTED & VERIFIED** | Verifikasi live Google Play dibatasi policy decision window. |
| **BILL-MT-SAFE-04** | Concurrency & Rollback Atomicity | `services/billing-verifier/lib/entitlement.ts` | BILL-03B.1 | Skenario pembatalan konkuren antar-token, write failure, dan refund akun legacy terlindungi secara serial dan atomik tanpa menghasilkan status sukses palsu atau entitlement tak berdasar. | `services/billing-verifier/tests/unit/bill03b1-fallback-safety.test.ts` | BF-09, BF-10, BF-11, BF-14 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |

---

## 15. PREMIUM UI HARMONIZATION, PAYWALL CONSISTENCY & SAFE LEGACY CLEANUP (SPRINT BILL-04)

| Req ID | Scope | Source File | Sprint | Acceptance Criteria | Test File | Evidence | Status | Remaining Gap |
|---|---|---|---|---|---|---|---|---|
| **BILL-UI-01** | Dual-Display Presentation Mapper | `lib/billing/entitlementPresentation.ts` | BILL-04 | Memisahkan status komersial (`commercialStatus`) dari lencana komunitas (`communityBadge`); menyajikan kedua status (`isDualDisplay: true`) saat pengguna memegang langganan berbayar dan lencana tester secara bersamaan tanpa saling menimpa. | `tests/unit/bill04-ui-acceptance.test.ts`<br>`tests/unit/billing-entitlement-presentation.test.ts` | UI-01..10 PASS (10/10)<br>18/18 mapper tests PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-UI-02** | Google Play Live Pricing & Neutral Fallback | `app/premium-bhumi/page.tsx`<br>`app/upgrade/page.tsx` | BILL-04 | Harga selalu ditarik langsung dari Google Play melalui `queryPremiumSubscription()`; saat harga belum termuat, antarmuka menyajikan teks netral tanpa hardcoded harga otoritatif. | `tests/unit/bill04-ui-acceptance.test.ts`<br>`tests/unit/v5-08-premium-residual.test.ts` | UI-11, UI-12 PASS<br>46/46 residual tests PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-UI-03** | Web Platform Guard & Accessibility | `components/billing/CanonicalPremiumScreen.tsx` | BILL-04 | Lingkungan non-Android/web secara tegas menonaktifkan tombol pembelian/pemulihan dengan peringatan informatif; state pembayaran pending menyajikan alert ARIA (`aria-live="polite"`). | `tests/unit/bill04-ui-acceptance.test.ts` | UI-13, UI-14 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-UI-04** | Settings Normalization & Local Plan Cleanup | `app/settings/page.tsx` | BILL-04 | Halaman Settings mengonsumsi `getBillingPresentation(entitlement, originalProfile, testerRecord)`, menampilkan expiry dan badge komunitas, serta membersihkan penulisan `localStorage` plan authority. | `tests/unit/bill04-ui-acceptance.test.ts`<br>`tests/unit/build108-sprint07-settings-legal-paywall.test.ts` | UI-21 PASS<br>64/64 sprint07 tests PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |
| **BILL-UI-05** | Safe Legacy Cleanup | `lib/billing/billingPreparation.ts` | BILL-04 | Konstanta usang `TODO_PLAY_CONSOLE_...` diperbarui menjadi ID kanonikal dengan tag `@deprecated`; tidak ada referensi mati atau antarmuka usang yang diekspos ke runtime. | `tests/unit/bill04-ui-acceptance.test.ts` | UI-22, UI-25 PASS | **IMPLEMENTED & VERIFIED** | Tidak ada. |

---

## 16. PREMIUM UI REAL-BROWSER ACCEPTANCE (SPRINT BILL-04A)

| Req ID | Scope | Source File | Sprint | Acceptance Criteria | Test File | Evidence | Status | Remaining Gap |
|---|---|---|---|---|---|---|---|---|
| **BILL-E2E-01** | Real-Browser Commercial & Community Badge Presentation | `app/premium-bhumi/page.tsx`<br>`app/settings/page.tsx`<br>`app/upgrade/page.tsx` | BILL-04A | Validasi di Playwright Chromium untuk seluruh status Free, Trial aktif/habis, Paid aktif/batal/kedaluwarsa, Founder, Tester Grant (Inti/Alfa), dan Dual Display tanpa konflasi visual dan zero horizontal overflow. | `tests/qa/bill04a-browser-acceptance.ts` | UI-01..UI-10 PASS (10/10) | **VERIFIED (PASS LOCAL BROWSER)** | Pengujian perangkat fisik Android ditangguhkan. |
| **BILL-E2E-02** | Dynamic Bridge Pricing & Fallback in Browser | `app/premium-bhumi/page.tsx`<br>`app/upgrade/page.tsx` | BILL-04A | Harga terbukti dimuat dari bridge Google Play di browser riil; penanganan fallback netral saat bridge error tidak memunculkan harga palsu. | `tests/qa/bill04a-browser-acceptance.ts` | UI-11, UI-12 PASS | **VERIFIED (PASS LOCAL BROWSER)** | Tidak ada. |
| **BILL-E2E-03** | Web Environment Safety & Pending State | `app/premium-bhumi/page.tsx` | BILL-04A | Web browser biasa tanpa Capacitor bridge menonaktifkan pembelian secara aman; transaksi pending menampilkan aria-live notice tanpa false active access. | `tests/qa/bill04a-browser-acceptance.ts` | UI-13, UI-14 PASS | **VERIFIED (PASS LOCAL BROWSER)** | Tidak ada. |
| **BILL-E2E-04** | Purchase & Restore Lifecycle with Backend Verification | `lib/billing/googlePlayBilling.ts`<br>`app/premium-bhumi/page.tsx` | BILL-04A | Alur pembelian dan restore lengkap melalui verifikasi backend; penanganan restore sukses, restore tidak ditemukan, dan konflik kepemilikan 409 (zero leak). | `tests/qa/bill04a-browser-acceptance.ts` | UI-15..UI-19 PASS (5/5) | **VERIFIED (PASS LOCAL BROWSER)** | Integrasi Google Play Console live dibatasi policy sandbox. |
| **BILL-E2E-05** | Sesi Switching, Late Response Discard & In-Flight Dedup | `lib/billing/googlePlayBilling.ts`<br>`components/auth/AccessGuard.tsx` | BILL-04A | Pergantian akun membersihkan badge/expiry sesi lama; respon verifikasi lama dibuang (`AUTH_CHANGED`); klik berulang pada tombol beli dideduplikasi tepat 1 kali pemanggilan verifier; timeout/abort jaringan fail-closed. | `tests/qa/bill04a-browser-acceptance.ts` | UI-20..UI-25 PASS (6/6) | **VERIFIED (PASS LOCAL BROWSER)** | Tidak ada. |

---

## 17. ANDROID BILLING READINESS, CAPACITOR NATIVE CONTRACT & SAFE LOCAL BUILD (SPRINT BILL-05A)

| Req ID | Scope | Source File | Sprint | Acceptance Criteria | Test File | Evidence | Status | Remaining Gap |
|---|---|---|---|---|---|---|---|---|
| **BILL-NAT-01** | Toolchain & Dependency Reconciliation | `package.json`<br>`android/app/build.gradle`<br>`capacitor.config.ts` | BILL-05A | Verifikasi tepat versi Next.js 16.2.6, React 19.2.4, Capacitor 8.3.4, Play Billing 9.1.0, Gradle 9.4.1, AGP 9.2.1, JDK 17, SDK 36. | Toolchain checks | Java/Node environment verification | **AUDITED & VERIFIED** | Versi terekonsiliasi dari klaim historis canary. |
| **BILL-NAT-02** | Native Plugin & Bridge Contract | `android/app/src/main/java/.../BhumiBillingPlugin.java`<br>`MainActivity.java` | BILL-05A | Plugin Capacitor `BhumiBilling` terdaftar secara sah; metode `queryPremiumSubscription`, `purchasePremium`, `restorePurchases` terikat ke Google Play Billing Library 9.1.0 dengan `enablePendingPurchases` dan zero premature acknowledgement. | Code audit | Contract inspection & static analysis | **AUDITED & VERIFIED** | Uji runtime pada Google Play Store riil menunggu BILL-05B. |
| **BILL-NAT-03** | Human Design Static Export Blocker | `app/api/humandesign/bodygraph/route.ts`<br>`next.config.ts` | BILL-05A | Blocker static export (`output: 'export'`) pada route HTTP 410 diidentifikasi sebagai isu dual-mode build (mobile client assets vs serverless web deployment). Penyelesaian ditandai CROSS-WORKSTREAM APPROVAL REQUIRED. | Static export audit | Next.js build error characterization | **CHARACTERIZED / MITIGATION PROPOSED** | Menunggu persetujuan Founder sebelum file disentuh. |
| **BILL-NAT-04** | Android Debug Build Task & Google Services | `android/app/build.gradle`<br>`android/app/google-services.json` | BILL-05A | Blocker Gradle `:app:processDebugGoogleServices` teridentifikasi karena `applicationIdSuffix ".qa"` tidak memiliki client ID di `google-services.json`. | Gradle assemble audit | Gradle build log characterization | **CHARACTERIZED / REMEDY DOCUMENTED** | Pendaftaran client `.qa` atau assemble non-suffixed. |
| **BILL-NAT-05** | Native Acceptance Matrix (NATIVE-01..20) | Native Java / TS code & Gradle tools | BILL-05A | Evaluasi 20 skenario Android native: 10 skenario lulus audit kontrak statis, 10 skenario berstatus Open Gates karena keterbatasan build lokal / emulator. | Static analysis & local toolchain | Zero false claims of live execution | **EVALUATED (10 PASS / 10 GATES OPEN)** | Perangkat fisik & live Google Play ditangguhkan ke BILL-05B. |
| **BILL-NAT-06** | BILL-05B Test Plan Design | Test plan document | BILL-05A | Desain pengujian lisensi Google Play Internal Testing (9 skenario lisensi, exit criteria, monitoring, rollback, zero eksekusi langsung). | Architecture specification | Test plan section | **DESIGN COMPLETE** | Eksekusi diblokir hingga ada persetujuan Founder. |
