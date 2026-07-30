import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

export type AdminRoleRecord = {
  isDeveloperPro: boolean;
};

const ADMIN_ROLE_REGISTRY_COLLECTION = "adminRoleRegistry";

/**
 * Single-document Firestore lookup, keyed by uid. Replaces the previous
 * hardcoded email allowlist in getUserPlanStatus.ts.
 */
export async function getAdminRoleRecord(uid?: string | null): Promise<AdminRoleRecord | null> {
  const trimmedUid = (uid || "").trim();
  if (!trimmedUid) return null;
  const snap = await getDoc(doc(db, ADMIN_ROLE_REGISTRY_COLLECTION, trimmedUid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return { isDeveloperPro: data.isDeveloperPro === true };
}
