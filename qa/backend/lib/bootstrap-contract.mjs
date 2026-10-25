export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
export const SOURCE = "server_access_bootstrap";
export const ACCESS_SOURCE_VERSION = "2026-09-13";
export const HIGHER_BADGES = Object.freeze([
  "Founder",
  "Penjaga Bhumi Inti",
  "Penjaga Bhumi Alfa",
]);
export const TRIAL_KEYS = Object.freeze([
  "trialStartedAt",
  "trialEndsAt",
  "accessStart",
  "accessUntil",
  "entitlementSource",
  "accessSource",
  "trialLoginCount",
  "trialStatus",
  "trialCompletedAt",
  "trialGranted",
]);

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function isHigherEntitlement(value) {
  const data = asObject(value);
  if ([data.badge, data.testerBadge, data.guardianBadge].some((badge) => HIGHER_BADGES.includes(badge))) {
    return true;
  }
  return (
    data.membershipType === "LIFETIME" ||
    data.membershipType === "PREMIUM" ||
    data.isPremium === true
  );
}

export function hasTrialState(value) {
  const data = asObject(value);
  return (
    TRIAL_KEYS.some((key) => Object.hasOwn(data, key)) ||
    data.membershipType === "TRIAL" ||
    data.membership === "REGULAR_TRIAL" ||
    data.plan === "free_trial" ||
    data.subscriptionStatus === "trialing"
  );
}

export function buildCanonicalGrant(now = new Date()) {
  const start = new Date(now);
  const end = new Date(start.getTime() + SEVEN_DAYS_MS);
  const startIso = start.toISOString();
  const endIso = end.toISOString();
  return {
    plan: "free_trial",
    membership: "REGULAR_TRIAL",
    membershipType: "TRIAL",
    subscriptionStatus: "trialing",
    trialStartedAt: startIso,
    trialEndsAt: endIso,
    accessStart: startIso,
    accessUntil: endIso,
    entitlementSource: SOURCE,
    accessSource: SOURCE,
    accessSourceVersion: ACCESS_SOURCE_VERSION,
    entitlementUpdatedAt: startIso,
    updatedBy: SOURCE,
    updatedAt: startIso,
  };
}

export function validateCanonicalTrial(value, now = new Date()) {
  const data = asObject(value);
  const start = typeof data.trialStartedAt === "string" ? Date.parse(data.trialStartedAt) : NaN;
  const end = typeof data.trialEndsAt === "string" ? Date.parse(data.trialEndsAt) : NaN;
  const nowMs = new Date(now).getTime();
  return (
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    end - start === SEVEN_DAYS_MS &&
    start <= nowMs &&
    data.entitlementSource === SOURCE &&
    data.accessSource === SOURCE &&
    data.updatedBy === SOURCE &&
    data.accessSourceVersion === ACCESS_SOURCE_VERSION &&
    data.accessStart === data.trialStartedAt &&
    data.accessUntil === data.trialEndsAt &&
    data.membershipType === "TRIAL" &&
    data.membership === "REGULAR_TRIAL" &&
    data.plan === "free_trial" &&
    data.subscriptionStatus === "trialing"
  );
}

export function evaluateBootstrap(value, now = new Date()) {
  const data = asObject(value);
  if (isHigherEntitlement(data)) {
    return { outcome: "HIGHER_ENTITLEMENT", ok: true };
  }
  if (hasTrialState(data)) {
    if (!validateCanonicalTrial(data, now)) {
      return { outcome: "DATA_CONFLICT", ok: false };
    }
    return {
      outcome: "ALREADY_PRESENT",
      ok: true,
      trialStartedAt: data.trialStartedAt,
      trialEndsAt: data.trialEndsAt,
    };
  }
  const grant = buildCanonicalGrant(now);
  return {
    outcome: "PROVISIONED",
    ok: true,
    grant,
    trialStartedAt: grant.trialStartedAt,
    trialEndsAt: grant.trialEndsAt,
  };
}

export function createMinimalProfile({ uid, claims = {}, now = new Date() }) {
  const displayName = typeof claims.name === "string" ? claims.name : "";
  const email = typeof claims.email === "string" ? claims.email : "";
  const photoURL = typeof claims.picture === "string" ? claims.picture : null;
  const timestamp = new Date(now);
  return {
    uid,
    fullName: displayName,
    displayName,
    email,
    photoURL,
    birthDate: "",
    birthTime: "",
    birthCity: "",
    birthPlace: "",
    birthCountry: null,
    latitude: null,
    longitude: null,
    timezone: null,
    language: "id",
    onboardingCompleted: false,
    baselineWellnessCompleted: false,
    setupCompleted: false,
    blueprintStatus: "missing",
    healingProgress: {
      healingStreak: 0,
      totalJournalEntries: 0,
      totalMeditationMinutes: 0,
      totalInnerworkSessions: 0,
      consciousnessLevel: 0,
    },
    emotionalState: {
      currentMood: null,
      lastCheckInAt: null,
      recurringThemes: [],
    },
    profile: {
      language: "id",
      onboardingCompleted: false,
      blueprintInput: {
        birthDate: "",
        birthTime: "",
        birthCity: "",
      },
    },
    settings: {},
    registeredAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
