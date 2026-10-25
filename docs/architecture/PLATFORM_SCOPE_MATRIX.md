# Matrix Cakupan Platform Bhumi Amartya (Platform Scope Matrix)

Dokumen ini mendefinisikan klasifikasi komprehensif atas batas platform (Web vs Mobile/Android vs Backend) untuk seluruh route halaman (52 rute), API routes (8 endpoint), komponen UI, pustaka modul (`lib`), native plugins, dan backend services.

## Definisi Klasifikasi Platform
- `WEB_ONLY`: Hanya diakses dan di-render pada target Web/Browser desktop/mobile web. Tidak diekspor ke asset bundle aplikasi mobile production APK/AAB.
- `APP_ONLY`: Khusus lingkungan runtime mobile app (Capacitor/Android WebView & native shell).
- `SHARED`: Digunakan bersama oleh Web dan Mobile App dengan antarmuka adaptif atau netral platform.
- `REMOTE_BACKEND_WEB`: Layanan backend remote khusus web (misal: webhook web, OAuth browser flow).
- `REMOTE_BACKEND_APP`: Layanan backend remote khusus verifikasi mobile (misal: Google Play Developer API verifier).
- `REMOTE_BACKEND_SHARED`: Layanan backend API yang melayani Web dan Mobile App secara seragam (misal: kalkulasi Human Design, data cuaca/lingkungan, AI guidance).
- `LEGACY_UNVERIFIED`: Rute atau modul eksperimental/POC/lama yang belum diverifikasi atau divalidasi untuk rilis production.

---

## 1. Route Halaman (52 Pages)

| Route / File Path | Klasifikasi | Platform Owner | Feature Owner | Runtime Environment | Mobile Build Inclusion Policy | Web Build Inclusion Policy | Status Evidence | Risk / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `app/page.tsx` | SHARED | Core App | Onboarding & Entry | Next.js Client / Capacitor | INCLUDE | INCLUDE | Canonical Root Gateway | App root router & auth/setup/dashboard gate; shared by Web and Android |
| `app/admin/page.tsx` | WEB_ONLY | Internal Ops | Admin Console | Next.js Web Server / Admin Guard | EXCLUDE | INCLUDE | Build 107 Hotfix Exclusion | Dilarang keras masuk ke build mobile APK/AAB (aturan rilis Build 107) |
| `app/admin/activity/page.tsx` | WEB_ONLY | Internal Ops | Telemetry / Audit | Next.js Web Server / Admin Guard | EXCLUDE | INCLUDE | Internal Telemetry | Dikecualikan dari client runtime Android |
| `app/admin/diagnostics/page.tsx` | WEB_ONLY | Internal Ops | System Diagnostics | Next.js Web Server / Admin Guard | EXCLUDE | INCLUDE | Build 106 Diagnostic Suite | Eksklusif admin internal untuk audit database |
| `app/bantuan/page.tsx` | SHARED | Support Team | Helpdesk & FAQ | Universal React Client | INCLUDE | INCLUDE | User Assistance Matrix | Menampilkan panduan bantuan & rujukan dukungan |
| `app/blueprint/page.tsx` | SHARED | Blueprint Squad | Blueprint Hub | Universal React Client | INCLUDE | INCLUDE | Core Navigation Hub | Pusat navigasi sistem blueprint spiritual |
| `app/blueprint/astrocartography/page.tsx` | SHARED | Blueprint Squad | Astrocartography | Universal React Client | INCLUDE | INCLUDE | Blueprint Expansion | Menampilkan garis relokasi astrologi |
| `app/blueprint/bazi/page.tsx` | SHARED | Blueprint Squad | BaZi (Four Pillars) | Universal React Client | INCLUDE | INCLUDE | Blueprint Expansion | Perhitungan pilar kelahiran BaZi |
| `app/blueprint/destiny-matrix/page.tsx` | SHARED | Blueprint Squad | Destiny Matrix | Universal React Client | INCLUDE | INCLUDE | Blueprint Expansion | Visualisasi numerologi matrix takdir |
| `app/blueprint/human-design/page.tsx` | SHARED | Blueprint Squad | Human Design Core | Universal React Client | INCLUDE | INCLUDE | Build 107/110 Hotfix Anchor | Rute utama chart HD, terintegrasi recovery & offline-cache |
| `app/blueprint/natal-chart/page.tsx` | SHARED | Blueprint Squad | Western Natal Chart | Universal React Client | INCLUDE | INCLUDE | Astrology Engine | Visualisasi natal chart zodiak barat |
| `app/blueprint/numerology/page.tsx` | SHARED | Blueprint Squad | Pythagorean Numerology | Universal React Client | INCLUDE | INCLUDE | Numerology Service | Perhitungan jalan hidup & ekspresi numerologi |
| `app/blueprint/tzolkin/page.tsx` | SHARED | Blueprint Squad | Mayan Tzolkin | Universal React Client | INCLUDE | INCLUDE | Blueprint Expansion | Kalender sakral Maya kin & seal |
| `app/blueprint/vedic/page.tsx` | SHARED | Blueprint Squad | Vedic Astrology (Jyotish)| Universal React Client | INCLUDE | INCLUDE | Blueprint Expansion | Perhitungan Nakshatra dan D1 Kundali |
| `app/blueprint/weton/page.tsx` | SHARED | Blueprint Squad | Primbon Jawa / Weton | Universal React Client | INCLUDE | INCLUDE | Nusantara Heritage | Pasaran, neptu, dan wuku Jawa |
| `app/blueprint/whole-sign/page.tsx` | SHARED | Blueprint Squad | Whole Sign Houses | Universal React Client | INCLUDE | INCLUDE | Astrology Engine | Sistem rumah astrologi whole sign |
| `app/blueprint/zi-wei/page.tsx` | SHARED | Blueprint Squad | Zi Wei Dou Shu | Universal React Client | INCLUDE | INCLUDE | Chinese Metaphysics | Astrologi Bintang Ungu |
| `app/dashboard/page.tsx` | SHARED | Core App | Main Dashboard | Universal React Client | INCLUDE | INCLUDE | Daily Operational Dashboard | Beranda utama aplikasi harian |
| `app/dashboard/environment/page.tsx` | SHARED | Environment Squad| Gaia Schumann & Weather | Universal React Client | INCLUDE | INCLUDE | Build 108 Schumann Restoration| Data resonansi Schumann, AQI, cuaca live |
| `app/healing/page.tsx` | SHARED | Wellness Squad | Healing Sanctuary | Universal React Client | INCLUDE | INCLUDE | Wellness Directory | Direktori kurasi pemulihan energi |
| `app/healing/audio/page.tsx` | SHARED | Wellness Squad | Solfeggio Audio Player | Universal Audio Runtime | INCLUDE | INCLUDE | Binaural Engine | Audio solfeggio frekuensi terapeutik |
| `app/healing/meditation/page.tsx` | SHARED | Wellness Squad | Guided Meditation | Universal Audio/Visual | INCLUDE | INCLUDE | Mindfulness Hub | Meditasi pernapasan & visualisasi |
| `app/inbox/page.tsx` | SHARED | Core App | Notification Inbox | Universal React Client | INCLUDE | INCLUDE | User Messaging | Notifikasi dan pengumuman aplikasi |
| `app/innerwork/page.tsx` | SHARED | Innerwork Squad | Inner Work Hub | Universal React Client | INCLUDE | INCLUDE | Personal Practice Hub | Direktori latihan transformasi diri |
| `app/innerwork/audio-healing/page.tsx` | SHARED | Innerwork Squad | Innerwork Audio | Universal Audio Runtime | INCLUDE | INCLUDE | Frequency Therapy | Audio fokus & pelepasan emosional |
| `app/innerwork/herbal/page.tsx` | SHARED | Innerwork Squad | Herbalism & Adaptogen | Universal React Client | INCLUDE | INCLUDE | Natural Wellness | Direktori ramuan herbal nusantara & holistik |
| `app/innerwork/journaling/page.tsx` | SHARED | Innerwork Squad | Reflective Journaling | Universal React Client | INCLUDE | INCLUDE | Shadow Work Module | Jurnal refleksi pribadi |
| `app/innerwork/manifestasi/page.tsx` | SHARED | Innerwork Squad | Conscious Creation | Universal React Client | INCLUDE | INCLUDE | Mindset Reprogramming | Alat visualisasi & peneguhan niat |
| `app/innerwork/meditation/page.tsx` | SHARED | Innerwork Squad | Innerwork Mindfulness | Universal React Client | INCLUDE | INCLUDE | Breathwork & Contemplation | Praktik hening dan penyelaman batin |
| `app/innerwork/workout/page.tsx` | SHARED | Innerwork Squad | Somatic Movement | Universal React Client | INCLUDE | INCLUDE | Body Movement | Gerakan somatik dan penyelarasan raga |
| `app/innerwork/yoga/page.tsx` | SHARED | Innerwork Squad | Asana & Prana Yoga | Universal React Client | INCLUDE | INCLUDE | Yoga Sequences | Panduan asana dan pernapasan yoga |
| `app/insights/page.tsx` | SHARED | Insights Squad | Daily Cosmic Insights | Universal React Client | INCLUDE | INCLUDE | Ephemeris Transits | Bacaan transit kosmik harian |
| `app/journal/page.tsx` | SHARED | Wellness Squad | Daily User Journal | Universal React Client | INCLUDE | INCLUDE | Encrypted Local/Remote Store | Catatan harian dan mood tracking |
| `app/journey/page.tsx` | SHARED | Gamification | Soul Journey Roadmap | Universal React Client | INCLUDE | INCLUDE | Pathway Progression | Peta jalan progres spiritual pengguna |
| `app/journey/[id]/page.tsx` | SHARED | Gamification | Pathway Detail | Universal React Client | INCLUDE | INCLUDE | Dynamic Routing Node | Detail langkah modul perjalanan |
| `app/kebijakan-privasi/page.tsx` | SHARED | Compliance | Privacy Policy | Static Universal Content | INCLUDE | INCLUDE | Play Store Compliance SOT | Kebijakan privasi resmi dwi-platform |
| `app/kenali-diri/aura/page.tsx` | SHARED | Aura Squad | Bio-Field / Aura Scan | Universal WebCam / MediaStream | INCLUDE | INCLUDE | Biofield Visualizer | Analisis warna medan aura |
| `app/kontak/page.tsx` | SHARED | Support Team | Contact Form | Universal React Client | INCLUDE | INCLUDE | Help & Support Hub | Formulir komunikasi pengembang & pengguna |
| `app/login/page.tsx` | SHARED | Auth Squad | Authentication Gateway | Firebase Auth Client | INCLUDE | INCLUDE | Dual Auth Channel | Login Google, Anonymous, dan Email |
| `app/meditation/page.tsx` | SHARED | Wellness Squad | General Meditation | Universal React Client | INCLUDE | INCLUDE | Meditation Quick-start | Akses kilat sesi hening harian |
| `app/premium-bhumi/page.tsx` | SHARED | Billing Squad | Subscription Paywall | Adaptive Billing Client | INCLUDE | INCLUDE | BILL-04/05 Multi-platform UI | Render Google Play Billing di App, Stripe/WebPay di Web |
| `app/profile/page.tsx` | SHARED | Profile Squad | User Profile Hub | Universal React Client | INCLUDE | INCLUDE | Identity Dashboard | Data profil kelahiran dan preferensi |
| `app/profile/[section]/page.tsx` | SHARED | Profile Squad | Profile Section Editor | Universal React Client | INCLUDE | INCLUDE | Granular Settings | Pengeditan sub-seksi profil |
| `app/reports/weekly/page.tsx` | SHARED | Insights Squad | Weekly Astro Report | Universal React Client | INCLUDE | INCLUDE | Synthesis Report | Laporan sintesis mingguan bio-kosmik |
| `app/settings/page.tsx` | SHARED | Core App | Application Settings | Universal React Client | INCLUDE | INCLUDE | Config & Subscription Bridge | Pengaturan akun, notifikasi, dan langganan |
| `app/setup/page.tsx` | SHARED | Onboarding Squad| Onboarding Birth Setup | Universal React Client | INCLUDE | INCLUDE | P0 Birth Integrity Entry | Input data lahir vital perhitungan blueprint |
| `app/syarat-ketentuan/page.tsx` | SHARED | Compliance | Terms of Service | Static Universal Content | INCLUDE | INCLUDE | Play Store Compliance SOT | Syarat & ketentuan layanan hukum |
| `app/tentang/page.tsx` | SHARED | Brand Team | About Bhumi Amartya | Static Universal Content | INCLUDE | INCLUDE | Identity & Mission | Informasi visi, misi, dan latar belakang |
| `app/test-3d-poc/page.tsx` | LEGACY_UNVERIFIED| Graphics Lab | Three.js Celestial POC | WebGL 3D Canvas | EXCLUDE | EXCLUDE | Experimental Sandbox | Dilarang masuk production bundle; hanya uji coba lokal |
| `app/upgrade/page.tsx` | SHARED | Billing Squad | Upgrade Fallback / Alias| Universal Redirect/Render | INCLUDE | INCLUDE | Legacy Route Alias | Alias kompatibilitas menuju /premium-bhumi |
| `app/wellness/page.tsx` | SHARED | Wellness Squad | Holistic Wellness Center| Universal React Client | INCLUDE | INCLUDE | Integrative Health | Dashboard kesehatan integratif |
| `app/wellness-assessment/page.tsx` | SHARED | Wellness Squad | Holobiont Health Survey | Universal React Client | INCLUDE | INCLUDE | Psychometric Assessment | Survei kuesioner kesejahteraan fisik-emosi |

---

## 2. API Routes (8 Endpoints)

| Route / File Path | Klasifikasi | Platform Owner | Feature Owner | Runtime Environment | Mobile Build Inclusion Policy | Web Build Inclusion Policy | Status Evidence | Risk / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `app/api/access/bootstrap-trial/route.ts` | REMOTE_BACKEND_SHARED | Backend Platform | Access & Entitlement | Node.js Serverless Edge/Server | EXCLUDE (Call via HTTP) | INCLUDE | Automated Trial Provisioning | Penyedia klaim akses trial 7-hari dengan Firestore Guard |
| `app/api/ai/daily-guidance/route.ts` | REMOTE_BACKEND_SHARED | AI Engine | Personalized Guidance | Node.js Serverless Edge/Server | EXCLUDE (Call via HTTP) | INCLUDE | Ephemeris AI Generator | Generasi narasi panduan harian bertenaga AI |
| `app/api/environment/weather-aqi/route.ts`| REMOTE_BACKEND_SHARED | Data Squad | OpenMeteo / WAQI Fetch | Node.js Serverless Edge/Server | EXCLUDE (Call via HTTP) | INCLUDE | Realtime Geo Cache | Proxy cache cuaca dan kualitas udara untuk proteksi kuota |
| `app/api/founder/play-metrics/route.ts` | REMOTE_BACKEND_WEB | Founder / Finance | Google Play Reporting | Node.js Serverless Edge/Server | EXCLUDE (Admin Web Only)| INCLUDE | Play Console Financial Telemetry| Endpoint tertutup untuk metriks internal Founder |
| `app/api/humandesign/astrology/route.ts` | REMOTE_BACKEND_SHARED | Astrology Engine | Ephemeris Transit API | Node.js / Swiss Ephemeris | EXCLUDE (Call via HTTP) | INCLUDE | High-precision Transit Matrix | Endpoint kalkulasi posisi planet presisi tinggi |
| `app/api/humandesign/bodygraph/route.ts` | REMOTE_BACKEND_SHARED | Blueprint Squad | SVG Bodygraph Generator | Node.js Serverless / Python Proxy| EXCLUDE (Call via HTTP) | INCLUDE | Visual Chart Renderer | Endpoint rendering SVG kalkulasi gerbang dan saluran HD |
| `app/api/humandesign/calculate/route.ts` | REMOTE_BACKEND_SHARED | Blueprint Squad | Core HD Computation | Node.js / Python Fast-API Proxy | EXCLUDE (Call via HTTP) | INCLUDE | P0 Canonical HD Engine | Endpoint sentral kalkulasi tipe, profil, dan otoritas HD |
| `app/api/kenali-diri/aura/route.ts` | REMOTE_BACKEND_SHARED | Aura Squad | Biofield Neural Classifier | Node.js Serverless Edge/Server | EXCLUDE (Call via HTTP) | INCLUDE | Computer Vision Proxy | Analisis frekuensi spektrum gambar aura |

---

## 3. Komponen Arsitektural Utama

| Component / Subdirectory | Klasifikasi | Platform Owner | Feature Owner | Runtime Environment | Mobile Build Policy | Web Build Policy | Status Evidence | Catatan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `components/billing/CanonicalPremiumScreen.tsx` | SHARED | Billing Squad | Paywall Presentation | Universal React Client | INCLUDE | INCLUDE | BILL-04 UI SOT | Adaptif mendeteksi Capacitor vs Browser untuk provider bayar |
| `components/billing/PaymentStatusBadge.tsx` | SHARED | Billing Squad | Entitlement Badge | Universal React Client | INCLUDE | INCLUDE | Entitlement UI | Menampilkan status keanggotaan aktif |
| `components/auth/AccessGuard.tsx` | SHARED | Auth Squad | Route Access Control | React Context / Client Guard | INCLUDE | INCLUDE | P0 Boundary Guard | Memproteksi rute privat dan memastikan kesiapan data lahir |
| `components/blueprint/HdStatus.tsx` | SHARED | Blueprint Squad | HD Recovery & Status | Universal React Client | INCLUDE | INCLUDE | HD-P0 Reliability | Menampilkan status offline-readiness dan recovery Human Design |
| `components/blueprint/HdStoredStatus.tsx` | SHARED | Blueprint Squad | HD Local Persistence | Universal React Client | INCLUDE | INCLUDE | Local Storage Cache UI | Visualisasi status penyimpanan lokal |
| `components/dashboard/AstroTodayCard.tsx` | SHARED | Core App | Cosmic Weather Glance | Universal React Client | INCLUDE | INCLUDE | Design-1 Invariant | Kartu transit kosmik pada beranda harian |
| `components/dashboard/SoulReflectionCard.tsx` | SHARED | Core App | Daily Guidance Reflection | Universal React Client | INCLUDE | INCLUDE | Design-1 Invariant | Refleksi panduan batin harian |
| `components/dashboard/CoreIdentity.tsx` | SHARED | Core App | Core Avatar & Blueprint | Universal React Client | INCLUDE | INCLUDE | Design-1 Invariant | Ringkasan identitas blueprint pengguna |
| `components/dashboard/PendingHdRecoveryBanner.tsx` | SHARED | Blueprint Squad | HD Background Recovery | Universal React Client | INCLUDE | INCLUDE | HD-P0 Banner | Banner interaktif rekonsiliasi data kelahiran yang tertunda |
| `components/celestial/*` | SHARED | Graphics Squad | 2D/3D Celestial Canvas | WebGL / SVG Universal | INCLUDE | INCLUDE | Astrological Projections | Visualisasi kanvas zodiak dan langit |
| `components/environment/*` | SHARED | Environment Squad| Schumann & Earth Data | Universal React Client | INCLUDE | INCLUDE | Gaia Live Feed | Grafik frekuensi resonansi bumi |
| `components/onboarding/*` | SHARED | Onboarding Squad| Wizard Setup Steps | Universal React Client | INCLUDE | INCLUDE | Setup Step Controller | Langkah interaktif registrasi data vital |

---

## 4. Pustaka Modul (`lib/*`)

| Library Path / Module | Klasifikasi | Platform Owner | Feature Owner | Runtime Environment | Mobile Build Policy | Web Build Policy | Catatan Keamanan / Batasan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `lib/billing/googlePlayBilling.ts` | APP_ONLY | Billing Squad | Google Play In-App Purchase| Capacitor Plugin / Android | INCLUDE (Staging/App)| TREE-SHAKEN / STUB | Hanya aktif jika `Capacitor.isNativePlatform() === true` |
| `lib/billing/canonicalAccessBootstrap.ts` | SHARED | Billing Squad | Client Entitlement State | Isomorphic Client/Server | INCLUDE | INCLUDE | Orkes pertahanan akses offline & online |
| `lib/billing/entitlementPresentation.ts` | SHARED | Billing Squad | Entitlement Localization | Isomorphic Client | INCLUDE | INCLUDE | Format mata uang IDR & status entitlement |
| `lib/humandesign/calculateHumanDesign.ts` | SHARED | Blueprint Squad | Offline HD Fallback Calc | Isomorphic JS/TS Engine | INCLUDE | INCLUDE | Engine deterministik offline ketika API unreachable |
| `lib/humandesign/birthFingerprint.ts` | SHARED | Blueprint Squad | Cryptographic Birth Hash | Isomorphic JS/TS | INCLUDE | INCLUDE | SHA-256 fingerprint identitas kelahiran |
| `lib/humandesign/liveContract.ts` | SHARED | Blueprint Squad | Live API Contract Parser | Isomorphic TS | INCLUDE | INCLUDE | Validasi skema respons API Human Design |
| `lib/firebase/service.ts` | SHARED | Cloud Platform | Firebase SDK Wrapper | Isomorphic Web SDK | INCLUDE | INCLUDE | Akses Firestore, Auth, dan Analytics |
| `lib/storage/onboardingStorage.ts` | SHARED | Onboarding Squad| Local Onboarding Cache | LocalStorage / Preferences | INCLUDE | INCLUDE | Penyimpanan sementara progres pendaftaran |
| `lib/astrology/personalizedTransitNarrative.ts` | SHARED | Astrology Squad | Transit Narrative Synthesizer | Isomorphic TS | INCLUDE | INCLUDE | Penerjemah aspek planet harian ke Bahasa Indonesia |
| `lib/auth/safeDiagnostics.ts` | SHARED | Auth Squad | Safe Auth Telemetry | Isomorphic TS | INCLUDE | INCLUDE | Audit telemetry tanpa eksposur kredensial PII |

---

## 5. Native Plugins & Backend Microservices

| Service / Plugin | Klasifikasi | Platform Owner | Feature Owner | Runtime Environment | Catatan Integrasi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `@capacitor/core` & `@capacitor/android` | APP_ONLY | Mobile Core | Native Shell Container | Android Native / WebView | Fondasi runtime APK/AAB |
| `@capacitor-community/billing` (atau native bridge) | APP_ONLY | Mobile Core | Google Play Billing Native | Android Java/Kotlin Bridge | Penghubung billing Google Play Store |
| `@capacitor/preferences` | SHARED (Native/Web)| Mobile Core | Secure Persistent Storage | Android SharedPreferences / Web LocalStorage | Penyimpan token & cache terenkripsi |
| `@capacitor/camera` | SHARED (Native/Web)| Aura Squad | Optical Aura Scan | Android CameraX / Web MediaDevices | Akuisisi tangkapan visual biofield |
| `services/billing-verifier` | REMOTE_BACKEND_APP | Billing Platform | Google Play Server-to-Server | Node.js Fastify/Express Cloud Service | Validasi cryptographic purchase token langsung ke Google Play |
| `services/humandesign-api` | REMOTE_BACKEND_SHARED| Blueprint Platform | Python Swiss-Ephemeris Core | Python FastAPI Container Service | Kalkulasi presisi tinggi posisi efemeris astronomis |
