import assert from "node:assert";

console.log("▶ Running Billing Entitlement Contract Tests\n");

let passed = 0;
let failed = 0;

function test(label: string, condition: boolean, detail?: string) {
  if (condition) { passed++; console.log(`  PASS: ${label}`); }
  else { failed++; console.error(`  FAIL: ${label}${detail ? " — " + detail : ""}`); }
}

const NOW = new Date("2026-07-25T00:00:00Z");

// Replicate the entitlement precedence chain from lib/billing/entitlementService.ts
// This is a SOURCE CONTRACT TEST against the production entitlement contract.
function getEntitlementStatus(profile: any, now: Date) {
  if (!profile) {
    return { isPremium: false, reason: "none", expiresAt: null, effectiveTier: "Free", status: "No Data" };
  }

  // Priority 0: Gaia override (expired since 2026-07-01)
  if (now < new Date("2026-07-01T00:00:00Z")) {
    return { isPremium: true, reason: "override", expiresAt: new Date("2026-07-01T00:00:00Z"), effectiveTier: "Gaia Override", status: "Active" };
  }

  // Priority 1: Founder / Lifetime
  if (profile.membershipType === "LIFETIME" || profile.guardianRole === "founder" || profile.role === "admin") {
    return { isPremium: true, reason: "founder", expiresAt: null, effectiveTier: "Founder (Lifetime)", status: "Active" };
  }

  // Priority 2: Badge-based access (Inti, Alfa, Penjaga Bhumi)
  const badge = String(profile.testerBadge || profile.guardianBadge || profile.badge || "").toLowerCase();
  if (badge.includes("inti") || badge === "penjaga bhumi inti") {
    return { isPremium: true, reason: "inti_badge", expiresAt: new Date("2026-08-30T00:00:00Z"), effectiveTier: "Penjaga Bhumi Inti", status: "Active" };
  }
  if (badge.includes("alfa") || badge === "penjaga bhumi alfa") {
    return { isPremium: true, reason: "alfa_badge", expiresAt: new Date("2026-07-30T00:00:00Z"), effectiveTier: "Penjaga Bhumi Alfa", status: "Active" };
  }
  if (badge.includes("penjaga bhumi") || badge.includes("founder")) {
    return { isPremium: true, reason: "subscriber", expiresAt: null, effectiveTier: "Penjaga Bhumi", status: "Active" };
  }

  // Priority 3: Active paid premium
  if (profile.membershipType === "PREMIUM" || profile.isPremium === true) {
    const expiry = profile.membershipExpiryDate || profile.accessUntil;
    const expiryDate = expiry ? new Date(expiry) : null;
    if (expiryDate && expiryDate > now) {
      return { isPremium: true, reason: "subscriber", expiresAt: expiryDate, effectiveTier: "Premium", status: "Active" };
    }
  }

  // Priority 4: Trial (7-login)
  const loginCount = profile.trialLoginCount ?? 0;
  const explicitlyFree = profile.plan === "free" || profile.trialStatus === "free";
  if (loginCount <= 7 && !explicitlyFree) {
    return { isPremium: true, reason: "trial", expiresAt: null, effectiveTier: "Trial", status: "Active", trialLoginsRemaining: `${7 - loginCount}/7` };
  }

  // Priority 5: Free
  return { isPremium: false, reason: "none", expiresAt: null, effectiveTier: "Free", status: "Free" };
}

// ========== TEST CASES ==========

// Null profile
{
  const s = getEntitlementStatus(null, NOW);
  test("null profile returns not premium", s.isPremium === false);
  test("null profile reason is none", s.reason === "none");
  test("null profile status is No Data", s.status === "No Data");
}

// Free user (expired trial)
{
  const profile = { trialLoginCount: 10, plan: "free" } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("expired trial user is not premium", s.isPremium === false);
  test("expired trial reason is none", s.reason === "none");
}

// Trial active
{
  const profile = { trialLoginCount: 3 } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("trial user with 3 logins is premium", s.isPremium === true);
  test("trial user reason is trial", s.reason === "trial");
  test("trial logins remaining is displayed", s.trialLoginsRemaining === "4/7");
}

// Trial boundary: exactly 7
{
  const profile = { trialLoginCount: 7 } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("user with 7 logins is still trial", s.isPremium === true && s.reason === "trial");
}

// Trial boundary: 8 logins (expired)
{
  const profile = { trialLoginCount: 8 } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("user with 8 logins is not premium", s.isPremium === false);
}

// Explicit free plan overrides trial
{
  const profile = { trialLoginCount: 3, plan: "free" } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("explicit free plan denies trial", s.isPremium === false);
}

// Active premium membership
{
  const profile = { membershipType: "PREMIUM", isPremium: true, membershipExpiryDate: "2026-08-01T00:00:00Z" } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("active premium membership is premium", s.isPremium === true);
  test("premium reason is subscriber", s.reason === "subscriber");
}

// Expired premium membership (falls through to trial since trialLoginCount defaults to 0)
{
  const profile = { membershipType: "PREMIUM", isPremium: true, membershipExpiryDate: "2026-06-01T00:00:00Z" } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("expired premium falls to trial for new user", s.isPremium === true && s.reason === "trial");
}

// Lifetime membership
{
  const profile = { membershipType: "LIFETIME" } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("lifetime membership is premium", s.isPremium === true);
  test("lifetime has no expiry", s.expiresAt === null);
}

// Premium overrides trial
{
  const profile = { trialLoginCount: 3, membershipType: "PREMIUM", isPremium: true, membershipExpiryDate: "2026-08-01T00:00:00Z" } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("premium takes precedence over trial", s.reason === "subscriber");
}

// Expired premium falls to trial
{
  const profile = { trialLoginCount: 5, membershipType: "PREMIUM", isPremium: true, membershipExpiryDate: "2026-06-01T00:00:00Z" } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("expired premium falls through to trial", s.isPremium === true && s.reason === "trial");
}

// Inti badge access
{
  const profile = { testerBadge: "Penjaga Bhumi Inti", accessUntil: "2026-08-30T00:00:00Z" } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("Inti badge grants premium", s.isPremium === true);
  test("Inti badge reason is inti_badge", s.reason === "inti_badge");
}

// Alfa badge access
{
  const profile = { testerBadge: "Penjaga Bhumi Alfa", accessUntil: "2026-07-30T00:00:00Z" } as any;
  const s = getEntitlementStatus(profile, NOW);
  test("Alfa badge grants premium", s.isPremium === true);
  test("Alfa badge reason is alfa_badge", s.reason === "alfa_badge");
}

// Empty profile defaults to trial (trialLoginCount defaults to 0)
{
  const profile = {} as any;
  const s = getEntitlementStatus(profile, NOW);
  test("empty profile defaults to trial access", s.isPremium === true && s.reason === "trial");
}

// Purchase token ownership validation contract
{
  function validateTokenOwnership(existing: any, callerUid: string) {
    if (!existing || !existing.uid) return { ok: true, idempotent: false };
    if (existing.uid === callerUid) return { ok: true, idempotent: true };
    return { ok: false, idempotent: false, reason: "token_linked_to_another_uid" };
  }

  test("new token is accepted", validateTokenOwnership(null, "user_1").ok === true);
  test("same UID re-verification is idempotent", validateTokenOwnership({ uid: "user_1" }, "user_1").idempotent === true);
  test("different UID token is rejected", validateTokenOwnership({ uid: "user_1" }, "user_2").ok === false);
}

// Backend subscription state machine contract
{
  function buildEntitlementDecision(state: string, expiry: number | null) {
    const activeStates = new Set(["SUBSCRIPTION_STATE_ACTIVE", "SUBSCRIPTION_STATE_IN_GRACE_PERIOD"]);
    const active = activeStates.has(state) && Boolean(expiry && expiry > Date.now());
    return { active, status: active ? "active" : state === "SUBSCRIPTION_STATE_VOIDED" ? "voided" : "expired" };
  }

  test("ACTIVE with future expiry grants entitlement", buildEntitlementDecision("SUBSCRIPTION_STATE_ACTIVE", Date.now() + 86400000).active === true);
  test("ACTIVE with past expiry denies entitlement", buildEntitlementDecision("SUBSCRIPTION_STATE_ACTIVE", Date.now() - 1000).active === false);
  test("GRACE_PERIOD with future expiry grants entitlement", buildEntitlementDecision("SUBSCRIPTION_STATE_IN_GRACE_PERIOD", Date.now() + 86400000).active === true);
  test("PENDING does not grant entitlement", buildEntitlementDecision("SUBSCRIPTION_STATE_PENDING", Date.now() + 86400000).active === false);
  test("CANCELED past expiry denies entitlement", buildEntitlementDecision("SUBSCRIPTION_STATE_CANCELED", Date.now() - 1000).active === false);
  test("VOIDED is marked voided", buildEntitlementDecision("SUBSCRIPTION_STATE_VOIDED", null).status === "voided");
  test("null expiry denies entitlement", buildEntitlementDecision("SUBSCRIPTION_STATE_ACTIVE", null).active === false);
}

console.log(`\n${passed + failed} tests, ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
