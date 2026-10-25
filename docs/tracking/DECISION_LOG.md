# BHUMI AMARTYA — ARCHITECTURE DECISION LOG (ADR)

**Document ID:** `ADR-LOG-001`  
**Workstream:** Phase 1 — Human Design Stabilization  
**Baseline Git Branch:** `hotfix/build110-indonesian-only`  
**Active HEAD:** `e63f334cf0ac20cc076bc88e98e3e06808b024f3`  
**Last Updated:** 20 Oktober 2026  
**Status:** ACTIVE REGISTER  

---

## ADR-01: Centralized Fail-Closed Firebase Auth untuk Endpoint HD
* **Tanggal Keputusan:** 18 Oktober 2026
* **Status:** **ACCEPTED & IMPLEMENTED** (Sprint HD-01)
* **Konteks:** Endpoint `/api/humandesign/calculate` dan `/api/humandesign/astrology` sebelumnya memiliki kerentanan verifikasi tidak terpusat dan risiko production bypass.
* **Keputusan:**
  1. Seluruh request wajib diverifikasi melalui modul terpusat `lib/auth/hdEndpointAuth.ts`.
  2. Menerapkan pendekatan fail-closed: jika token tidak ada, kedaluwarsa, atau berasal dari Firebase project berbeda, request langsung ditolak dengan HTTP 401 atau 403 sebelum mencapai logic bisnis atau backend Python.
  3. App Check token tidak boleh berdiri sendiri tanpa Auth token pengguna.
  4. Header bypass di-hardcode ditolak pada mode `production`.
* **Konsekuensi:** Keamanan endpoint tertutup rapat. Automated testing wajib menyertakan synthetic bearer token yang sah.

---

## ADR-02: Dekomisioning Endpoint Bodygraph (HTTP 410 Gone)
* **Tanggal Keputusan:** 18 Oktober 2026
* **Status:** **ACCEPTED & IMPLEMENTED** (Sprint HD-01)
* **Konteks:** Endpoint `app/api/humandesign/bodygraph/route.ts` merupakan rute legasi yang mengembalikan representasi SVG/struktur lama yang duplikatif dan tidak terstandarisasi.
* **Keputusan:** Menghentikan endpoint tersebut secara permanen dengan mereturn HTTP 410 Gone untuk seluruh caller. Seluruh rendering grafis dialihkan ke komponen React SVG berbasis data chart canonical terpadu.
* **Konsekuensi:** Mengeliminasi surface attack dan mencegah kebingungan data source di frontend.

---

## ADR-03: Penerimaan Struktural Core Completeness Terpisah dari Provenance
* **Tanggal Keputusan:** 18 Oktober 2026
* **Status:** **ACCEPTED & IMPLEMENTED** (Sprint HD-02)
* **Konteks:** Sebelumnya, chart dinyatakan lengkap hanya berdasarkan flag metadata (`calculationQuality === 'verified'`) atau provenance tertentu, yang menyebabkan payload kosong tetap dianggap ready jika metadatanya ada.
* **Keputusan:**
  1. Memisahkan evaluasi kelengkapan struktural inti (*core completeness*) dari status provenance.
  2. Chart hanya diakui lengkap jika memiliki Type, Profile, Authority, 9 Centers (boolean), Definition, Gates (array non-empty), Channels, dan Incarnation Cross.
  3. Tipe Reflector (semua 9 centers open, 0 channel aktif) diakui valid dan tidak diklasifikasikan sebagai chart korup.
  4. Ketiadaan data advanced enrichment (digestion, environment) tidak membatalkan core completeness.
* **Konsekuensi:** Menghilangkan bug "chart ready tetapi halaman detail kosong".

---

## ADR-04: Sidik Jari Input Lahir Deterministik (`bip_v1_<fnv1a32>`)
* **Tanggal Keputusan:** 18 Oktober 2026
* **Status:** **ACCEPTED & IMPLEMENTED** (Sprint HD-03)
* **Konteks:** Perubahan data lahir pengguna di Settings atau Setup berisiko menerima hasil kalkulasi yang tertunda dari input sebelumnya (stale calculation race condition).
* **Keputusan:**
  1. Membuat fungsi hash kanonikal `computeBirthInputFingerprint` yang menggabungkan: UID, tanggal lahir (YYYY-MM-DD), waktu lahir (HH:mm), kota lahir (lowercase), timezone, dan koordinat latitude/longitude yang dibulatkan ke 4 desimal.
  2. Format output: `bip_v1_<fnv1a32>`.
  3. Mengakui adanya hutang teknis (technical debt): FNV-1a 32-bit tidak sepenuhnya bebas tabrakan (collision-proof) pada skala sangat besar, namun memadai untuk kebutuhan Phase 1.
* **Konsekuensi:** Setiap perubahan input otomatis mengubah revision hash, memungkinkan pembatalan request kalkulasi usang.

---

## ADR-05: Pembatalan Transaksional Kalkulasi In-Flight saat Revisi Berubah
* **Tanggal Keputusan:** 18 Oktober 2026
* **Status:** **ACCEPTED & IMPLEMENTED** (Sprint HD-03 & HD-04)
* **Konteks:** Jika pengguna menekan koreksi data lahir saat kalkulasi sebelumnya masih berjalan di engine, response lama yang tiba belakangan dapat menimpa data baru di database.
* **Keputusan:**
  1. Menolak proses simpan jika revision hash hasil kalkulasi berbeda dengan revision hash data lahir aktif pengguna pada saat response tiba.
  2. Menerapkan transactional guard di `lib/repositories/blueprintRepository.ts` yang memeriksa `inputHash` sebelum melakukan commit tulis ke Firestore.
  3. Membatalkan penyimpanan jika pengguna telah logout (`active === false`).
* **Konsekuensi:** Integritas data terjamin bebas race condition saat pengguna mengedit data lahir berulang kali.

---

## ADR-06: Deadline Timeout Berlapis & Kebijakan Retry Terbatas
* **Tanggal Keputusan:** 18 Oktober 2026
* **Status:** **ACCEPTED & IMPLEMENTED** (Sprint HD-04)
* **Konteks:** Upstream service yang lambat atau tidak responsif menyebabkan infinite loading dan pemborosan resource client.
* **Keputusan:**
  1. Klien memiliki total deadline maksimal 25 detik (mencakup perolehan token, fetch, dan pembacaan body).
  2. Gateway Next.js proxy memiliki upstream deadline 15 detik ke backend Python.
  3. Retry hanya diizinkan untuk HTTP 429 (rate limit) dan 500 (transient server error) dengan batas maksimal retry bertahap.
  4. HTTP 400, 401, 403, dan 404 berstatus non-retryable fail-closed.
* **Konsekuensi:** Kegagalan jaringan terdeteksi secara dini dan dilaporkan secara jujur ke UI.

---

## ADR-07: In-Memory Session Cache Berdurasi 5 Menit (Tanpa LocalStorage Stale Leakage)
* **Tanggal Keputusan:** 18 Oktober 2026
* **Status:** **ACCEPTED & IMPLEMENTED** (Sprint HD-05)
* **Konteks:** Penggunaan LocalStorage untuk caching data chart berisiko kebocoran data antar-pengguna pada perangkat bersama (*shared device*) dan menyajikan data usang setelah data lahir diubah.
* **Keputusan:**
  1. Caching chart pada layer klien dibatasi hanya pada **memory (RAM)** dengan TTL 5 menit.
  2. Kunci cache mengikat triple: `uid + sessionId + revisionHash`.
  3. Tidak ada penulisan chart ke `localStorage` browser.
  4. Logout atau pergantian pengguna seketika membersihkan cache memori.
* **Konsekuensi:** Data antar akun terisolasi secara mutlak di sisi browser, namun reload penuh di web akan melakukan pembacaan ulang ke Firestore.

---

## ADR-08: Sandbox Playwright Browser Harness dengan Process-Level Network & Credential Guard
* **Tanggal Keputusan:** 19 Oktober 2026
* **Status:** **ACCEPTED & IMPLEMENTED** (Sprint HD-05C & HD-05D.1)
* **Konteks:** Pengujian browser otomatis berisiko secara tidak sengaja menghubungi layanan eksternal (Google APIs, Firebase live, Railway) atau membaca file kredensial produksi di disk lokal.
* **Keputusan:**
  1. Menerapkan interceptor proses Node.js di `tests/helpers/hd05cHarnessNetworkGuard.mjs`.
  2. Melarang seluruh resolusi DNS, socket TCP, TLS, dan HTTP request ke luar dari host `127.0.0.1` dan `localhost` pada port 3000, 3001, 3002, dan 18765.
  3. Mengintersepsi pemanggilan filesystem (`fs.readFileSync`, `fs.openSync`) dan melempar error fatal jika mencoba membaca file bertanda `.env`, `service-account`, `keystore`, atau `.pem`.
* **Konsekuensi:** Pengujian browser berjalan dalam ruang hampa lokal 100% aman tanpa risiko pencemaran data produksi atau kebocoran kredensial.

---

## ADR-09: Isolasi Ketat Modul Phase 1 (Human Design First)
* **Tanggal Keputusan:** 19 Oktober 2026
* **Status:** **ACCEPTED & ADOPTED** (Handover Mandate)
* **Konteks:** Proyek memiliki modul lain (Billing, Weton, BaZi, Vedic, Astrologi) yang memiliki kerentanan sumber atau integrasi yang belum diselesaikan.
* **Keputusan:**
  1. Melarang seluruh perubahan kode di luar modul Human Design selama Phase 1 berjalan.
  2. Billing (Phase 3) dan Blueprint lain (Phase 2) berada di bawah status *protected scope*.
  3. Founder Dashboard berada di repositori terpisah dan tidak boleh disentuh dari repositori ini.
* **Konsekuensi:** Fokus engineering terisolasi penuh pada stabilisasi Human Design hingga selesai.

---

## ADR-10: Konvensi Kerja Project Requirements Matrix (PRM)
* **Tanggal Keputusan:** 20 Oktober 2026
* **Status:** **ACCEPTED (PROPOSED CONVENTION)**
* **Konteks:** Tidak ditemukan dokumen atau singkatan resmi "PRM" di dalam repositori lama, namun pelacakan granular dibutuhkan untuk kesinambungan proyek.
* **Keputusan:**
  1. Mengadopsi nama *Project Requirements Matrix* (PRM) sebagai konvensi kerja operasional Antigravity.
  2. Memberi label eksplisit bahwa kepanjangan ini adalah usulan konvensi pelacakan, bukan deklarasi SoT historis yang telah disahkan sebelumnya.
  3. Memetakan seluruh requirement HD ke dalam dokumen `docs/requirements/PROJECT_REQUIREMENTS_MATRIX.md`.
* **Konsekuensi:** Proyek memiliki matriks pelacakan yang transparan tanpa mengaburkan riwayat dokumen asli.

---

## ADR-11: Token Ownership & Atomic Multi-Account Protection (Sprint BILL-01)
* **Tanggal Keputusan:** 21 Oktober 2026
* **Status:** **ACCEPTED & IMPLEMENTED** (Sprint BILL-01)
* **Konteks:** Terdapat risiko pembajakan token pembelian Google Play (replay/restore) antar-UID Firebase yang berbeda, yang dapat mentransfer akses Premium tanpa pembayaran sah.
* **Keputusan:**
  1. Mengikat token pembelian secara atomik pada `billing_purchase_tokens/${tokenHash}` di Firestore dengan mencatat `initial_owner_uid`.
  2. Jika UID yang berbeda mencoba melakukan verifikasi atau me-restore token yang sama, sistem langsung melempar `TOKEN_OWNERSHIP_CONFLICT` (HTTP 409).
  3. Dokumen `users/{uid}` akun baru tidak diubah dan akun lama tetap mempertahankan hak aksesnya.
* **Konsekuensi:** Token pembelian tidak dapat dipindahtangankan antar-akun secara ilegal.

---

## ADR-12: Multi-Token Lifecycle Invariant: Stale / Older Inactive Token Protection (Sprint BILL-02)
* **Tanggal Keputusan:** 21 Oktober 2026
* **Status:** **ACCEPTED & IMPLEMENTED** (Sprint BILL-02)
* **Konteks:** Seorang pengguna yang memiliki langganan aktif sah (misal s/d Desember 2026) dapat memiliki histori pembelian lama di Google Play (misal langganan Agustus 2026 yang expired atau di-refund/voided). Saat me-restore, token lama tersebut sebelumnya mencabut status Premium pengguna karena `isStaleOlderToken` mengecualikan status `VOIDED`.
* **Keputusan:**
  1. Memperbaiki logika `isStaleOlderToken` di `services/billing-verifier/lib/entitlement.ts` sehingga mengevaluasi kondisi:
     `!result.active && hasActiveFuturePaid && result.date && existingExpiry && result.date.getTime() < existingExpiry.getTime()`.
  2. Token yang tidak aktif yang bertanggal lebih lama dari tanggal kedaluwarsa aktif pengguna hanya mencatat histori ke `billing_purchase_tokens/${tokenHash}`, dan dilarang mengubah dokumen pengguna `users/{uid}`.
  3. Dokumen `users/{uid}` mempertahankan `isPremium: true` dan tanggal kedaluwarsa subscription yang lebih baru.
* **Konsekuensi:** Pengguna sah tidak pernah kehilangan hak akses Premium yang sedang berjalan akibat adanya token lama yang kedaluwarsa atau di-refund.

---

## ADR-13: Active Token Binding & Authoritative Downgrade Guard (Sprint BILL-03)
* **Tanggal Keputusan:** 21 Oktober 2026
* **Status:** **ACCEPTED & IMPLEMENTED** (Sprint BILL-03)
* **Konteks:** Dokumen `users/{uid}` sebelumnya tidak menyimpan referensi identitas token (`tokenHash`) yang saat ini menjadi penyedia aktif hak akses Premium. Hal ini menimbulkan risiko di mana token apa pun yang berstatus non-aktif tanpa tanggal atau dengan tanggal masa depan dapat mendowngrade hak akses langganan aktif yang sah.
* **Keputusan:**
  1. Menambahkan field `activeTokenHash` pada dokumen `users/{uid}` saat status Premium aktif diberikan atau diperpanjang.
  2. Memperluas kriteria `isStaleOlderToken` agar memblokir downgrade jika:
     - Token yang diverifikasi bukan merupakan token aktif otoritatif (`existing.activeTokenHash !== hash`), ATAU
     - Token yang diverifikasi tidak memiliki informasi tanggal masa aktif (`!result.date`), ATAU
     - Tanggal masa aktif token lebih lampau dibandingkan langganan aktif saat ini (`result.date < existingExpiry`).
  3. Mempertahankan hak refund/revocation di mana token yang memang merupakan `activeTokenHash` dapat mencabut hak aksesnya sendiri secara sah.
* **Konsekuensi:** Mencegah penurunan status Premium oleh token yang tidak sah atau tidak relevan, sambil mempertahankan kemampuan sistem untuk me-revoke pembelian yang di-refund.
