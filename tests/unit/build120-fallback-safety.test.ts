import { strictEqual, ok, deepStrictEqual } from "node:assert";
import { stripCanonicalServerMetadata, stripClientBirthWrites } from "@/lib/profile/canonicalBirthFields";
import { stripServerOwnedAccessFields } from "@/lib/billing/serverOwnedAccessFields";

console.log("=== BUILD 120: SETUP & SETTINGS FALLBACK SAFETY TEST SUITE ===\n");

// -------------------------------------------------------------
// TEST 1: Permitted Legacy Birth Profile Preservation
// -------------------------------------------------------------
console.log("--- 1. Testing Permitted Legacy Birth Profile Preservation ---");

const legacyInput = {
  uid: "test-user-1985",
  fullName: "Widhi Wedhaswara",
  birthDate: "1985-05-03",
  birthTime: "23:45",
  birthCity: "Jakarta",
  latitude: -6.2088,
  longitude: 106.8456,
  timezone: "Asia/Jakarta",
  setupCompleted: true,
  relationshipStatus: "in_relationship",
  language: "id",
};

const strippedAccess = stripServerOwnedAccessFields(legacyInput);
const strippedMetadata = stripCanonicalServerMetadata(strippedAccess);

strictEqual(strippedMetadata.fullName, "Widhi Wedhaswara");
strictEqual(strippedMetadata.birthDate, "1985-05-03");
strictEqual(strippedMetadata.birthTime, "23:45");
strictEqual(strippedMetadata.birthCity, "Jakarta");
strictEqual(strippedMetadata.latitude, -6.2088);
strictEqual(strippedMetadata.longitude, 106.8456);
strictEqual(strippedMetadata.timezone, "Asia/Jakarta");
strictEqual(strippedMetadata.setupCompleted, true);
console.log("  [PASS] All permitted legacy profile and birth fields are preserved without loss.\n");

// -------------------------------------------------------------
// TEST 2: Rejection of Fake Canonical Metadata
// -------------------------------------------------------------
console.log("--- 2. Testing Rejection of Fake Canonical Metadata ---");

const rogueInputWithFakeCanonical = {
  ...legacyInput,
  canonicalBirthEpoch: "fake_epoch_forge_attempt",
  canonicalBirthRevision: 42,
  canonicalBirthOperationId: "fake_op_12345",
  canonicalBirthSchemaVersion: 1,
  canonicalBirthUpdatedAt: "2026-11-07T00:00:00.000Z",
};

const sanitized = stripCanonicalServerMetadata(stripServerOwnedAccessFields(rogueInputWithFakeCanonical));

ok(!("canonicalBirthEpoch" in sanitized), "canonicalBirthEpoch must be stripped");
ok(!("canonicalBirthRevision" in sanitized), "canonicalBirthRevision must be stripped");
ok(!("canonicalBirthOperationId" in sanitized), "canonicalBirthOperationId must be stripped");
ok(!("canonicalBirthSchemaVersion" in sanitized), "canonicalBirthSchemaVersion must be stripped");
ok(!("canonicalBirthUpdatedAt" in sanitized), "canonicalBirthUpdatedAt must be stripped");
console.log("  [PASS] All fake canonical epoch/revision/operation metadata stripped unconditionally.\n");

// -------------------------------------------------------------
// TEST 3: Rejection of Forged Access & Lifetime Fields
// -------------------------------------------------------------
console.log("--- 3. Testing Rejection of Forged Access & Lifetime Fields ---");

const rogueInputWithPrivileges = {
  ...legacyInput,
  isLifetime: true,
  lifetime: true,
  lifetimeAccess: true,
  isPremium: true,
  role: "admin",
  tier: "inti",
  adminRole: "superadmin",
};

const securePayload = stripCanonicalServerMetadata(stripServerOwnedAccessFields(rogueInputWithPrivileges));

ok(!("isLifetime" in securePayload), "isLifetime must be stripped");
ok(!("lifetime" in securePayload), "lifetime must be stripped");
ok(!("lifetimeAccess" in securePayload), "lifetimeAccess must be stripped");
ok(!("isPremium" in securePayload), "isPremium must be stripped");
ok(!("role" in securePayload), "role must be stripped");
ok(!("tier" in securePayload), "tier must be stripped");
ok(!("adminRole" in securePayload), "adminRole must be stripped");
console.log("  [PASS] All privilege, lifetime, and admin fields stripped unconditionally.\n");

// -------------------------------------------------------------
// TEST 4: Canonical Immutability (Existing Canonical Protected)
// -------------------------------------------------------------
console.log("--- 4. Testing Canonical Immutability Guard ---");

const forgedBirthUpdateOnCanonical = {
  displayName: "Updated Preference",
  birthDate: "2002-01-01", // attempt to forge canonical birth
  birthCity: "Forged City",
};

// When user has canonical record, stripClientBirthWrites is applied:
const protectedCanonical = stripClientBirthWrites(
  stripCanonicalServerMetadata(stripServerOwnedAccessFields(forgedBirthUpdateOnCanonical))
);

strictEqual(protectedCanonical.displayName, "Updated Preference");
ok(!("birthDate" in protectedCanonical), "birthDate must be stripped when canonical record exists");
ok(!("birthCity" in protectedCanonical), "birthCity must be stripped when canonical record exists");
console.log("  [PASS] Existing canonical records cannot be overwritten by direct client birth writes.\n");

console.log("=== ALL BUILD 120 FALLBACK SAFETY CHECKS PASSED (EXIT 0) ===");
