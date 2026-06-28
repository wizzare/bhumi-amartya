import { UserProfile, userRepository } from "@/lib/repositories/userRepository";
import { Timestamp } from "firebase/firestore";
import { FREE_TRIAL_DAYS } from "@/lib/billing/getUserPlanStatus";
import {
  getFounderTesterRecord,
  shouldApplyDefaultRegistrationPolicy,
  type FounderTesterRecord,
} from "@/lib/billing/founderTesterSourceOfTruth";

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

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function setIfChanged<T extends keyof UserProfile>(
  profile: UserProfile,
  updatedData: Partial<UserProfile>,
  key: T,
  value: UserProfile[T],
) {
  if (profile[key] !== value) {
    updatedData[key] = value;
    return true;
  }
  return false;
}

function applyFounderTesterRecord(
  profile: UserProfile,
  updatedData: Partial<UserProfile>,
  record: FounderTesterRecord,
): boolean {
  let changed = false;
  const startDate = toProfileDate(profile.membershipStartDate || profile.createdAt);
  const startTimestamp = profile.membershipStartDate || Timestamp.fromDate(startDate);

  changed = setIfChanged(profile, updatedData, "testerBadge", record.badge) || changed;
  changed = setIfChanged(profile, updatedData, "membershipStartDate", startTimestamp) || changed;

  if (record.membership === "LIFETIME_PREMIUM") {
    changed = setIfChanged(profile, updatedData, "plan", "premium") || changed;
    changed = setIfChanged(profile, updatedData, "planLabel", "Lifetime Premium") || changed;
    changed = setIfChanged(profile, updatedData, "membershipType", "LIFETIME") || changed;
    if (profile.membershipExpiryDate !== null) {
      updatedData.membershipExpiryDate = null;
      changed = true;
    }
    return changed;
  }

  if (record.membership === "PREMIUM_2_MONTHS" || record.membership === "PREMIUM_1_MONTH") {
    const months = record.premiumMonths || 1;
    changed = setIfChanged(profile, updatedData, "plan", "premium") || changed;
    changed = setIfChanged(profile, updatedData, "planLabel", record.membership === "PREMIUM_2_MONTHS" ? "Premium (2 Months)" : "Premium (1 Month)") || changed;
    changed = setIfChanged(profile, updatedData, "membershipType", "PREMIUM") || changed;
    updatedData.membershipExpiryDate = Timestamp.fromDate(addMonths(startDate, months));
    changed = true;
    return changed;
  }

  changed = setIfChanged(profile, updatedData, "plan", "trial") || changed;
  changed = setIfChanged(profile, updatedData, "planLabel", "Free Trial (3 Days)") || changed;
  changed = setIfChanged(profile, updatedData, "membershipType", "REGULAR") || changed;
  if (!profile.trialStartedAt) {
    updatedData.trialStartedAt = startTimestamp;
    changed = true;
  }
  if (!profile.trialEndsAt) {
    updatedData.trialEndsAt = Timestamp.fromDate(new Date(startDate.getTime() + FREE_TRIAL_DAYS * 86_400_000));
    changed = true;
  }
  if (profile.membershipExpiryDate !== null) {
    updatedData.membershipExpiryDate = null;
    changed = true;
  }
  return changed;
}

export async function processMembershipGrant(profile: UserProfile): Promise<UserProfile> {
  const updatedData: Partial<UserProfile> = {};
  let changed = false;
  const founderTesterRecord = getFounderTesterRecord({
    fullName: profile.fullName,
    displayName: profile.displayName,
  });
  const applyDefaultPolicy = shouldApplyDefaultRegistrationPolicy(profile.registeredAt || profile.createdAt);

  if (founderTesterRecord) {
    changed = applyFounderTesterRecord(profile, updatedData, founderTesterRecord) || changed;
  } else if (applyDefaultPolicy && !profile.testerBadge) {
    updatedData.testerBadge = "Penjaga Bhumi";
    changed = true;
  }

  if (applyDefaultPolicy && !profile.membershipType) {
    updatedData.membershipType = "REGULAR";
    changed = true;
  }

  if (applyDefaultPolicy && (!profile.plan || profile.plan === "free")) {
    updatedData.plan = "trial";
    changed = true;
  }

  if (applyDefaultPolicy && !profile.planLabel) {
    updatedData.planLabel = "Free Trial (3 Days)";
    changed = true;
  }

  if (applyDefaultPolicy && !profile.trialStartedAt) {
    updatedData.trialStartedAt = Timestamp.fromDate(toProfileDate(profile.registeredAt || profile.createdAt));
    changed = true;
  }

  if (applyDefaultPolicy && !profile.trialEndsAt) {
    const startDate = toProfileDate(profile.registeredAt || profile.createdAt);
    updatedData.trialEndsAt = Timestamp.fromDate(new Date(startDate.getTime() + FREE_TRIAL_DAYS * 86_400_000));
    changed = true;
  }

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
