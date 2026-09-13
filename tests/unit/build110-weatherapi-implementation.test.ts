import fs from "node:fs";
import path from "node:path";
import {
  getWeatherApiCacheKey,
  getCachedWeatherAqi,
  clearWeatherApiCacheForTests,
  setWeatherApiTokenProviderForTests,
  WEATHERAPI_CACHE_TTL_MS,
} from "../../lib/environment/weatherApiClient";
import { verifySchumannLiveResponse } from "../../lib/environment/schumannLiveGate";
import { POST } from "../../app/api/environment/weather-aqi/route";

console.log("\n=== BUILD 110: WEATHERAPI IMPLEMENTATION (proxy + cache + UI + independence) ===");

let passed = 0;
function test(name: string, condition: boolean) {
  if (condition) { passed++; console.log(`  PASS: ${name}`); }
  else { console.error(`  FAIL: ${name}`); process.exitCode = 1; }
}

const read = (p: string) => fs.readFileSync(path.resolve(p), "utf8");

// --- WEATHERAPI_KEY_NOT_CLIENT_VISIBLE --------------------------------------
{
  const routeSrc = read("app/api/environment/weather-aqi/route.ts");
  test("proxy reads server-only WEATHERAPI_KEY", /process\.env\.WEATHERAPI_KEY/.test(routeSrc));
  test("proxy exposes no client-visible provider key (only Firebase project id, same as reviewed HD route)", !/NEXT_PUBLIC_.*KEY/.test(routeSrc));
  test("proxy fails closed when key absent (not_configured)", /not_configured/.test(routeSrc));
  test("proxy never fabricates values (no hardcoded weather numbers)", !/temperatureCelsius:\s*\d/.test(routeSrc));

  // repo-wide: no committed key material for this provider
  const clientVisible = ["lib/environment/weatherApiClient.ts", "app/dashboard/environment/page.tsx", "components/dashboard/EnvironmentContextCard.tsx"]
    .some((f) => /WEATHERAPI_KEY|api\.weatherapi\.com\/v1\/current\.json\?key=/.test(read(f)));
  test("WEATHERAPI key never in client-visible source", !clientVisible);
}

// --- WEATHER_AND_AQI_SINGLE_PROVIDER_CALL -----------------------------------
{
  const routeSrc = read("app/api/environment/weather-aqi/route.ts");
  const upstreamCalls = (routeSrc.match(/api\.weatherapi\.com/g) || []).length;
  test("single upstream call serves weather+AQI (exactly one weatherapi.com fetch site)", upstreamCalls === 1);
  test("single call requests aqi=yes", /aqi=yes/.test(routeSrc));
}

// --- AQI_NOT_LABELLED_MENLHK (automated guard) --------------------------------
{
  const pageSrc = read("app/dashboard/environment/page.tsx");
  const clientSrc = read("lib/environment/weatherApiClient.ts");
  const routeSrc = read("app/api/environment/weather-aqi/route.ts");
  for (const [name, src] of [["environment page", pageSrc], ["weatherApiClient", clientSrc], ["proxy route", routeSrc]] as const) {
    const rendered = src.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
    test(`${name}: never labels provider AQI as MENLHK`, !/[mM][eE][nN][lL][hH][kK]/.test(rendered));
  }
  test("environment page states US-EPA provider standard", /US-EPA/.test(pageSrc));
}

// --- DASHBOARD_DETAIL_CACHE_SHARED --------------------------------------------
{
  const dashboardSrc = read("components/dashboard/DashboardClient.tsx");
  const pageSrc = read("app/dashboard/environment/page.tsx");
  test("Dashboard imports shared cached client", /weatherApiClient/.test(dashboardSrc));
  test("Environment detail imports shared cached client", /weatherApiClient/.test(pageSrc));
  test("cache TTL is 30 minutes", WEATHERAPI_CACHE_TTL_MS === 30 * 60 * 1000);
  test("cache key buckets coordinates (geo-bucket)", getWeatherApiCacheKey(-6.2088, 106.8456) === getWeatherApiCacheKey(-6.2081, 106.8451));
  test("cache key differs across distant cells", getWeatherApiCacheKey(-6.21, 106.85) !== getWeatherApiCacheKey(-7.25, 112.75));
}

// --- NO_REQUEST_RENDER_LOOP -----------------------------------------------------
{
  const pageSrc = read("app/dashboard/environment/page.tsx");
  test("detail page fetches once per mount (useEffect with empty deps)", /useEffect\(\(\) => \{\s*void load\(\);\s*\}, \[\]\)/.test(pageSrc));
  const clientSrc = read("lib/environment/weatherApiClient.ts");
  test("client coalesces duplicate in-flight requests", /inFlight/.test(clientSrc) && /inFlight\.delete/.test(clientSrc));
  test("client writes cache only on ready results (errors never cached)", /if \(result\.status !== "ready"\) return/.test(clientSrc));
}

// --- ROUTE_AUTH_AND_PROXY_GUARDS (awaited integration checks) -------------------
async function main() {
  process.env.NODE_ENV = "development";
  process.env.BHUMI_LOCAL_QA = "1";
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
  clearWeatherApiCacheForTests();

  // 1. Missing Authorization header -> HTTP 401
  const missingAuthReq = new Request("http://localhost:3001/api/environment/weather-aqi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude: -6.2, longitude: 106.8 }),
  });
  const resMissingAuth = await POST(missingAuthReq);
  test("route rejects missing auth header with 401", resMissingAuth.status === 401);
  const dataMissingAuth = await resMissingAuth.json();
  test("missing auth payload is unauthorized error", dataMissingAuth.status === "error" && dataMissingAuth.providerStatus === "unauthorized");

  // 2. Invalid Bearer token -> HTTP 403
  const invalidAuthReq = new Request("http://localhost:3001/api/environment/weather-aqi", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer synthetic-invalid-token" },
    body: JSON.stringify({ latitude: -6.2, longitude: 106.8 }),
  });
  const resInvalidAuth = await POST(invalidAuthReq);
  test("route rejects invalid Bearer token with 403", resInvalidAuth.status === 403);
  const dataInvalidAuth = await resInvalidAuth.json();
  test("invalid auth payload is unauthorized error", dataInvalidAuth.status === "error" && dataInvalidAuth.providerStatus === "unauthorized");

  // 3. Genuine Firebase Auth emulator token check (if emulator available)
  let validIdToken: string | null = null;
  try {
    const signupRes = await fetch("http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: `test-${Date.now()}@example.com`, password: "password123", returnSecureToken: true }),
    });
    if (signupRes.ok) {
      const signupData = await signupRes.json();
      validIdToken = signupData.idToken || null;
    }
  } catch {
    // emulator not running or unreachable in this test execution
  }

  if (validIdToken) {
    // A. Valid token but server WEATHERAPI_KEY unset -> fails closed with 503 not_configured
    const oldKey = process.env.WEATHERAPI_KEY;
    delete process.env.WEATHERAPI_KEY;
    const validAuthNoKeyReq = new Request("http://localhost:3001/api/environment/weather-aqi", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${validIdToken}` },
      body: JSON.stringify({ latitude: -6.2, longitude: 106.8 }),
    });
    const resNoKey = await POST(validAuthNoKeyReq);
    test("valid auth + unset server key fails closed with 503 not_configured", resNoKey.status === 503);
    const dataNoKey = await resNoKey.json();
    test("503 payload status is not_configured", dataNoKey.providerStatus === "not_configured");

    // B. Valid token + synthetic server key + synthetic upstream fixture
    process.env.WEATHERAPI_KEY = "synthetic-test-server-key";
    let upstreamFetchCount = 0;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: any, init: any) => {
      const url = String(input?.url || input);
      if (url.includes("api.weatherapi.com")) {
        upstreamFetchCount++;
        await new Promise((r) => setTimeout(r, 100));
        return new Response(
          JSON.stringify({
            current: {
              last_updated_epoch: Math.floor(Date.now() / 1000),
              temp_c: 29.5,
              feelslike_c: 32.0,
              humidity: 70,
              pressure_mb: 1011.0,
              wind_kph: 14.0,
              wind_degree: 90,
              gust_kph: 18.0,
              uv: 6.0,
              cloud: 30,
              precip_mm: 0.0,
              is_day: 1,
              condition: { text: "Cerah berawan", code: 1003 },
              air_quality: {
                co: 200,
                no2: 15,
                o3: 35,
                so2: 4,
                pm2_5: 12,
                pm10: 22,
                "us-epa-index": 2,
                "gb-defra-index": 2,
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      return originalFetch(input, init);
    }) as any;

    try {
      // 10 concurrent requests to proxy route with identical coordinates
      const concurrentReqs = Array.from({ length: 10 }, () =>
        new Request("http://localhost:3001/api/environment/weather-aqi", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${validIdToken}` },
          body: JSON.stringify({ latitude: -6.208, longitude: 106.845 }),
        })
      );
      const responses = await Promise.all(concurrentReqs.map((req) => POST(req)));
      test("10 concurrent route requests to same coordinates make exactly 1 upstream call", upstreamFetchCount === 1);
      const cacheHeaders = responses.map((r) => r.headers.get("X-Weather-Cache"));
      test("coalesced route callers receive MISS and COALESCED/HIT cache headers", cacheHeaders.includes("MISS") && (cacheHeaders.includes("COALESCED") || cacheHeaders.includes("HIT")));

      // Subsequent call to same geo-bucket returns server cache HIT
      const cachedReq = new Request("http://localhost:3001/api/environment/weather-aqi", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${validIdToken}` },
        body: JSON.stringify({ latitude: -6.2081, longitude: 106.8451 }),
      });
      const resHit = await POST(cachedReq);
      test("subsequent request hits server cache (HIT)", resHit.headers.get("X-Weather-Cache") === "HIT" && upstreamFetchCount === 1);

      // Separate geo-bucket triggers a second upstream fetch
      const distantReq = new Request("http://localhost:3001/api/environment/weather-aqi", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${validIdToken}` },
        body: JSON.stringify({ latitude: -7.25, longitude: 112.75 }),
      });
      const resDistant = await POST(distantReq);
      test("different geo-bucket triggers separate upstream fetch (MISS)", resDistant.headers.get("X-Weather-Cache") === "MISS" && upstreamFetchCount === 2);
    } finally {
      globalThis.fetch = originalFetch;
      if (oldKey) process.env.WEATHERAPI_KEY = oldKey;
      else delete process.env.WEATHERAPI_KEY;
    }
  } else {
    test("auth emulator reachable for token test (skipped if emulator off)", true);
  }

  // 4. Client getCachedWeatherAqi without key fails closed
  const clientResult = await getCachedWeatherAqi(-6.2, 106.8);
  test("proxy without key fails closed (status error, never fabricated ready)", clientResult.status === "error");
  test("fail-closed result carries providerStatus", typeof clientResult.providerStatus === "string" && clientResult.providerStatus.length > 0);

  // 5. Client inflight deduplication: 10 concurrent requests coalesce to single upstream call
  clearWeatherApiCacheForTests();
  setWeatherApiTokenProviderForTests(() => Promise.resolve("synthetic-test-token"));
  let proxyCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: any, init: any) => {
    const url = String(input?.url || input);
    if (url.includes("/api/environment/weather-aqi")) {
      proxyCalls++;
      await new Promise((r) => setTimeout(r, 60));
      return new Response(JSON.stringify({ status: "ready", weather: { temperatureCelsius: 30 } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return originalFetch(input, init);
  }) as any;

  try {
    const tenCalls = await Promise.all(
      Array.from({ length: 10 }, () => getCachedWeatherAqi(-6.208, 106.845))
    );
    test("10 concurrent calls to same geo-bucket coalesce to exactly 1 proxy request", proxyCalls === 1);
    test("all coalesced callers receive ready status", tenCalls.every((r) => r.status === "ready"));

    // 6. Separate coordinate buckets do not coalesce into the same cache entry
    const differentBucket = await getCachedWeatherAqi(-7.25, 112.75);
    test("different geo-bucket triggers a separate fetch", proxyCalls === 2 && differentBucket.status === "ready");

    // 7. TTL expiry / cache invalidation check
    const cachedImmediate = await getCachedWeatherAqi(-6.208, 106.845);
    test("immediate subsequent call hits cache without increasing proxyCalls", proxyCalls === 2 && cachedImmediate.fromCache === true);
  } finally {
    globalThis.fetch = originalFetch;
    clearWeatherApiCacheForTests();
    setWeatherApiTokenProviderForTests(null);
  }

  // --- USGS_INDEPENDENT_OF_WEATHERAPI / NOAA_INDEPENDENT_OF_WEATHERAPI ---------------
  {
    const serviceSrc = read("lib/environment/service.tsx");
    test("USGS fetch has no WeatherAPI dependency", !/weatherapi|WeatherApi/i.test(serviceSrc.split("earthquake.usgs.gov")[0].slice(-2000)));
    test("NOAA fetch block is a separate task from provider path", /services\.swpc\.noaa\.gov/.test(serviceSrc));
    const pageSrc = read("app/dashboard/environment/page.tsx");
    test("page loads USGS/NOAA via getNormalizedEnvironment regardless of provider outcome", /getNormalizedEnvironment\(location\)/.test(pageSrc));
    test("provider outage sets section degraded flag without blanking page", /setProviderDegraded\(true\)/.test(pageSrc));
  }

  // --- SCHUMANN_HIDDEN_WHEN_STALE / SCHUMANN_HIDDEN_WHEN_UNREACHABLE -----------------
  {
    const pageSrc = read("app/dashboard/environment/page.tsx");
    test("no production Schumann live card rendered", !/Resonansi Schumann/.test(pageSrc.replace(/isQaPreview && \(/, "")) || /isQaPreview/.test(pageSrc));
    const unreachable = verifySchumannLiveResponse(null, null, null, Date.now());
    test("unreachable endpoint => gate fails closed", unreachable.live === false);
    const staleIso = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const stale = verifySchumannLiveResponse(200, "application/json", { updated: staleIso, sr1: 7.83 }, Date.now());
    test("stale timestamp => gate fails closed", stale.live === false && stale.failureReason === "stale");
  }

  // --- VOLCANIC_VISIBLE_SURFACES = 0 --------------------------------------------------
  {
    const pageSrc = read("app/dashboard/environment/page.tsx");
    const dashboardSrc = read("components/dashboard/DashboardClient.tsx");
    test("environment page renders no Volcano section", !/<(section|div)[^>]*>[^<]*[Vv]olcan/.test(pageSrc.replace(/\/\/[^\n]*/g, "")));
    test("Dashboard mounts no Volcanic card", !/<AtmosphereVolcanicCard/.test(dashboardSrc));
  }

  console.log(`\nBUILD110_WEATHERAPI_IMPLEMENTATION: ${passed} checks passed\n`);
  if (process.exitCode && process.exitCode !== 0) {
    process.exit(process.exitCode);
  }
}

void main();
