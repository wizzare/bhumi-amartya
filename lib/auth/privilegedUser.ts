const FOUNDER_EMAILS = [
  "wizzare@gmail.com",
] as const;

export type PrivilegedRole = "founder" | "admin" | "dev_admin";

const ADMIN_ROLES = ["admin", "dev_admin"] as const;

export interface PrivilegedUserInfo {
  uid?: string | null;
  email?: string | null;
  role?: string | null;
  guardianRole?: string | null;
}

function normalizedRoles(user: PrivilegedUserInfo): string[] {
  return [user.role, user.guardianRole]
    .map((role) => role?.trim().toLowerCase() ?? "")
    .filter(Boolean);
}

export function isFounderUser(user: PrivilegedUserInfo | null): boolean {
  if (!user) return false;
  const email = user.email?.trim().toLowerCase() ?? "";
  return normalizedRoles(user).includes("founder")
    || (FOUNDER_EMAILS as readonly string[]).includes(email);
}

/** Admin identities resolve only from the server-owned Firestore role fields. */
export function isAdminUser(user: PrivilegedUserInfo | null): boolean {
  if (!user) return false;
  return normalizedRoles(user).some((role) =>
    (ADMIN_ROLES as readonly string[]).includes(role),
  );
}

export function resolvePrivilegedRole(user: PrivilegedUserInfo | null): PrivilegedRole | null {
  if (isFounderUser(user)) return "founder";
  if (!user) return null;
  const roles = normalizedRoles(user);
  if (roles.includes("admin")) return "admin";
  if (roles.includes("dev_admin")) return "dev_admin";
  return null;
}

/** Global helper for premium and privileged feature policy. */
export function isPrivilegedUser(user: PrivilegedUserInfo | null): boolean {
  return resolvePrivilegedRole(user) !== null;
}

/**
 * UI guard bound to the currently authenticated Firebase UID. A stale profile,
 * missing profile, or profile-read failure cannot authorize a privileged page.
 */
export function hasPrivilegedPageAccessForUid(
  authenticatedUid: string | null | undefined,
  profile: PrivilegedUserInfo | null,
): boolean {
  const uid = authenticatedUid?.trim() ?? "";
  const profileUid = profile?.uid?.trim() ?? "";
  return Boolean(uid && profileUid && uid === profileUid && resolvePrivilegedRole(profile));
}
