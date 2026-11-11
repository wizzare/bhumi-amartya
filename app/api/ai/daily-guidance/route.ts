import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getFirestore } from "firebase-admin/firestore";
import type { DailyGuidanceContext } from "@/lib/dailyGuidance/types";
import type { DailyGuidanceInput } from "@/lib/orchestrators/types";
import {
  generateDailyGuidanceForRequest,
  generateStatelessLegacyDailyGuidance,
  getOrGenerateDailyGuidance,
  minimizeDailyGuidanceResponse,
} from "@/lib/services/dailyGuidanceService";
import { isEnlEdition } from "@/lib/config/edition";
import {
  getOrCreateHdAdminApp,
  verifyHdRequestAuthentication,
  type HdAuthDependencies,
} from "@/lib/auth/hdEndpointAuth";
import { hasFeatureAccess } from "@/lib/billing/accessControl";

type DailyGuidanceErrorReason =
  | "missing_uid"
  | "missing_profile"
  | "missing_blueprint"
  | "missing_currentSky"
  | "missing_localDateKey"
  | "ai_failed"
  | "unauthorized"
  | "forbidden"
  | "rate_limited";

type DailyGuidanceRequestBody = Partial<DailyGuidanceContext & DailyGuidanceInput> & {
  uid?: string;
  mode?: string;
  profile?: Record<string, unknown> | null;
  localDateKey?: string;
  date?: string;
  astrologyToday?: string | null;
  generatedAt?: string;
  memoryHash?: string;
};

const CORS_ALLOWED_METHODS = "POST, OPTIONS";
const CORS_ALLOWED_HEADERS = "Content-Type, Authorization";

// Dual-layer rate limiting: in-memory + persistent server-side Firestore transaction
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const AUTH_IP_MAX_REQUESTS = 30;
const AUTH_UID_MAX_REQUESTS = 15;
const LEGACY_IP_MAX_REQUESTS = 10;
const LEGACY_UID_MAX_REQUESTS = 4;

export type DailyGuidanceRateLimitStore = {
  checkAndIncrement: (bucketKey: string, maxRequests: number, windowMs: number) => Promise<boolean>;
};

function checkInMemoryRateLimit(bucketKey: string, maxRequests: number, windowMs = RATE_LIMIT_WINDOW_MS): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(bucketKey);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(bucketKey, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (record.count >= maxRequests) {
    return false;
  }
  record.count += 1;
  return true;
}

async function checkPersistentRateLimit(
  bucketKey: string,
  maxRequests: number,
  windowMs = RATE_LIMIT_WINDOW_MS,
): Promise<boolean> {
  if (!checkInMemoryRateLimit(bucketKey, maxRequests, windowMs)) {
    return false;
  }

  const injectedStore =
    process.env.NODE_ENV !== "production"
      ? (globalThis as { __dailyGuidanceRateLimitStore?: DailyGuidanceRateLimitStore }).__dailyGuidanceRateLimitStore
      : undefined;
  if (injectedStore) {
    return injectedStore.checkAndIncrement(bucketKey, maxRequests, windowMs);
  }

  const shouldUseFirestore =
    process.env.NODE_ENV === "production" || process.env.ENABLE_FIRESTORE_RATE_LIMIT === "1";
  if (!shouldUseFirestore) {
    return true;
  }

  const adminApp = getOrCreateHdAdminApp();
  if (!adminApp) {
    return true;
  }

  try {
    const db = getFirestore(adminApp);
    const docId = `dg_${createHash("sha256").update(bucketKey).digest("hex").slice(0, 32)}`;
    const ref = db.collection("apiRateLimits").doc(docId);
    const now = Date.now();
    return await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.exists ? (snap.data() as { count?: number; resetTime?: number } | undefined) : undefined;
      if (!data || typeof data.resetTime !== "number" || now > data.resetTime) {
        tx.set(ref, { count: 1, resetTime: now + windowMs, updatedAt: now }, { merge: true });
        return true;
      }
      const currentCount = typeof data.count === "number" ? data.count : 0;
      if (currentCount >= maxRequests) {
        return false;
      }
      tx.set(ref, { count: currentCount + 1, resetTime: data.resetTime, updatedAt: now }, { merge: true });
      return true;
    });
  } catch {
    return true;
  }
}

async function verifyServerSideEntitlement(uid: string): Promise<boolean> {
  const injectedCheck =
    process.env.NODE_ENV !== "production"
      ? (globalThis as { __dailyGuidanceEntitlementCheck?: (uid: string) => Promise<boolean> })
          .__dailyGuidanceEntitlementCheck
      : undefined;
  if (injectedCheck) {
    return injectedCheck(uid);
  }

  const adminApp = getOrCreateHdAdminApp();
  if (!adminApp) return false;
  try {
    const db = getFirestore(adminApp);
    const snap = await db.collection("users").doc(uid).get();
    if (!snap.exists) return false;
    return hasFeatureAccess(snap.data() as Record<string, unknown>, "profile");
  } catch {
    return false;
  }
}

function allowedCorsOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const allowedOrigins = new Set([
    "https://localhost",
    ...(process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  ]);
  return allowedOrigins.has(origin) ? origin : null;
}

function corsHeaders(request: Request, existing?: HeadersInit): Headers {
  const headers = new Headers(existing);
  const origin = allowedCorsOrigin(request);
  if (origin) headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", CORS_ALLOWED_METHODS);
  headers.set("Access-Control-Allow-Headers", CORS_ALLOWED_HEADERS);
  headers.set("Vary", "Origin");
  return headers;
}

function corsJson(request: Request, body: unknown, init: ResponseInit = {}) {
  return NextResponse.json(body, { ...init, headers: corsHeaders(request, init.headers) });
}

export async function OPTIONS(request: Request) {
  if (request.headers.get("origin") && !allowedCorsOrigin(request)) {
    return new NextResponse(null, { status: 403 });
  }
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function getLocalDateKey(body: DailyGuidanceRequestBody | null): string | null {
  const explicit = body?.localDateKey || body?.date;
  if (typeof explicit === "string" && explicit.trim()) return explicit.slice(0, 10);

  const generatedAt = "generatedAt" in (body ?? {}) ? body?.generatedAt : null;
  if (typeof generatedAt === "string" && generatedAt.trim()) return generatedAt.slice(0, 10);

  return new Date().toISOString().slice(0, 10);
}

function maskUid(uid: unknown): string | null {
  if (typeof uid !== "string" || !uid.trim()) return null;
  const trimmed = uid.trim();
  if (trimmed.length <= 8) return "***";
  return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
}

function getDailyGuidanceLogSummary(
  body: DailyGuidanceRequestBody | null,
  normalized: { input: DailyGuidanceContext | null; missingReason: DailyGuidanceErrorReason | null },
) {
  const bodyRecord = asRecord(body);
  const dashboardUser = asRecord("user" in (body ?? {}) ? body?.user : null);
  const uid = normalized.input?.uid ?? body?.uid ?? dashboardUser?.uid ?? null;

  return {
    hasUid: Boolean(uid),
    uid: maskUid(uid),
    date: normalized.input?.localDateKey ?? body?.localDateKey ?? body?.date ?? null,
    hasBlueprint: Boolean(body?.blueprint),
    hasDailyState: Boolean(bodyRecord?.dailyState),
    hasJourney: Boolean(
      bodyRecord?.journey
        || Array.isArray(body?.journalHistory)
        || Array.isArray(body?.previousJournalEntries)
        || Boolean(body?.previousGuidance)
    ),
    hasWellness: Boolean(bodyRecord?.wellness),
    hasEnvironment: Boolean(
      bodyRecord?.environmentContext
        || bodyRecord?.environment
    ),
    providerStatus: process.env.GEMINI_API_KEY ? "configured" : "missing_api_key",
    reason: normalized.missingReason,
    normalizedFromDashboardInput: Boolean(!body?.profile && dashboardUser),
  };
}

function normalizeDailyGuidanceRequest(
  body: DailyGuidanceRequestBody | null,
): { input: DailyGuidanceContext | null; missingReason: DailyGuidanceErrorReason | null } {
  const localDateKey = getLocalDateKey(body);
  const dashboardUser = asRecord("user" in (body ?? {}) ? body?.user : null);
  const profile = asRecord(body?.profile) ?? dashboardUser;
  const blueprint = asRecord(body?.blueprint);
  const uid = typeof body?.uid === "string" && body.uid.trim()
    ? body.uid
    : typeof dashboardUser?.uid === "string"
      ? dashboardUser.uid
      : null;
  const astrologyTransits = asRecord("astrologyTransits" in (body ?? {}) ? body?.astrologyTransits : null);
  const currentSky = asRecord(body?.currentSky)
    ?? (astrologyTransits
      ? {
          source: astrologyTransits.source ?? "dashboard-astrology-transits",
          generatedAt: astrologyTransits.generatedAt ?? new Date().toISOString(),
          summary: astrologyTransits.summary ?? null,
          activeTransits: astrologyTransits.activeTransits ?? [],
          bodies: [],
        }
      : null);

  const missingReason: DailyGuidanceErrorReason | null = !uid
    ? "missing_uid"
    : !profile
      ? "missing_profile"
      : !blueprint
        ? "missing_blueprint"
        : !currentSky
          ? "missing_currentSky"
          : !localDateKey
            ? "missing_localDateKey"
            : null;

  if (missingReason) return { input: null, missingReason };

  const previousGuidance = "previousGuidance" in (body ?? {}) && Array.isArray(body?.previousGuidance)
    ? body.previousGuidance[0] ?? null
    : "previousGuidance" in (body ?? {}) && body?.previousGuidance
      ? body.previousGuidance
    : undefined;
  const generatedAt = typeof body?.generatedAt === "string" && body.generatedAt.trim()
    ? body.generatedAt
    : new Date().toISOString();

  return {
    missingReason: null,
    input: {
      ...(body as Record<string, unknown>),
      uid: uid as string,
      date: localDateKey as string,
      localDateKey: localDateKey as string,
      language: "id",
      user: asRecord("user" in (body ?? {}) ? body?.user : null) ?? profile,
      profile,
      blueprint,
      astrologyToday: typeof astrologyTransits?.summary === "string"
        ? astrologyTransits.summary
        : typeof body?.astrologyToday === "string"
          ? body.astrologyToday
          : null,
      astrologyTransits,
      currentSky,
      journalHistory: Array.isArray(body?.journalHistory)
        ? body.journalHistory
        : Array.isArray(body?.previousJournalEntries)
          ? body.previousJournalEntries
          : [],
      meditationHistory: Array.isArray(body?.meditationHistory)
        ? body.meditationHistory
        : Array.isArray(body?.previousMeditationEntries)
          ? body.previousMeditationEntries
          : [],
      audioHealingHistory: Array.isArray(body?.audioHealingHistory)
        ? body.audioHealingHistory
        : Array.isArray(body?.previousAudioHealingEntries)
          ? body.previousAudioHealingEntries
          : [],
      previousGuidance,
      environmentContext: (body as any)?.environmentContext,
      generatedAt,
    } as DailyGuidanceContext,
  };
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    console.log("[DAILY_GUIDANCE_API_START]");
    const body = (await request.json().catch(() => null)) as DailyGuidanceRequestBody | null;

    const normalized = normalizeDailyGuidanceRequest(body);
    const dashboardUser = asRecord("user" in (body ?? {}) ? body?.user : null);
    const targetUid =
      normalized.input?.uid
      ?? (typeof body?.uid === "string" && body.uid.trim()
        ? body.uid
        : typeof dashboardUser?.uid === "string"
          ? dashboardUser.uid
          : null);
    const requestedMode =
      typeof body?.mode === "string" && body.mode.trim()
        ? body.mode.trim().toLowerCase()
        : "dashboard";

    // Route Authentication & Identity Binding (verified before schema validation)
    const authHeader = request.headers.get("authorization");
    let verifiedUid: string | null = null;

    if (authHeader) {
      if (!authHeader.startsWith("Bearer ")) {
        return corsJson(
          request,
          { ok: false, reason: "unauthorized", note: "Malformed Authorization header." },
          { status: 401 },
        );
      }
      const testAuthDeps =
        process.env.NODE_ENV !== "production"
          ? (globalThis as { __dailyGuidanceAuthDeps?: HdAuthDependencies }).__dailyGuidanceAuthDeps
          : undefined;
      const authResult = await verifyHdRequestAuthentication(request, testAuthDeps);
      if (!authResult.authenticated || !authResult.uid) {
        return corsJson(
          request,
          { ok: false, reason: "unauthorized", note: authResult.errorNote || "Authentication failed." },
          { status: authResult.status || 401 },
        );
      }
      if (targetUid && authResult.uid !== targetUid) {
        console.error("[DAILY_GUIDANCE_CROSS_ACCOUNT_REJECTED]", {
          callerUid: maskUid(authResult.uid),
          targetUid: maskUid(targetUid),
        });
        return corsJson(
          request,
          { ok: false, reason: "forbidden", note: "Cross-account UID mismatch forbidden." },
          { status: 403 },
        );
      }
      verifiedUid = authResult.uid;
    }

    // Paid / non-dashboard modes strictly require verified Firebase identity + active entitlement
    if (requestedMode !== "dashboard") {
      if (!verifiedUid) {
        return corsJson(
          request,
          { ok: false, reason: "unauthorized", note: "Authentication required for non-dashboard modes." },
          { status: 401 },
        );
      }
      const entitled = await verifyServerSideEntitlement(verifiedUid);
      if (!entitled) {
        return corsJson(
          request,
          { ok: false, reason: "forbidden", note: "Active premium entitlement required for requested mode." },
          { status: 403 },
        );
      }
    }

    // Server-side rate limiting (persistent Firestore + in-memory defense-in-depth)
    if (verifiedUid) {
      const [ipAllowed, uidAllowed] = await Promise.all([
        checkPersistentRateLimit(`auth_ip:${ip}`, AUTH_IP_MAX_REQUESTS),
        checkPersistentRateLimit(`auth_uid:${verifiedUid}`, AUTH_UID_MAX_REQUESTS),
      ]);
      if (!ipAllowed || !uidAllowed) {
        return corsJson(
          request,
          { ok: false, reason: "rate_limited", note: "Too many requests. Rate limit exceeded." },
          { status: 429 },
        );
      }
    } else {
      const [ipAllowed, legacyUidAllowed] = await Promise.all([
        checkPersistentRateLimit(`legacy_ip:${ip}`, LEGACY_IP_MAX_REQUESTS),
        checkPersistentRateLimit(`legacy_uid:${ip}:${targetUid || "anon"}`, LEGACY_UID_MAX_REQUESTS),
      ]);
      if (!ipAllowed || !legacyUidAllowed) {
        return corsJson(
          request,
          { ok: false, reason: "rate_limited", note: "Too many requests. Rate limit exceeded." },
          { status: 429 },
        );
      }
      console.warn("[DAILY_GUIDANCE_UNAUTHENTICATED_LEGACY_CALL]", {
        uid: maskUid(targetUid),
        mode: "dashboard-stateless-minimized",
      });
    }

    console.log("[DAILY_GUIDANCE_REQUEST_SUMMARY]", getDailyGuidanceLogSummary(body, normalized));

    if (normalized.missingReason) {
      console.error("[DAILY_GUIDANCE_BAD_REQUEST]", normalized.missingReason);
      return corsJson(
        request,
        { ok: false, reason: normalized.missingReason },
        { status: 400 },
      );
    }

    const input = normalized.input as DailyGuidanceContext;
    const localDateKey = input.localDateKey as string;

    if (verifiedUid) {
      const authenticatedInput: DailyGuidanceContext = {
        ...input,
        uid: verifiedUid,
      };
      const result = await getOrGenerateDailyGuidance({
        uid: verifiedUid,
        profile: authenticatedInput.profile,
        blueprint: authenticatedInput.blueprint,
        date: localDateKey,
        generate: async () => {
          const generated = await generateDailyGuidanceForRequest(authenticatedInput);
          return typeof body?.memoryHash === "string" && body.memoryHash
            ? { ...generated, memoryHash: body.memoryHash }
            : generated;
        },
      });

      if (result.status !== "success" || !result.guidance) {
        throw new Error(result.error || "DAILY_GUIDANCE_GENERATION_FAILED");
      }

      const guidance = minimizeDailyGuidanceResponse(result.guidance);
      const apiResponse = { ok: true, guidance };
      console.log("[DAILY_GUIDANCE_RESPONSE_SUMMARY]", {
        ok: true,
        authenticated: true,
        date: authenticatedInput.localDateKey,
        hasGuidance: Boolean(guidance),
      });
      return corsJson(request, apiResponse);
    }

    // Legacy unauthenticated Dashboard path (VC 121 / VC 122 compatibility):
    // Strictly stateless — NEVER accesses Firestore user collections or shared inFlightPromises by uid.
    const statelessInput = {
      ...input,
      journalHistory: [],
      previousJournalEntries: [],
      meditationHistory: [],
      previousMeditationEntries: [],
      audioHealingHistory: [],
      previousAudioHealingEntries: [],
      previousGuidance: undefined,
      healingMemory: null,
      journeyMemory: null,
    } as DailyGuidanceContext;

    const guidance = await generateStatelessLegacyDailyGuidance(statelessInput);
    const apiResponse = { ok: true, guidance };
    console.log("[DAILY_GUIDANCE_RESPONSE_SUMMARY]", {
      ok: true,
      authenticated: false,
      stateless: true,
      date: statelessInput.localDateKey,
      hasGuidance: Boolean(guidance),
    });
    return corsJson(request, apiResponse);
  } catch (error) {
    console.error("Daily guidance API failed:", error);
    if (process.env.NODE_ENV === "development" && error instanceof Error) {
      console.error("[DAILY_GUIDANCE_GEMINI_ERROR_STACK]", error.stack);
    }
    const apiResponse = { ok: false, reason: "ai_failed" satisfies DailyGuidanceErrorReason };
    console.log("[DAILY_GUIDANCE_RESPONSE_SUMMARY]", apiResponse);
    return corsJson(
      request,
      apiResponse,
      { status: 500 },
    );
  }
}
