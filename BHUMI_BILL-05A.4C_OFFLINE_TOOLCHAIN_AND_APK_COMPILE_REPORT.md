# BILL-05A.4C — Offline toolchain and APK compile report

Tanggal: 21 Oktober 2026. **DEPENDENCY BLOCKED; assemble NOT RUN, bukan COMPILATION FAILED. NATIVE-ONLY COMPILE PASS tidak tercapai.**

## Otorisasi, baseline, dan batas

Worktree: `C:\tmp\bhumi-build106-recovery`. Branch awal/akhir `hotfix/build110-indonesian-only`; HEAD `e63f334cf0ac20cc076bc88e98e3e06808b024f3`. Founder secara eksplisit mengotorisasi inventaris dan conditional native-only offline compile, bukan release ENL. BILL-05A.4B dan PLATFORM-02C dibaca penuh sebelum sumber; AGENTS dari konteks, RULES, BUILD_106_MASTER_SOT dan BUILD_108_ENL_MASTER_SOT dibaca. Historical PASS tidak dipromosikan menjadi hasil sesi ini. Konflik status historis ENL tidak dipakai sebagai izin release.

Awal: 61 tracked modified historis, 91 untracked, tidak ada staged. Manifest `before.json` merekam 2.868 file Git tracked/nonignored-untracked yang ada beserta ukuran/SHA256, termasuk dirty snapshot. Hash manifest awal `a4335cbbf65d92b687980224fe3e440c8aed3ee02c6ebd29822d527d5283caae`. Ignored dependency/cache diinventaris terpisah, bukan dianggap bagian manifest Git. Nama laporan tujuan diperiksa belum ada sebelum pekerjaan.

Evidence root (selanjutnya E): `C:\Users\shein\AppData\Local\Temp\opencode\bill05a4c-evidence`. Empat skrip pendukung ada di parent E: `bill05a4c-evidence.mjs`, `bill05a4c-docker.mjs`, `bill05a4c-detail.mjs`, `bill05a4c-extra.mjs`. Tidak mengubah source, pipeline, HD, konfigurasi host, Git index atau ref. Tidak membaca layanan/API/auth console produksi, tidak mengunduh, menerima lisensi, install/launch APK, deploy, atau menggunakan release signing.

## 1. Temuan utama yang memperbaiki kesimpulan sebelumnya

1. **JDK21 sebenarnya ada di Windows**, walau PATH default memilih JDK17. Microsoft 21.0.11+10, Gradle-provisioned JetBrains 21.0.11, dan Android Studio JBR 21.0.10 berhasil menjalankan `java.exe -version`, masing-masing exit 0. Semua launcher PE/MZ Windows, bukan ELF Linux.
2. **Gradle 9.4.1 sudah ada**, termasuk launcher shell Unix, JAR, expanded bin distribution dan ZIP all. Tidak perlu Node/Next/cap sync untuk jalur native generated yang diperiksa. Ketiadaan `gradle` pada PATH image bukan bukti distribusi lokal hilang.
3. **Google Services 4.4.4 dan Foojay 0.10.0 tersedia**, bukan dependency yang terbukti hilang. JAR dan binary descriptor cache ada; Foojay plugin marker descriptor juga ada walaupun file POM tidak ada di files-2.1.
4. **Blocker konkret Linux**: JDK21 Linux belum ditemukan/terbukti tersedia dalam kandidat lokal yang diperiksa; SDK build-tools 36.0.0 lokal adalah Windows, dan Maven aapt2 hanya classifier Windows. `aapt2-9.2.1-15009934-linux.jar` tidak ada dalam seluruh manifest files-2.1 yang diperiksa.
5. Generated native wiring tersedia, tetapi public assets Android yang lama **bukan** output PLATFORM-02C. Build berikut harus memasukkan output pilihan ke salinan terisolasi saja.

## 2. Docker aktual, digest, arsitektur dan isolasi

Host `win32/x64`; daemon explicit local pipe `npipe:////./pipe/docker_engine`, Docker 29.6.1, Linux x86_64. Guest kernel 6.18.33.2-microsoft-standard-WSL2, x86_64. Semua image inspect linux/amd64.

| Image lokal | Digest/ID SHA256 | Size dari image inspect, byte | Probe shell exit |
|---|---|---:|---:|
| postgres:16-alpine | cf78e76683b9ca8c5733cbbdce6c9262b45b6767934dd0a95e671f9a0fc20685 | 116075089 | 0 |
| postgres:16 / 16.14 (ID sama) | 95206741a5b214807675e14165369d05b93a9cf692223b616d07cca227e74b0b | 160197950 | 0 |
| curlimages/curl:latest | 7c12af72ceb38b7432ab85e1a265cff6ae58e06f95539d539b654f2cfa64bb13 | 10652192 | 0 |
| iiidev/iii:0.11.2 | 15f8d4ed16c0bec350b98f4e18ed04498b1fc5ccc50585e087b736717300cf26 | 20773090 | 127 |
| hello-world:latest | c3cbe1cc1aa588a64951ac6286e0df7b27fe2e6324b1001c619bb358770c0178 | 16227 | 127 |
| busybox:1.36 | 73aaf090f3d85aa34ee199857f03fa3a95c8ede2ffd4cc2cdb5b94e566b11662 | 2217006 | 0 |

Ukuran ini field inspect lokal, bukan estimasi download atau angka expanded `image ls`. Seluruh exact argument arrays, stdout/stderr dan exit disimpan pada `E/commands.json`.

Template command aktual untuk index 0..5, digest sesuai tabel:

```text
docker --host npipe:////./pipe/docker_engine run --pull never --name bill05a4c-probe-N --network none --read-only --cap-drop ALL --security-opt no-new-privileges --tmpfs /work:rw,nosuid,size=64m --mount type=bind,source=C:/Users/shein/AppData/Local/Temp/opencode/bill05a4c-evidence/input,target=/input,readonly --mount type=bind,source=C:/Users/shein/AppData/Local/Temp/opencode/bill05a4c-evidence/output,target=/output --entrypoint /bin/sh sha256:DIGEST /input/probe.sh
```

Pada empat image dengan shell, `/sys/class/net` hanya lo, `/proc/net/route` hanya header, IPv6 hanya lo. Lookup java/javac/gradle/aapt2/node masing-masing exit 127. Pencarian nama tool juga dilakukan di direktori tool lazim `/usr/lib/jvm`, `/opt/java`, `/opt/jdk`, `/usr/java`, `/opt/android`, `/opt/gradle`, `/usr/local/openjdk-21`, `/usr/local/bin`, `/app`; tidak menemukan tool tersebut. Ini pencarian terarah, bukan klaim tidak ada binary bernama lain di seluruh host.

Image iii dan hello-world tidak punya /bin/sh. Untuk menutup celah pemeriksaan sebelumnya, `docker export bill05a4c-probe-3` dan `-4` dialirkan dalam memori ke `tar -tf -`, tanpa mengekstrak atau mencetak isi file. Semua export/tar exit 0; 1.792/17 entri split listing, nol nama java/javac/aapt2/gradle/jdk/openjdk/jvm. Evidence `shellless-images.json`. Tidak menjalankan entrypoint layanan image.

**Penyimpangan footprint yang dicatat jujur:** image postgres mendeklarasikan VOLUME; Docker otomatis membuat dua anonymous volume baru untuk `/var/lib/postgresql/data`, walaupun skrip hanya meminta dua bind mounts. Jadi probe postgres tidak memenuhi bentuk mount minimal yang diminta. Volume baru tidak dibaca dan tidak dihapus. Probe curl/busybox membuktikan bentuk yang benar: tepat satu input bind read-only dan satu output bind writable, internal tmpfs, tanpa socket/privileged/host network. Tidak ada build pada probe postgres. Container probe berhenti dipertahankan.

`docker volume ls --format '{{.Name}} {{.Driver}} {{.Scope}}'` exit 0 mencatat 10 volume awal (9 nama opaque dan agentmemory_iii-data), hanya metadata nama/driver/scope. Tidak inspect isi atau mount volume pribadi tersebut. WSL list exit 0: Ubuntu/docker-desktop terdaftar WSL2 dan dilaporkan Stopped. Ubuntu tidak dimulai: sesi ini belum membuktikan network-disabled untuk distro tersebut; keberadaan JDK Linux di Ubuntu **UNVERIFIED**, bukan absent. Tidak mengubah jaringan host.

## 3. Inventaris SDK, Java, Gradle, Maven

Evidence lengkap dengan ukuran/hash: `jdk-paths.json`, `extra.json`, `gradle-distribution.json`, `sdk-artifacts.json`, `maven-artifacts.json`, `dependency-checks.json`.

| Artifact | Hasil aktual / SHA256 |
|---|---|
| Microsoft JDK21 java.exe, 50.208 byte | e4c702ab4d11cc094144ff91c91371ed9b35a38a2e54ed1e032a628cc5bd40f3 |
| Gradle cached JetBrains JDK21 java.exe, 34.144 byte | 32175de845136d912639895587c199a0f114008cd2b4defec97509e14ca28ee3 |
| Gradle 9.4.1 launcher JAR, 341.971 byte | 541d9a671246033cae467215bdfc16839958888f3808a6aa937ba7fc802945ed |
| Gradle 9.4.1 all ZIP, 271.623.173 byte | e75dea3b184089016580c9fba8d506d08730a053b1fd513252a94277ea6d41e6 |
| SDK android-36/android.jar, 27.768.026 byte | d9eb9da824d9e247a352f570f01e1169e725b2954bca9e283a71786c59b59f9a |
| SDK build-tools/36.0.0/aapt2.exe, 5.423.200 byte | babf3122e515ddb954c5ac4669e085ce990536c035e3072de30127bddd6e3608 |
| AGP 9.2.1 JAR, 12.974.080 byte | 582e85078b60eb80669223b34b58200ba034654b2edb1cf9621e62fde7dfc0a3 |
| Google Services 4.4.4 JAR, 42.747 byte | 7a6579dfee3aa1bd0564d72f9c91d75bde715b44bc484eefc984841c642540cd |
| Foojay resolver 0.10.0 JAR, 45.786 byte | 0cd7ca9f9ed1ba8a323f1902c05af21dd6223a130345fbe78f5e48d58ccd6d4c |
| Maven aapt2 9.2.1-15009934 windows JAR, 2.132.406 byte | ac25e699c4830b5179f138736fd6200567aa1d73acc4dff0b0ba2b73013a8cdb |

Gradle distributions manifest mencakup 25.011 file / 1.629.890.756 byte (beberapa versi, bukan semuanya dibutuhkan). SDK platform36+build-tools36.0.0: 11.513 file / 249.456.029 byte. Maven files-2.1: 621 file. Hash mengikat byte lokal saat inventaris, bukan verifikasi signature/checksum vendor yang diunduh.

Gradle bin/gradle adalah skrip Unix dan JAR Java dapat dipakai lintas OS dengan runtime yang sesuai; gradle.bat serta java.exe/aapt2.exe PE tidak dapat dipakai sebagai executable Linux. SDK android.jar dapat direuse lintas platform. Native helpers Gradle dan seluruh dependency closure belum diuji dalam guest. Tidak menjalankan Gradle host dan tidak menganggap `.zip.ok` bukti compile.

Root meminta AGP9.2.1, GoogleServices4.4.4; wrapper Gradle9.4.1. Modul Capacitor/Cordova masih menyatakan AGP8.13.0; JAR versi itu ada. Filesystem/geolocation memakai Kotlin plugin2.2.20; dua variant JAR cached. Potensi interaksi AGP9/root dengan plugin library/Kotlin lama tetap **UNVERIFIED sampai compile**, bukan failure yang direkayasa.

App awal menyatakan Java17, tetapi `apply from: capacitor.build.gradle` sesudah blok android menetapkan source/target21. Capacitor/Cordova dan plugin juga Java21; filesystem/geolocation eksplisit `jvmToolchain(21)`. Karena itu default host JDK17 bukan compiler yang cukup. Java tidak diturunkan; tidak mengaktifkan Foojay download otomatis.

GoogleServices dan AGP9.2.1 masing-masing punya JAR dan descriptor.bin metadata-2.107. Foojay resolver dan plugin marker punya descriptor.bin. POM/module files tidak ditemukan untuk versi fokus dalam files-2.1, tetapi ini **bukan bukti resolusi offline pasti gagal** karena descriptor binary ada. Tidak ada exact missing transitive list yang dapat dinyatakan tanpa resolver berjalan.

Direct artifacts billing9.1.0, review/review-ktx2.0.2, app-update2.1.0, firebase-auth24.0.1, ionfilesystem1.1.0, iongeolocation2.2.0 juga terbukti ada, hash pada dependency-checks. Missing yang terbukti dibatasi pada classifier aapt2 Linux di cache yang diperiksa dan tool runtime Linux dalam kandidat yang diperiksa; closure Maven lainnya UNVERIFIED.

Known project temp diperiksa: bill05a4b-evidence (manifest/log/probe), bill05a4a-BYGyIw (manifest/diff metadata), mobile-staging-1792568056999 (source/output/node_modules). `known-cache-paths.json` merekam top-level listing. Native Next SWC staging yang ditemukan adalah win32-x64-msvc PE, bukan toolchain Linux. Tidak memindai download pribadi atau volume lain.

## 4. Generated native completeness: cukup untuk jalur native tanpa sync, bukan compile PASS

Dibaca: root/settings/variables/wrapper Gradle, capacitor.settings, app build/capacitor.build, Cordova build/variables, plugin registry/config assets, Gradle modul dependency dan plugin source paths. Semua 10 projectDir dari capacitor.settings ada beserta build.gradle (core + 9 plugin), app dan Cordova manifest ada, wrapper shell/JAR ada. Generated dependency references sesuai registry. Bukti per-file SHA256 pada `native-projects.json` dan `native-manifest.json`, isi Gradle modul pada `gradle-source-review.json`.

| Native module | Versi package | Registry class source |
|---|---|---|
| @capacitor/android core | 8.3.4 | core project ada |
| @capacitor-firebase/authentication | 8.2.0 | ada |
| @capacitor/app | 8.1.0 | ada |
| @capacitor/filesystem | 8.1.2 | ada, src/main/kotlin |
| @capacitor/geolocation | 8.2.0 | ada, src/main/kotlin |
| @capacitor/local-notifications | 8.2.0 | ada |
| @capacitor/preferences | 8.0.1 | ada |
| @capacitor/share | 8.0.1 | ada |
| @capacitor/toast | 8.0.1 | ada |
| capacitor-secure-storage-plugin | 0.13.0 | ada |

Conditional publish scripts tidak diperlukan bila CAP_PUBLISH/CAP_PLUGIN_PUBLISH tidak disetel; tidak membutuhkan npm install/Node untuk native compile ini. Firebase plugin compileOnly provider dependencies tetap dependency kompilasi meskipun provider include flags default false.

Public `android/app/google-services.json` hanya diparse metadata project/package: `bhumiamartya-fe85c` / `com.bhumiamartya.app`, bukan API key. Capacitor config appId sama, webDir out, registry 9 plugin. Native version115/5.0.15; suffix debug `.qa` / `-qa` masih asli. Tidak menghapus suffix pada original atau membuat staging sebelum toolchain guest terbukti. Release signing properties tidak disalin/dicetak.

Native assets/public saat ini 740 file, 70 HTML, 12.713.390 byte: berbeda dari PLATFORM-02C. Jadi jangan memakai assets generated lama sebagai output yang terverifikasi. Struktur native cukup untuk melewati sync secara sengaja, dengan penggantian assets **di salinan** setelah gate toolchain. Native completeness ini tidak menjamin semua Gradle API kompatibel atau build sukses.

## 5. Static output dan provenance

`C:\Users\shein\AppData\Local\Temp\opencode\mobile-staging-1792568056999\out` dihash ulang: **808 file / 66 HTML / 9.213.286 byte**. Seluruh path/hash sama dengan manifest BILL-05A.4B; nol changed. Manifest sesi ini SHA256 `ff891cd56eafa33c805c557b7d39aa76d427d7edceeaca5a5933528b873d5319` (serialisasi/order berbeda dari manifest terdahulu, bukan perubahan file).

Provenance tetap **PARTIAL**: kesamaan byte output saat inspeksi tidak membuktikan input seluruh source/dependency ketika export historis. Tidak ada fresh export atau binding build input baru. `.next` staging ada, tetapi tidak dipromosikan menjadi bukti provenance lengkap. Tidak memakai label FROM VERIFIED PREBUILT STATIC OUTPUT.

## 6. Ledger commands, checks dan keputusan build

| Eksekusi | Exit/hasil |
|---|---|
| git branch --show-current; git rev-parse HEAD; git status --short | read-only; output awal CLI diringkas; identitas/status lengkap diperoleh subprocess Git berikut |
| node bill05a4c-evidence.mjs before | 0; semua subprocess Git 0 |
| node bill05a4c-evidence.mjs inventory | 0; manifests source/cache/static tersimpan |
| node bill05a4c-docker.mjs | 0 orchestrator; masing-masing exit Docker ada di commands.json |
| docker info/image ls/volume ls/image inspect/container inspect | semuanya 0 |
| docker run shell probes | 0,0,0,127,127,0; tool lookups 127, bukan build result |
| node bill05a4c-detail.mjs pertama | 1; 3 assert lolos, assert keempat gagal karena skrip awal hanya mencari src/main/java |
| perbaikan skrip evidence: tambahkan src/main/kotlin; rerun detail | 0; **4 assertions PASS**: jumlah static, semua static hashes, semua project Gradle, semua registry sources |
| docker export + tar -tf - dua image tanpa shell | masing-masing 0; tidak ada kandidat JDK |
| node bill05a4c-extra.mjs | 0; metadata cache dan hashes Java |
| java -version default dan tiga absolute JDK21 java.exe | masing-masing 0; versi tepat di extra.json/commands.json |
| node bill05a4c-evidence.mjs after | 0; 2.868 file awal unchanged |
| Next export | NOT RUN, tidak dibutuhkan jalur native-only |
| Capacitor sync | NOT RUN, bukan PASS |
| Sanitized source/cache staging dan suffix edit salinan | NOT RUN; guest prerequisite tidak terpenuhi |
| ./gradlew assembleDebug --offline | NOT RUN; tidak ada guest JDK21/Linux SDK proven |
| APK aapt2 badging, ZIP/DEX/plugin/assets/SHA256 | NOT RUN; tidak ada APK baru |
| lint/typecheck/unit aplikasi | NOT RUN; tidak mengubah produk atau menjalankan pipeline host di luar isolasi |

Tidak ada log Gradle karena Gradle tidak dimulai; exact exit assemble **N/A**, bukan 0 atau failure palsu. Tidak ada APK name/package/version/hash yang diklaim dari artifact historis. Assertion aplikasi 0; evidence self-check 4. FULL PIPELINE PASS tidak diklaim. QA **RSK-23 OPEN**, bukan alasan blocker native compile. Billing/runtime/emulator/device/Play QA semuanya NOT RUN.

## 7. Approval manifest jika memilih menyediakan toolchain Linux

Pilihan lebih kecil daripada rebuild web: pertahankan generated native project dan prebuilt out; sediakan hanya runtime/toolchain Linux serta dependency cache yang kurang. Alternatif tanpa download baru adalah Founder menyediakan image/cache offline yang sudah dimiliki; image itu tetap harus diinspect/digest dan diverifikasi sebelum build.

| Item approval terpisah | Versi/identifier resmi | Status lokal dan lisensi |
|---|---|---|
| JDK Linux x86_64 | Microsoft Build of OpenJDK 21.0.11+10, atau distribusi OpenJDK21 vendor resmi yang Founder pilih | Windows21 ada, Linux belum terbukti. Gunakan kanal resmi Microsoft/OpenJDK; GPLv2 + Classpath Exception dan notices distribusi perlu direview, tidak diterima sesi ini |
| Android SDK Linux build-tools | SDK package `build-tools;36.0.0` dari Google Android SDK repository | lokal hanya Windows; perlu persetujuan Android SDK License Agreement sebelum provisioning |
| Platform SDK | `platforms;android-36` dari Google Android SDK repository | android.jar lokal ada dan hash tercatat; reuse dahulu, tidak otomatis download ulang; terms SDK tetap berlaku |
| Maven Linux resource compiler | `com.android.tools.build:aapt2:9.2.1-15009934:linux@jar` dari Google Maven | classifier Linux terbukti tidak ada pada cache inspected; terms/notices distribusi direview |
| Gradle | distribusi resmi `gradle-9.4.1-bin.zip` sesuai wrapper, services.gradle.org | expanded9.4.1 dan all ZIP ada; reuse, tidak meminta download default; Apache2/notices |
| Maven/plugin cache residual | Google Maven, Maven Central, Gradle Plugin Portal, sesuai repository declarations | AGP9.2.1/8.13.0, GoogleServices4.4.4, Foojay0.10.0, Kotlin2.2.20 ada; transitive missing list UNKNOWN sampai resolver offline berjalan |

Untuk semua artifact prospektif: **SHA256 UNKNOWN sampai diunduh/diverifikasi; ukuran download UNKNOWN**. Tidak memberi URL mirror atau pin image digest yang belum ada. Belum memilih/mengunduh image toolchain baru; digest image lokal tersedia pada §2. Tidak meminta blanket download semua transitive atau acceptance otomatis `sdkmanager --licenses`. Node bukan prerequisite native-only sehingga tidak dimasukkan sebagai download blocker.

## 8. Preservasi akhir, keterbatasan dan tindak lanjut

Satu-satunya tambahan repo tugas ini: `BHUMI_BILL-05A.4C_OFFLINE_TOOLCHAIN_AND_APK_COMPILE_REPORT.md`. Tracked task delta +0/-0; 61 modifikasi historis dipertahankan. Manifest after memverifikasi seluruh 2.868 file awal identik. Status akhir yang diharapkan setelah laporan: 61 modified tracked, 92 untracked, staged0; verifikasi sesudah penulisan dicatat di `E/after.json`. Branch/HEAD tetap. Commit/push/Git mutations0; production reads/writes0. Tidak menghapus untracked, container, atau cache awal.

Keterbatasan: distro Ubuntu tidak diperiksa internal; dependency resolution/runtime Gradle belum diuji; static provenance partial; host cache fingerprints bukan checksum vendor; probe postgres membuat anonymous volume otomatis sebagaimana §2. Tidak menyatakan audit seluruh mesin atau source compatibility PASS.

Next task tepat: setelah Founder menyediakan atau menyetujui artifact Linux tertentu, buktikan JDK21/SDK36/build-tools36 dalam guest network-none; whitelist copy dirty native/source dependency yang relevan + out pilihan tanpa .env/serviceaccount/keystore/local credentials; gunakan internal writable copy dan satu output bind, tanpa volume image tambahan; edit suffix hanya salinan; assembleDebug --offline dengan Java21 dan toolchain autodownload disabled, ephemeral debug signing; inspeksi APK statis tanpa install/launch. Jika resolver menolak cache, catat exact coordinate dari log offline dan berhenti tanpa fetch.

**STOP AND WAIT FOR FOUNDER REVIEW**
