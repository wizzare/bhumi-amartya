import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

const FOUNDER_EMAILS = [
  "wizzare@gmail.com",
];

const ADMIN_ROLES = ["founder", "admin", "dev_admin"];

export interface PrivilegedUserInfo {
  email?: string | null;
  role?: string | null;
  guardianRole?: string | null;
}

/**
 * Global helper to identify Founders and Admins who must bypass all application gates.
 */
export function isPrivilegedUser(user: PrivilegedUserInfo | null): boolean {
  if (!user) return false;

  const email = user.email?.toLowerCase().trim();
  const role = user.role?.toLowerCase() || user.guardianRole?.toLowerCase();

  // 1. Hardcoded Founder Email Bypass (Immediate)
  if (email && FOUNDER_EMAILS.includes(email)) return true;

  // 2. Role-based Bypass
  if (role && ADMIN_ROLES.includes(role)) return true;

  return false;
}

/**
 * Future-proof Firestore check for privileged status.
 * Used for dynamic admin management without app updates.
 */
export async function checkRemotePrivilegedStatus(email: string): Promise<boolean> {
  if (!email) return false;
  try {
    const snap = await getDoc(doc(db, "admin_users", email.toLowerCase().trim()));
    if (snap.exists()) {
      const data = snap.data();
      return data.active === true;
    }
  } catch (err) {
    console.warn("[PRIVILEGED USER] Remote check failed:", err);
  }
  return false;
}
