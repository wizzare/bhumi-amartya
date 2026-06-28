# Play Console Submission Draft - Bhumi Amartya

This document contains all the necessary information to create the app in Google Play Console and upload the first Internal Testing release.

**Last repository verification:** 2026-06-26

## 1. AAB File Information
- **File Name:** `app-release.aab`
- **Path:** `android/app/build/outputs/bundle/release/app-release.aab`
- **Exists:** Yes
- **Size:** 9.42 MB (9,421,269 bytes)
- **Timestamp:** 2026-06-21 10:12
- **Sign Status:** Existing release bundle present. Release signing is configured through Gradle properties (`BHUMI_RELEASE_STORE_FILE`, `BHUMI_RELEASE_STORE_PASSWORD`, `BHUMI_RELEASE_KEY_ALIAS`, `BHUMI_RELEASE_KEY_PASSWORD`) and must be verified before upload.

## 2. Version & Package Info (from build.gradle)
- **Application ID:** `com.bhumiamartya.app`
- **Version Code:** `53`
- **Version Name:** `3.1.12-RC`
- **Namespace:** `com.bhumiamartya.app`

## 3. Play Console Create App Values
- **App name:** Bhumi Amartya
- **Default language:** Indonesian - id_ID
- **App or game:** App
- **Free or paid:** Free
- **Declarations:** 
    - [x] Follows Google Play Developer Program Policies
    - [x] Complies with US export laws

## 4. Store Listing Draft

### Short Description
Bhumi Amartya membantu kamu mengenali diri lewat jurnal, refleksi harian, dan innerwork personal.

### Full Description
**Bhumi Amartya: Kenali Diri, Temukan Ketenangan, dan Tumbuh Setiap Hari**

Bhumi Amartya adalah teman setia dalam perjalanan *innerwork* dan pertumbuhan personal Anda. Dirancang untuk membantu Anda memahami lapisan diri yang lebih dalam, aplikasi ini menggabungkan praktik mindfulness modern dengan wawasan kepribadian yang unik.

**Fitur Utama:**
- **Jurnal & Refleksi Harian:** Tuangkan pikiran Anda dan pantau perkembangan emosional melalui fitur penjurnalan yang intuitif.
- **Innerwork Personal:** Panduan terarah untuk membantu Anda menghadapi tantangan diri dan memperkuat mentalitas positif.
- **Meditasi & Audio Healing:** Temukan ketenangan di tengah hiruk-pikuk dunia dengan koleksi audio meditasi yang menenangkan.
- **Self-Awareness Berbasis Blueprint:** Pahami potensi unik Anda melalui analisis blueprint yang dipersonalisasi.
- **Human Design (Beta):** Jelajahi sistem Human Design sebagai alat refleksi diri untuk mengenal mekanisme energi dan pengambilan keputusan Anda. (Catatan: Fitur ini ditujukan untuk tujuan refleksi diri, bukan klaim medis atau ilmiah).

**Privasi & Keamanan Anda Utama:**
Kami menghargai privasi Anda. Data Anda disimpan dengan aman dan Anda memiliki kendali penuh atas akun Anda, termasuk opsi penghapusan akun kapan saja langsung dari dalam aplikasi.

Mulailah perjalanan kembali ke diri sendiri hari ini bersama Bhumi Amartya.

## 5. App Category Recommendation
- **Primary Category:** Lifestyle
- **Reasoning:** Bhumi Amartya difokuskan pada pengembangan diri, kesadaran diri, dan kebiasaan harian seperti menjurnal, yang paling tepat masuk dalam kategori Lifestyle. Meskipun memiliki fitur meditasi, nilai utamanya adalah eksplorasi diri dan "innerwork".

## 6. Data Safety Draft
**Data yang dikumpulkan:**
- **Info Pribadi:** Nama, Alamat Email.
- **Data Kelahiran:** Tanggal, Waktu, dan Kota Lahir (digunakan untuk mempersonalisasi Blueprint/Human Design).
- **Konten Pengguna:** Entri Jurnal.
- **Aktivitas Aplikasi:** Progress penggunaan/interaksi dalam aplikasi.

**Penjelasan:**
- Data dikumpulkan hanya untuk fungsionalitas inti aplikasi.
- Data dienkripsi saat transit menggunakan protokol standar industri.
- Pengguna dapat menghapus akun dan data mereka kapan saja melalui menu pengaturan di dalam aplikasi.
- Data tidak dibagikan atau dijual kepada pihak ketiga.

## 7. App Access Instructions for Reviewer
- **Login Required:** Yes, Google Login is required to synchronize journal data and personalize the experience.
- **Instructions:** Reviewers can use any Google Account to sign in. The internal testing build is configured to support standard Firebase/Google authentication.
- **Note:** Please ensure the testing device has Google Play Services installed.

## 8. Content Rating Notes
- **App Type:** Personal Development / Journaling
- **Content:** Self-reflection, meditation, and educational content.
- **Restrictions:** No violence, no gambling, no adult content, no medical services, and no financial products.
- **Rating Target:** Recommended for ages 3+ (PEGI 3 / ESRB Everyone).

## 9. Remaining Assets Needed
- [ ] **App Icon:** 512x512 PNG (transparent background)
- [ ] **Feature Graphic:** 1024x500 PNG/JPG
- [ ] **Phone Screenshots:** At least 2 (up to 8), 16:9 or 9:16 aspect ratio.
- [ ] **7-inch Tablet Screenshots:** (Optional but recommended)
- [ ] **10-inch Tablet Screenshots:** (Optional but recommended)
