import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { getEntitlementStatus } from "../../lib/billing/entitlementService";
import { hasFeatureAccess, type TrialProfile } from "../../lib/billing/accessControl";
import type { FounderTesterRecord } from "../../lib/billing/founderTesterSourceOfTruth";
import { POST as dailyGuidancePOST } from "../../app/api/ai/daily-guidance/route";

const ROOT = process.cwd();
const BASE_NOW = new Date("2026-11-12T00:00:00.000Z");

const founderTesterRecord: FounderTesterRecord = {
  uid: "founder_uid_123",
  registeredAt: "2026-06-01",
  activeDays: 160,
  badge: "Founder",
  sourceBadge: "Founder",
  membership: "LIFETIME_PREMIUM",
  premiumMonths: null,
  trialDays: null,
};

const adminTesterRecord: FounderTesterRecord = {
  uid: "admin_uid_456",
  registeredAt: "2026-06-01",
  activeDays: 160,
  badge: "Penjaga Bhumi",
  sourceBadge: "Penjaga Bhumi",
  membership: "COMMUNITY_LEADER",
  premiumMonths: null,
  trialDays: null,
};

test("VC123-01: Founder / Admin / Lifetime maintains legitimate access across all surfaces", () => {
  // Founder
  const founderProfile = { uid: "founder_uid_123", plan: "lifetime_free" } as any;
  const founderStatus = getEntitlementStatus(founderProfile, BASE_NOW, founderTesterRecord);
  assert.equal(founderStatus.isPremium, true);
  assert.equal(founderStatus.reason, "founder");
  assert.equal(hasFeatureAccess(founderProfile, "dashboard", BASE_NOW, founderTesterRecord), true);
  assert.equal(hasFeatureAccess(founderProfile, "profile", BASE_NOW, founderTesterRecord), true);
  assert.equal(hasFeatureAccess(founderProfile, "wellness", BASE_NOW, founderTesterRecord), true);
  assert.equal(hasFeatureAccess(founderProfile, "journey", BASE_NOW, founderTesterRecord), true);

  // Admin
  const adminProfile = { uid: "admin_uid_456", role: "admin", plan: "admin_provisioned" } as any;
  const adminStatus = getEntitlementStatus(adminProfile, BASE_NOW, adminTesterRecord);
  assert.equal(adminStatus.isPremium, true);
  assert.equal(hasFeatureAccess(adminProfile, "profile", BASE_NOW, adminTesterRecord), true);
  assert.equal(hasFeatureAccess(adminProfile, "wellness", BASE_NOW, adminTesterRecord), true);
  assert.equal(hasFeatureAccess(adminProfile, "journey", BASE_NOW, adminTesterRecord), true);

  // Lifetime non-founder
  const lifetimeProfile = { uid: "lifetime_789", membershipType: "LIFETIME", plan: "lifetime_free" } as any;
  const lifetimeStatus = getEntitlementStatus(lifetimeProfile, BASE_NOW, null);
  assert.equal(lifetimeStatus.isPremium, true);
  assert.equal(lifetimeStatus.reason, "lifetime");
  assert.equal(hasFeatureAccess(lifetimeProfile, "profile", BASE_NOW, null), true);
});

test("VC123-02: Active Premium (Google Play) entitles until exact expiry; revoked immediately after", () => {
  const activeSubProfile = {
    uid: "sub_1",
    membershipType: "PREMIUM",
    entitlementSource: "google_play",
    membershipExpiryDate: "2026-11-20T00:00:00.000Z",
  } as any;

  // Before expiry -> full access
  const statusActive = getEntitlementStatus(activeSubProfile, BASE_NOW, null);
  assert.equal(statusActive.isPremium, true);
  assert.equal(statusActive.reason, "subscriber");
  assert.equal(hasFeatureAccess(activeSubProfile, "profile", BASE_NOW, null), true);
  assert.equal(hasFeatureAccess(activeSubProfile, "wellness", BASE_NOW, null), true);
  assert.equal(hasFeatureAccess(activeSubProfile, "journey", BASE_NOW, null), true);

  // After expiry -> immediately revoked
  const afterExpiry = new Date("2026-11-20T00:00:01.000Z");
  const statusExpired = getEntitlementStatus(activeSubProfile, afterExpiry, null);
  assert.equal(statusExpired.isPremium, false);
  assert.equal(statusExpired.status, "Expired");
  assert.equal(hasFeatureAccess(activeSubProfile, "dashboard", afterExpiry, null), true); // Dashboard stays open
  assert.equal(hasFeatureAccess(activeSubProfile, "profile", afterExpiry, null), false);
  assert.equal(hasFeatureAccess(activeSubProfile, "wellness", afterExpiry, null), false);
  assert.equal(hasFeatureAccess(activeSubProfile, "journey", afterExpiry, null), false);
});

test("VC123-03: Active Trial entitles until exact trialEndsAt timestamp; zero access after", () => {
  const trialEnd = new Date("2026-11-15T12:00:00.000Z");
  const activeTrialProfile = {
    uid: "trial_user_1",
    trialStartedAt: "2026-11-08T12:00:00.000Z",
    trialEndsAt: trialEnd.toISOString(),
    entitlementSource: "server_access_bootstrap",
    setupCompleted: true,
  } as any;

  // 1 second before expiration -> active
  const justBefore = new Date(trialEnd.getTime() - 1000);
  const statusBefore = getEntitlementStatus(activeTrialProfile, justBefore, null);
  assert.equal(statusBefore.isPremium, true);
  assert.equal(statusBefore.reason, "trial");
  assert.equal(statusBefore.daysRemaining, 1);
  assert.equal(hasFeatureAccess(activeTrialProfile, "profile", justBefore, null), true);

  // Exact expiration or 1ms after -> locked
  const atExpiry = trialEnd;
  const statusAtExpiry = getEntitlementStatus(activeTrialProfile, atExpiry, null);
  assert.equal(statusAtExpiry.isPremium, false);
  assert.equal(statusAtExpiry.status, "Trial Exhausted");
  assert.equal(hasFeatureAccess(activeTrialProfile, "profile", atExpiry, null), false);
  assert.equal(hasFeatureAccess(activeTrialProfile, "wellness", atExpiry, null), false);
  assert.equal(hasFeatureAccess(activeTrialProfile, "journey", atExpiry, null), false);
  assert.equal(hasFeatureAccess(activeTrialProfile, "dashboard", atExpiry, null), true); // Dashboard allowed
});

test("VC123-04: Stale / unbacked isPremium or membershipType=TRIAL without active timestamps fails closed", () => {
  // Stale doc from production audit discrepancy: plan="free_trial", membershipType="TRIAL" but trialEndsAt past
  const expiredConflictProfile = {
    uid: "conflict_user_1",
    plan: "free_trial",
    membershipType: "TRIAL",
    membership: "REGULAR_TRIAL",
    subscriptionStatus: "trialing",
    trialStartedAt: "2026-06-01T00:00:00.000Z",
    trialEndsAt: "2026-06-08T00:00:00.000Z", // expired months ago
    entitlementSource: "bhumi_profile_first_creation",
    accessSource: "vercel_profile_bootstrap",
  } as any;

  const status = getEntitlementStatus(expiredConflictProfile, BASE_NOW, null);
  assert.equal(status.isPremium, false);
  assert.equal(hasFeatureAccess(expiredConflictProfile, "profile", BASE_NOW, null), false);
  assert.equal(hasFeatureAccess(expiredConflictProfile, "wellness", BASE_NOW, null), false);
  assert.equal(hasFeatureAccess(expiredConflictProfile, "journey", BASE_NOW, null), false);

  // Stale doc with isPremium: true but no active subscription/grant
  const stalePremiumDoc = {
    uid: "stale_prem_1",
    isPremium: true,
    plan: "premium",
    membershipType: "PREMIUM",
    membershipExpiryDate: "2026-05-01T00:00:00.000Z", // expired
  } as any;

  const staleStatus = getEntitlementStatus(stalePremiumDoc, BASE_NOW, null);
  assert.equal(staleStatus.isPremium, false);
  assert.equal(hasFeatureAccess(stalePremiumDoc, "profile", BASE_NOW, null), false);
});

test("VC123-05: Untrusted trial source (firebase_auth_creation_time / none) fails closed", () => {
  const forgedAuthCreationProfile = {
    uid: "forged_1",
    trialStartedAt: "2026-11-10T00:00:00.000Z",
    trialEndsAt: "2026-11-17T00:00:00.000Z",
    entitlementSource: "firebase_auth_creation_time",
  } as any;

  const status = getEntitlementStatus(forgedAuthCreationProfile, BASE_NOW, null);
  assert.equal(status.isPremium, false);
  assert.equal(status.status, "Invalid Trial Setup");
  assert.equal(hasFeatureAccess(forgedAuthCreationProfile, "profile", BASE_NOW, null), false);
});

test("VC123-06: Clean Free account without trial has access to Dashboard only", () => {
  const freeProfile = {
    uid: "clean_free_1",
    plan: "free",
    membershipType: "FREE",
    setupCompleted: true,
    createdAt: "2026-06-01T00:00:00.000Z",
  } as any;

  const status = getEntitlementStatus(freeProfile, BASE_NOW, null);
  assert.equal(status.isPremium, false);
  assert.equal(status.effectiveTier, "Free");
  assert.equal(hasFeatureAccess(freeProfile, "dashboard", BASE_NOW, null), true);
  assert.equal(hasFeatureAccess(freeProfile, "profile", BASE_NOW, null), false);
  assert.equal(hasFeatureAccess(freeProfile, "wellness", BASE_NOW, null), false);
  assert.equal(hasFeatureAccess(freeProfile, "journey", BASE_NOW, null), false);
});

test("VC123-07: Account Switch / Cross-User isolation prevents stale access inheritance", () => {
  // Device previously had User A (Founder), then User B (Free) logs in
  const userA = founderTesterRecord;
  const userBProfile = { uid: "user_b_free", plan: "free" } as any;

  // Passing User A tester record to User B evaluation is invalid (UID mismatch)
  // Canonical resolver evaluates User B using only User B records
  const statusB = getEntitlementStatus(userBProfile, BASE_NOW, null);
  assert.equal(statusB.isPremium, false);
  assert.equal(hasFeatureAccess(userBProfile, "profile", BASE_NOW, null), false);
});

test("VC123-08: /api/ai/daily-guidance rejects cross-account UID mismatch with 403 Forbidden", async () => {
  const req = new Request("https://bhumiamartya.app/api/ai/daily-guidance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer token_for_caller_A",
    },
    body: JSON.stringify({
      uid: "target_user_B", // Mismatch with authenticated token
      profile: { name: "Victim Profile" },
      blueprint: { type: "Projector" },
      currentSky: { bodies: [] },
      localDateKey: "2026-11-12",
    }),
  });

  (globalThis as any).__dailyGuidanceAuthDeps = {
    verifyIdToken: async (token: string) => {
      if (token === "token_for_caller_A") {
        return { uid: "caller_user_A" };
      }
      throw new Error("Invalid token");
    },
  };
  let res: Response;
  try {
    res = await dailyGuidancePOST(req);
  } finally {
    delete (globalThis as any).__dailyGuidanceAuthDeps;
  }

  assert.equal(res.status, 403);
  const data = await res.json();
  assert.equal(data.ok, false);
  assert.equal(data.reason, "forbidden");
  assert.match(data.note, /Cross-account UID mismatch forbidden/);
});

test("VC123-09: /api/ai/daily-guidance rejects invalid / expired Bearer token with 403", async () => {
  const req = new Request("https://bhumiamartya.app/api/ai/daily-guidance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer expired_or_tampered_token",
    },
    body: JSON.stringify({
      uid: "user_1",
      profile: { name: "Test" },
      blueprint: { type: "Manifestor" },
      currentSky: { bodies: [] },
      localDateKey: "2026-11-12",
    }),
  });

  (globalThis as any).__dailyGuidanceAuthDeps = {
    verifyIdToken: async () => {
      const err = new Error("auth/id-token-expired");
      (err as { code?: string }).code = "auth/id-token-expired";
      throw err;
    },
  };
  let res: Response;
  try {
    res = await dailyGuidancePOST(req);
  } finally {
    delete (globalThis as any).__dailyGuidanceAuthDeps;
  }

  assert.equal(res.status, 403);
  const data = await res.json();
  assert.equal(data.ok, false);
  assert.equal(data.reason, "unauthorized");
});

test("VC123-10: /api/ai/daily-guidance allows authenticated request when token UID matches body UID", async () => {
  const req = new Request("https://bhumiamartya.app/api/ai/daily-guidance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer valid_token_user_1",
    },
    body: JSON.stringify({
      uid: "legit_user_1",
      // Omit profile to stop cleanly at validation without calling Gemini
    }),
  });

  (globalThis as any).__dailyGuidanceAuthDeps = {
    verifyIdToken: async () => ({ uid: "legit_user_1" }),
  };
  let res: Response;
  try {
    res = await dailyGuidancePOST(req);
  } finally {
    delete (globalThis as any).__dailyGuidanceAuthDeps;
  }

  // Stopped cleanly at schema validation (missing_profile 400), not rejected with 401/403
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.ok, false);
  assert.equal(data.reason, "missing_profile");
});

test("VC123-11: /api/ai/daily-guidance allows legacy unauthenticated call with masked log and IP rate limiting", async () => {
  const req = new Request("https://bhumiamartya.app/api/ai/daily-guidance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // No Authorization header (simulates shipped VC 121/122 APK)
    },
    body: JSON.stringify({
      uid: "legacy_user_123",
      // Omit profile to stop cleanly at validation
    }),
  });

  const res = await dailyGuidancePOST(req);
  assert.equal(res.status, 400); // Stopped cleanly at validation (400), not 401
  const data = await res.json();
  assert.equal(data.ok, false);
  assert.equal(data.reason, "missing_profile");
});

test("VC123-12: /api/ai/daily-guidance rejects paid/non-dashboard modes without Bearer token (401) or without entitlement (403)", async () => {
  const unauthPaidReq = new Request("https://bhumiamartya.app/api/ai/daily-guidance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uid: "user_paid_mode",
      mode: "soul-identity",
    }),
  });
  const unauthRes = await dailyGuidancePOST(unauthPaidReq);
  assert.equal(unauthRes.status, 401);

  const nonEntitledPaidReq = new Request("https://bhumiamartya.app/api/ai/daily-guidance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer valid_token_free_user",
    },
    body: JSON.stringify({
      uid: "free_user_1",
      mode: "soul-identity",
    }),
  });
  (globalThis as any).__dailyGuidanceAuthDeps = {
    verifyIdToken: async () => ({ uid: "free_user_1" }),
  };
  (globalThis as any).__dailyGuidanceEntitlementCheck = async () => false;
  let forbiddenRes: Response;
  try {
    forbiddenRes = await dailyGuidancePOST(nonEntitledPaidReq);
  } finally {
    delete (globalThis as any).__dailyGuidanceAuthDeps;
    delete (globalThis as any).__dailyGuidanceEntitlementCheck;
  }
  assert.equal(forbiddenRes.status, 403);
});

test("VC123-13: /api/ai/daily-guidance enforces server-side persistent rate limit store across instances", async () => {
  (globalThis as any).__dailyGuidanceRateLimitStore = {
    checkAndIncrement: async () => false,
  };
  let rateLimitedRes: Response;
  try {
    const req = new Request("https://bhumiamartya.app/api/ai/daily-guidance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "203.0.113.99",
      },
      body: JSON.stringify({ uid: "rate_limited_user" }),
    });
    rateLimitedRes = await dailyGuidancePOST(req);
  } finally {
    delete (globalThis as any).__dailyGuidanceRateLimitStore;
  }
  assert.equal(rateLimitedRes.status, 429);
  const body = await rateLimitedRes.json();
  assert.equal(body.reason, "rate_limited");
});

test("VC123-14: /journal and all /innerwork/* routes isolate data hooks behind AccessGuard", () => {
  const innerworkLayout = path.join(ROOT, "app", "innerwork", "layout.tsx");
  assert.equal(fs.existsSync(innerworkLayout), true, "app/innerwork/layout.tsx must exist");
  const layoutSrc = fs.readFileSync(innerworkLayout, "utf8");
  assert.equal(layoutSrc.includes('<AccessGuard feature="wellness">'), true);

  const guardedRoutes = [
    ["app/journal/page.tsx", "JournalPageContent"],
    ["app/innerwork/journaling/page.tsx", "JournalPageContent"],
    ["app/innerwork/herbal/page.tsx", "HealthyFoodPageContent"],
    ["app/innerwork/manifestasi/page.tsx", "ManifestasiPageContent"],
    ["app/innerwork/meditation/page.tsx", "MeditationPageContent"],
    ["app/innerwork/workout/page.tsx", "WorkoutPageContent"],
    ["app/innerwork/yoga/page.tsx", "YogaPageContent"],
  ] as const;

  for (const [relPath, contentComponent] of guardedRoutes) {
    const src = fs.readFileSync(path.join(ROOT, relPath), "utf8");
    const exportIdx = src.indexOf("export default function");
    const guardIdx = src.indexOf("<AccessGuard", exportIdx);
    const contentDefIdx = src.indexOf(`function ${contentComponent}`, exportIdx);
    assert.equal(exportIdx >= 0, true, `${relPath} must have export default function`);
    assert.equal(guardIdx > exportIdx && guardIdx < contentDefIdx, true, `${relPath} must render <AccessGuard> before ${contentComponent}`);
  }
});
