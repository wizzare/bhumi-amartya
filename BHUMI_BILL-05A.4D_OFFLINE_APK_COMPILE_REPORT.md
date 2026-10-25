# BILL-05A.4D — Read-only offline APK compile preflight

Tanggal: 21 Oktober 2026.

**DEPENDENCY BLOCKED / AWAITING EXPLICIT PROVISIONING APPROVAL.** Bukan isolation-blocked, bukan compilation failure, bukan compile PASS. Scope ini tidak memberikan izin provisioning. AUTHNEW dibatalkan dan tidak dikerjakan/diklaim selesai. **RSK-23 OPEN — QA.**

## 1. Otorisasi dan baseline

Worktree yang diperiksa: `C:\tmp\bhumi-build106-recovery`.
Branch awal terverifikasi: `hotfix/build110-indonesian-only`.
HEAD: `e63f334cf0ac20cc076bc88e98e3e06808b024f3`.
Git branch, rev-parse, status masing-masing exit **0** pada pemeriksaan terstruktur. Awal: **61 tracked modified, 92 untracked, staged 0**. Ini sesuai baseline laporan 4C, bukan perubahan baru yang diadopsi. Semua original dipertahankan; tidak ada edit product/tracking/index/ref.

Laporan 4C dibaca penuh (158 baris). Governance yang dibaca: AGENTS.md dari konteks, RULES.md penuh dan BUILD_108_ENL_MASTER_SOT.md penuh. Ini preflight BILL, bukan pelaksanaan/release ENL; status historis yang bertentangan tidak memberi izin build. Evidence 4C yang digunakan hanya yang relevan dengan tugas, bukan diangkat menjadi canonical source baru.

Tujuan laporan diperiksa melalui glob dan `Test-Path`: **belum ada** sebelum penulisan. Satu-satunya file repo yang dibuat adalah laporan ini. Tidak ada overwrite dokumen user.

Evidence historis E: `C:\Users\shein\AppData\Local\Temp\opencode\bill05a4c-evidence`.
Evidence sesi sekarang: transcript tool panggilan read-only; tidak membuat direktori evidence, skrip, atau manifest tambahan. Perintah hash memakai PowerShell read-only untuk hashing massal (tool Read tidak menghitung SHA256). Tidak mengeksekusi source aplikasi.

## 2. Dua anonymous volume: atribusi berbasis log, bukan waktu saja

| Volume Name / exact ID | CreatedAt sekarang (UTC) | Driver | Labels / Options | Atribusi |
|---|---|---|---|---|
| `429858f91b0c94de97d45df5286b6b6d7a8c762c083b1a845fa35120f8f4af81` | `2026-10-21T11:58:58Z` | local | [redacted] / null | 4C `bill05a4c-probe-0`, postgres:16-alpine |
| `0b4b23a1ac8c673f3e1303127b63f252bfd5617192f84f9db6063718c34584fe` | `2026-10-21T11:58:59Z` | local | [redacted] / null | 4C `bill05a4c-probe-1`, postgres:16 |

Rantai bukti: `E/commands.json:59–72` mencatat daftar sebelum probe tanpa kedua ID; `:88–119` dan `:149–180` mencatat run bernama tersebut exit 0 tanpa explicit volume data; `:120–133` dan `:181–194` mencatat inspect container historis exit 0 dengan **Name yang sama persis**, Type volume, destination `/var/lib/postgresql/data`. Laporan 4C §2 mencatat deklarasi VOLUME image. Ini mengatribusikan kedua volume pada footprint probe 4C; timestamp hanya corroboration, bukan dasar tunggal. Metadata kini membuktikan kedua volume masih ada, bukan isi kosong atau aman dihapus. Current container attachment/liveness tidak diperiksa ulang karena scope Docker dibatasi volume ls/inspect.

Perintah sesi ini (P = `npipe:////./pipe/docker_engine`, V0/V1 = ID tabel):

```powershell
docker --host npipe:////./pipe/docker_engine volume ls --filter name=429858f91b0c94de97d45df5286b6b6d7a8c762c083b1a845fa35120f8f4af81 --filter name=0b4b23a1ac8c673f3e1303127b63f252bfd5617192f84f9db6063718c34584fe --format '{{.Name}}'
docker --host npipe:////./pipe/docker_engine volume inspect 429858f91b0c94de97d45df5286b6b6d7a8c762c083b1a845fa35120f8f4af81 0b4b23a1ac8c673f3e1303127b63f252bfd5617192f84f9db6063718c34584fe --format 'Name={{.Name}} CreatedAt={{.CreatedAt}} Driver={{.Driver}} Labels={{if .Labels}}[redacted]{{else}}null{{end}} Options={{if .Options}}[redacted]{{else}}null{{end}}'
```

CLI meringkas output panggilan gabungan pertama, sehingga exit volume ls tidak dapat dipastikan dari output yang terlihat; **tidak diklaim 0**. Inspect diulang dalam JSON wrapper, exit **0**, dua metadata terlihat lengkap. Tidak membaca contents, Mountpoint, volume lain, atau melakukan run/export/prune/removal. Tidak ada volume dibuat oleh sesi ini.

## 3. Cross-check toolchain lokal minimal

Pemeriksaan SHA256 sekarang terhadap manifest 4C:

- Sepuluh `projectDir/build.gradle` ada dan **10/10 hash sama** dengan `E/native-projects.json`. Core Capacitor 8.3.4 + sembilan plugin. Versi berikut berasal dari evidence package 4C, bukan resolusi baru: authentication 8.2.0, app 8.1.0, filesystem 8.1.2, geolocation 8.2.0, local-notifications 8.2.0, preferences/share/toast 8.0.1, secure-storage 0.13.0.
- `E/native-checks.json` membuktikan historis sembilan registry sources. Registry original kini dihash; tidak mengklaim source registry masing-masing dibaca ulang atau compile compatibility.
- Gradle 9.4.1 expanded all/bin: masing-masing `bin/gradle` dan `lib/gradle-launcher-9.4.1.jar` ada, **4/4 hash sama** dengan `E/gradle-distribution.json`. Roots `C:\Users\shein\.gradle\wrapper\dists\gradle-9.4.1-all\eckclv9s5vi9exbmnyvpg2a3h` dan `...\gradle-9.4.1-bin\arn2x92ynaizyzdaamcbpbhtj`. Unix script/JAR reusable dengan Linux runtime yang sesuai, bukan bukti native helpers guest kompatibel.
- Semua **14 artifact entries** yang berisi file di `E/dependency-checks.json` ada dan hash sama di `C:\Users\shein\.gradle\caches\modules-2\files-2.1`: AGP 9.2.1/8.13.0, Google Services 4.4.4, Foojay 0.10.0, Kotlin 2.2.20 dua variant, aapt2 Windows 9.2.1-15009934, billing 9.1.0, review/review-ktx 2.0.2, app-update 2.1.0, firebase-auth 24.0.1, ionfilesystem 1.1.0, iongeolocation 2.2.0.
- Foojay marker entry files kosong tidak membuktikan hilang: 4C mencatat binary descriptor cache. Metadata descriptor tidak dihash ulang sesi ini. Seluruh transitive closure tetap **UNRESOLVED/UNVERIFIED**, bukan daftar missing yang direkayasa.
- SDK `platforms/android-36/android.jar` dan Windows `build-tools/36.0.0/aapt2.exe` ada, hash sama dengan 4C (tabel §5). Reuse platform jar; Windows executable bukan Linux toolchain.
- Pencarian read-only `*linux*` di exact cache coordinate `com.android.tools.build/aapt2/9.2.1-15009934` menghasilkan **0 file**. Classifier Linux belum tersedia pada lokasi tersebut.
- JDK21 Windows yang berhasil diprobe 4C tetap bukti historis saja; Java/Gradle tidak dijalankan ulang. JDK21 Linux belum terbukti tersedia dalam kandidat 4C. Tidak memindai seluruh mesin, memulai WSL, atau menyatakan JDK Linux pasti tidak ada di mana pun.

## 4. Inventaris hash aset tanpa menjalankan aplikasi

Original: `C:\tmp\bhumi-build106-recovery\android\app\src\main\assets\public`.
PLATFORM-02C: `C:\Users\shein\AppData\Local\Temp\opencode\mobile-staging-1792568056999\out`.

| Inventaris sekarang | File | HTML | Byte | SHA256 inventaris |
|---|---:|---:|---:|---|
| Android original | 740 | 70 | 12713390 | `f1f1901f424750d98d785db3c9a9523bc220474e017f3ff242a68145dd5cb9ca` |
| PLATFORM-02C out | **808** | **66** | **9213286** | `a2c19023028ef264bc5c55af990d49d30e54360a4e2742b2774840d1ae3258bf` |

Metode aktual: `Get-ChildItem -LiteralPath $root -File -Recurse`; setiap file `Get-FileHash -Algorithm SHA256`; relative path slash `/`; `Sort-Object path`; serialisasi tiap row `path<TAB>bytes<TAB>lowercase-sha256<LF>` UTF-8; hash SHA256 gabungan. SHA ini bukan hash JSON 4C karena serialisasi berbeda. Manifest per-file dihitung dalam memori, bukan disimpan baru.

Dibandingkan seluruh 808 entries `E/static-manifest.json`: **0 changed/missing, 0 added**. Antara kedua direktori sekarang: **18 same-path/same-hash, 553 same-path/different-hash, 237 only PLATFORM-02C, 169 only original**. Jadi original generated assets bukan output PLATFORM-02C; tidak boleh diklaim sama atau diganti sekarang.

Provenance **PARTIAL**: kesamaan hash output sekarang terhadap manifest 4C mengikat byte output, bukan seluruh input source/dependency export historis, flags, atau reproducibility. Tidak ada fresh export, binding source baru, browser rendering, atau label FROM VERIFIED PREBUILT STATIC OUTPUT. Tidak memakai APK existing sebagai substitusi hasil build.

## 5. Hash original sebelum/sesudah pembacaan

Dua hash berurutan read-only per file identik; ini pemeriksaan saat inspeksi, **bukan** manifest before/after seluruh worktree sepanjang sesi. Asset hanya diinventaris sekali. Tidak mengklaim seluruh ignored files diverifikasi.

| Original path | SHA256 before = after |
|---|---|
| android/build.gradle | `867f728f4c6e116ccf769864cc3092ebc65346349878b1a22f105551f0a079ed` |
| android/settings.gradle | `e174734f07af3e9ed9528a21e46cdf4ae45a57775d01cc39a647b63b6aa88eb9` |
| android/capacitor.settings.gradle | `5f2a8bd17c08239ca11abbd824979ac6ea247cc5d302f14ca327e2d96aa452dd` |
| android/app/build.gradle | `db08adfcba08ec9cd2acc4c3e251008822f99ef4bc610212a40303bd9c60dfaf` |
| android/app/capacitor.build.gradle | `b85cbda04d9a03c28363ff60fc799a0a3e37dd8fa93afc96e2f30b69f632c4d6` |
| android/gradle/wrapper/gradle-wrapper.properties | `d1f446be7e5aea7ed5e9fba2870f1ad9f54f94b27014f87ad1dfca699b10f455` |
| android/app/src/main/assets/capacitor.plugins.json | `3e208f1688864104f73a0666953dc8c62802ed704a97f10c283526f8dde6f6c4` |
| SDK platforms/android-36/android.jar | `d9eb9da824d9e247a352f570f01e1169e725b2954bca9e283a71786c59b59f9a` |
| SDK build-tools/36.0.0/aapt2.exe | `babf3122e515ddb954c5ac4669e085ce990536c035e3072de30127bddd6e3608` |

SDK root: `C:\Users\shein\AppData\Local\Android\Sdk`. These are local byte fingerprints, not vendor authenticity verification.

## 6. Command ledger dan tiga gate terpisah

Exact command bodies untuk PowerShell inventory/cross-check terdapat pada transcript sesi; tidak ada log Gradle karena tidak dimulai. Command primitives dan inputs: §2, §3, §4, §5; semuanya filesystem read/hash atau Git/Docker metadata lokal. PowerShell hash invocations mengembalikan hasil tanpa error terlihat, tetapi tool tidak mengekspos numeric process exit; **exit numeric tidak direkam**, jangan dipromosikan menjadi executed test PASS. Pemeriksaan Boolean bukan assertion test framework.

| Command/check | Exit/status sesi ini |
|---|---|
| git branch --show-current | 0 |
| git rev-parse HEAD | 0 |
| git status --porcelain=v1 | 0 |
| Docker volume ls filtered two IDs | Numeric exit tidak terlihat akibat ringkasan CLI |
| Docker volume inspect whitelist, JSON wrapper | 0 |
| PowerShell asset inventory/hash comparison | Hasil §4; numeric process exit tidak diekspos |
| PowerShell manifest-driven native/Gradle/Maven hash | Hasil §3; numeric process exit tidak diekspos |
| PowerShell selected original double-hash, Linux classifier search, report Test-Path | Hasil §5; numeric process exit tidak diekspos |
| Gate 1: native-only existing generated project/assets | **NOT RUN**, assemble exit N/A |
| Gate 2: compile dengan PLATFORM-02C assets dalam salinan | **NOT RUN**, staging/swap/assemble exit N/A |
| Gate 3: full Next export → Capacitor sync → Android pipeline | **NOT RUN**, exit N/A |
| lint/typecheck/unit/application tests | **NOT RUN**, bukan product change; assertion aplikasi 0 |
| APK inspection/install/launch, device/emulator/billing/Play QA | **NOT RUN** |

Tidak ada `docker run postgres`, image pull, download, install, acceptance lisensi, build, prod API/network call, official online fetch, release signing, commit, push atau deploy. Production reads/writes **0**. QA RSK-23 tetap OPEN, terpisah dari dependency blocker.

## 7. Approval manifest — belum dieksekusi

| Artifact | Versi diketahui / gap | Approval yang diperlukan |
|---|---|---|
| Linux x86_64 JDK | Java21 wajib menurut 4C; kandidat Microsoft OpenJDK 21.0.11+10, vendor/archive final belum dipilih | Pilih vendor/exact artifact kemudian izin download/provisioning; tidak mengubah target Java |
| Linux SDK build tools | `build-tools;36.0.0`; hanya Windows dibuktikan lokal | Izin provisioning Linux exact package |
| Linux Maven aapt2 | `com.android.tools.build:aapt2:9.2.1-15009934:linux@jar` tidak ditemukan di cache coordinate sekarang | Izin download exact classifier |
| SDK platform | `platforms;android-36`, android.jar lokal tersedia | Reuse dahulu; download ulang tidak diminta default |
| Gradle | 9.4.1 expanded Unix launcher/JAR ada | Reuse dahulu, bukan default download |
| SDK command-line installer, jika dibutuhkan | Exact revision belum ditentukan/evidenced | Review terpisah sebelum memilih/unduh; tidak mengarang versi |
| Maven/transitive/native runtime residual | Exact missing coordinates **UNKNOWN** sebelum resolver offline; potensi native helpers/OS compatibility belum diuji | Jangan blanket-fetch; catat error offline dahulu, minta izin per daftar baru |

**SHA256 dan ukuran semua prospective downloads: PENDING / UNKNOWN**, tidak dibuat-buat. Image toolchain baru tidak dipilih, digest baru tidak dikarang. Kanal resmi disebut 4C: Microsoft/OpenJDK, Google Android SDK repository, Google Maven, Maven Central, Gradle Plugin Portal, services.gradle.org; tidak ada artifact URL baru yang dibuat/fetch sesi ini.

**Lisensi adalah approval independen dari download.** 4C §7 menyebut GPLv2 + Classpath Exception untuk kandidat OpenJDK, Android SDK License Agreement, serta Apache2/notices untuk Gradle. Ini referensi nama dari evidence historis, **bukan validasi terms artifact terpilih**; teks/version/notice vendor wajib direview sebelum penerimaan. Terms aapt2, installer SDK, plugins/transitives dan distribusi/image yang belum dipilih: **REQUIRE REVIEW**, tidak menyimpulkan lisensi tertentu. Tidak menjalankan `sdkmanager --licenses`, auto-yes, atau menganggap download approval sebagai license acceptance.

Alternatif lebih ringan: Founder menyediakan toolchain/cache offline yang sudah dimiliki dan berprovenance; tetap perlu verifikasi serta review terms, bukan izin build otomatis.

## 8. Batas lingkungan untuk task berikutnya

Download environment nantinya harus terpisah dan **tidak berisi/mount source aplikasi, credentials, .env, production config, keystore, service-account atau home cache personal**. Hanya manifest artifact yang disetujui, tujuan download resmi yang direview, checksum/vendor verification dan output artifact bersih. Approval network terbatas bukan izin production API. Jangan menjalankan Gradle project aplikasi dalam download environment untuk mencari transitive dependency.

Offline-build environment terpisah: `--network none`, tanpa Docker socket/privileged/host network, capabilities dropped/no-new-privileges, input bind read-only yang sudah disanitasi, writable working copy internal disposable dan output khusus disposable. Hindari image VOLUME otomatis. Tidak mount original writable. Jangan menjalankan aplikasi. Toolchain autodownload disabled, Gradle `--offline`; jika cache kurang, berhenti dan rekam coordinate tanpa fetch. Pemilihan assets/provenance dan izin compile sendiri tetap eksplisit; tidak menyamakan tiga gate.

Penghapusan volume memerlukan **approval terpisah yang menyebut V0/V1 exact ID §2**, bukan blanket prune. Current attachments perlu diverifikasi lagi di task cleanup yang diotorisasi; container removal jika diperlukan juga butuh izin scope terpisah. Tidak ada penghapusan sekarang.

## 9. Preservasi dan next task

Task delta: satu laporan baru; original tracked delta **+0/-0**, 92 untracked awal dipertahankan; tidak stage/commit. Status akhir akan diperiksa sesudah penulisan, hasil ditambahkan append-only. Tidak ada klaim full-worktree before/after hash proof.

Next task tepat: Founder memilih sumber artifact Linux/offline cache, mengotorisasi download/provisioning exact items secara eksplisit, mereview dan menyetujui terms secara independen, lalu memberikan izin compile offline dan pilihan assets. Cleanup dua volume adalah keputusan terpisah, bukan prerequisite yang otomatis dijalankan. Sampai itu terjadi: **DEPENDENCY BLOCKED / AWAITING EXPLICIT PROVISIONING APPROVAL**.

**STOP AND WAIT FOR FOUNDER REVIEW**

### Verifikasi akhir setelah laporan dibuat

`git branch --show-current`, `git rev-parse HEAD`, `git status --porcelain=v1` masing-masing exit **0**. Branch/HEAD tetap seperti §1; **61 tracked modified, 93 untracked, staged 0**. Penambahan untracked tepat satu laporan ini. Laporan sebelum appendix 140 baris; appendix 6 baris, total task report **146 baris ditambahkan / 0 dihapus**; original tidak diedit. Tidak ada commit atau production access. Count bukan pengganti hash seluruh worktree. Semua approval tetap pending.

**STOP AND WAIT FOR FOUNDER REVIEW**
