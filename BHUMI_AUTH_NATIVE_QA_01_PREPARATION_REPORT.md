# AUTH-NATIVE-QA-01 — PREPARATION ONLY

Tanggal: 22 Oktober 2026. **GO untuk persiapan dokumentasi; BLOCKED untuk export, QA APK, install, dan runtime. NO BUILD.**

## 1. Latest-source readiness

Repo yang diotorisasi: `C:\tmp\bhumi-build106-recovery`; branch aktual `hotfix/build110-indonesian-only`; HEAD awal `e63f334cf0ac20cc076bc88e98e3e06808b024f3`. Baseline Git terstruktur: 62 tracked modified, 144 untracked file, staged 0. Dirty state diizinkan untuk dipertahankan, bukan diadopsi/dirapikan. Laporan ini belum ada ketika Glob dilakukan.

Governance dibaca: delapan entrypoint Build108/Build107/RULES, `docs/sot/SOT_INDEX.md`, laporan AUTH-NEW-02, PLATFORM-02C, dan laporan paritas APK yang telah diterima. Marker historis Build108 tidak memberikan izin build sekarang. Instruksi Founder PREPARATION ONLY paling tinggi. Dokumen untracked dipakai sebagai evidence task yang disebut Founder, bukan dipromosikan menjadi canonical source baru.

**Baseline AUTH-NEW-02 diterima apa adanya: 384 assertions pada enam suite utama / 421 assertions gabungan, historical exit 0. Tidak dihitung ulang, tidak dijalankan ulang. Native runtime NOT VERIFIED.**

### Source aktual, bukan kesimpulan runtime

- `lib/auth/authActions.ts:331-337`: satu blok start event per invocation; masih memilih LOGIN versus SIGNUP dari `auth.currentUser`, bukan selalu LOGIN. Snapshot lama memiliki dua blok di baris 307-322. Deduplikasi ini tidak membuktikan exactly-once lintas invocation atau seluruh event failure.
- `lib/auth/authActions.ts:91-110`: `getAdditionalUserInfo` adalah otoritas primer; boolean false langsung dikembalikan. Jika helper tidak tersedia/melempar, metadata valid dengan delta <=5000 ms masih mengembalikan **true**. Return type hanya boolean/undefined; tidak ada provenance/uncertainty flag dalam return. Komentar “flag as fallback” tidak mengimplementasikan flag. Ini discrepancy terhadap klaim explicit uncertainty pada laporan, bukan izin membuka ulang/refaktor.
- `lib/auth/authActions.ts:408-414,439-445`: ACCOUNT_CREATED dipagari `isNewUser === true` pada native exchange dan popup. Karena fallback dapat true, jangan perluas jaminan false authoritative menjadi semua returning login tanpa metadata authoritative.
- `context/AuthContext.tsx:186-197`: metadata invalid/missing menghasilkan undefined dan field dihilangkan; metadata valid <=5 detik tetap true tanpa UserCredential. Jadi unknown tidak selalu dipertahankan jika hanya timestamp tersedia.
- `lib/auth/authActions.ts:239-320`: bootstrap, reread, reconcile, presence, minimal profile dan bounded wait masih memiliki perilaku sendiri; telemetry fix tidak membuktikan first-profile bootstrap selesai. Bootstrap `ok:false` dapat melewati wait dan mengembalikan profile; ini bukan bukti server trial berhasil. Trial/data tetap server-owned.
- `context/AuthContext.tsx:239-302,371-423`: outcome primary/cache/pending/error terpisah; pending menetapkan profileError lalu return dengan finally mengakhiri loading. Tidak ada bukti runtime retry loop otomatis sukses.
- `lib/repositories/userRepository.ts:293-302` dan `lib/firebase/service.ts:309-325`: read failure dipropagasikan; null berarti dokumen absent pada fungsi tersebut. Namun `app/login/page.tsx:88,99` menangkap read failure menjadi null; baris 120-126 mengarahkan ke `/setup`, termasuk outer catch. `lib/auth/landingCtaRoute.ts:27-32` membedakan profileError, tetapi login effect tersebut tidak menunjukkan guard yang setara. **Pending routing risk: failure != verified missing.** Klaim laporan bahwa infinite loop telah ruled out/first onboarding fixed tidak menjadi runtime proof. Route aktual adalah `/setup`, bukan `/onboarding/setup` yang disebut laporan.

### Perbandingan hash source saja

Snapshot accepted PLATFORM-02C: `C:\Users\shein\AppData\Local\Temp\opencode\mobile-staging-1792568056999`. Tidak membaca/menghash ulang out, APK, atau aset Android. SHA256:

| Source | Latest sebelum laporan | Snapshot lama |
|---|---|---|
| `lib/auth/authActions.ts` | `3A178BF58F633754D4E3241A9DCFCABE0616FDFF2382B069AEA54A52E0D6C5A7` | `DC9D38CC7A0472C0C30C9738937D8659F15F1ECFBBF815F2DF36C5326D6E8193` |
| `context/AuthContext.tsx` | `5DC5BBCE837B9780CAFB001BC354FCF4D46C5E145B892E79BD6C7DBBE61B1C55` | `0E4B644AF90C5C558DF967FA6E3100908B57D5F71192B290C10F83DF91C75E56` |
| `app/login/page.tsx` | `8DDFB0E9C30F46BA0E771AC63576D3E3F592E5300CF6C00B54DB5BA40841DDD4` | sama |
| `app/page.tsx` | `48F3FBE9316093FBBA005C62B34319C00B3B6FB985FF0AEEDE57BBB1B04177ED` | sama |
| `lib/repositories/userRepository.ts` | `758A65E588A54D8598BE0B135B99322863C2F1E41C019D7BC3D3F3ECB1F122A2` | sama |

Snapshot authActions baris 393-423 memiliki credential exchange tanpa classifier dan ACCOUNT_CREATED tanpa guard. Accepted `BHUMI_ANDROID_APK_01_ASSET_PARITY_REPORT.md:19-29` mengikat APK lama ke output PLATFORM-02C, bukan latest AUTH-NEW-02. Maka APK lama bukan kandidat pembuktian auth fix terbaru; perubahan classifier/deduplikasi/latest listener tidak boleh diklaim ada di APK lama. Ini penggunaan provenance yang diterima, bukan pembukaan ulang audit paritas atau pembuktian reproducibility historis.

## 2. QA readiness dan resource matrix

Tidak ada external contact/resource creation. NOT_FOUND_LOCAL berarti tidak ditemukan pada lokasi lokal yang diperiksa, **bukan** bukti resource eksternal tidak ada.

| Resource / lokasi exact | Status dan alasan | Aksi Founder minimum / alternatif lokal |
|---|---|---|
| `android/app/build.gradle:7,48-52` | AVAILABLE: original `com.bhumiamartya.app`; debug suffix `.qa`, target `com.bhumiamartya.app.qa`, versi source 115/5.0.15-qa. Bukan identitas APK baru terverifikasi. | Setujui target QA, tanpa mengganti production identity. |
| `android/app/google-services.json` | AVAILABLE, metadata saja: project `bhumiamartya-fe85c`, package hanya original; bukan QA isolated registration. | Sediakan konfigurasi client Android dari project QA terpisah. Registrasi `.qa` dalam project produksi yang sama **bukan isolation**. |
| `android/app/src/debug/google-services.json` | NOT_FOUND_LOCAL; direktori debug berisi `AndroidManifest.xml` dan `res/xml/network_security_config.xml`. | Penempatan konfigurasi QA memerlukan scope terpisah. |
| Google Services plugin | `android/app/build.gradle:90-97` memeriksa root app `google-services.json` sebelum apply plugin. Jika hanya src/debug tersedia dan root tidak ada, plugin tidak diaktifkan. | Review QA-specific activation; jangan menyalin root produksi sebagai workaround. Tidak diimplementasikan. |
| Root `.env.local` | AVAILABLE: enam nama Firebase web keys dan `NEXT_PUBLIC_BILLING_VERIFIER_URL`; project web cocok metadata native produksi. Nilai tidak dicetak. | Setujui web client config QA dengan project sama dengan native QA. |
| `services/billing-verifier/.env.local` | Hanya nama `VERCEL_OIDC_TOKEN` ditemukan; tidak membuktikan backend QA siap. Nilai tidak dibaca ke laporan. | Bukti backend QA configuration/ownership lewat kanal aman; tidak meminta credentials. |
| OAuth web client | `lib/auth/authActions.ts:341,353-370` hardcoded web client diteruskan ke plugin (Credential Manager dan legacy). Metadata cocok OAuth pada native config lokal, prefix project number cocok. | QA harus menggunakan web OAuth client milik project QA; Android client/package saja tidak cukup. Hardcoded client produksi adalah blocker lintas-project. Jangan cetak ID/token/secret. |
| Debug certificate standar | AVAILABLE: `C:\Users\shein\.android\debug.keystore`; keytool lokal `C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot\bin\keytool.exe`. | Daftarkan SHA1/SHA256 signer QA yang dipilih; nanti buktikan signer APK aktual cocok. |
| Workspace debug signing | `android/app/debug.keystore` dan `android/debug.keystore` NOT_FOUND_LOCAL; tidak ada debug signingConfig khusus pada build.gradle. | Gunakan signer debug existing yang disetujui; jangan akses release keystore. |
| Isolated QA project, Google provider, consent/test-user registration | UNVERIFIED eksternal; tidak ada konfigurasi QA lokal yang membuktikannya. | Founder tentukan/otorisasi project QA, Google provider dan QA-only account/test-user. Emulator Auth sintetis tidak membuktikan Google OAuth. |
| Firestore/Auth/callables QA | SDK tersedia; `lib/firebase/config.ts:46-49,70-75` menggunakan app bersama dan regional functions. Deployment/rules/providers QA UNVERIFIED. | Pastikan semua service terikat project QA yang sama, rules unchanged dan owner-isolation. Emulator lokal dapat menguji kontrak, bukan native Google. |
| Bootstrap/verifier QA | BLOCKED: `services/billing-verifier/lib/firebaseAdmin.ts:5,28-33,57-77` mem-pin project produksi dan mengikat Auth/Firestore pada named app sama. Mengganti env saja akan ditolak untuk project QA. | Review adaptation QA fail-closed terpisah; backend runtime dan token issuer QA harus tervalidasi, tanpa mengubah trial semantics. |
| CORS/origin | Source tersedia: verifier `lib/security.ts:13-19`; bootstrap `api/access/bootstrap-trial.ts:13-33` OPTIONS, origin, bearer verified/revocation. Deployment belum diperiksa. | Approved native origin harus cocok scheme aktual; jangan wildcard. Local absence of Origin diterima source, bukan pengganti token auth. |
| Founder QA/access flags | `lib/auth/founderQaPolicy.ts:13-28`, guard `:7-15` membatasi akun bila flag true; allowlist existing bukan bukti QA account approved. `AuthContext:226` menjalankannya sebelum load profile. | Tentukan QA-only accounts dan kebijakan akses; jangan memakai akun produksi atau grant privileged/trial di client. |
| HD/astrology/daily guidance/billing extras | Production defaults masih ada: `lib/config/hdApiUrl.ts:3,21-30`, `astrologyApiUrl.ts:23-42`, `dailyGuidanceApiUrl.ts:4-18`, `next.config.ts:4`; billing SDK dependency masih ada `android/app/build.gradle:81`. | Setujui fail-closed disable extras/purchases dan production fallback pada scope QA berikutnya; jangan route prod saat onboarding. Tidak ada mocks sebagai native PASS. |

Sertifikat debug (public fingerprints): SHA1 `E7:76:79:29:E8:C4:14:92:FE:FA:D0:E8:A5:3A:BE:27:49:FF:A8:D4`; SHA256 `F7:0F:FC:C9:4A:33:A6:DD:A0:EE:C4:D3:84:64:13:36:50:3B:93:1A:7E:12:25:68:0E:C7:A9:E5:83:B6:B9:6A`. Probe pertama tanpa password exit 0 tetapi integrity NOT verified dan tidak menghasilkan fingerprint; tidak disebut PASS. Pembacaan kedua memakai password standar debug melalui stdin tanpa log password, exit 0, menghasilkan fingerprint di atas. Tidak membuka release keystore; belum ada bukti signature APK target baru.

## 3. Dependencies exact dan allowlist minimum (proposal, tidak diterapkan)

Slot berikut **placeholder non-usable**, bukan endpoint/resource yang telah tersedia: `<QA_PROJECT_ID>`, `<QA_ANDROID_APP>`, `<QA_WEB_APP>`, `<QA_WEB_OAUTH_CLIENT>`, `<QA_BOOTSTRAP_BASE>`, `<QA_WEB_BACKEND_BASE>`, `<QA_FUNCTIONS_REGION>`, `<QA_ACCOUNT_POLICY>`.

Allowlist future configuration:

- Public web keys saja: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, semuanya approved QA project. Native google-services project/app/package dan web SDK harus konsisten.
- Approved QA-only `NEXT_PUBLIC_BILLING_VERIFIER_URL`, `NEXT_PUBLIC_WEB_APP_URL`; HD/astrology/guidance harus endpoint QA yang dibuktikan atau disabled fail-closed. Slot kosong/synthetic/production/unknown harus memblokir export runtime kandidat, bukan fallback.
- Review flags `NEXT_PUBLIC_ENABLE_FOUNDER_PRE_RELEASE_QA`, `NEXT_PUBLIC_ENABLE_ADMIN_UI`, `NEXT_PUBLIC_USE_FIREBASE_EMULATORS`, `NEXT_PUBLIC_USE_AUTH_EMULATOR`, `NEXT_PUBLIC_USE_FIRESTORE_EMULATOR`, `NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR`, `NEXT_PUBLIC_ENABLE_EMULATOR_QA_LOGIN`, `NEXT_PUBLIC_ENABLE_ANDROID_EMULATOR_QA_LOGIN`, `ENABLE_QA_LOGIN`. Native real Google acceptance tidak menggunakan harness alias/mock login. Admin tetap off; account access approved; emulator mode dipisahkan jelas dari real QA.
- Backend-only config: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `ALLOWED_ORIGINS` serta project-pinning yang telah direview. **Tidak ada service account/private key dalam APK/web export**. Backend Auth verifier issuer/audience, database project dan callable project harus QA identik. Config client publik bukan service-account credential.
- Billing transactions, purchase/restore/verification/reconcile ke produksi harus disabled/block pada scope QA terpisah. `BILLING_PREVIEW_DRY_RUN` bukan isolation yang cukup dan bukan bukti real billing; server bootstrap boleh tetap diuji hanya pada QA, trial/server data ownership dan rules tidak diubah.

Future runtime checks: package `.qa`, SHA signer aktual, OAuth Android package+SHA1+SHA256, web OAuth audience, native plugin options (skipNativeAuth true per call vs config false di `capacitor.config.ts:17-20`), actual plugin behavior, Web Auth app project, Firestore project, Functions region/project, bootstrap verifier issuer/audience/project, origin CORS, provider availability, account allowlist, serta deny semua destination produksi. Harus dibuktikan sebelum sesi pertama; jangan log token/email/UID/birth payload.

## 4. Rencana latest-source export dan aksi Founder minimum

Runner existing `scripts/run-mobile-staging-build.mjs` dapat digunakan ulang hanya setelah scope QA disetujui. Baris 14-61 membaca `config/platform-scope.json` fail-closed untuk classification/inclusion; 76-139 menyaring env/secrets/API/admin sesuai scope dan menyalin source ke disposable staging. **Ini bukan deterministic input manifest lengkap**: nama staging memakai timestamp, process env diwarisi, dan dependensi memakai junction existing. Future capture harus mencatat sorted relative source path+SHA256, HEAD+dirty snapshot, lockfile+runner+scope hashes, tool versions dan approved nonsecret config fingerprint untuk mengikat output ke input. Jangan hanya mengandalkan timestamp.

Blocker runner aktual `:267-294`: emulator flags false, founder QA false, production web URL dipin, billing verifier default produksi, Firebase fallback synthetic. `next.config.ts:33` juga tergantung inherited VERCEL untuk export. Jadi runner sekarang **compile harness, bukan runtime-safe isolated QA exporter**. Tidak dieksekusi, tidak ada fresh export ready claim.

Aksi Founder minimum:
1. Ratifikasi project QA terpisah dan target `.qa`, provider Google, web+Android registration, QA-only accounts/consent policy serta debug SHA di atas (atau signer QA lain yang dibuktikan).
2. Otorisasi scope configuration/backend QA sempit: client OAuth override, plugin root-file condition, explicit env allowlist tanpa inherited production defaults, backend QA project pin/issuer/Firestore/callables/CORS, extras/purchase fail-closed. Tidak mengubah rules atau trial semantics. Discrepancy classifier/routing dicatat untuk disposition, bukan refaktor diam-diam.
3. Setelah dependencies tersedia dan review selesai, otorisasi export dan APK secara eksplisit sebagai task baru; lalu identity/config verification; baru izin install/runtime dengan QA accounts.

Alternatif paling ringan: gunakan existing local Firebase Auth/Firestore/functions emulator dan synthetic identities untuk kontrak bootstrap/routing; tidak perlu Linux/infrastruktur baru. Ini **tidak** menyelesaikan native Google OAuth registration maupun membuktikan runtime native. Tidak menyalakan emulator atau harness pada task ini.

## 5. Gate keputusan dan urutan aman

| Gate | Status sekarang | Bukti yang dibutuhkan untuk lanjut |
|---|---|---|
| Latest auth source inspection | GO persiapan saja | Hash dan discrepancy di atas; synthetic baseline tetap accepted, runtime NOT VERIFIED. |
| QA resources/config | BLOCKED | Isolated project, Google/OAuth/package/SHA, QA web config, backend issuer/data/origin consistency dan account policy approved. |
| Latest-source export | BLOCKED / NOT RUN | Izin baru; reviewed fail-closed QA configuration, exact source/dependency/config manifest; reuse existing Windows runner setelah review, bukan output lama. |
| QA APK | BLOCKED / NO BUILD | Export baru diterima lalu izin build QA terpisah. Tidak mengulang closed compile/parity audit sekarang. |
| Identity/config then install/runtime | BLOCKED / NOT VERIFIED | Fresh APK package/signature/config target proof, lalu izin QA install/launch dan native Google new-user + existing-user + onboarding checks. |

Urutan terpendek: **resource approval/config review -> authorized latest-source export -> authorized QA APK -> verify identity/config -> authorized QA install/runtime**. Runtime future mencakup first Google login, returning login, cancel/failure, exactly-scoped telemetry, server profile/bootstrap delay/error, confirmed-missing versus read failure, existing completed setup tanpa overwrite, onboarding completion/relogin. Jangan menganggap HTTP/compile/mock PASS sebagai native PASS.

## Pelaksanaan dan integritas

Tidak ada build/Next export/Gradle/sync/install/launch, external request, produksi read/write, deploy, resource creation, git mutation, commit atau push. Tidak menjalankan tests/lint/TSC: dokumentasi-only dan tidak mengulang audit; exit N/A, assertions baru 0. Pemeriksaan metadata/hash/keytool adalah read-only, bukan aplikasi test PASS.

Verifikasi after-report dieksekusi: branch/HEAD tetap sama; 62 tracked modified, 145 untracked (144 awal + laporan), staged 0; status exit 0. Git diff SHA256 sebelum=sesudah `BB6DA09821455319B29E2B3349E74CDDAA7CF13BD8E94CD6D378B10E0AA4C2CA`, diff exit 0 (UTF8 output diff --binary dengan newline join). Kelima source SHA256 sesudah identik dengan kolom latest sebelum. Tidak menghash seluruh ignored assets/keystore/secret files atau semua untracked; preservasi untracked berdasarkan tidak ada operasi write/delete pada file tersebut, bukan full filesystem byte audit.

Scope edit: hanya laporan ini, **1 file baru / +108 -0 baris**, product edits **0 file / +0 -0 baris**. `git diff --no-index --numstat -- NUL BHUMI_AUTH_NATIVE_QA_01_PREPARATION_REPORT.md` menghasilkan 108/0; exit 1 berarti diff ditemukan, bukan test failure. Dua penggantian paragraf penutup mempertahankan jumlah baris. Existing tracked/untracked dipertahankan; commits 0. Next task exact: Founder review dependency/config authorization untuk isolated QA; bukan build.

**STOP AND WAIT FOR FOUNDER REVIEW**
