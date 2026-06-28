# MOANA-007 FINAL QA REPORT

## 1. Ticket ID

MOANA-007 - Dashboard Core Identity Regression

## 2. VersionCode Tested

56

Source: `android/app/build.gradle`

## 3. Device Tested

BLOCKED - no real Android device was detected by ADB.

ADB output:

```text
List of devices attached
```

ADB was restarted on Windows using the SDK-local executable:

```text
adb kill-server
adb start-server
adb devices -l
```

Result after restart remained:

```text
List of devices attached

* daemon not running; starting now at tcp:5037
* daemon started successfully
```

## 4. Account Tested

Not tested. Founder/test account login could not be performed because no Android device was available.

## 5. Dashboard Before Close/Reopen

Not tested on Android real device.

Expected values remain:

- Life Path: 4
- Zodiac Matahari: Taurus
- Pusat Arcana: 8
- Human Design: ManGen
- Weton: Sabtu Legi
- BaZi: real compact value, not fallback
- Vedic: Libra Moon
- Tzolkin: Ahau 260

## 6. Dashboard After Close/Reopen

Not tested on Android real device.

## 7. Weton Result

Not verified on device. Code path hydrates missing Weton using `calculateWeton({ birthDate, birthTime })`, but Android runtime display/readback remains unverified.

## 8. BaZi Result

Not verified on device. Code path hydrates missing BaZi using `calculateBazi({ birthDate, birthTime, timezone })`, but Android runtime display/readback remains unverified.

## 9. Tzolkin Result

Not verified on device. Code path formats Tzolkin as compact seal plus kin number, for example `Ahau 260`, but Android runtime display/readback remains unverified.

## 10. Human Design Result

Not verified on device. Code path displays verified `Manifesting Generator` as `ManGen`, but Android runtime display/readback remains unverified.

## 11. Data Persistence Proof

Not available. Android install, login, close/reopen, and dashboard readback could not be performed because ADB reports no connected device.

The debug APK candidate was built successfully:

`C:\Users\shein\bhumi-amartya-clean\android\app\build\outputs\apk\debug\app-debug.apk`

## Browser QA Update

Founder temporarily approved browser QA while Android/ADB is blocked.

Browser QA path:

- URL: `http://localhost:3001/dashboard`
- Mode: development-only audit route with `localStorage.bhumi_audit_user = "moana007"`
- Evidence screenshot: `screenshots/moana-007-browser-dashboard.png`

Dashboard Identitas Inti browser result:

- Life Path: `4`
- Zodiac Matahari: `Taurus`
- Pusat Arcana: `8`
- Human Design: `ManGen`
- Weton: `Sabtu Legi`
- BaZi: `Yang Wood`
- Vedic: `Libra Moon`
- Tzolkin: `Ahau 260`
- Forbidden placeholders: no `...`, no `undefined`, no `null`
- `Belum tersedia`: not present in the Dashboard browser QA result

Browser QA status:

`BROWSER QA ACCEPTED / ANDROID QA PENDING`

Profile/Gudang Identitas Jiwa browser note:

- Checked `http://localhost:3001/profile` with the same audit browser setup.
- The page showed `Profilmu belum siap dibaca. Lengkapi data kelahiran terlebih dahulu.`
- Full-detail Profile/Gudang verification remains not proven in browser because that route did not hydrate from the Dashboard audit fixture.
- Evidence screenshot: `screenshots/moana-007-browser-profile.png`

## 12. Commands Run

- `rg -n "versionCode|versionName|applicationId" android\app\build.gradle capacitor.config.ts package.json`
- `Get-ChildItem -LiteralPath android -Force`
- `Get-ChildItem -LiteralPath android -Filter gradlew* -Force`
- `C:\Users\shein\AppData\Local\Android\Sdk\platform-tools\adb.exe devices -l`
- `C:\Users\shein\AppData\Local\Android\Sdk\platform-tools\adb.exe kill-server`
- `C:\Users\shein\AppData\Local\Android\Sdk\platform-tools\adb.exe start-server`
- `npm run android:sync`
- `Get-Content -LiteralPath capacitor.config.ts`
- `.\gradlew.bat assembleDebug`
- `Get-ChildItem` searches for local `java.exe`
- `JAVA_HOME=C:\Program Files\Android\Android Studio\jbr; .\gradlew.bat assembleDebug`
- `Get-ChildItem -LiteralPath android\app\build\outputs\apk\debug -Filter *.apk`
- Playwright browser QA for `http://localhost:3001/dashboard` with `bhumi_audit_user=moana007`
- Playwright browser QA for `http://localhost:3001/profile` with `bhumi_audit_user=moana007`
- `npx tsc --noEmit`

## 13. Artifact Path

`MOANA_007_FINAL_QA_REPORT.md`

Android APK candidate:

`android/app/build/outputs/apk/debug/app-debug.apk`

## 14. Final Status

BROWSER QA ACCEPTED / ANDROID QA PENDING

Reason: Browser Dashboard Identitas Inti QA passed for the required MOANA-007 values and placeholder checks. Android debug build and sync succeeded, but mandatory Android real-device close/reopen/readback QA remains blocked because no real Android device is connected/visible via ADB. MOANA-007 must not be marked Android PASS until founder/test account dashboard close/reopen/readback is verified on a real Android device.
