import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const capacitorConfig = readFileSync("capacitor.config.ts", "utf8");
const mainManifest = readFileSync("android/app/src/main/AndroidManifest.xml", "utf8");
const debugManifest = readFileSync("android/app/src/debug/AndroidManifest.xml", "utf8");
const debugNetworkSecurity = readFileSync(
  "android/app/src/debug/res/xml/network_security_config.xml",
  "utf8",
);

assert.match(
  capacitorConfig,
  /process\.env\.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true'/,
  "Android HTTP origin must be guarded by the direct public emulator flag",
);
assert.match(capacitorConfig, /androidScheme: 'http'/, "emulator QA must avoid an HTTPS-to-HTTP mixed-content block");
assert.doesNotMatch(capacitorConfig, /server:\s*\{[\s\S]*?url:/, "QA configuration must keep bundled assets");
assert.match(mainManifest, /android:usesCleartextTraffic="false"/, "main/release cleartext policy must stay denied");
assert.match(debugManifest, /android:networkSecurityConfig="@xml\/network_security_config"/);
assert.match(debugNetworkSecurity, /<base-config cleartextTrafficPermitted="false" \/>/);
assert.match(debugNetworkSecurity, /<domain includeSubdomains="false">10\.0\.2\.2<\/domain>/);
assert.match(debugNetworkSecurity, /<domain includeSubdomains="false">127\.0\.0\.1<\/domain>/);
assert.equal((debugNetworkSecurity.match(/<domain /g) ?? []).length, 2, "only Android emulator and adb-reverse loopback hosts may allow cleartext");
assert.doesNotMatch(
  debugNetworkSecurity,
  /googleapis\.com|cloudfunctions\.net|play\.googleapis\.com|androidpublisher\.googleapis\.com/,
);

console.log("android emulator QA config: 10 assertions passed");
