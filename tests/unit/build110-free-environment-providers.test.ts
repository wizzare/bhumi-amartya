import fs from "node:fs";
import path from "node:path";
import { isWeatherApiServerConfigured, isWeatherApiCallPermitted, WEATHERAPI_ATTRIBUTION_TEXT } from "../../lib/environment/weatherApiGate";
import { verifySchumannLiveResponse, SCHUMANN_NOMINAL_FUNDAMENTAL_LABEL } from "../../lib/environment/schumannLiveGate";

console.log("\n=== BUILD 110: FREE ENVIRONMENT PROVIDERS (WeatherAPI + Schumann SR1 gate) ===");

let passed = 0;
function test(name: string, condition: boolean, detail?: string) {
  if (condition) { passed++; console.log(`  PASS: ${name}`); }
  else { console.error(`  FAIL: ${name}${detail ? ` — ${detail}` : ""}`); process.exitCode = 1; }
}

// --- WeatherAPI.com gate: fail-closed by default, no client key path ------
test("WeatherAPI server is not configured (no client key activation path)", isWeatherApiServerConfigured() === false);
test("WeatherAPI attribution text names WeatherAPI.com (no MENLHK mislabel)", /WeatherAPI\.com/.test(WEATHERAPI_ATTRIBUTION_TEXT));
test("WeatherAPI attribution does not claim MENLHK index", !/menlhk|MENLHK/i.test(WEATHERAPI_ATTRIBUTION_TEXT));

{
  const originalNodeEnv = process.env.NODE_ENV;
  const originalFlag = process.env.ENABLE_DEV_WEATHERAPI;
  try {
    process.env.NODE_ENV = "production";
    delete process.env.ENABLE_DEV_WEATHERAPI;
    test("WeatherAPI calls forbidden in production (OPEN_METEO-style fail-closed)", isWeatherApiCallPermitted() === false);
  } finally {
    process.env.NODE_ENV = originalNodeEnv;
    if (originalFlag !== undefined) process.env.ENABLE_DEV_WEATHERAPI = originalFlag;
  }
}

// --- Schumann SR1-only live gate -------------------------------------------
const NOW = Date.now();
const freshIso = new Date(NOW - 60_000).toISOString();
const staleIso = new Date(NOW - 60 * 60_1000).toISOString();

{
  const v = verifySchumannLiveResponse(200, "application/json", { updated: freshIso, sr1: 7.83, license: "CC0" }, NOW);
  test("measured numeric SR1 + fresh timestamp => live", v.live === true && v.sr1ValueHz === 7.83);
}

{
  const v = verifySchumannLiveResponse(200, "application/json", { updated: freshIso, frequencies: [{ id: "SR1", value: 7.91, measured: true }] }, NOW);
  test("frequencies-array SR1 with measured:true => live", v.live === true);
}

{
  const v = verifySchumannLiveResponse(200, "application/json", { updated: freshIso, sr1: { value: 7.83, nominal: true } }, NOW);
  test("nominal SR1 slot must NOT pass as measured", v.live === false && v.failureReason === "sr1-not-measured");
}

{
  const v = verifySchumannLiveResponse(200, "application/json", { updated: freshIso, frequencies: [{ id: "SR1", value: 7.83, reference: true }] }, NOW);
  test("reference SR1 slot must NOT pass as measured", v.live === false && v.sr1Measured === false);
}

{
  const v = verifySchumannLiveResponse(200, "application/json", { updated: freshIso }, NOW);
  test("missing SR1 => fail closed (sr1-missing)", v.live === false && v.failureReason === "sr1-missing");
}

{
  const v = verifySchumannLiveResponse(200, "application/json", { sr1: 7.83 }, NOW);
  test("missing timestamp => fail closed (timestamp-missing)", v.live === false && v.failureReason === "timestamp-missing");
}

{
  const v = verifySchumannLiveResponse(200, "application/json", { updated: staleIso, sr1: 7.83 }, NOW);
  test("stale timestamp => fail closed (stale)", v.live === false && v.failureReason === "stale");
}

{
  const v = verifySchumannLiveResponse(404, "application/json", { updated: freshIso, sr1: 7.83 }, NOW);
  test("non-2xx HTTP => fail closed (http-not-ok)", v.live === false && v.failureReason === "http-not-ok");
}

{
  const v = verifySchumannLiveResponse(200, "text/html", { updated: freshIso, sr1: 7.83 }, NOW);
  test("non-JSON content-type => fail closed", v.live === false && v.failureReason === "unexpected-content-type");
}

{
  // Never substitute 7.83 as a fake live reading: the nominal label exists and
  // is distinct from any live value path.
  test("7.83 nominal label exists and is not a live value", SCHUMANN_NOMINAL_FUNDAMENTAL_LABEL.includes("7,83") && SCHUMANN_NOMINAL_FUNDAMENTAL_LABEL.includes("nominal"));
}

// --- Static guards: no keys, no SunGeo, no Google activation ---------------
const gateSrc = fs.readFileSync(path.resolve("lib/environment/weatherApiGate.ts"), "utf8");
test(
  "weatherApiGate exposes no NEXT_PUBLIC key variable (mentions only as forbidden pattern)",
  !/process\.env\.NEXT_PUBLIC_|NEXT_PUBLIC_WEATHERAPI_KEY["']?\s*[:=]/.test(gateSrc),
);
test("weatherApiGate contains no hardcoded API key", !/key\s*[:=]\s*["'][A-Za-z0-9]{10,}["']/.test(gateSrc));

const serviceFiles = ["lib/environment/service.tsx", "lib/environment/env2Service.ts", "lib/environment/provider.ts"];
for (const file of serviceFiles) {
  if (!fs.existsSync(path.resolve(file))) continue;
  const src = fs.readFileSync(path.resolve(file), "utf8");
  test(`${file} makes no SunGeo production calls`, !/sungeo/i.test(src));
}

console.log(`\nBUILD110_FREE_ENV_PROVIDERS: ${passed} checks passed\n`);
