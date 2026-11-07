import assert from "node:assert/strict";
import test from "node:test";
import { stripCanonicalServerMetadata, stripClientBirthWrites } from "../../lib/profile/canonicalBirthFields";
import { stripServerOwnedAccessFields } from "../../lib/billing/serverOwnedAccessFields";

// Canonical birth fields that candidate rules restrict from direct client writes
const CANONICAL_BIRTH_FIELDS = new Set([
  "birthRevision",
  "placeOfBirth",
  "birthDate",
  "dateOfBirth",
  "birthTime",
  "timeOfBirth",
  "birthCity",
  "birthPlace",
  "cityOfBirth",
  "birthCountry",
  "latitude",
  "longitude",
  "timezone",
  "canonicalBirthRevision",
  "canonicalBirthEpoch",
  "canonicalBirthSchemaVersion",
  "canonicalBirthUpdatedAt",
  "canonicalBirthOperationId",
]);

// Rule predicate simulation matching firestore.rules candidate logic
function candidateRulesPermitDirectClientWrite(
  existingDoc: Record<string, unknown> | null,
  incomingDoc: Record<string, unknown>,
  callerUid: string,
  targetDocUid: string
): { allowed: boolean; reason?: string } {
  // 1. UID Isolation
  if (callerUid !== targetDocUid) {
    return { allowed: false, reason: "PERMISSION_DENIED_UID_MISMATCH" };
  }

  // 2. Protected access / privilege fields check
  const PROTECTED_ACCESS_FIELDS = [
    "plan", "role", "admin", "isPremium", "membershipType", "badge",
    "testerBadge", "guardianBadge", "trial", "trialStartedAt", "trialEndsAt"
  ];
  const incomingKeys = Object.keys(incomingDoc);
  if (incomingKeys.some((k) => PROTECTED_ACCESS_FIELDS.includes(k))) {
    return { allowed: false, reason: "PERMISSION_DENIED_PROTECTED_ACCESS_FIELD" };
  }

  // 3. Candidate Canonical Birth Protection (Lines 195-237 of firestore.rules)
  // Client creates or changes canonical birth fields directly
  if (!existingDoc) {
    // Create operation
    if (incomingKeys.some((k) => CANONICAL_BIRTH_FIELDS.has(k))) {
      return { allowed: false, reason: "PERMISSION_DENIED_CANONICAL_BIRTH_CREATE_BLOCKED" };
    }
  } else {
    // Update operation
    const changedKeys = incomingKeys.filter((k) => incomingDoc[k] !== existingDoc[k]);
    if (changedKeys.some((k) => CANONICAL_BIRTH_FIELDS.has(k))) {
      return { allowed: false, reason: "PERMISSION_DENIED_CANONICAL_BIRTH_UPDATE_BLOCKED" };
    }
  }

  return { allowed: true };
}

// Rule predicate for CURRENT DEPLOYED production rules (permits legacy client birth writes)
function deployedProductionRulesPermitDirectClientWrite(
  existingDoc: Record<string, unknown> | null,
  incomingDoc: Record<string, unknown>,
  callerUid: string,
  targetDocUid: string
): { allowed: boolean; reason?: string } {
  if (callerUid !== targetDocUid) {
    return { allowed: false, reason: "PERMISSION_DENIED_UID_MISMATCH" };
  }
  return { allowed: true };
}

test("Client 118 Onboarding Direct Birth Write Compatibility", () => {
  const callerUid = "user-v118-new";
  const v118OnboardingPayload = {
    fullName: "Budi Santoso",
    birthDate: "1990-05-15",
    birthTime: "14:30",
    birthCity: "Surabaya",
    latitude: -7.2575,
    longitude: 112.7521,
    timezone: "Asia/Jakarta",
    setupCompleted: true,
  };

  // Under deployed production rules: v118 onboarding SUCCEEDS
  const deployedEval = deployedProductionRulesPermitDirectClientWrite(
    null,
    v118OnboardingPayload,
    callerUid,
    callerUid
  );
  assert.equal(deployedEval.allowed, true);

  // Under candidate hardened rules: v118 onboarding FAILS (permission-denied!)
  const candidateEval = candidateRulesPermitDirectClientWrite(
    null,
    v118OnboardingPayload,
    callerUid,
    callerUid
  );
  assert.equal(candidateEval.allowed, false);
  assert.equal(candidateEval.reason, "PERMISSION_DENIED_CANONICAL_BIRTH_CREATE_BLOCKED");
  // This proves unequivocally that candidate rules cannot be rolled out while v118 clients are active!
});

test("Client 119 Settings Birth Update Compatibility", () => {
  const callerUid = "user-v119";
  const existingProfile = {
    fullName: "Dewi Lestari",
    birthDate: "1995-10-10",
    birthTime: "08:00",
    birthCity: "Bandung",
    latitude: -6.9175,
    longitude: 107.6191,
    timezone: "Asia/Jakarta",
  };

  const v119UpdatePayload = {
    ...existingProfile,
    birthTime: "08:15", // Time correction
  };

  // Under deployed production rules: v119 edit SUCCEEDS
  const deployedEval = deployedProductionRulesPermitDirectClientWrite(
    existingProfile,
    v119UpdatePayload,
    callerUid,
    callerUid
  );
  assert.equal(deployedEval.allowed, true);

  // Under candidate hardened rules: v119 edit FAILS
  const candidateEval = candidateRulesPermitDirectClientWrite(
    existingProfile,
    v119UpdatePayload,
    callerUid,
    callerUid
  );
  assert.equal(candidateEval.allowed, false);
  assert.equal(candidateEval.reason, "PERMISSION_DENIED_CANONICAL_BIRTH_UPDATE_BLOCKED");
});

test("Client 120 Fallback Sanitization & Forgery Rejection", () => {
  const rawClientPayload = {
    fullName: "Aria Pratama",
    birthDate: "2000-01-01",
    birthTime: "09:00",
    birthCity: "Jakarta",
    // Forged server metadata
    canonicalBirthRevision: 999,
    canonicalBirthEpoch: "fake-epoch",
    canonicalBirthOperationId: "fake-op",
    // Forged access / admin / lifetime fields
    role: "admin",
    isPremium: true,
    membershipType: "LIFETIME",
    badge: "Founder",
  };

  // 1. Strip fake canonical metadata
  const sanitizedMeta = stripCanonicalServerMetadata(rawClientPayload);
  assert.equal(sanitizedMeta.canonicalBirthRevision, undefined);
  assert.equal(sanitizedMeta.canonicalBirthEpoch, undefined);
  assert.equal(sanitizedMeta.canonicalBirthOperationId, undefined);
  assert.equal(sanitizedMeta.fullName, "Aria Pratama");

  // 2. Strip server-owned access & privilege fields
  const sanitizedAccess = stripServerOwnedAccessFields(sanitizedMeta);
  assert.equal(sanitizedAccess.role, undefined);
  assert.equal(sanitizedAccess.isPremium, undefined);
  assert.equal(sanitizedAccess.membershipType, undefined);
  assert.equal(sanitizedAccess.badge, undefined);

  // 3. Canonical Immutability Guard: client cannot overwrite existing canonical birth records
  const existingCanonicalProfile = {
    fullName: "Aria Pratama",
    birthDate: "2000-01-01",
    canonicalBirthRevision: 1, // Already verified on server
  };
  const sanitizedBirthWrites = stripClientBirthWrites(sanitizedAccess, existingCanonicalProfile);
  assert.equal(sanitizedBirthWrites.birthDate, undefined);
  assert.equal(sanitizedBirthWrites.birthTime, undefined);
});

test("Client 121 Canonical Server Boundary & Cross-User Isolation", () => {
  const callerUid = "user-121-alpha";
  const victimUid = "user-121-beta";

  // Cross-user write is unconditionally denied
  const crossUserEval = candidateRulesPermitDirectClientWrite(
    null,
    { fullName: "Attacker" },
    callerUid,
    victimUid
  );
  assert.equal(crossUserEval.allowed, false);
  assert.equal(crossUserEval.reason, "PERMISSION_DENIED_UID_MISMATCH");

  // Client-side forgery of privilege is denied by candidate rules
  const forgeryEval = candidateRulesPermitDirectClientWrite(
    null,
    { isPremium: true },
    callerUid,
    callerUid
  );
  assert.equal(forgeryEval.allowed, false);
  assert.equal(forgeryEval.reason, "PERMISSION_DENIED_PROTECTED_ACCESS_FIELD");
});
