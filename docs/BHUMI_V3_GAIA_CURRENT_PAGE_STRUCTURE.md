# BHUMI V3 GAIA - CURRENT PAGE STRUCTURE INVENTORY

Dokumen ini mendokumentasikan struktur aktual semua halaman (page) dalam aplikasi Bhumi V3 Gaia berdasarkan audit source code terbaru.

## 1. Dashboard
- **Route Path:** `/dashboard`
- **File Utama:** `app/dashboard/page.tsx` -> `components/dashboard/DashboardClient.tsx`
- **Komponen Utama:** `DashboardHeader`, `AccuracyUpgradeBanner`, `GuardianIdentityCard`, `CoreIdentity`, `SoulReflectionCard`, `AstroTodayCard`, `DailyNoteV2`, `DailyUserFlowGuide`.
- **Urutan Section/Card (UI):**
    1. `DashboardHeader`: Salam (Nama User) & Tanggal.
    2. `AccuracyUpgradeBanner`: Muncul jika akurasi data perlu diperbarui.
    3. `GuardianIdentityCard`: Status keanggotaan (Founder/Guardian/Core).
    4. `CoreIdentity`: Ringkasan 4 Identitas Utama (Life Path, Arcana Center, Sun Sign, Human Design).
    5. `SoulReflectionCard`: Pesan refleksi harian singkat.
    6. `AstroTodayCard`: Energi astrologi hari ini.
    7. `DailyNoteV2`: Refleksi mendalam harian (Companion Reflection).
    8. `DailyUserFlowGuide`: Panduan alur aktivitas harian.
- **Data Source:** `StorageProvider` (UserProfile, Blueprint), `DailyGuidanceRepository`, `DailyStateRepository`, `Astro Engine`.
- **Kondisi Tampil:** Memerlukan Login, Memerlukan Setup Selesai.
- **Action:** Klik Identitas (ke Blueprint), Buka Setup (jika belum selesai).

## 2. Profile (Kenali Diri)
- **Route Path:** `/profile`
- **File Utama:** `app/profile/page.tsx`
- **Komponen Utama:** `BhumiPageHeader`, `SummaryCard` (Identitas Jiwa), `GaiaSectionLink` (Grid 6 Section), `ShareCard`.
- **Urutan Section:**
    1. Header: Nama User.
    2. **Identitas Jiwa**: Life Path, Arcana Center, HD Type, Zodiak Matahari. (Wajib 4 item).
    3. **Gudang Identitas Jiwa**: Grid 6 section Gaia (Inti Diri, Pola Interaksi, Kekuatan & Bakat, Tantangan & Bayangan, Misi & Tujuan, Keseimbangan Diri).
    4. **Bagikan Refleksi Jiwamu**: Share Card section.
    5. Footer: Build & Engine Metadata.
- **Data Source:** `GaiaProfile` (synthesized from Blueprint), `ProfileEcho`.
- **Action:** Klik section Gaia (ke `/profile/[section]`), Klik Bagikan (Export Image).

## 3. Profile Detail (Insights)
- **Route Path:** `/profile/[section]` (Daftar Insight) & `/profile/[section]/[insight]` (Detail Insight)
- **File Utama:** `app/profile/[section]/page.tsx`, `app/profile/[section]/[insight]/page.tsx`
- **Komponen Utama:** `ProfileSectionClient`, `ProfileInsightClient`.
- **Struktur Detail Insight:**
    1. Header: Judul Insight & Ringkasan.
    2. **Penjelasan Personal**: Narasi mendalam.
    3. **Efek dalam Hidupmu**: Dampak pada kehidupan.
    4. **Saran Praktis**: Langkah konkret (Bullet points).
- **Data Source:** `GaiaProfile`.

## 4. Innerwork Hub
- **Route Path:** `/innerwork`
- **File Utama:** `app/innerwork/page.tsx`
- **Komponen Utama:** `BhumiPageHeader`, `InnerworkRecommendations`, `InnerworkMenuItems`.
- **Urutan Section:**
    1. Header: Title & Subtitle.
    2. **Rekomendasi Berdasarkan Kondisimu**: Card Journaling, Meditasi, Manifestasi, Workout, Yoga, Audio, Herbal.
    3. **Menu Grid**: Semua modul innerwork.
- **Data Source:** `DailyGuidance` (Recommendations).

## 5. Journaling
- **Route Path:** `/innerwork/journaling`
- **File Utama:** `app/innerwork/journaling/page.tsx`
- **Struktur Alur (Stages):**
    1. **Stage 1: Setup/Checkin**: Hero, Daily Prompt, Emotional Check-in (Mood & Body signals).
    2. **Stage 2: Writing**: Input teks jurnal.
    3. **Stage 3: Insight**: Analisis emosi, Rekomendasi penyembuhan (Healing), Timeline progres.
- **Data Source:** `JournalRepository`, `EmotionalMemoryRepository`.

## 6. Meditation
- **Route Path:** `/innerwork/meditation`
- **File Utama:** `app/innerwork/meditation/page.tsx`
- **Struktur Halaman:**
    1. Hero: Pesan pembuka personal.
    2. Theme: Tema meditasi hari ini.
    3. **To-Do Practice**: Daftar instruksi praktik.
    4. **Panduan Mudra**: Nama, Tujuan, Langkah, Durasi, Afirmasi, Link Referensi.
    5. **Body Awareness**: Refleksi setelah praktik (Mood, Body signals, Teks).
    6. Save & Insight.

## 7. Audio Healing
- **Route Path:** `/innerwork/audio-healing`
- **File Utama:** `app/innerwork/audio-healing/page.tsx`
- **Struktur Halaman:**
    1. Hero: Instruksi audio.
    2. **Playlist**: Youtube Embed + Tombol buka di aplikasi Youtube.
    3. **Reflection**: Mood, Body signals, Teks refleksi.
    4. Save & Insight.

## 8. Journey Hub
- **Route Path:** `/journey`
- **File Utama:** `app/journey/page.tsx`
- **Struktur Halaman:**
    1. Header: Title & Subtitle.
    2. **Progres Hari Ini**: Progress bar % aktivitas harian.
    3. **Menu Cards**: Tahap Pertumbuhan, Fokus, Perhatian, Milestone, Riwayat.
- **Data Source:** `DailyStateRepository`.

## 9. Weekly Report
- **Route Path:** `/reports/weekly`
- **File Utama:** `app/reports/weekly/page.tsx`
- **Struktur Halaman:**
    1. Header: Range tanggal laporan.
    2. **Statistik Mingguan**: Total Journal, Meditasi, Audio.
    3. **Tema Dominan**: Fokus utama minggu ini.
    4. **Emosi & Tubuh**: Ringkasan pola.
    5. **Kaitan Dengan Blueprint**: Analisis berdasarkan jati diri.
    6. **Fokus Minggu Depan**: Rekomendasi praktik.
    7. Pesan Penutup.
- **Data Source:** `WeeklySoulReport` (derived from activity logs).

## 10. Founder Dashboard
- **Route Path:** `/admin`
- **File Utama:** `app/admin/page.tsx` -> `components/admin/CoreGuardianValidation.tsx`
- **Komponen Utama:** `Ringkasan Pengguna` (Metrics), `CandidateValidation`, `UserMonitoring`, `UserDetailModal`.
- **User Detail Modal (Struktur):**
    1. Header: Nama & Email User, Badge Role.
    2. **Metadata**: Build, Version, Platform, Engine version.
    3. **Activity**: Registered At, Last Login, Last Seen.
    4. **Participation Metrics**: Login count, Check-In, Assessment, Active Days.
    5. **Human Design Diagnostic (Collapsed by Default)**:
        - HD Status, Type, Source, Engine Version, Last Calculation.
        - Birth Info: Normalized Date, Time, Timezone, City/Country, UTC.
        - Cache Key.
        - **Founder Actions**: Re-run HD Audit, Clear HD Cache, Re-run Gaia Migration.
- **Data Source:** `AdminRepository` (Users, Audit Logs).

## 11. Setup (Onboarding)
- **Route Path:** `/setup`
- **File Utama:** `app/setup/page.tsx`
- **Struktur Form:** Full Name, Email (Readonly), Birth Date, Birth Time, City Autocomplete.
- **Data Source:** `UserRepository`, `BlueprintRepository`, `Astrology Engine`.

## 12. Login (Auth)
- **Route Path:** `/login`
- **File Utama:** `app/login/page.tsx`
- **Struktur UI:** Logo Bhumi, Welcome message, Google Sign-in button, TOS/Privacy link.

## 13. Settings
- **Route Path:** `/settings`
- **File Utama:** `app/settings/page.tsx`
- **Struktur Section:**
    1. User Data: Form edit info kelahiran & nama.
    2. Language: Indonesia/English.
    3. Account Status: Badge role & subscription plan.
    4. Account Links: Tentang, Privasi, Syarat.
    5. **Zona Bahaya**: Hapus & Perbaiki Blueprint, Hapus Akun.

## 14. Blueprint (Technical View)
- **Route Path:** `/blueprint`
- **File Utama:** `app/blueprint/page.tsx`
- **Struktur:** Ringkasan data mentah dari Core Identity, HD, Natal Chart, dan Destiny Matrix.

## 15. Share Cards
- **Lokasi:** Tersemat di halaman `/profile`.
- **Flow:** Menampilkan kartu ringkasan -> Tombol "Bagikan" -> Export DOM ke PNG -> Simpan ke perangkat (Capacitor/Browser) -> Toast sukses.
- **Aturan:** Menampilkan data "Share-safe" (tidak terlalu sensitif). Tidak ada opsi platform sosial media (langsung simpan gambar).

---

## Aturan Akses & Billing (Override)
- **Gate Aktif:** `isGaiaAccessOverrideActive`.
- **Override End Date:** `2026-07-01T00:00:00+07:00`.
- **Dampak:** Semua fitur utama (Journal, Meditasi, Audio, Journey, Report) terbuka selama masa override tanpa pengecekan subscription Pro.

## Logika Human Design (HD)
- **Kondisi Tampil:** Tampil jika status `ready` di Blueprint.
- **Status Pending:** Jika belum valid, menampilkan pesan "Human Design sedang diproses."
- **Source Valid:** Harus `canonical` atau `api` untuk dianggap divalidasi penuh.

## Hal yang TIDAK boleh diubah
1. **Identitas Jiwa:** Harus tetap 4 item di Dashboard dan Profile (Life Path, Arcana Center, Sun Sign, HD Type).
2. **Dashboard:** Harus tetap ringkas (fokus pada harian).
3. **Founder Diagnostics:** Harus tetap *collapsed* secara default agar modal detail tidak terlalu panjang.
4. **Share Cards:** Tetap menggunakan flow simpan gambar ke perangkat, jangan tambah pilihan platform (WA/IG/dsb) di dalam UI.
