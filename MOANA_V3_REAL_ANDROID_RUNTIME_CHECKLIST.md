# MOANA V3 - REAL ANDROID RUNTIME CHECKLIST
## Production Runtime Verification Package
**Version:** 1.0  
**Date:** 2024  
**Status:** READY FOR TESTER EXECUTION  
**Build Reference:** MOANA V3 - Journey Persistence Fixed  

---

## 📋 PERSIAPAN (Pre-Test Setup)

| Item | Requirement | Verified (✓/✗) | Notes |
|------|-------------|----------------|-------|
| **Build yang digunakan** | APK/AAB Release Build (signed) | | Version code & name tercatat di bawah |
| **Version Code** | | | _Isi: `versionCode: XX`, `versionName: X.X.X`_ |
| **Firebase Project** | `moana-production` (Production) | | Project ID: ___________________ |
| **Akun tester** | Email: ___________________ | | Terdaftar di Firebase Auth |
| **Badge tester** | Badge aktif: [ ] Trial [ ] Premium [ ] Lifetime | | Cek di Firestore `users/{uid}/badges` |
| **Internet aktif** | WiFi / 4G/5G stabil | | Ping google.com < 100ms |
| **Login berhasil** | Bisa masuk ke Dashboard tanpa error | | Token refresh OK |

> **CATATAN:** Semua item di atas **WAJIB** ✓ sebelum memulai TEST 1-10.

---

## 🧪 TEST 1: MEDITATION - Save & Persist

| Step | Action | Expected Result | Actual Result | PASS/FAIL | Screenshot | Firestore Evidence | Notes |
|------|--------|-----------------|---------------|-----------|------------|-------------------|-------|
| 1 | Buka halaman Meditation | UI load tanpa error | | | | | |
| 2 | Pilih durasi (mis. 10 menit) | Timer mulai berjalan | | | | | |
| 3 | Selesaikan / Tap "Save" | Toast "Journey saved" | | | | | |
| 4 | Cek tab Journey | Journey Meditation muncul di list | | | | | |
| 5 | **Pull-to-refresh** Journey | Journey tetap ada (tidak hilang) | | | | | |
| 6 | Buka Firestore Console | Doc baru di `journeys/{uid}/entries/{entryId}` | | | | **Timestamp:** `createdAt: ___________` | |

**Firestore Evidence Required:** Screenshot doc `journeys/{uid}/entries/{entryId}` dengan field `type: "meditation"`, `duration`, `createdAt`.

---

## 🧪 TEST 2: JOURNALING - Force Close Recovery

| Step | Action | Expected Result | Actual Result | PASS/FAIL | Screenshot | Firestore Evidence | Notes |
|------|--------|-----------------|---------------|-----------|------------|-------------------|-------|
| 1 | Buka halaman Journaling | UI load tanpa error | | | | | |
| 2 | Tulis entry minimal 50 karakter | Text tersimpan di state | | | | | |
| 3 | Tap "Save" | Toast "Journey saved" | | | | | |
| 4 | **Force Close app** (swipe dari recent apps) | App terminated | | | | | |
| 5 | Buka app kembali | Auto-login / sesi valid | | | | | |
| 6 | Cek tab Journey | Journaling entry **masih ada** | | | | | |
| 7 | Buka Firestore Console | Doc `journeys/{uid}/entries/{entryId}` exists | | | | **Timestamp:** `createdAt: ___________` | |

**Firestore Evidence Required:** Doc dengan `type: "journaling"`, `content` tidak kosong.

---

## 🧪 TEST 3: WORKOUT - Logout/Login Persistence

| Step | Action | Expected Result | Actual Result | PASS/FAIL | Screenshot | Firestore Evidence | Notes |
|------|--------|-----------------|---------------|-----------|------------|-------------------|-------|
| 1 | Buka halaman Workout | UI load tanpa error | | | | | |
| 2 | Pilih workout (mis. Push-ups 3 set) | Form input tersedia | | | | | |
| 3 | Isi reps/set & tap "Save" | Toast "Journey saved" | | | | | |
| 4 | Cek tab Journey | Workout muncul | | | | | |
| 5 | **Logout** (Settings → Logout) | Kembali ke Login screen | | | | | |
| 6 | **Login kembali** (akun sama) | Dashboard load normal | | | | | |
| 7 | Cek tab Journey | Workout **masih ada** | | | | | |
| 8 | Buka Firestore Console | Doc `journeys/{uid}/entries/{entryId}` exists | | | | **Timestamp:** `createdAt: ___________` | |

**Firestore Evidence Required:** Doc dengan `type: "workout"`, `exercise`, `sets`, `reps`.

---

## 🧪 TEST 4: YOGA - Progress Today Increment

| Step | Action | Expected Result | Actual Result | PASS/FAIL | Screenshot | Firestore Evidence | Notes |
|------|--------|-----------------|---------------|-----------|------------|-------------------|-------|
| 1 | Buka Dashboard | Catat nilai "Progress Today" awal: **_____** | | | | | |
| 2 | Buka halaman Yoga | UI load tanpa error | | | | | |
| 3 | Pilih sesi Yoga (mis. 15 menit) | Timer mulai | | | | | |
| 4 | Selesaikan & tap "Save" | Toast "Journey saved" | | | | | |
| 5 | Kembali ke Dashboard | **Progress Today bertambah** (mis. +15 menit) | | | | **Nilai baru: _____** | |
| 6 | **Pull-to-refresh** Dashboard | Nilai **tetap sama** (tidak reset) | | | | | |
| 7 | Buka Firestore Console | `users/{uid}/progress.todayMinutes` updated | | | | **Value: ___________** | |

**Firestore Evidence Required:** `users/{uid}/progress` doc dengan `todayMinutes` bertambah sesuai durasi yoga.

---

## 🧪 TEST 5: HEALTHY FOOD - Dashboard Update

| Step | Action | Expected Result | Actual Result | PASS/FAIL | Screenshot | Firestore Evidence | Notes |
|------|--------|-----------------|---------------|-----------|------------|-------------------|-------|
| 1 | Buka Dashboard | Catat state "Healthy Food" section | | | | | |
| 2 | Buka halaman Healthy Food | UI load tanpa error | | | | | |
| 3 | Log makanan (mis. "Nasi merah + ayam") | Form tersimpan | | | | | |
| 4 | Tap "Save" | Toast "Journey saved" | | | | | |
| 5 | Kembali ke Dashboard | **Section Healthy Food berubah** (update** (menampilkan entry baru) | | | | | |
| 6 | Buka Firestore Console | `journeys/{uid}/entries/{entryId}` type: `healthy_food` | | | | **Timestamp: ___________** | |

**Firestore Evidence Required:** Doc dengan `type: "healthy_food"`, `meal`, `calories` (opsional).

---

## 🧪 TEST 6: DASHBOARD - Refleksi Jiwa Update

| Step | Action | Expected Result | Actual Result | PASS/FAIL | Screenshot | Firestore Evidence | Notes |
|------|--------|-----------------|---------------|-----------|------------|-------------------|-------|
| 1 | Buka Dashboard | Catat "Refleksi Jiwa" saat ini: **___________** | | | | | |
| 2 | Lakukan aktivitas yang memicu refleksi (Meditation/Journaling/Yoga) | Journey tersimpan | | | | | |
| 3 | Kembali ke Dashboard | **Refleksi Jiwa berubah** (update otomatis dari AI/rule) | | | | **Nilai baru: ___________** | |
| 4 | Pull-to-refresh | Nilai **tetap konsisten** | | | | | |
| 5 | Buka Firestore Console | `users/{uid}/reflection` atau `dailyReflection` updated | | | | **Doc ID: ___________** | |

**Firestore Evidence Required:** Doc `users/{uid}/reflection` dengan `content`, `generatedAt`, `sourceJourneyId`.

---

## 🧪 TEST 7: DASHBOARD - Catatan Hari Ini Update

| Step | Action | Expected Result | Actual Result | PASS/FAIL | Screenshot | Firestore Evidence | Notes |
|------|--------|-----------------|---------------|-----------|------------|-------------------|-------|
| 1 | Buka Dashboard | Catat "Catatan Hari Ini" saat ini: **___________** | | | | | |
| 2 | Buat Journaling entry baru | Save berhasil | | | | | |
| 3 | Kembali ke Dashboard | **Catatan Hari Ini berubah** (menampilkan journal terbaru) | | | | **Nilai baru: ___________** | |
| 4 | Pull-to-refresh | Tetap konsisten | | | | | |
| 5 | Buka Firestore Console | `users/{uid}/dailyNote` atau `todayNote` updated | | | | **Doc ID: ___________** | |

**Firestore Evidence Required:** Doc dengan `note`, `sourceJourneyId`, `date` (today).

---

## 🧪 TEST 8: DASHBOARD - Manifestasi Update

| Step | Action | Expected Result | Actual Result | PASS/FAIL | Screenshot | Firestore Evidence | Notes |
|------|--------|-----------------|---------------|-----------|------------|-------------------|-------|
| 1 | Buka Dashboard | Catat "Manifestasi" saat ini: **___________** | | | | | |
| 2 | Lakukan aktivitas positif (Workout/Yoga/Healthy Food) | Journey tersimpan | | | | | |
| 3 | Kembali ke Dashboard | **Manifestasi berubah** (streak/affirmasi update) | | | | **Nilai baru: ___________** | |
| 4 | Pull-to-refresh | Tetap konsisten | | | | | |
| 5 | Buka Firestore Console | `users/{uid}/manifestation` updated | | | | **Doc ID: ___________** | |

**Firestore Evidence Required:** Doc dengan `affirmation`, `streak`, `lastUpdated`, `triggerJourneyId`.

---

## 🧪 TEST 9: AI MEMORY CONTINUITY

| Step | Action | Expected Result | Actual Result | PASS/FAIL | Screenshot | Firestore Evidence | Notes |
|------|--------|-----------------|---------------|-----------|------------|-------------------|-------|
| 1 | Save **Meditation** (10 min) | Journey tersimpan | | | | | |
| 2 | Save **Journaling** ("Hari ini tenang") | Journey tersimpan | | | | | |
| 3 | Save **Workout** (Push-ups) | Journey tersimpan | | | | | |
| 4 | Buka **AI Chat / Memory** | AI merujuk ke **semua 3 aktivitas** di konteks | | | | | |
| 5 | Tanya: "Apa yang sudah kulakukan hari ini?" | Jawaban mencantumkan: Meditation, Journaling, Workout | | | | | |
| 6 | Buka Firestore Console | `users/{uid}/aiMemory` atau `memoryContext` updated | | | | **Doc ID: ___________** | |

**Firestore Evidence Required:** Doc `users/{uid}/aiMemory` dengan `recentJourneys` array berisi 3 entry IDs, `lastUpdated`.

---

## 🧪 TEST 10: NO DUPLICATE JOURNEY

| Step | Action | Expected Result | Actual Result | PASS/FAIL | Screenshot | Firestore Evidence | Notes |
|------|--------|-----------------|---------------|-----------|------------|-------------------|-------|
| 1 | Buka halaman Meditation | UI load | | | | | |
| 2 | Tap "Save" **berulang kali** (5x cepat) | Hanya **1 journey** tercipta | | | | | |
| 3 | Cek tab Journey | Hanya **1 entry** Meditation hari ini | | | | | |
| 4 | Buka Firestore Console | **Hanya 1 doc** di `journeys/{uid}/entries/` untuk meditation hari ini | | | | **Count: _____** | |
| 5 | Ulangi untuk Journaling (tap Save 5x) | Hanya 1 entry | | | | **Count: _____** | |
| 6 | Ulangi untuk Workout (tap Save 5x) | Hanya 1 entry | | | | **Count: _____** | |

**Firestore Evidence Required:** Query `journeys/{uid}/entries` where `type == "meditation" AND date == today` → **count == 1**.

---

## ⚠️ KNOWN FAILURE LOG

> Isi hanya jika ada test yang **FAIL**. Jika semua PASS, biarkan kosong.

| Test # | Test Name | ROOT CAUSE | Evidence (Screenshot/Firestore) | Reproduction Steps |
|--------|-----------|------------|----------------------------------|---------------------|
| | | | | 1. |
| | | | | 2. |
| | | | | 3. |

---

## 🚪 FINAL RELEASE GATE

| Component | PASS / FAIL | Evidence Ref (Test #) | Blocker? |
|-----------|-------------|----------------------|----------|
| **Journey Persistence** | | Test 1, 2, 3, 10 | [ ] Yes [ ] No |
| **Dashboard Sync** | | Test 4, 5, 6, 7, 8 | [ ] Yes [ ] No |
| **Refleksi Jiwa** | | Test 6 | [ ] Yes [ ] No |
| **Catatan Hari Ini** | | Test 7 | [ ] Yes [ ] No |
| **Manifestasi** | | Test 8 | [ ] Yes [ ] No |
| **AI Memory Continuity** | | Test 9 | [ ] Yes [ ] No |
| **Badge System** | | Manual check: Badge muncul per journey | [ ] Yes [ ] No |
| **Trial Status** | | Manual check: Trial countdown / upgrade prompt | [ ] Yes [ ] No |
| **Billing / Subscription** | | Manual check: Purchase flow, restore purchase | [ ] Yes [ ] No |

### OVERALL RELEASE DECISION

| Decision | Criteria |
|----------|----------|
| ✅ **READY** | **SEMUA** component = PASS, zero blocker |
| ❌ **NOT READY** | Ada **minimal 1** component = FAIL atau blocker |

**FINAL VERDICT:** ___________________ (READY / NOT READY)

**Signed off by:** ___________________  
**Date:** ___________________  
**Build Version:** ___________________

---

## 📄 OUTPUT SUMMARY (Untuk Dikirim ke Founder)

| Field | Value |
|-------|-------|
| **STATUS** | PASS / FAIL |
| **Files Created** | `MOANA_V3_REAL_ANDROID_RUNTIME_CHECKLIST.md` |
| **Evidence Collected** | [ ] Screenshots (per test) [ ] Firestore Console screenshots [ ] Video recording (opsional) |
| **Checklist Coverage** | 10 Core Tests + Persiapan + Known Failure + Release Gate |
| **Regression Risk** | LOW / MEDIUM / HIGH (isi berdasarkan Known Failure) |

---

## 📎 LAMPIRAN YANG HARUS DISIAPKAN TESTER

1. **Screenshot per test step** (minimal: before save, after save, after refresh, Firestore doc)
2. **Firestore Console screenshots** untuk setiap test yang butuh evidence
3. **Screen recording** (opsional tapi recommended) untuk Test 2 (Force Close) & Test 3 (Logout/Login)
4. **Export JSON** dari Firestore `journeys/{uid}/entries` (untuk audit trail)

---

**DOCUMENT CONTROL**  
- Created: MOANA V3 Runtime Verification Package  
- No code changes required  
- No Firestore changes required  
- No pipeline changes required  
- Ready for immediate tester execution on physical Android device