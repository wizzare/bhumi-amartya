/**
 * Focused deterministic contract test for lib/config/dailyGuidanceApiUrl.ts
 * (recovered missing build prerequisite — imported by DashboardClient.tsx,
 * dashboardOrchestrator.ts, dailyGuidanceService.ts, all zero-argument).
 *
 * No network. Hard-fail assertions (node:assert/strict -> throws -> exit 1).
 */
import assert from "node:assert/strict";
import { getDailyGuidanceApiUrl } from "../../lib/config/dailyGuidanceApiUrl";

const WEB_PATH = "/api/ai/daily-guidance";
const CANONICAL = "https://bhumi-amartya-clean.vercel.app";

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log(`  PASS: ${name}`);
}

const savedEnv = process.env.NEXT_PUBLIC_WEB_APP_URL;
delete process.env.NEXT_PUBLIC_WEB_APP_URL;

try {
  // A. zero-argument invocation (Node/web context: Capacitor.isNativePlatform() === false)
  check("A zero-arg returns the relative web path", () => {
    assert.equal(getDailyGuidanceApiUrl(), WEB_PATH);
  });

  // B. explicit webAppUrl override wins for native
  check("B explicit isNative + webAppUrl override is used verbatim", () => {
    assert.equal(
      getDailyGuidanceApiUrl({ isNative: true, webAppUrl: "https://custom.example" }),
      "https://custom.example" + WEB_PATH,
    );
  });
  check("B2 trailing slash on webAppUrl is normalised (no double slash)", () => {
    assert.equal(
      getDailyGuidanceApiUrl({ isNative: true, webAppUrl: "https://custom.example/" }),
      "https://custom.example" + WEB_PATH,
    );
  });

  // C. environment override behaviour
  check("C NEXT_PUBLIC_WEB_APP_URL is used for native when no explicit webAppUrl", () => {
    process.env.NEXT_PUBLIC_WEB_APP_URL = "https://env.example";
    try {
      assert.equal(getDailyGuidanceApiUrl({ isNative: true }), "https://env.example" + WEB_PATH);
    } finally {
      delete process.env.NEXT_PUBLIC_WEB_APP_URL;
    }
  });
  check("C2 explicit webAppUrl beats NEXT_PUBLIC_WEB_APP_URL", () => {
    process.env.NEXT_PUBLIC_WEB_APP_URL = "https://env.example";
    try {
      assert.equal(
        getDailyGuidanceApiUrl({ isNative: true, webAppUrl: "https://explicit.example" }),
        "https://explicit.example" + WEB_PATH,
      );
    } finally {
      delete process.env.NEXT_PUBLIC_WEB_APP_URL;
    }
  });

  // D. native path with no override and no env -> canonical host
  check("D native, no override, no env -> canonical production host", () => {
    assert.equal(getDailyGuidanceApiUrl({ isNative: true }), CANONICAL + WEB_PATH);
  });

  // E. explicit web path
  check("E explicit isNative:false -> relative web path", () => {
    assert.equal(getDailyGuidanceApiUrl({ isNative: false }), WEB_PATH);
  });

  // F. returned value shape
  check("F web result is a root-relative path", () => {
    const r = getDailyGuidanceApiUrl({ isNative: false });
    assert.ok(r.startsWith("/"), `expected leading slash, got ${r}`);
    assert.ok(!/^https?:/i.test(r), "web result must not be absolute");
  });
  check("F2 native result is a valid absolute https URL ending in the API path", () => {
    const r = getDailyGuidanceApiUrl({ isNative: true });
    const u = new URL(r);
    assert.equal(u.protocol, "https:");
    assert.ok(r.endsWith(WEB_PATH), `expected suffix ${WEB_PATH}, got ${r}`);
  });

  console.log(`\nDAILY_GUIDANCE_API_URL_CONTRACT_PASS assertions=${passed}`);
} catch (err) {
  console.error("DAILY_GUIDANCE_API_URL_CONTRACT_FAIL", err instanceof Error ? err.stack || err.message : String(err));
  process.exitCode = 1;
} finally {
  if (savedEnv === undefined) delete process.env.NEXT_PUBLIC_WEB_APP_URL;
  else process.env.NEXT_PUBLIC_WEB_APP_URL = savedEnv;
}
