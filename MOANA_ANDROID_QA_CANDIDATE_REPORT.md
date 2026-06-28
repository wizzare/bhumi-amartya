# MOANA Android QA Candidate Preparation Report

**Title:** V3 MOANA Android QA Candidate Preparation  
**Timestamp:** 28 June 2026, 16:09 WIB  
**Git Commit Hash:** `a07b4913ff5c8b27744b5da0178f667c05ca76fc`  
**Android versionCode:** `56`  
**Android versionName:** `"3.1.12-RC"`  
**Generated Candidate APK:** [android/app/build/outputs/apk/debug/app-debug.apk](file:///c:/Users/shein/bhumi-amartya-clean/android/app/build/outputs/apk/debug/app-debug.apk)

---

## 1. Candidate Status

```
MOANA Android QA Candidate Prepared
Android Runtime QA Pending
```

> [!IMPORTANT]
> **Real-Device Testing Notice:** The debug candidate APK has been compiled and packaged successfully. However, ADB detected no connected devices/emulators at build time. Runtime device QA is pending manual installation by the founder on a physical Android device.

---

## 2. Packaging Commands Executed

```bash
# 1. Sync web assets & Capacitor config to native Android project
npm run android:sync

# 2. Compile Debug APK via Gradle
cmd /c "set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr&& set PATH=%JAVA_HOME%\bin;%PATH%&& cd android&& gradlew assembleDebug"
```

**Build Status:** `BUILD SUCCESSFUL in 15s` (326 actionable tasks executed/up-to-date).

---

## 3. Manual Installation Instructions for Founder

Since ADB automated deployment is currently offline, follow these steps to install and test the candidate package manually:

1. **Locate APK:** Copy the compiled APK file from:  
   `android/app/build/outputs/apk/debug/app-debug.apk`
2. **Transfer to Device:** Transfer `app-debug.apk` to your Android device via USB, Google Drive, or messaging.
3. **Install Package:**  
   - Open the APK file on your device.
   - If prompted, enable **"Allow installation from unknown apps/sources"** for your file manager.
   - Tap **Install** (or **Update**).
4. **Launch & Test:** Open **Bhumi Amartya**, log in / use your developer session, and execute the manual QA checklist in Section 4.

---

## 4. Required Android Manual QA Checklist

Execute these checks on the installed APK to verify native Capacitor webview persistence, lifecycle handling, and storage engine consistency:

### A. Dashboard Core Identity
- [ ] Open Dashboard.
- [ ] Confirm core identity cards render clean values:
  - **Life Path:** 4
  - **Zodiac Matahari:** Taurus
  - **Pusat Arcana:** 8
  - **Human Design:** ManGen
  - **Weton:** Sabtu Legi
  - **BaZi:** Yang Wood
  - **Vedic:** Libra Moon
  - **Tzolkin:** Ahau 260
- [ ] Confirm zero `...`, `undefined`, `null`, or fallback placeholders appear.
- [ ] Fully close app from task switcher, reopen, and verify values persist.

### B. Wellness Save + Journey Readback
- [ ] Open Wellness → Complete Journaling practice.
- [ ] Open Journey → Confirm activity progress updates (e.g. `1/6 Aktivitas Selesai`).
- [ ] Confirm fallback `"Perjalananmu baru saja dimulai..."` no longer appears.
- [ ] Fully close app, reopen, and verify Journey progress persists.

### C. Wellness Section 4 Practices
- [ ] Complete available Section 4 practices: Journaling, Meditasi, Yoga, Olahraga, Audio Healing, Makanan Sehat, and Manifestasi Hari Ini.
- [ ] Confirm completed practices log into Journey state.
- [ ] Confirm progress counter updates (up to `7/7 Aktivitas Selesai`) and persists after app restart.

### D. Daily Check-In Influence
- [ ] Update Daily Check-In mood/energy values.
- [ ] Confirm dynamic updates in Section 2 (Refleksi), Section 3 (Rekomendasi Utama), and Section 4 practice focus.
- [ ] Test high-all-values scenario and confirm it maps to **Fase Pertumbuhan / Growth**, not heavy/crisis mode.

### E. Share Cards Data Binding
- [ ] Open Profile → Share Cards.
- [ ] Confirm card snippets: Refleksi Jiwa snippet, Catatan Hari Ini snippet, and concise Profil Hari Ini.
- [ ] Confirm **Law of Affirmation** card displays active Wellness Manifestasi Hari Ini affirmation (`"Aku memilih satu arah kecil yang terasa benar, lalu membiarkan sisanya menunggu."`).
- [ ] Fully close app, reopen, and confirm bindings persist.

### F. Meditation Mudra Guidance
- [ ] Open Meditation practice with Mudra guidance.
- [ ] Confirm actual mudra instructions display (e.g. Gyan Mudra steps, benefits, duration, affirmation).
- [ ] Confirm placeholder `"Panduan mudra sedang disiapkan"` does not appear for practices with valid mudras.
- [ ] Confirm safe fallback `"Praktik ini tidak menggunakan panduan mudra khusus."` appears only when mudra is genuinely absent.

### G. Environment Detail Polish
- [ ] Open Environment Detail.
- [ ] Confirm natural Indonesian moon labels (`Cembung Awal`, `Purnama`, `Cembung Akhir`, `Kuartal Akhir`; no `"Benjol"` terms).
- [ ] Confirm UV Index displays numeric + category (e.g. `6 — Tinggi`).
- [ ] Confirm missing UV displays `"Belum tersedia"` (no `"Belum terbaca"`).
