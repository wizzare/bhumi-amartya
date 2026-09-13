import { NextResponse } from "next/server";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const TTL_MS = 30 * 60 * 1000;
const MAX_ENTRIES = 256;
const MAX_INFLIGHT = 32;
const cache = new Map<string, { expires: number; body: unknown }>();
const inflight = new Map<string, Promise<{ status: number; body: unknown }>>();
const rateLimits = new Map<string, { count: number; expires: number }>();

function allowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = ["https://localhost", ...(process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim())];
  return origin && allowed.includes(origin) ? origin : null;
}

function headers(request: Request) {
  const result = new Headers({
    "Cache-Control": "no-store",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    Vary: "Origin",
  });
  const origin = allowedOrigin(request);
  if (origin) result.set("Access-Control-Allow-Origin", origin);
  return result;
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: request.headers.get("origin") && !allowedOrigin(request) ? 403 : 204,
    headers: headers(request),
  });
}

function error(providerStatus: string, status = 502) {
  return { status, body: { status: "error", providerStatus } };
}

function number(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function conditionLabel(code: number, day: number) {
  if (code === 1000) return day === 1 ? "Cerah" : "Malam cerah";
  if (code === 1003) return "Cerah berawan";
  if ([1006, 1009].includes(code)) return "Berawan";
  if ([1030, 1135, 1147].includes(code)) return "Berkabut";
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return "Hujan disertai petir";
  if ([1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) return "Hujan";
  if ([1069, 1072, 1168, 1171, 1198, 1201, 1204, 1207, 1237, 1249, 1252, 1261, 1264].includes(code)) return "Hujan es atau hujan membeku";
  if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) return "Salju";
  return "Kondisi cuaca belum dikenali";
}

async function fetchProvider(latitude: number, longitude: number, key: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${encodeURIComponent(key)}&q=${latitude},${longitude}&aqi=yes`,
      { signal: controller.signal, cache: "no-store", redirect: "error" },
    );
    if (!response.ok) return error(response.status === 429 || response.status >= 500 ? "retriable_error" : "provider_error");
    const data = await response.json();
    const c = data?.current;
    if (!c || ![c.temp_c, c.feelslike_c, c.humidity, c.pressure_mb, c.wind_kph, c.wind_degree, c.gust_kph, c.uv, c.cloud, c.precip_mm, c.last_updated_epoch].every(number) ||
        !Number.isInteger(c.condition?.code) || ![0, 1].includes(c.is_day) || c.humidity < 0 || c.humidity > 100 || c.cloud < 0 || c.cloud > 100 ||
        c.pressure_mb <= 0 || c.wind_kph < 0 || c.gust_kph < 0 || c.uv < 0 || c.precip_mm < 0 || c.wind_degree < 0 || c.wind_degree > 360 || c.last_updated_epoch <= 0) {
      return error("provider_error");
    }
    const aq = c.air_quality;
    if (!aq || !Number.isInteger(aq["us-epa-index"]) || aq["us-epa-index"] < 1 || aq["us-epa-index"] > 6 ||
        ![aq.pm2_5, aq.pm10, aq.co, aq.no2, aq.o3, aq.so2].every((v) => number(v) && v >= 0)) return error("missing_aqi");
    const directions = ["Utara", "Timur laut", "Timur", "Tenggara", "Selatan", "Barat daya", "Barat", "Barat laut"];
    return {
      status: 200,
      body: {
        status: "ready", providerStatus: "available",
        observedAt: new Date(c.last_updated_epoch * 1000).toISOString(),
        weather: {
          temperatureCelsius: c.temp_c, feelsLikeCelsius: c.feelslike_c,
          humidityPercent: c.humidity, pressureHpa: c.pressure_mb,
          windSpeedKph: c.wind_kph, windDirectionDegrees: c.wind_degree,
          windDirectionCardinal: directions[Math.round(c.wind_degree / 45) % 8], windGustKph: c.gust_kph,
          uvIndex: c.uv, condition: conditionLabel(c.condition.code, c.is_day),
          cloudCoverPercent: c.cloud, precipitationMm: c.precip_mm,
        },
        airQuality: { usEpaIndex: aq["us-epa-index"], pm25UgM3: aq.pm2_5, pm10UgM3: aq.pm10, coUgM3: aq.co, no2UgM3: aq.no2, o3UgM3: aq.o3, so2UgM3: aq.so2 },
        attribution: "Weather data source: WeatherAPI.com",
      },
    };
  } catch {
    return error("retriable_error");
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  const json = (body: unknown, status: number, cacheState?: string) => {
    const h = headers(request);
    if (cacheState) h.set("X-Weather-Cache", cacheState);
    return NextResponse.json(body, { status, headers: h });
  };
  try {
    const token = request.headers.get("authorization")?.match(/^Bearer (\S+)$/)?.[1];
    if (!token) return json({ status: "error", providerStatus: "unauthorized" }, 401);
    let uid: string;
    try {
      if (!getApps().length) initializeApp(process.env.NODE_ENV !== "production" && process.env.BHUMI_LOCAL_QA === "1" && process.env.FIREBASE_AUTH_EMULATOR_HOST === "127.0.0.1:9099" ? { projectId: "demo-build110-local" } : undefined);
      uid = (await getAuth().verifyIdToken(token)).uid;
    } catch {
      return json({ status: "error", providerStatus: "unauthorized" }, 403);
    }
    const now = Date.now();
    for (const [key, entry] of rateLimits) if (entry.expires <= now) rateLimits.delete(key);
    const rate = rateLimits.get(uid);
    if (rate && rate.count >= 20) return json({ status: "error", providerStatus: "retriable_error" }, 429);
    if (rate) rate.count++;
    else {
      if (rateLimits.size >= 4096) return json({ status: "error", providerStatus: "retriable_error" }, 429);
      rateLimits.set(uid, { count: 1, expires: now + 60000 });
    }
    const input = await request.json().catch(() => null);
    if (!number(input?.latitude) || Math.abs(input.latitude) > 90 || !number(input?.longitude) || Math.abs(input.longitude) > 180) {
      return json({ status: "error", providerStatus: "missing_input" }, 400);
    }
    const serverKey = process.env.WEATHERAPI_KEY?.trim();
    if (!serverKey) return json({ status: "error", providerStatus: "not_configured" }, 503);
    const lat = Math.round(input.latitude * 100) / 100;
    const lon = Math.round(input.longitude * 100) / 100;
    const key = `weatherapi:current:v1:aqi=yes:id-code-v1:${lat}:${lon}`;
    const expired = cache.has(key) && cache.get(key)!.expires <= now;
    for (const [k, entry] of cache) if (entry.expires <= now) cache.delete(k);
    const cached = cache.get(key);
    if (cached) {
      cache.delete(key);
      cache.set(key, cached);
      return json(cached.body, 200, "HIT");
    }
    const pending = inflight.get(key);
    if (pending) {
      const result = await pending;
      return json(result.body, result.status, "COALESCED");
    }
    if (inflight.size >= MAX_INFLIGHT) return json({ status: "error", providerStatus: "retriable_error" }, 429);
    const task = fetchProvider(lat, lon, serverKey).then((result) => {
      if (result.status === 200) {
        if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value!);
        cache.set(key, { body: result.body, expires: Date.now() + TTL_MS });
      }
      return result;
    }).finally(() => inflight.delete(key));
    inflight.set(key, task);
    const result = await task;
    return json(result.body, result.status, expired ? "EXPIRED" : "MISS");
  } catch {
    return json({ status: "error", providerStatus: "provider_error" }, 500);
  }
}
