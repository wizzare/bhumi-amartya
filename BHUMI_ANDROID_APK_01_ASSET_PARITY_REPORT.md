# ANDROID-APK-01 — Audit paritas aset read-only

## Verdict

**PASS — paritas byte aset saja.** A, B, dan C masing-masing **808 file, 66 HTML, 9.213.286 byte uncompressed**, seluruh path dan SHA256 konten sama. Bukan PASS runtime, signing, release, atau AUTH-NEW-02.

## Otorisasi dan baseline

- Repo: `C:\tmp\bhumi-build106-recovery`.
- Branch awal: `hotfix/build110-indonesian-only`.
- HEAD awal: `e63f334cf0ac20cc076bc88e98e3e06808b024f3`.
- Baseline terstruktur `git status --porcelain=v1 -uall`: **62 tracked modified, 143 untracked files, staged 0**. Ringkasan CLI pertama menampilkan 99 untracked karena agregasi; angka authoritative audit memakai file-level `-uall`.
- **2.876 file tracked/untracked non-ignored** dihash sebelum analisis; metadata/hash identik setelah analisis. File deleted tetap direkam sebagai missing jika ada. Ignored files repo di luar cakupan ini tidak diklaim terverifikasi.
- Dirty state memang diizinkan Founder untuk dipertahankan, bukan diperbaiki atau diadopsi. Tidak ada edit source/config, git mutation, commit, push, deploy, dependency, jaringan, Firebase, Gradle, rebuild, install atau launch APK. Production reads/writes **0**.
- Laporan ini diperiksa dengan Read sebelum dibuat: **File not found**. Satu-satunya file repo baru ialah laporan ini; skrip dan JSON hanya di direktori evidence baru.

## Input dan provenance

| ID | Path |
|---|---|
| A | `C:\Users\shein\AppData\Local\Temp\opencode\mobile-staging-1792568056999\out` |
| B | `C:\Users\shein\AppData\Local\Temp\opencode\host-offline-20261022\workspace\android\app\src\main\assets\public` |
| C | `C:\Users\shein\AppData\Local\Temp\opencode\host-offline-20261022\workspace\android\app\build\outputs\apk\debug\app-debug.apk`, anggota ZIP `assets/public/`, tanpa direktori |

APK: **12.618.929 byte**; SHA256 **`55b311944557dcb4b05d0cd228b3077706b3044096b714dcddd71846a57ffb6a`**; mtime UTC **2026-10-22T00:56:50.561391+00:00**. Ukuran/hash cocok tepat dengan input Founder. Tidak memakai compressed-size comparison untuk paritas.

Laporan PLATFORM-02C dibaca penuh (180 baris); laporan 4H dibaca penuh (110 baris); laporan 4D bagian 1–120 dibaca untuk lokasi dan metode provenance. Manifest historis `C:\Users\shein\AppData\Local\Temp\opencode\bill05a4c-evidence\static-manifest.json` diparse penuh oleh skrip: **808/808 hash cocok dengan A, missing/unexpected/changed 0**. SHA256 manifest `ff891cd56eafa33c805c557b7d39aa76d427d7edceeaca5a5933528b873d5319`, ukuran 132.554 byte, mtime UTC 2026-10-21T11:57:00.092893+00:00.

Ini mengikat APK ke output PLATFORM-02C lama yang tersimpan dan manifest historis, **bukan export source terbaru AUTH-NEW-02**. Mtime A berkisar 2026-09-02T04:31:20.450997+00:00 hingga 2026-10-21T07:35:54.208999+00:00; mtime bukan pembuktian input source. Binding lengkap source/dependency/flags export historis dan reproducibility tidak diuji. Klaim laporan v1/v2/signing sebelumnya tidak diangkat menjadi hasil audit ini.

## Inventaris konten

Angka berikut identik untuk A, B, C. Kategori berdasarkan ekstensi, bukan inferensi perilaku payload; `.txt` dapat memuat payload Next/RSC, tetapi tidak dihitung ganda sebagai `.rsc`.

| Kategori | File | Byte uncompressed |
|---|---:|---:|
| HTML | 66 | 749865 |
| JS | 133 | 5483653 |
| CSS | 2 | 98290 |
| Fonts | 0 | 0 |
| Images | 16 | 1301928 |
| RSC (.rsc) | 0 | 0 |
| TXT | 590 | 1579293 |
| Other (manifest.json) | 1 | 257 |
| **Total** | **808** | **9213286** |

ZIP keseluruhan: **1.367 entries = 1.367 file + 0 direktori**, **26.617.542 byte uncompressed**. SHA256 dihitung atas seluruh 1.367 konten file terdekompresi, bukan hanya public. `zipfile.ZipFile.testzip()` memeriksa seluruh entry dan mengembalikan `None`: **CRC bad entries 0**. Tidak mengekstraksi APK.

Path memakai slash `/`, tanpa casefold untuk pencocokan. Duplicate nama, collision normalisasi slash, collision case, serta path noncanonical diperiksa terpisah di ZIP keseluruhan dan A/B/C: **semuanya 0**, tidak ada overwrite dictionary ambigu yang disembunyikan.

| Perbandingan | Equal | Missing | Unexpected | Changed |
|---|---:|---:|---:|---:|
| A → B | 808 | 0 | 0 | 0 |
| A → C | 808 | 0 | 0 | 0 |
| B → C | 808 | 0 | 0 | 0 |
| Manifest historis → A | 808 | 0 | 0 | 0 |

Daftar exact untuk masing-masing perbandingan: `missing=[]`, `unexpected=[]`, `changed=[]`; tersimpan dalam `comparisons.json`. Tidak ada discrepancy yang memerlukan dugaan root cause.

## Rute kritis: presence dan equivalence saja

Semua **66 HTML** diverifikasi ada dan hash-equivalent A/B/C; daftar lengkap ada di `routes.json`. Termasuk:

- `index.html`, `dashboard/index.html`, `dashboard/environment/index.html`.
- `login/index.html`, `setup/index.html`, `settings/index.html`.
- `premium-bhumi/index.html`, `upgrade/index.html`, `inbox/index.html`.
- `blueprint/human-design/index.html`, `blueprint/natal-chart/index.html`, `blueprint/destiny-matrix/index.html`, dan seluruh HTML blueprint lainnya.
- Journey, profile, wellness, wellness-assessment, healing, innerwork, journal, bantuan dan halaman legal yang tercantum dalam A.

Aura/admin/testpoc/api tidak menjadi expected route hanya karena ada di source lain: inventaris A merupakan boundary audit. Tidak ada HTML kategori tersebut dalam daftar 66 A; ketidakhadirannya bukan missing expected. Tidak ada klaim browser rendering atau runtime berdasarkan keberadaan file.

## Koreksi hitungan 202

Filter lama direproduksi persis:

```python
[f for f in z.namelist() if 'public' in f.lower() and ('html' in f or 'css' in f or 'js' in f)]
```

Hasil **202**, terdiri dari **66 HTML + 133 JS + 2 CSS + 1 manifest.json**. `manifest.json` ikut karena substring `js` dalam `.json`; filter ini bukan pemeriksaan suffix dan bukan prefix `assets/public/` yang ketat, serta tidak mengecualikan directory secara eksplisit. Pada APK ini tidak ada direktori ZIP. Filter melewatkan **606 file = 590 TXT + 16 images**. Jadi 202 bukan jumlah seluruh aset: jumlah benar **808**. Daftar exact hasil filter dan kategori disimpan di `previous-filter.json`.

## Evidence, perintah, exit, dan integritas

Evidence root (E): `C:\Users\shein\AppData\Local\Temp\opencode\android-apk-01-evidence-20261022`.

- `audit.py`: Python 3.12.10 stdlib saja; ditulis via Write tool di direktori temp baru.
- `repo-before.json`, `repo-after-audit.json`: branch, HEAD, full porcelain status, hash/size/mtime baseline per file; tidak mencetak secret contents.
- `input-before.json`, `A.json`, `B.json`, `C.json`: setiap file konten SHA256, byte dan timestamp filesystem/ZIP.
- `zip-all-files.json`: seluruh file ZIP dan SHA256 konten terdekompresi.
- `summary.json`, `comparisons.json`, `routes.json`, `previous-filter.json`: hasil mesin lengkap.
- `repo-after-report.json`, `final-integrity.json`: pemeriksaan ulang setelah laporan, mengecualikan hanya laporan baru dari baseline file repo.

Perintah utama persis (cwd repo):

```powershell
python -B "C:\Users\shein\AppData\Local\Temp\opencode\android-apk-01-evidence-20261022\audit.py"; $auditExit = $LASTEXITCODE; "AUDIT_EXIT=$auditExit"; exit $auditExit
```

**AUDIT_EXIT=0**. Skrip melakukan 4 perbandingan × 808 = **3.232 pasangan file equivalent**, CRC seluruh 1.367 ZIP files, pemeriksaan collision, identitas APK, serta hash/mtime integrity. Ini bukan suite assertion aplikasi: **application assertions 0**. Lint/typecheck/unit tests **NOT RUN, exit N/A**, karena audit read-only tanpa perubahan kode produk, sesuai larangan scope.

Perintah Git internal persis, masing-masing exit **0**, dijalankan sebelum dan sesudah audit; argv/cwd/exit tersimpan di summary:

```text
git --no-optional-locks ls-files -z --cached --others --exclude-standard
git --no-optional-locks branch --show-current
git --no-optional-locks rev-parse HEAD
git --no-optional-locks status --porcelain=v1 -uall
```

Probe awal `git branch --show-current; git rev-parse HEAD; git status --short` diringkas CLI; exit individual probe itu tidak diklaim. Capture terstruktur di atas authoritative. Probe `Test-Path` temp parent menghasilkan True, evidence target False, `python --version` menghasilkan Python 3.12.10. Perintah detail read-only JSON melalui `python -B -c` dalam transcript menghasilkan **DETAIL_EXIT=0**, tanpa menulis input.

A/B/APK serta log terverifikasi hash/mtime sebelum=sesudah audit. Log build dipertahankan: `C:\Users\shein\AppData\Local\Temp\opencode\host-offline-20261022\logs\manual-gradle-assemble.log`, **75.628 byte**, SHA256 `0677fb49f98699bacf80e498665ee7c10270e2c43f166796f8606098ca38ca48`, mtime UTC 2026-10-22T00:56:51.001208+00:00. Log tidak dijalankan ulang atau diubah.

Pemeriksaan akhir dijalankan dengan:

```powershell
python -B "C:\Users\shein\AppData\Local\Temp\opencode\android-apk-01-evidence-20261022\audit.py" final; $auditExit = $LASTEXITCODE; "FINAL_EXIT=$auditExit"; exit $auditExit
```

Hasil aktual dan exit pemeriksaan akhir dicatat pada `final-integrity.json` dan transcript setelah penulisan laporan; tidak menganggap rencana perintah ini sebagai PASS sebelum eksekusi. Diff produk **0 file/0 baris**; tambahan repo hanya laporan ini (untracked, tidak staged). Seluruh 143 untracked awal dipertahankan, final diharapkan 144 karena laporan baru. Tidak membuat infrastruktur baru.

## Batasan dan next task — proposal saja

**Runtime Google Sign-In, new-user, bootstrap, onboarding, AUTH-NEW-02: NOT VERIFIED.** Tidak ada APK run, backend rules test, atau klaim keamanan produksi baru.

Next minimal: minta persetujuan Founder untuk konfigurasi QA pada **project terisolasi**, package suffix `.qa`, registrasi debug SHA yang sesuai, providers auth yang diperlukan, web SDK configuration QA, dan remote QA backend/rules yang selaras. Setelah source auth terbaru disetujui, diperlukan **mobile export baru dari updated AUTH-NEW-02 source**, bukan memberi label ulang 808 aset lama ini; kemudian audit paritas baru sebelum QA runtime terotorisasi. Alternatif paling ringan sekarang: simpan APK ini hanya sebagai bukti packaging lama, tanpa implementasi QA atau rebuild.

**STOP AND WAIT FOR FOUNDER REVIEW**.
