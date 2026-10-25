# BILL-05A.4B — OFFLINE COMPILE ONLY RESULT

Tanggal: 21 Oktober 2026. **Verdict: DEPENDENCY BLOCKED (toolchain guest), bukan ISOLATION BLOCKED.** Tidak ada APK baru dan tidak ada COMPILE-ONLY PASS.

## 1. Otorisasi dan governance

Tugas Founder mengizinkan inventaris lokal dan kompilasi offline terisolasi dengan konfigurasi publik `com.bhumiamartya.app`, project `bhumiamartya-fe85c`. Tidak mengizinkan produksi, credential, install/launch APK, emulator, Play, perubahan Git, fitur OS/admin, firewall host atau HD. Laporan BILL-05A.4A dan PLATFORM-02C dibaca penuh sebelum sumber; AGENTS dari konteks, RULES penuh, bagian otoritas BUILD_106_MASTER_SOT dan pembukaan/otoritas BUILD_108_ENL_MASTER_SOT diperiksa. Ini tugas BILL compile-only, bukan implementasi/release ENL. Klaim historis PLATFORM-02C tidak dinaikkan menjadi hasil sesi ini.

## 2. Identitas dan baseline preservasi

Worktree `C:\tmp\bhumi-build106-recovery`; branch `hotfix/build110-indonesian-only`; HEAD `e63f334cf0ac20cc076bc88e98e3e06808b024f3`.

Awal: **61 modified tracked, 90 entri untracked, 0 staged**. Skrip Git read-only dengan `GIT_OPTIONAL_LOCKS=0` merekam 2.867 file non-ignored yang ada, total **81.338.140 byte**, masing-masing SHA-256. SHA-256 `before.json`: `c4039d0d143fab6f1a20f91594242dbe839ddeb7e7bd3ae14ee4cbc47ca3dc70`. Ini manifest preservasi, bukan salinan source build. Ignored dependency/cache di luar cakupan hash tersebut.

Bukti: `C:\Users\shein\AppData\Local\Temp\opencode\bill05a4b-evidence`; skrip `..\bill05a4b-evidence.mjs`. Direktori evidence baru dibuat tanpa mirror/deletion. Known relevant `bill05a4a-BYGyIw/after.json` diperiksa: historical checked 2.866, changed kosong. Tidak memindai file pribadi.

## 3. Windows Sandbox dan virtualisasi

- `Get-Command WindowsSandbox.exe`: tidak ditemukan; `Test-Path C:\Windows\System32\WindowsSandbox.exe`: False.
- `Get-WindowsOptionalFeature -Online -FeatureName Containers-DisposableClientVM`: gagal karena elevation required. **State fitur inconclusive**, bukan Disabled yang terbukti. Tidak menjalankan enable/install/admin.
- Association `.wsb`: tidak ditemukan atau tidak dapat diakses. Dukungan konfigurasi Networking Disable pada host ini **tidak terverifikasi**; guest Sandbox tidak tersedia untuk percobaan. Tidak membuat klaim bahwa konfigurasi tersebut tidak didukung Windows secara umum.
- CIM Win32_ComputerSystem: HypervisorPresent=True. Win32_Processor melaporkan VirtualizationFirmwareEnabled=False, VMMonitorModeExtensions=False, SecondLevelAddressTranslationExtensions=False; flag yang terlihat dari sesi ini tidak membuktikan firmware fisik tidak mendukung virtualisasi.
- Cmdlet bukan native process: numeric native exit tidak ada; feature query exception ditangani, virtualization query sukses.

## 4. Alternatif lingkungan yang benar-benar diperiksa

| Pemeriksaan | Hasil aktual / exit |
| --- | --- |
| Get-Command docker.exe | Ada di instalasi DockerDesktop lokal |
| `docker --version` | 29.6.1 build 8900f1d; 0 |
| `docker --host npipe:////./pipe/docker_engine info --format '{{.ServerVersion}}'` | Server lokal 29.6.1; 0, bukan daemon unavailable |
| Docker info OSType/Architecture | linux/x86_64; 0 |
| Docker image ls | 0; postgres:16-alpine, postgres:16 dan 16.14 (ID sama), curlimages/curl:latest, iiidev/iii:0.11.2, hello-world:latest, busybox:1.36 |
| Get-Command podman.exe | Tidak ditemukan |
| `wsl --status`, `wsl --list --verbose` | Masing-masing 0; Ubuntu dan docker-desktop terdaftar WSL2, keduanya dilaporkan Stopped |
| Get-Command Get-VM | Tidak ditemukan |
| CIM root/virtualization/v2 Msvm_ComputerSystem | Invalid namespace; tidak ada listing VM yang berhasil, bukan bukti semua VM mustahil ada |

WSL tidak dijalankan sebagai build guest karena belum ada bukti network-disabled per lingkungan; host networking tidak diubah. Tidak melakukan koneksi eksternal. Docker memakai explicit named pipe lokal, bukan context remote. Tidak pull image.

## 5. Bukti isolasi guest aktual

Container `bill05a4b-offline-probe` dijalankan dari cached `busybox:1.36` (ID lokal `73aaf090f3d8`) dengan:

```powershell
docker --host npipe:////./pipe/docker_engine run --pull never --name bill05a4b-offline-probe --network none --read-only --cap-drop ALL --security-opt no-new-privileges --tmpfs /tmp:rw,noexec,nosuid,size=64m --mount "type=bind,source=C:\Users\shein\AppData\Local\Temp\opencode\bill05a4b-evidence\input,target=/input,readonly" --mount "type=bind,source=C:\Users\shein\AppData\Local\Temp\opencode\bill05a4b-evidence\output,target=/output" busybox:1.36 sh /input/guest-check.sh
```

Exit container command **0**. Ini sukses probe, **bukan sukses toolchain/build**. Input hanya skrip probe sanitasi, bukan profile/credential/repository. Satu output bind writable khusus; internal disposable `/tmp/work`. Tidak mount Docker socket. Tidak copy dependency/source sebelum blocker toolchain.

`docker inspect` exit **0**: NetworkMode=none, ReadonlyRootfs=true, State.ExitCode=0; mount `/input` RW=false dan `/output` RW=true menunjuk dua subdirektori evidence tepat. Guest `/sys/class/net`: hanya `lo`; `/proc/net/route`: hanya header tanpa rute; IPv6 hanya entri `lo`, tidak ada interface/rute keluar. Check ONLY_LOOPBACK_EXIT=0 dan NO_IPV4_ROUTES_EXIT=0 (**2 check sukses**). Bukti persisten `output/guest-evidence.txt`. Tidak menggunakan request ke internet untuk membuktikan blokir; tidak menganggap Node guard sebagai isolasi OS.

Container probe dihentikan secara normal dan tetap disimpan, tidak dihapus. Tmpfs noexec cocok untuk probe saja; build guest berikut membutuhkan disposable work mount yang mengizinkan eksekusi toolchain.

## 6. Toolchain/cache lokal versus guest

| Komponen | Host lokal | Guest |
| --- | --- | --- |
| JDK17 | java -version exit 0: Microsoft OpenJDK 17.0.20.1+1-LTS, Windows | BusyBox java -version exit **127**, java tidak ditemukan |
| Node | node --version exit 0: v24.19.0, Windows | node --version exit **127** |
| SDK36 | `Sdk/platforms/android-36/android.jar` ada | Tidak disalin/divalidasi |
| Build tools | Direktori 35.0.0, 36.0.0, 36.1.0, 37.0.0 ada; 36.0.0/aapt2.exe ada, 36.0.0/aapt2 tanpa ekstensi tidak ada | aapt2 lookup **127**; Windows binary bukan Linux toolchain |
| Gradle 9.4.1 | wrapper menunjuk 9.4.1; cache expanded distribution, .zip.ok dan bin/gradle ada | `gradle --offline --version` **127**, tidak ditemukan |
| AGP 9.2.1 | Direktori cache artifact version ada | Tidak divalidasi/resolved |
| Google Services 4.4.4 | Direktori cache artifact version ada | Tidak divalidasi/resolved |
| Foojay | Path group tebakan `org.gradle.toolchains.foojay-resolver-convention` tidak ada | Tidak cukup untuk menyimpulkan seluruh artifact Foojay hilang |
| Capacitor | cli/android/core package metadata masing-masing **8.3.4** | Node tidak tersedia; dependency tidak disalin |

Host metadata bukan validasi kelengkapan transitive cache, bukan bukti executable Linux siap. Tidak menjalankan Gradle pada host. Tidak npm install/download.

Cached alternatives juga benar-benar dicoba dengan `--pull never --network none --read-only --cap-drop ALL --security-opt no-new-privileges --entrypoint /bin/sh`: postgres:16-alpine, postgres:16, curlimages/curl:latest. Tiap command container exit **0**, tetapi `command -v java/node/gradle/aapt2` masing-masing **127**. postgres:16.14 ID sama dengan 16, tidak diduplikasi. iiidev/iii:0.11.2 gagal start `/bin/sh` tidak ada, exit **127**; inspect exit 0 menunjukkan Linux amd64 entrypoint `/app/iii`. Itu bukan bukti seluruh isi image tak memiliki Java; tooling yang dapat dieksekusi untuk kebutuhan ini belum terbukti. hello-world bukan kandidat build toolchain, tidak diluncurkan. Container alternatif tanpa host bind mounts; container berhenti dipertahankan.

**Blocker tepat yang terbukti:** Java, Node, Gradle launcher, aapt2 tidak ditemukan dalam guest BusyBox; kandidat shell image lain juga tidak menyediakan command tersebut pada PATH. Tidak ada failure resolusi Maven yang direkayasa. Missing transitive artifacts belum diketahui karena Gradle assemble belum dapat dimulai.

## 7. Static output dan provenance

Path pilihan Founder `C:\Users\shein\AppData\Local\Temp\opencode\mobile-staging-1792568056999\out` **ada**. Pemeriksaan rekursif/hash aktual exit **0**: **808 file, 66 HTML, 9.213.286 byte**, cocok dengan angka PLATFORM-02C. Setiap file direkam pada `static-manifest.json`; SHA-256 file manifest: `3f04909bb2ba1c79f9e9199f92ca895ea521a91156b3dd8aa133f19bb26b8b1d` (hash manifest, bukan APK atau hash gabungan byte output).

Perbandingan SHA-256 current vs staging cocok untuk 8 file: AuthContext, inbox page, communicationCenterService, userCommunicationService, package.json, package-lock.json, next.config.ts, runner staging. `config/platform-scope.json` juga cocok, hash `f0a66b3f39997626cf9ba70fd3d74bad0e54b1896ebaafe304f8db5166d18d2b`. Path tebakan `config/mobile-build-manifest.json` tidak ada di kedua lokasi; policy sebenarnya platform-scope.json.

Staging memiliki `.next` build/prerender/routes manifests. Tidak ditemukan manifest hash input original atau log yang mengikat secara kriptografis seluruh source/dependency ke output saat build; inventaris `.next/*manifest*` bukan pembuktian binding tersebut. Hash delapan file dan policy adalah bukti kesamaan sekarang, bukan provenance lengkap. Manifest output baru hanya menetapkan baseline saat inspeksi ini. Tidak memindai semua temp log yang tidak relevan. **Provenance PARTIAL**, tidak memenuhi label `COMPILE-ONLY FROM VERIFIED PREBUILT STATIC OUTPUT`. Tidak full clean build atau fresh export. Historical report bukan pengganti provenance.

## 8. Source snapshot dan konfigurasi native

Snapshot yang dibuat hanya manifest preservasi byte, bukan source staging compile. Tidak menyalin source, cache, .env, keystore, service account, local.properties atau profile ke guest. Public google-services JSON dibaca melalui parser yang hanya mencetak project_id dan package: **bhumiamartya-fe85c / com.bhumiamartya.app**, metadata command exit **0**, tidak mencetak API key.

`android/app/build.gradle` tetap versionCode 115, versionName 5.0.15, debug applicationIdSuffix `.qa`, versionNameSuffix `-qa`. Perubahan suffix ke kosong **NOT DONE**, termasuk salinan; gate dependency berhenti sebelum sync/build. HD dan seluruh product source tidak diedit.

## 9. Ledger eksekusi build dan verifikasi APK

| Tahap | Hasil / exit |
| --- | --- |
| Snapshot before melalui node bill05a4b-evidence.mjs before | 0; seluruh Git subprocess 0 |
| Inventaris command/path/CIM | Hasil pada §3–6; cmdlet exception bukan numeric native exit |
| Static inventory/hash | 0 |
| Public config/Capacitor/policy metadata | 0 |
| Guest isolation probe | 0; 2 checks isolasi sukses; tool failures 127 dicatat terpisah |
| Next export | NOT RUN; tidak ada exit |
| Capacitor sync android | NOT RUN; tidak ada exit |
| gradlew.bat assembleDebug --offline | NOT RUN; Windows guest tidak tersedia; Linux guest kekurangan runtime |
| Linux equivalent ./gradlew assembleDebug --offline | NOT RUN; bukan substitute build host |
| aapt2 badging/APK hash/native plugin packaging | NOT RUN; tidak ada APK baru |
| Lint/typecheck/app unit tests | NOT RUN; tidak ada edit produk dan tidak menjalankan dependency project di host di luar isolasi |

Jumlah assertion aplikasi: **0**. Tidak ada sanitized Gradle build log karena Gradle build tidak dijalankan. Log guest mencatat missing commands secara eksplisit. APK name/package/version/hash/native library/plugin list: **N/A**, bukan metadata APK historis. Host version Gradle file bukan hasil kompilasi.

## 10. Gates compile-only versus QA

- Environment isolation: **VERIFIED untuk Docker probe**; Sandbox tidak tersedia, feature state permission-inconclusive.
- Compile-only: **DEPENDENCY BLOCKED** pada toolchain Linux guest. Bukan BUILD FAILED karena assemble tidak pernah dimulai; bukan ISOLATION BLOCKED karena container network-none berhasil dibuktikan.
- COMPILE-ONLY PASS: **NOT ACHIEVED**; tidak ada APK baru.
- Provenance static output: **PARTIAL**, bukan verified build-input binding.
- QA **RSK-23 OPEN**; runtime, billing, Firestore, install/launch, emulator, purchases, Play, release readiness semua NOT RUN/NOT ESTABLISHED. QA config bukan blocker compile-only yang dipakai di sini.

## 11. Preservasi akhir dan footprint

Satu-satunya file repository yang ditambahkan tugas ini: `BHUMI_BILL-05A.4B_OFFLINE_COMPILE_ONLY_RESULT.md`. Tidak ada perubahan file produk atau tracked delta tugas ini (+0/-0 tracked); report adalah untracked baru. Manifest akhir `after.json` merekam hasil aktual: **2.867 hash awal diperiksa, changed=[]**, preservation command exit **0**, seluruh Git subprocess exit **0**. Total byte awal 81.338.140 tetap identik pada seluruh file tersebut. Status akhir aktual **61 modified tracked, 91 entri untracked, 0 staged**; branch dan HEAD tetap identik. File-level delta tugas: laporan baru **127 baris (+127/-0)**, tidak ada file awal berubah.

Tidak ada git add/commit/push/reset/restore/clean/stash/checkout. Commit baru **0**, production reads **0**, production writes **0**. Semua dirty tracked/untracked awal dipertahankan; bukti hash final menentukan preservasi, bukan count saja. Footprint di luar repo terbatas evidence pada approved temp dan container Docker probe berhenti. Tidak menghapus container/file, tidak mengubah konfigurasi daemon, networking host, OS optional feature, credential atau Git config.

## 12. Keputusan Founder dan langkah berikut

Pilihan paling kecil: sediakan/otorisasi **offline cached Linux build image** yang sudah berisi JDK kompatibel, Node, SDK36 Linux/build-tools serta Gradle dependency cache; gunakan Docker network-none yang sudah terbukti. Alternatif Windows Sandbox memerlukan keputusan Founder terpisah untuk memasang/mengaktifkan fitur dengan elevation; sesi ini tidak melakukannya. Tidak ada permintaan QA credential sebagai pengganti blocker.

Task berikut tepat: validasi toolchain guest offline; copy source whitelist saat ini beserta dirty files yang relevan dan public config tanpa secrets ke input sanitasi read-only, copy privat ke internal disposable workdir, satu temp output mount; cap sync; ubah suffix hanya pada salinan; assemble offline dan verifikasi fresh APK statis. Selesaikan binding provenance prebuilt atau fresh export offline sebelum memakai label verified prebuilt. Kekurangan cache harus dilaporkan dari output Gradle aktual bila proses tersebut sudah dapat dimulai. Tidak install/launch identitas produksi.

**STOP AND WAIT FOR FOUNDER REVIEW**
