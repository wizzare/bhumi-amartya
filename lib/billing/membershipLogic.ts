import { UserProfile, userRepository } from "@/lib/repositories/userRepository";
import { getPenjagaBhumiIntiGrant, isDirectPenjagaBhumiInti } from "@/lib/billing/membershipGrant";

const FOUNDER_EMAIL = "wizzare@gmail.com";
const ADMIN_EMAILS = [
  "ayeshiaad@gmail.com",
  "dj.neynna@gmail.com",
  "wedancewiththetime@gmail.com",
  "kahfifa46@gmail.com"
];

function toProfileDate(value: UserProfile["createdAt"] | string | Date | null | undefined): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate();
  }
  if (value && typeof value === "object" && "seconds" in value && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000);
  }
  return new Date();
}

export async function processMembershipGrant(profile: UserProfile): Promise<UserProfile> {
  const email = profile.email?.trim().toLowerCase();
  const grant = getPenjagaBhumiIntiGrant(email);

  const updatedData: Partial<UserProfile> = {};
  let changed = false;

  // 1. Identity & Recognition Layer
  if (email === FOUNDER_EMAIL || email === "wizzare@gmail.com") {
    if (profile.guardianRole !== "founder" || profile.recognitionTier !== "FOUNDER") {
      updatedData.guardianRole = "founder";
      updatedData.guardianBadge = "core_guardian";
      updatedData.recognitionTier = "FOUNDER";
      updatedData.membershipType = "LIFETIME";
      updatedData.isFoundingMember = true;
      changed = true;
    }
  } else if (ADMIN_EMAILS.some(e => e.toLowerCase() === email)) {
    if (profile.guardianRole !== "admin") {
      updatedData.guardianRole = "admin";
      updatedData.membershipType = "LIFETIME";
      changed = true;
    }
  }

  // 2. Direct Bhumi Inti grant
  if (isDirectPenjagaBhumiInti(email)) {
    if (profile.recognitionTier !== "CORE_GUARDIAN" || profile.guardianBadge !== "core_guardian") {
      updatedData.recognitionTier = "CORE_GUARDIAN";
      updatedData.guardianBadge = "core_guardian";
      updatedData.guardianCandidate = false;
      updatedData.guardianApproved = true;
      updatedData.membershipType = "PENJAGA_BHUMI_INTI";
      updatedData.isFoundingMember = true;
      changed = true;
    }
  } else if (grant && !updatedData.recognitionTier && profile.recognitionTier !== "CORE_GUARDIAN" && profile.recognitionTier !== "CORE_GUARDIAN_CANDIDATE") {
    updatedData.recognitionTier = "CORE_GUARDIAN_CANDIDATE";
    updatedData.guardianBadge = "guardian"; // Candidate still has regular badge until approved
    updatedData.guardianCandidate = true;
    updatedData.guardianApproved = false;
    updatedData.isFoundingMember = true;
    changed = true;
  }

  // 3. Initialize Metrics if missing for candidates
  if (profile.recognitionTier === "CORE_GUARDIAN_CANDIDATE" || updatedData.recognitionTier === "CORE_GUARDIAN_CANDIDATE") {
    if (!profile.participationMetrics) {
      updatedData.participationMetrics = {
        loginCount: 1,
        lastSeen: new Date().toISOString(),
        hasCompletedCheckIn: false,
        hasCompletedAssessment: false,
        activeDays: [new Date().toISOString().slice(0, 10)]
      };
      changed = true;
    }
  }

  // 4. Default Recognition
  if (!profile.recognitionTier && !updatedData.recognitionTier) {
    updatedData.recognitionTier = "GUARDIAN";
    updatedData.guardianBadge = "guardian";
    updatedData.guardianRole = profile.guardianRole || "user";
    changed = true;
  }

  if (!profile.recognitionDate) {
     updatedData.recognitionDate = toProfileDate(profile.createdAt).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
     changed = true;
  }

  if (changed) {
    await userRepository.upsertUserProfile(profile.uid, updatedData);
    return {
      ...profile,
      ...updatedData,
    } as UserProfile;
  }

  return profile;
}
