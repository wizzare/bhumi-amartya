type RoleInputProfile = {
  email?: string | null;
  fullName?: string | null;
  displayName?: string | null;
  profile?: Record<string, unknown>;
} | null;

export type UserRoleResult = {
  role: "dev_admin" | "user";
  isAdmin: boolean;
  isDev: boolean;
};

const ADMIN_EMAIL = "wizzare@gmail.com";
const ADMIN_NAME = "widhi wedhaswara";

function normalize(value?: string | null): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getCandidateName(profile: RoleInputProfile): string {
  if (!profile) return "";

  const nestedProfile = profile.profile && typeof profile.profile === "object"
    ? profile.profile as Record<string, unknown>
    : null;

  const nestedFullName = typeof nestedProfile?.fullName === "string" ? nestedProfile.fullName : null;
  const nestedDisplayName = typeof nestedProfile?.displayName === "string" ? nestedProfile.displayName : null;

  return normalize(
    profile.fullName
      ?? profile.displayName
      ?? nestedFullName
      ?? nestedDisplayName
      ?? null,
  );
}

function getCandidateEmail(profile: RoleInputProfile): string {
  if (!profile) return "";

  const nestedProfile = profile.profile && typeof profile.profile === "object"
    ? profile.profile as Record<string, unknown>
    : null;
  const nestedEmail = typeof nestedProfile?.email === "string" ? nestedProfile.email : null;

  return normalize(profile.email ?? nestedEmail ?? null);
}

export function getUserRole(profile: RoleInputProfile): UserRoleResult {
  const email = getCandidateEmail(profile);
  const name = getCandidateName(profile);
  const emailMatchesAdmin = email === ADMIN_EMAIL;

  // Name is only a secondary signal for diagnostics; access still requires email match.
  const nameLooksLikeAdmin = name === ADMIN_NAME;
  void nameLooksLikeAdmin;

  if (emailMatchesAdmin) {
    return {
      role: "dev_admin",
      isAdmin: true,
      isDev: true,
    };
  }

  return {
    role: "user",
    isAdmin: false,
    isDev: false,
  };
}
