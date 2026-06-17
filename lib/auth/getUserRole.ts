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

const FOUNDER_EMAIL = "wizzare@gmail.com";
const ADMIN_EMAILS = [
  "ayeshiaad@gmail.com",
  "dj.neynna@gmail.com",
  "wedancewiththetime@gmail.com",
  "kahfifa46@gmail.com"
];

function normalize(value?: string | null): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
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
  const isFounder = email === FOUNDER_EMAIL;
  const isAdmin = ADMIN_EMAILS.includes(email) || isFounder;

  if (isFounder || isAdmin) {
    return {
      role: "dev_admin",
      isAdmin: true,
      isDev: isFounder,
    };
  }

  return {
    role: "user",
    isAdmin: false,
    isDev: false,
  };
}
