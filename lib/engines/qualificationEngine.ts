import { UserProfile } from "@/lib/repositories/userRepository";

export type QualificationStatus = "QUALIFIED" | "REVIEW REQUIRED" | "NOT QUALIFIED";

export function evaluateCandidateStatus(profile: UserProfile): QualificationStatus {
  const metrics = profile.participationMetrics;
  if (!metrics) return "NOT QUALIFIED";

  const { loginCount, hasCompletedCheckIn, hasCompletedAssessment, activeDays } = metrics;

  // MINIMUM QUALIFICATION
  // 1. Login at least once (loginCount > 0)
  // 2. Open app (metrics existence implies this)
  // 3. One of: Complete Check-In OR Complete Assessment

  const hasParticipated = hasCompletedCheckIn || hasCompletedAssessment;

  if (loginCount > 0 && hasParticipated && activeDays.length >= 1) {
    // If they have done a significant amount of active days (e.g. 3+) or both checkin/assessment
    if (activeDays.length >= 3 || (hasCompletedCheckIn && hasCompletedAssessment)) {
       return "QUALIFIED";
    }
    return "REVIEW REQUIRED";
  }

  if (loginCount > 0) {
    return "REVIEW REQUIRED";
  }

  return "NOT QUALIFIED";
}
