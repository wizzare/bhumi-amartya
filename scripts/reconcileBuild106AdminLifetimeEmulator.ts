import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  BUILD106_ADMIN_IDENTITY_SLOTS,
  buildAdminLifetimeProfilePatch,
  validateAdminUidAssignments,
} from "../lib/auth/adminContinuity";

function requireEmulatorBoundary(): string {
  const host = process.env.FIRESTORE_EMULATOR_HOST?.trim() ?? "";
  if (!/^(localhost|127\.0\.0\.1):\d+$/.test(host)) {
    throw new Error("FIRESTORE_EMULATOR_HOST must target localhost. Production writes are refused.");
  }

  const projectId = process.env.BHUMI_ADMIN_RECONCILIATION_PROJECT_ID?.trim() ?? "";
  if (!projectId.startsWith("demo-")) {
    throw new Error("BHUMI_ADMIN_RECONCILIATION_PROJECT_ID must use a demo-* project.");
  }
  return projectId;
}

async function main() {
  const projectId = requireEmulatorBoundary();
  const assignments = validateAdminUidAssignments({
    ADMIN_1: process.env.BHUMI_BUILD106_ADMIN_1_UID ?? "",
    ADMIN_2: process.env.BHUMI_BUILD106_ADMIN_2_UID ?? "",
    ADMIN_3: process.env.BHUMI_BUILD106_ADMIN_3_UID ?? "",
    ADMIN_4: process.env.BHUMI_BUILD106_ADMIN_4_UID ?? "",
  });

  const app = getApps()[0] ?? initializeApp({ projectId });
  const firestore = getFirestore(app);
  const patch = buildAdminLifetimeProfilePatch();
  const batch = firestore.batch();

  for (const slot of BUILD106_ADMIN_IDENTITY_SLOTS) {
    const ref = firestore.collection("users").doc(assignments[slot]);
    const existing = await ref.get();
    if (!existing.exists) {
      throw new Error(`${slot} users/{uid} profile is missing; refusing to create identity data.`);
    }
    batch.set(ref, patch, { merge: true });
  }

  await batch.commit();

  for (const slot of BUILD106_ADMIN_IDENTITY_SLOTS) {
    const snapshot = await firestore.collection("users").doc(assignments[slot]).get();
    const data = snapshot.data() ?? {};
    if (
      data.role !== "admin"
      || data.membershipType !== "LIFETIME"
      || data.membershipExpiryDate !== null
      || data.entitlementSource !== "admin_lifetime"
    ) {
      throw new Error(`${slot} reconciliation verification failed.`);
    }
  }

  console.log(`BUILD106_ADMIN_LIFETIME_EMULATOR_RECONCILED count=${BUILD106_ADMIN_IDENTITY_SLOTS.length}`);
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Admin reconciliation failed.");
  process.exitCode = 1;
});
