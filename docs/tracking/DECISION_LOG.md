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

---

## ADR-DASH-02: Arsitektur Personal Weekly Cosmic & Soul Guidance (Build 118)
* **Tanggal Keputusan:** 28 Oktober 2026
* **Status:** **ACCEPTED & IMPLEMENTED** (Sprint DASH-WEEKLY-01)
* **Konteks:** 
  1. Build 117 telah dirilis ke Google Play Store (`versionCode 117`, `versionName "5.0.17"`). Seluruh pengembangan Panduan Minggu Ini baru dialokasikan ke **Build 118** (`versionCode 118`, `versionName "5.0.18"`).
  2. Audit mendalam menemukan implementasi lama menggunakan bahasa bersyarat generik (*"Jika transit Pluto menyentuh..."*), formula minggu cacat yang menyebabkan tabrakan key ISO week (menggunakan hari dalam bulan `(day+6)/7`), typo karakter Cina (`jangan等到`), re-render loop akibat dependensi `appNow` 30 detik, serta potensi kebocoran data saat pergantian akun (UID switch).
* **Keputusan Arsitektur:**
  1. **Kalkulasi Kalender ISO-8601:** Menggunakan Luxon `dt.weekNumber` dan `dt.weekYear` untuk membentuk key `YYYY-'W'WW` yang deterministik, dengan rentang awal minggu Senin 00:00:00 dan akhir minggu Minggu 23:59:59.999 sesuai timezone pengguna (fallback `Asia/Jakarta`).
  2. **Kondisi Langit Kolektif Otoritatif:** Menghitung fase Bulan dan iluminasi trigonometrik closed-form dari SwissEph / astronomy-engine, kecepatan gerak 8 planet, status retrograde/direct, serta peristiwa diskrit ingress dan station yang terjadi dalam minggu berjalan.
  3. **Kalkulasi Aspek Transit-to-Natal Presisi:** Menghitung aspek nyata (Conjunction, Sextile, Square, Trine, Opposition) terhadap posisi natal pengguna (Sun, Moon, Ascendant, Mercury s/d Pluto) dengan batas orb ketat $\le 5.0^\circ$, klasifikasi fase (*applying*, *exact*, *separating*), dan kalkulasi estimasi waktu eksak.
  4. **Ekstraksi Rumah Placidus Nyata:** Menggunakan 12 cusp Placidus natal pengguna dari Canonical Blueprint untuk memetakan rumah transit dan rumah natal yang tersentuh secara presisi.
  5. **Sintesis 8 Domain Kehidupan:** Menghasilkan pembacaan tegas untuk 8 domain dengan rincian bukti astrologis spesifik (planet, tanda, derajat, rumah Placidus, aspek, orb, fase), makna astrologis, makna spiritual/perjalanan batin, pendalaman Canonical Blueprint (Life Path 1-9/11/22/33, Human Design type & authority, Arcana), dan Saran Bhumi konkret.
  6. **Prinsip Kejujuran Kosmik (Calm/Neutral Fallback):** Jika suatu domain tidak memiliki aspek transit aktif, sistem memberikan panduan tenang dan stabil tanpa mengarang transit palsu.
  7. **Redesain UI Dashboard & Tab Selector:** Menggantikan tampilan monolitik panjang di `WeeklyGuidanceCard.tsx` dengan horizontal pill tab selector interaktif 8 domain, serta menambahkan kartu ringkasan kosmik mingguan (*Weekly Cosmic Summary*) di `DashboardClient.tsx`.
  8. **Pembersihan Cacat Tipografi & State Leak:** Mengeliminasi karakter asing `jangan等到`, memastikan bahasa Indonesia baku, dan menyetel `setWeeklyGuidance(null)` saat UID berganti.
  9. **Optimalisasi Siklus Render:** Menghapus `appNow` dari dependency array `buildWeeklyGuidance`, mencegah kalkulasi ulang setiap 30 detik.
  10. **Tata Kelola Rilis:** Seluruh build APK/AAB dan publikasi Play Store tetap berstatus **BLOCKED** menunggu peninjauan dan persetujuan Founder.
* **Konsekuensi:** Fitur Panduan Minggu Ini menjadi 100% personal, berbasis data astronomi dan natal nyata pengguna, responsif di perangkat mobile, dan bersih dari regresi teknis.

---

## ADR-DASH-03: Redesain UI Vertikal Accordion 8 Domain Panduan Minggu Ini (Build 118)
* **Tanggal Keputusan:** 28 Oktober 2026
* **Status:** **ACCEPTED & IMPLEMENTED** (Sprint DASH-WEEKLY-02)
* **Konteks:** 
  1. Horizontal pill selector sebelumnya mengharuskan pengguna menggeser tab ke samping pada perangkat mobile, menyebabkan label domain terpotong dan navigasi kurang intuitif.
  2. Ringkasan 3 domain di atas belum terkoneksi langsung untuk membuka detail domain terkait di dalam kartu panduan mingguan.
* **Keputusan Arsitektur:**
  1. **Hapus Navigasi Horizontal:** Menghapus horizontal pill scroll bar di `WeeklyGuidanceCard.tsx`.
  2. **8 Kartu Vertikal Full Width (Accordion Stack):** Mengganti UI 8 domain menjadi kartu vertikal penuh satu baris per domain dengan ikon tematik, judul lengkap tanpa terpotong, ringkasan personal 1–2 baris, status aktivasi transit, dan chevron toggle.
  3. **Aksesibilitas & Semantic Markup:** Menyediakan atribut ARIA lengkap (`aria-expanded`, `aria-controls`), anchor unik `id="weekly-domain-{sec.key}"`, dan region role untuk panel detail.
  4. **Koneksi Interaktif 3 Kartu Ringkasan:** Menghubungkan klik pada 3 kartu domain highlight di `DashboardClient.tsx` agar otomatis membuka accordion domain yang dituju dan melakukan scroll halus (*smooth scroll*).
* **Konsekuensi:** Navigasi 8 domain di perangkat mobile menjadi lancar, teks tidak terpotong, dan keterhubungan antara ringkasan dan detail kartu terjalin utuh.

---

## ADR-DASH-04: Canonical Cross-System Synthesis & Humanized Spiritual Narrative (Build 118)
* **Tanggal Keputusan:** 28 Oktober 2026
* **Status:** **ACCEPTED & IMPLEMENTED** (Sprint DASH-WEEKLY-02)
* **Konteks:**
  1. Teks Panduan Minggu Ini sebelumnya masih terasa kaku dan mekanis akibat template AI ("Awal pekan dimulai dengan kesadaran penuh...", "Arus keuangan terhubung dengan rumah...", "Kosmos mengarahkan kita...").
  2. Muncul kalimat canggung seperti *"rumah ke-9 dan rumah ke-9"* ketika planet transit dan natal berada di rumah yang sama.
  3. Detail indikator Canonical Blueprint (Love Line, Money Line, Karmic Tail, Arcana Tahunan, Human Design Centers & Not-Self) belum teranyam secara organik ke dalam narasi utama.
* **Keputusan Arsitektur:**
  1. **Ekstraksi Blueprint Kanonikal Penuh:** Fungsi `extractFullCanonicalBlueprint()` mengekstrak data dari seluruh sistem terintegrasi: Numerologi (Life Path & peran, Personal Year, Expression, Soul Urge), Human Design (Tipe, Otoritas, Profil, Defined/Open Centers, Not-Self theme, Signature), Destiny Matrix (Pusat Arcana, Love Line 3 arcana, Money Line 3 arcana, Karmic Tail 3 arcana, Arcana Tahunan, Talenta), BaZi (Day Master elemen, polaritas, pinyin), Vedic (Nakshatra, Nakshatra Lord, Moon Sign), Weton (Hari-Pasaran, Neptu, Wuku, Pancasuda), dan Tzolkin (Kin, Solar Seal, Galactic Tone).
  2. **Bahasa Spiritual yang Mengalir & Manusiawi:** Menghapus seluruh formula AI klise. Bahasa Bhumi diposisikan sebagai pendamping spiritual yang hangat, peka tema shadow work, karma, dan pertumbuhan batin tanpa gaya menggurui.
  3. **Detail Kanonikal Eksplisit:** Angka arcana nyata (misal Love Line 6-12-18, Money Line 3-7-10, Karmic Tail 18-6-15) serta penempatan Human Design dianyam langsung di paragraf narasi, bukan disembunyikan.
  4. **Format Rumah Placidus Bersih:** Memperkenalkan `formatHousePair(tHouse, nHouse)` sehingga jika transit dan natal di rumah yang sama, keluar *"rumah ke-X Placidus"* (tunggal), bukan duplikasi *"rumah ke-X dan rumah ke-X"*.
  5. **Laci Bukti Teknis ("Dasar Pembacaan"):** Menambahkan laci ekspansif `<details>` di setiap kartu domain yang memaparkan transparansi indikator sistem (planet transit, derajat, rumah, aspek, orb, fase, arcana, center HD).
* **Konsekuensi:** Pembacaan menjadi autentik, mendalam, manusiawi, dan sepenuhnya transparan tanpa mengurangi presisi astronomi.

---

## ADR-DASH-05: Integritas Data Love Path Destiny Matrix & Personalisasi Status Hubungan Asmara (Build 118)
* **Tanggal Keputusan:** 28 Oktober 2026
* **Status:** **ACCEPTED & IMPLEMENTED** (Sprint DASH-WEEKLY-03)
* **Konteks:**
  1. Founder menemukan ketidaksesuaian kritis pada akun yang sama: halaman Destiny Matrix menampilkan Love Path `7–10–21`, sedangkan Panduan Minggu Ini menampilkan arcana `8–10–7` dengan narasi template generik ("pola pengorbanan sepihak atau keterikatan yang dipicu oleh rasa takut kehilangan").
  2. Investigasi akar masalah menemukan bahwa legacy mapper di `lib/calculations/destinyMatrix/mapToBlueprint.ts` memetakan `loveLine: [result.points.epoint, result.points.kpoint, result.points.lpoint]`. Untuk tanggal lahir Founder 1985-05-03: `epoint` = 8 (Pusat Arcana BM05), `kpoint` = 10 (BM21), `lpoint` = 7 (BM20). Hal ini secara keliru menyelipkan Arcana Pusat di awal dan menghilangkan simpul akhir BM10 (Arcana 21), menghasilkan `[8, 10, 7]`.
  3. Sumber kebenaran kanonikal (`lib/destiny-matrix/topology.ts`) mendefinisikan `LOVE_PATH` melalui simpul `["BM20", "BM21", "BM10"]`. Untuk 1985-05-03, nilai kanonikalnya adalah `[7, 10, 21]` (7 The Chariot, 10 Wheel of Fortune, 21 The World). "Love Path" dan "Love Line" merujuk pada simpul relasi yang persis sama.
  4. Founder juga menginstruksikan personalisasi domain **Asmara & Percintaan** berbasis status hubungan pengguna (`single` / lajang vs `in_relationship` / berpasangan vs `unspecified`), tanpa menebak status dari bagan astrologi atau Love Path, serta tanpa janji palsu atau tuduhan selingkuh/putus.
* **Keputusan Arsitektur:**
  1. **Rekonsiliasi Sumber Kanonikal:** `lib/calculations/destinyMatrix/mapToBlueprint.ts` dialihkan sepenuhnya untuk memanggil `calculateCanonicalDestinyMatrixBlueprint()`, menjamin `loveLine: visual.love.values` yang kanonikal (`[7, 10, 21]`).
  2. **Hydration & Self-Healing Guard:** Di `weeklyGuidanceEngine.ts` (`extractFullCanonicalBlueprint`) dan `DashboardClient.tsx`, jika blueprint tersimpan memiliki pola bug legacy (`loveLine[0] === dmCenter` dengan length 3), sistem secara otomatis merehidrasi data kanonikal dari `calculateCanonicalDestinyMatrixBlueprint(birthDate)` tanpa merusak field lainnya.
  3. **Interpretasi Dinamis Berbasis Kamus Arcana:** Mengeliminasi hardcode "pengorbanan sepihak". Fungsi `interpretLovePathArcana()` kini mengekstraksi tema nyata dari `destinyMatrixArcanaDictionary`:
     - Untuk `7–10–21`: Arcana 7 (arah bersama & kepemimpinan relasi), Arcana 10 (keluwesan menerima siklus hidup tanpa fatalisme), Arcana 21 (keterbukaan jiwa menuju keutuhan tanpa sekat sempit).
     - Untuk `6–12–18`: Arcana 6 (pilihan hati murni), Arcana 12 (welas asih tanpa pengorbanan sepihak), Arcana 18 (kejujuran menembus ilusi masa lalu).
  4. **Personalisasi Status Hubungan (Single vs Berpasangan vs Netral):**
     - Helper `extractRelationshipStatus()` membaca dari `profile.relationshipStatus`, `profile.statusHubungan`, atau `profile.settings.relationshipStatus`, defaulting ke `"unspecified"`.
     - `single`: Membedah kesiapan batin, pola memilih pasangan, kebutuhan emosional, batasan sehat, dan shadow work; tanpa janji pasangan baru tiba minggu ini.
     - `in_relationship`: Membedah komunikasi dengan pasangan, penyelarasan kebutuhan, keintiman, komitmen, dan penyelesaian konflik dewasa; tanpa tuduhan selingkuh atau ramalan perceraian.
     - `unspecified`: Narasi universal yang meneduhkan dan relevan bagi kedua fase.
     - Selektor UI 3 opsi ("Single", "Berpasangan", "Tidak ingin menyebutkan") ditambahkan pada Settings Data Diri di `app/settings/page.tsx` dan disimpan ke `UserProfile` via `userRepository` / `storageProvider`.
  5. **Verifikasi & Governan:** Seluruh 187 pengujian unit Build 118 lulus (`187 PASSED, 0 FAILED` across 15 sections), 24 tes rekonsiliasi versi lulus, `tsc --noEmit` exit code 0, dan local dev server HTTP 200.
* **Konsekuensi:** Inkonsistensi data Love Path terselesaikan tuntas, narasi asmara sepenuhnya dinamis sesuai angka arcana dan status hubungan pengguna, dengan integritas data 100%.

---

## ADR-DASH-06: Skoring Aktivasi Proporsional, Eliminasi Duplikasi Saran Bhumi & Dinamika Astronomis (Build 118)
* **Tanggal Keputusan:** 28 Oktober 2026
* **Status:** **ACCEPTED & IMPLEMENTED** (Sprint DASH-WEEKLY-04)
* **Konteks:**
  1. Founder menemukan bahwa hampir seluruh 8 domain kehidupan menampilkan lencana "Aktivasi Kuat" tanpa diferensiasi proporsional.
  2. Saran Bhumi muncul berulang pada tiga tempat berbeda: highlight 3 domain di atas, preview ringkasan header kartu accordion, dan kotak Saran Bhumi di dalam kartu yang terbuka.
  3. Dinamika Awal, Tengah, dan Akhir Pekan terasa seperti template statis alih-alih mencerminkan peristiwa astronomis aktual.
  4. Sintesis Destiny Matrix pada Ekor Karma hanya mendeskripsikan arcana satu per satu tanpa menjelaskan interaksi antar ketiga arcana (misal 21–7–13).
  5. Pergerakan cepat Bulan (melintasi 3–4 rumah Placidus dalam sepekan) sebelumnya dapat disalahpahami seolah-olah Bulan berada di banyak rumah sekaligus pada waktu yang sama.
* **Keputusan Arsitektur:**
  1. **Skoring Aktivasi Proporsional Bertingkat (`scoreAspectForDomain`):**
     - Setiap transit dinilai kecocokannya terhadap domain berdasarkan rumah utama (+14/9/8), planet utama (+8/5), kekencangan aspek (+7/5/3/1), dan luminary Sun/Moon (+3).
     - Ambang batas: Skor >= 24 & Orb <= 2.2° -> "Aktivasi Kuat" (`high`); Skor >= 14 -> "Aktivasi Sedang" (`medium`); Skor < 14 -> "Ritme Tenang" (`subtle`).
     - Hasil: Distribusi yang realistis dan jujur (misal 1 Kuat, 6 Sedang, 1 Ritme Tenang), domain tanpa transit tegang tidak lagi dipaksakan menjadi Kuat.
  2. **Eliminasi Total Duplikasi Teks via Field `summary`:**
     - Menambahkan field kanonikal `summary: string;` pada `WeeklyGuidanceSection`.
     - Header kartu accordion dan kartu highlight dashboard kini menampilkan `summary` (ringkasan eksekutif 1 kalimat khusus).
     - Kotak Saran Bhumi di dalam kartu tetap fokus pada arahan aksi praktis (`advice[0]`).
  3. **Dinamika Pekan Berbasis Waktu Puncak Astronomis (`buildDynamicPhases`):**
     - Tanggal puncak aspek eksak (`exactDate`): Senin–Rabu memicu kulminasi di Awal Pekan; Kamis–Jumat di Tengah Pekan; Sabtu–Minggu di Akhir Pekan.
     - Aspek yang menjauh (`separating`) diposisikan sebagai fase melandai dan pemulihan energi.
     - Aspek tenang (`subtle`) disajikan dalam ritme harian yang stabil tanpa fluktuasi dramatis buatan.
  4. **Sintesis Multi-Arcana Mendalam pada Ekor Karma & Love Path:**
     - Fungsi `interpretKarmicTail` kini membedah dinamika interaksi ketiga arcana (misal 21–7–13: batas keterikatan 21, dorongan kontrol ego 7, dan transformasi radikal 13; serta 18–6–15 dan 15–20–5).
     - Love Path 7–10–21 dan kombinasi lainnya memadukan arketipe arcana dengan status hubungan (single / berpasangan / unspecified).
  5. **14 Sub-Interval Zero-Crossing & Pemisahan Traversal Bulan:**
     - Algoritma `calculateTransitToNatalAspects` menggunakan 14 sub-interval setengah harian dengan biseksi sub-menit untuk mendeteksi titik potong nol sudut aspek.
     - Timestamp eksak hanya dimunculkan jika puncak benar-benar jatuh pada minggu berjalan, transparan dengan label "sekitar ... WIB".
     - Traversal cepat Bulan secara eksplisit dibedakan antara rentang jelajah mingguan (`melintasi rumah ke-X hingga ke-Y Placidus`) dengan posisi snapshot tengah pekan (`posisi tengah pekan di rumah ke-Z Placidus`).
  6. **Verifikasi Menyeluruh:**
     - Test suite diperluas menjadi 231 checks PASS LOCAL.
     - Typecheck repository-wide `npx tsc --noEmit` exit 0.
     - Local dev server HTTP 200.
* **Konsekuensi:** Akurasi astronomis mencapai presisi tinggi, tidak ada lagi duplikasi teks visual, distribusi intensitas menjadi proporsional dan jujur, serta narasi spiritual mendalam dan memberdayakan.

---

## ADR-DASH-07: Final Penerimaan Panduan Minggu Ini, Pembekuan Scope & Idempotensi Analytics Localhost (Build 118)
* **Tanggal Keputusan:** 28 Oktober 2026
* **Status:** **ACCEPTED & CLOSED / FROZEN** (Sprint DASH-WEEKLY-05)
* **Konteks:**
  1. Sprint final acceptance bertujuan mengaudit secara ketat 8 domain kehidupan, memastikan tidak ada overengineering atau penambahan fitur, membekukan scope Panduan Minggu Ini, dan menyiapkan prioritas modul berikutnya bagi Founder.
  2. Siklus temporal Destiny Matrix (Arcana Tahunan) dalam engine sebelumnya menggunakan aproksimasi modular sederhana `((baseCenter + age) % 22) || 22`.
  3. Muncul error `Document already exists` (status 6 ALREADY_EXISTS) saat menjalankan localhost:3000 pada koleksi `analytics`.
* **Keputusan Arsitektur:**
  1. **Penyelarasan Kanonikal Arcana Tahunan:**
     - Mengintegrasikan fungsi otoritatif `resolveDestinyMatrixArcanaAtAge(canonicalMatrix, age)` dari `lib/destiny-matrix/annualArcana.ts` berbasis simpul graf kanonikal `BM01`–`BM22`.
     - Menghilangkan asumsi modular; kalkulasi temporal kini 100% konsisten dengan visualisasi Destiny Matrix.
  2. **Idempotensi & Deduplikasi Telemetri Analytics Localhost:**
     - Menambahkan jendela deduplikasi in-memory 3000ms pada `lib/analytics/usageAnalytics.ts` untuk meredam pemanggilan siklus hidup ganda (React StrictMode / Fast Refresh).
     - Menjadikan error code 6 (`ALREADY_EXISTS`) pada `lib/repositories/analyticsRepository.ts` sebagai pengakuan idempoten aman (soft warning) alih-alih melempar unhandled exception.
     - Mendokumentasikan status koneksi langsung dev-to-prod Firestore sebagai risiko terbuka residual (OPEN RESIDUAL RISK) tanpa mengklaimnya tuntas sebelum emulator terisolasi dikonfigurasi.
  3. **Acceptance Asmara 3 Kondisi:**
     - Memverifikasi secara deterministik bahwa satu chart sintetis yang sama (1985-05-03 Scorpio Rising) menghasilkan 3 narasi, refleksi kosmik, dan Saran Bhumi yang berbeda tajam antara `single`, `in_relationship`, dan `unspecified` tanpa memutasi data kelahiran atau mengarang data pasangan.
  4. **Pembekuan Scope Fitur (Feature Freeze):**
     - Seluruh acceptance criteria Weekly Guidance Build 118 terpenuhi (440 checks PASS across all suites, zero type errors, localhost HTTP 200).
     - Fitur Panduan Minggu Ini resmi dibekukan (**WEEKLY GUIDANCE BUILD 118 — CLOSED / FROZEN**). Tidak ada perubahan kode lebih lanjut.
* **Konsekuensi:** Seluruh pipeline kalkulasi dan narasi Panduan Minggu Ini terbukti valid secara teknis dan spiritual, stabil di localhost, dan siap diserahkan kepada Founder untuk persetujuan rilis.

---

## ADR-PROFILE-01: Arsitektur 2-Lapisan, Kalkulasi Astronomis Riil & Sintesis Lintas Sistem Catatan Hari Ini (Profile Page) (Build 118)
* **Tanggal Keputusan:** 28 Oktober 2026
* **Status:** **ACCEPTED (PASS LOCAL - PENDING FOUNDER REVIEW)** (Sprint PROFILE-DAILY-01)
* **Konteks:**
  1. Audit read-only terhadap fitur "Catatan Hari Ini" pada halaman Profil (`app/profile/page.tsx`) menemukan bahwa implementasi lama (`lib/dailyGuidance/profileDailySynthesis.ts` dan `DailyNoteV2.tsx`) berbasis template acak hash tanggal (`dayNumber % 5` dan `pick(values, hash(seed) % items.length)`) tanpa kalkulasi ephemeris riil.
  2. Implementasi lama merender 8 kartu `<IntelligenceCard>` yang selalu terbuka secara bersamaan, menciptakan "wall of cards" yang membebani pengguna mobile (>3000px vertical scroll).
  3. 88% data Blueprint Kanonikal pengguna (Destiny Matrix Love Line, Ekor Karma, Human Design Type/Authority/Profile/Not-Self, Life Path, BaZi) menjadi data yatim (orphan data) yang tidak dikonsumsi.
* **Keputusan Arsitektur:**
  1. **Engine Deterministik Terisolasi (`lib/dailyGuidance/dailySoulJournalEngine.ts`):**
     - Mengembangkan engine baru murni TypeScript tanpa memodifikasi engine Weekly Guidance (yang tetap FROZEN).
     - Mengintegrasikan cuaca kosmik harian riil dari SwissEph / Astronomy engine (`buildDailyAstroSynthesis`): Matahari, Bulan (zodiak, derajat menit, iluminasi %, fase Bulan), dan gerak retrograde/stasioner planet.
     - Mengevaluasi transit harian personal terhadap natal chart Placidus (Conjunction, Sextile, Square, Trine, Opposition dengan orb <= 5.5°, status applying/exact/separating, aktivasi rumah 1..12).
     - Mengintegrasikan Blueprint Kanonikal secara eksplisit: Love Path (7–10–21), Ekor Karma (21–7–13), Center Arcana, Human Design Type & Authority, Life Path, Personal Year, BaZi Day Master, dan Weton kelahiran vs harian.
  2. **Arsitektur Antarmuka 2-Lapisan (`components/profile/DailySoulJournalCard.tsx`):**
     - **Lapisan 1 (Daily Card - Ringkas ~180-220px):** Menampilkan tanggal & Weton harian, headline personal, 1–2 kalimat rangkuman energi inti, 2–3 micro-badges (Bulan, Transit, Kanonikal), dan tombol toggle elegan "Buka/Tutup Pembacaan Lengkap".
     - **Lapisan 2 (Daily Deep Reading - Expandable):** 7 bagian terstruktur yang muncul dengan transisi halus saat dibuka:
       - Bagian A: Langit Hari Ini (cuaca kosmik riil, posisi Matahari & Bulan, dinamika planet).
       - Bagian B: Yang Sedang Bergerak Dalam Dirimu (transit personal, aspek, orb, rumah Placidus aktif, makna psikologis).
       - Bagian C: Pesan Jiwa Hari Ini (sintesis kanonikal Life Path, HD, Love Path 7–10–21, Center, BaZi, Weton).
       - Bagian D: Yang Perlu Kamu Sadari (shadow work, Ekor Karma 21–7–13, Not-Self warning, batas energi).
       - Bagian E: Ruang yang Terbuka (peluang konkret, ritme Weton pasaran harian, frekuensi Kin Tzolkin).
       - Bagian F: Saran Bhumi (tepat SATU saran praktis membumi, pertanyaan refleksi hening; zero saran triplikasi).
       - Bagian G: Dasar Pembacaan (`<details>` dropdown transparansi teknis derajat, orb, aspek, dan angka cetak biru).
  3. **Integrasi Permukaan Halaman Profil (`app/profile/page.tsx`):**
     - Menghubungkan pemuatan `buildDailySoulJournal()` saat profil & blueprint siap.
     - Merender `DailySoulJournalCard` pada posisi utama, membungkus `DailyNoteV2` dalam container tersembunyi untuk menjaga kompatibilitas kontrak legacy.
  4. **Kualitas Bahasa Spiritual & Eliminasi Klise AI:**
     - Menerapkan fungsi filter `sanitizeHumanizedText()` dengan blacklist frasa klise AI ("awal pekan dimulai...", "kosmos mengajakmu...", "perjalanan jiwamu...", "setiap transit adalah cermin...", dll.).
  5. **Verifikasi Otomatis Komprehensif:**
     - Test suite `tests/unit/build118-daily-guidance.test.ts` (76/76 checks PASS LOCAL).
     - Typecheck repository-wide `npx tsc --noEmit` exit 0.
     - Next.js dev server localhost:3000/profile HTTP 200.
* **Konsekuensi:** Catatan Hari Ini kini menyajikan bacaan harian yang akurat secara astronomis, kaya akan data personal kanonikal, intim dan mendalam secara spiritual, efisien secara UX mobile, serta mempertahankan stabilitas sistem secara menyeluruh. Status rilis tetap dibatasi menunggu Founder review.

---

## ADR-PROFILE-02: Paritas Format Panduan Minggu Ini (8 Domain Accordion) & Pengayaan Siklus Temporal Harian (Astro Hari Ini, BaZi Day Ren, Weton, Tzolkin) pada Catatan Hari Ini (Build 118)
* **Tanggal Keputusan:** 28 Oktober 2026
* **Status:** **ACCEPTED & IMPLEMENTED (PASS LOCAL - PENDING FOUNDER REVIEW)** (Sprint PROFILE-DAILY-02)
* **Konteks:**
  1. Founder mengeluarkan arahan tegas bahwa Catatan Hari Ini di halaman Profil **HARUS MENGGUNAKAN KONSEP, FORMAT, STRUKTUR PEMBACAAN, DESAIN, DAN METODE YANG SAMA PERSIS DENGAN PANDUAN MINGGU INI** (8 domain accordion vertikal). Desain 7-bagian Daily Soul Journal dibatalkan/ditimpa secara eksplisit.
  2. Founder juga menambahkan addendum: pembacaan harian harus **LEBIH KAYA DARI SISI SIKLUS TEMPORAL HARIAN** dengan memanfaatkan kalkulasi temporal yang sudah tersedia di "Astro Hari Ini" tanpa menghitung ulang dari nol:
     - Posisi dan fase Bulan SwissEph (zodiak, derajat menit, iluminasi %, fase).
     - Transit aktual dan kontak aspek terhadap natal Placidus (dengan perhitungan akar sub-menit eksak).
     - Weton Jawa hari ini (hari, pasaran, neptu, wuku).
     - Hari dan elemen dalam sistem BaZi, termasuk pendeteksian eksplisit **Day Ren** (壬, Air Yang) pada tanggal terkait (misalnya 26 Okt 2026: Ren Shen) dan relasi Shishen terhadap Day Master natal.
     - Tzolkin Maya hari ini (Kin, nama Kin, Solar Seal, Galactic Tone, Wavespell, dan makna gelombang).
     - Peristiwa harian diskret (ingress, station, moon phase peak) dari `dailyEvents`.
* **Keputusan Arsitektur:**
  1. **Engine Deterministik Terpadu (`lib/dailyGuidance/dailyGuidanceEngine.ts`):**
     - Mempertahankan Weekly Guidance tetap FROZEN 100%. Engine harian dibangun di direktori `lib/dailyGuidance/` dengan memanfaatkan fungsi astronomis yang sama.
     - Mengadaptasi rentang waktu perhitungan menjadi 1 hari (00:00:00 s.d. 23:59:59.999 waktu lokal) via `dailyTransitCalculator.ts`.
     - Mengimplementasikan 8 domain kanonikal identik: `kabarHariIni`, `pikiran`, `ekonomi`, `asmara`, `orangTerdekat`, `maknaBatin`, `yangMungkinTerasaBerat`, `ruangYangSedangTerbuka`.
     - Mengadopsi mekanisme alokasi aspek tanpa tabrakan (`usedAspectIndices`) dan threshold relevansi minimal 14 untuk memastikan distribusi intensitas yang proporsional ("Aktivasi Kuat", "Aktivasi Sedang", "Ritme Tenang").
     - Menyusun Ringkasan Kosmik Harian (`DailyCosmicSummary`) yang mengintegrasikan cuaca langit Western dengan siklus Timur (Weton, BaZi Day Ren, Tzolkin Kin).
     - Menyaring Top 3 Domain Paling Menonjol Hari Ini berdasarkan skor relevansi astrologis dan orb.
  2. **Komponen Visual Berparitas Penuh (`components/profile/DailyGuidanceCard.tsx`):**
     - Banner Header: Judul "Catatan Hari Ini", tanggal lokal, timezone, micro-badges (Weton, BaZi/Day Ren, Tzolkin Kin).
     - Ringkasan Langit & Siklus Hari Ini: Kotak rangkuman cuaca kosmik, fase Bulan, retrograde, tema kolektif, dan catatan Day Ren.
     - Transit Paling Aktif Terhadap Chart Milikmu: Kotak bukti hijau sage dengan rincian kontak dan waktu eksak (`sekitar HH:mm WIB`).
     - 3 Domain Kehidupan Paling Menonjol Hari Ini: 3 kartu tombol interaktif yang membuka accordion terkait dan melakukan smooth-scroll ke domain tersebut.
     - 8 Kartu Vertikal Accordion: Setiap domain memiliki icon SVG khusus, badge aktivasi, ringkasan 1-2 baris, chevron expand/collapse, bukti kalkulasi Placidus, pengaruh astrologis, makna spiritual, sintesis lintas sistem (Love Path 7-10-21, Ekor Karma 21-7-13, HD, Life Path, BaZi/Weton), Saran Bhumi, dinamika fase harian (Pagi, Siang, Malam), dan drawer Dasar Pembacaan.
     - Arah Hari Ini: Kotak penutup dengan 3 paragraf refleksi batin terpadu dan tombol CTA menuju `/wellness` dan `/journal`.
  3. **Integrasi Halaman Profil (`app/profile/page.tsx`):**
     - Menggantikan `DailySoulJournalCard` dengan `DailyGuidanceCard` terhubung ke `buildDailyGuidance()`.
     - Mempertahankan `DailyNoteV2` dalam container tersembunyi untuk kompatibilitas.
  4. **Verifikasi Kualitas Komprehensif:**
     - Test suite `tests/unit/build118-daily-guidance.test.ts` (239/239 PASS LOCAL).
     - Test suite `tests/unit/build118-weekly-guidance.test.ts` (231/231 PASS LOCAL - tidak ada regresi pada Weekly Guidance).
     - Typecheck repository-wide `npx tsc --noEmit` exit 0.
     - Local dev server HTTP 200 pada `/profile`.
     - Hasil aktual Aria & Maya tercatat di `scratch/build118-daily-guidance-parity-outputs.json`.
* **Konsekuensi:** Catatan Hari Ini di halaman Profil kini 100% konsisten dengan desain dan standar kualitas Panduan Minggu Ini, sekaligus memiliki kedalaman temporal harian tertinggi di aplikasi Bhumi Amartya. Status rilis tetap `STOP AND WAIT FOR FOUNDER REVIEW`.

---

## ADR-PROFILE-03: Deep Daily Cross-System Synthesis (Empat Fondasi Harian × Cetak Biru Kanonikal) pada Catatan Hari Ini Build 118
* **Tanggal Keputusan:** 28 Oktober 2026
* **Status:** **ACCEPTED & IMPLEMENTED (PASS LOCAL - PENDING FOUNDER REVIEW)** (Sprint PROFILE-DAILY-03)
* **Konteks:**
  1. Founder menyetujui tambahan kedalaman pembacaan pada Catatan Hari Ini di mana 4 Fondasi Temporal Harian (Western Astrology, Weton Jawa, BaZi, Tzolkin Maya) disintesiskan secara mendalam dengan Cetak Biru Kanonikal (Destiny Matrix, Human Design, Life Path, Vedic) ke dalam pembacaan 8 domain kehidupan.
  2. Pendekatan bukan konkatenasi string mekanis atau ramalan terpisah, melainkan anyaman naratif terpadu yang domain-aware (tidak memaksakan seluruh sistem ke dalam setiap kartu).
  3. Dibutuhkan kalkulasi matematis Ten Gods (Shi Shen) lengkap antara natal Day Master dan daily stem, isolasi ketat Weton natal vs harian, deteksi Day Ren 壬 eksplisit hanya pada hari Ren, dan drawer Dasar Pembacaan yang transparan.
* **Keputusan Arsitektur:**
  1. **Empat Fondasi Harian Terpadu:**
     - Western Transit: Aspek harian terhadap natal chart dengan Placidus cusps dan sub-menit exact timing 'sekitar HH:mm WIB' via fungsi sudut bertanda kontinu (`signedDiff`).
     - Weton Jawa Harian: Integrasi kamus kanonikal `DAY_INTERPRETATIONS` dan `PASARAN_INTERPRETATIONS` mencakup watak, kekuatan, tantangan, dan pola rezeki/relasi.
     - BaZi Harian & Ten Gods: Mengimplementasikan `computeBaziTenGod` yang menghasilkan 10 pola hubungan klasik (*Bi Jian, Jie Cai, Shi Shen, Shang Guan, Pian Cai, Zheng Cai, Qi Sha, Zheng Guan, Pian Yin, Zheng Yin*) dan fokus domain (thinking, economy, identity). Deteksi Day Ren terjaga fail-safe.
     - Tzolkin Maya Harian: Kin harian, Solar Seal (keyword, gift, challenge, purpose), Galactic Tone (function, lesson), dan Wavespell 13 hari.
  2. **Cetak Biru Kanonikal Sebagai Lensa Personal:**
     - Destiny Matrix: Love Path 7–10–21 (dengan personalisasi Asmara Single vs Berpasangan), Garis Keuangan, Ekor Karma 21–7–13, Center Arcana 8, Annual Arcana.
     - Human Design: Type, Authority, Profile, Not-Self theme.
     - Life Path & Personal Year: Peran evolusi jiwa dan siklus tahunan numerologi.
  3. **Distribusi Domain-Aware:**
     - Kabar Hari Ini: Sintesis makro 4 fondasi harian + HD Type/Authority.
     - Pikiran: BaZi Day Master + Ten Gods nalar + Weton watak hari + HD Authority.
     - Ekonomi: Garis Keuangan Destiny Matrix + BaZi Ten Gods materi + Weton rezeki pasaran.
     - Asmara: Love Path (diferensiasi Single vs Berpasangan) + Weton relasi pasaran.
     - Orang Terdekat: Weton kelahiran (natal) + HD Profile + batasan sosial transit.
     - Makna Batin: Tzolkin Kin & Tone + Center Arcana + Vedic Nakshatra.
     - Yang Mungkin Terasa Berat: Ekor Karma 21–7–13 + HD Not-Self + Weton tantangan.
     - Ruang yang Terbuka: Arcana Tahunan + Tzolkin Wavespell + Weton kekuatan hari.
  4. **Verifikasi Kualitas Komprehensif:**
     - `tests/unit/build118-daily-guidance.test.ts` (389/389 PASS LOCAL across 16 Sections).
     - Seluruh 7 test suite repositori (856/856 assertions PASS LOCAL).
     - `npx tsc --noEmit` exit code 0 (0 error).
     - Local dev server localhost:3000/profile HTTP 200 OK.
* **Konsekuensi:** Catatan Hari Ini mencapai kedalaman personal dan ketepatan astrologis-spiritual tertinggi, memadukan tradisi Nusantara, Tiongkok, Maya, dan Barat secara harmonis. Rilis produksi tetap berstatus `STOP AND WAIT FOR FOUNDER REVIEW`.
