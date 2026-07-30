import { getHdApiUrl } from "../../lib/config/hdApiUrl";

console.log("▶ Running Human Design URL Resolution Unit Tests\n");

let passed = 0;
let failed = 0;

function test(label: string, condition: boolean, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${label}`);
  } else {
    failed++;
    console.error(`  FAIL: ${label}${detail ? " — " + detail : ""}`);
  }
}

// 1. Web Localhost Development
{
  const url = getHdApiUrl({ isNative: false, isProd: false, isWindow: true });
  test("Web Localhost resolves relative route /api/humandesign/calculate", url === "/api/humandesign/calculate");
}

// 2. Web Production
{
  const url = getHdApiUrl({ isNative: false, isProd: true, isWindow: true });
  test("Web Production resolves relative route /api/humandesign/calculate", url === "/api/humandesign/calculate");
}

// 3. Capacitor Android Native APK
{
  const url = getHdApiUrl({ isNative: true, isProd: true, isWindow: true });
  test("Capacitor Android resolves absolute HTTPS URL", url.startsWith("https://") && url.includes("/api/humandesign/calculate"));
  test("Capacitor Android DOES NOT resolve relative path", !url.startsWith("/api/"));
}

// 4. Capacitor iOS Native App
{
  const url = getHdApiUrl({ isNative: true, isProd: true, isWindow: true });
  test("Capacitor iOS resolves absolute HTTPS URL", url.startsWith("https://") && url.includes("/api/humandesign/calculate"));
  test("Capacitor iOS DOES NOT resolve relative path", !url.startsWith("/api/"));
}

// 5. Server-Side Build (SSR / Node environment)
{
  const url = getHdApiUrl({ isNative: false, isProd: true, isWindow: false });
  test("Server-Side Build resolves canonical HTTPS API URL", url.startsWith("https://"));
}

// 6. Explicit Environment Variable Override
{
  const customUrl = "https://custom-hd-api.run.app/calculate";
  const url = getHdApiUrl({ envUrl: customUrl, isNative: true, isWindow: true });
  test("Environment override takes precedence over native check", url === customUrl);
}

console.log(`\nResults: ${passed + failed} tests, ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
