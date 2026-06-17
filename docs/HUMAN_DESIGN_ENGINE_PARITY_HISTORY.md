# HUMAN DESIGN ENGINE PARITY HISTORY & CALIBRATION

Dokumen ini mencatat sejarah kalibrasi, audit, dan migrasi arsitektur pada Human Design (HD) engine Bhumi Amartya. Dokumen ini wajib dibaca dan dipahami sebelum melakukan modifikasi pada logika perhitungan atau konstanta offset astrologi.

---

## 1. Kronologi & Root Cause 40.75

### Masalah Awal (Local Approximation)
Pada versi awal, perhitungan Human Design di client-side menggunakan library JavaScript lokal (`calculateHumanDesignType.ts`) yang mengadopsi konstanta offset mandala standar:
* **Mandala Human Design**: Gate 41 dimulai pada 19° 15' Aquarius (319.25°).
* **Formula Teoretis**: `offset = 360° - 319.25° = 40.75°`.
* **Implementasi**: `adjusted_longitude = (planetary_longitude + 40.75) % 360`.

### Kegagalan Parity (Root Cause)
Meskipun secara matematis teoretis offset mandala adalah `40.75`, dalam praktiknya penggunaan nilai ini pada engine pure-JS dengan library astronomi sederhana menghasilkan deviasi/selisih perhitungan dibanding standard industri (seperti Jovian Archive). Akibatnya:
1. Beberapa user mendapatkan tipe energi, profile (misalnya 6/4 vs 6/3), atau inner authority yang salah.
2. Untuk menutupi kegagalan ini pada akun penting (seperti Founder), dipasang logic **owner override** secara hardcoded pada `ownerOverride.ts` untuk email `wizzare@gmail.com`. Hal ini menyembunyikan inkonsistensi kalkulasi engine yang sebenarnya.

---

## 2. Temuan Audit (Audit Findings)

Audit komprehensif pada pipeline perhitungan menemukan:
* **Inkonsistensi Client-Server**: Next.js API route (`/api/humandesign/calculate`) memanggil engine Python, sementara fallback mobile memanggil kode JS lokal yang tidak presisi.
* **Ketergantungan Swisseph**: Perhitungan HD yang presisi membutuhkan presisi koordinat tinggi (Swiss Ephemeris) yang hanya tersedia dengan aman pada engine Python FastAPI (`pyswisseph`).
* **Kegagalan Endpoint Mobile**: Di perangkat mobile (APK/AAB), absolute relative fetches (`/api/humandesign/calculate`) gagal total karena Next.js dikompilasi dalam mode static HTML (`output: 'export'`) sehingga route handler `/api/` tidak dimasukkan ke dalam aset APK.

---

## 3. Kalibrasi Offset 58.00 (Calibrated Offset)

Untuk menyamakan perhitungan dengan standar resmi Jovian Archive secara universal (tanpa memerlukan override hardcoded), dilakukan kalibrasi ulang pada parameter engine Python:
* **Konstanta Terkalibrasi**: `IGING_offset = 58.00` (ditetapkan di `services/humandesign-api/src/humandesign/hd_constants.py`).
* **Mengapa 58.00?**: Nilai ini mengompensasi proyeksi lingkaran zodiak dan perbedaan presisi pembacaan ephemeris untuk menyelaraskan output 64 gerbang zodiak secara tepat dengan standard global.

> [!IMPORTANT]
> **JANGAN MENGUBAH `IGING_offset` KEMBALI KE `40.75`**.
> Mengubah nilai ini akan langsung merusak akurasi data dan memicu kegagalan parity pada kelima akun golden sample. Nilai `58.00` adalah kalibrasi final yang terbukti presisi.

---

## 4. Validasi Golden Samples

Berikut adalah 5 data sampel utama yang digunakan sebagai benchmark kebenaran perhitungan:

| Pengguna | Tipe Energi | Profile | Inner Authority | Cross (Incarnation Cross) |
|---|---|---|---|---|
| **Widhi** | Manifesting Generator | 6/3 | Sacral Authority | `((24, 44), (13, 7))-LAC` (24/44 \| 13/7) |
| **Ning** | Manifesting Generator | 2/4 | Sacral Authority | `((57, 51), (53, 54))-RAC` (57/51 \| 53/54) |
| **Widya** | Manifestor | 1/3 | Emotional Authority | `((45, 26), (22, 47))-RAC` (45/26 \| 22/47) |
| **Amartya** | Manifesting Generator | 4/6 | Sacral Authority | `((12, 11), (36, 6))-RAC` (12/11 \| 36/6) |
| **Eva Syana** | Projector | 6/2 | Self-Projected Authority | `((64, 63), (45, 26))-LAC` (64/63 \| 45/26) |

*Seluruh sampel di atas berstatus **PASS** dan telah tervalidasi 100% cocok dengan output live API.*

---

## 5. Migrasi Railway & Kesiapan Produksi

Untuk mengatasi hilangnya `/api/` route di production APK, kami memindahkan hosting kalkulator Python HD ke platform **Railway** dengan status **Online**:
* **Production Endpoint**: `https://bhumi-humandesign-api-production.up.railway.app/calculate`
* **Peningkatan Kompatibilitas**: Backend Python FastAPI diperkuat agar mendukung request format JSON langsung dari client WebView (`birthDate`, `birthTime`, `timezone`) maupun parameter pecahan dari Next.js API wrapper (`year`, `month`, `day`, `utc_offset`).
* **Integrasi CORS**: Mendukung origin `capacitor://localhost` dan `https://localhost` untuk koneksi aman dari WebView Android/iOS.

---

## 6. Validasi Build 46 RC

Build 46 RC telah dirilis dengan konfigurasi final:
* **Version Name**: `3.1.6`
* **Version Code**: `46`
* **Konfigurasi API**: `NEXT_PUBLIC_HUMAN_DESIGN_API_URL` diarahkan secara statis ke domain Railway HTTPS publik.
* **Hasil Pengujian**:
  * Pengecekan status audit menghasilkan `canonical = true`, `calculationQuality = "verified"`, dan `source = "human-design-py"`.
  * Integrasi data profil, dashboard, dan Founder diagnostic berfungsi mulus tanpa fallback error.

---

## 7. Pelajaran Berharga (Lessons Learned)

1. **Hindari Hardcoded Overrides**: Logika override client-side (seperti `ownerOverride.ts`) harus dihindari karena menutupi kegagalan kalibrasi engine utama dan menyulitkan pelacakan bug.
2. **Ketergantungan Aset WebView**: Aplikasi hybrid yang di-package dengan Capacitor (`output: 'export'`) tidak memiliki runtime Node.js lokal. Seluruh operasi dynamic API wajib diarahkan ke HTTPS endpoint publik sejak awal fase arsitektur.
3. **Multi-stage Docker Build**: Library C-astrologi seperti `pyswisseph` harus dikompilasi pada builder container dengan dependency compiler lengkap (`gcc`, `g++`, `python3-dev`) lalu disalin ke runtime container bersih untuk menjaga stabilitas dan performa deployment.
