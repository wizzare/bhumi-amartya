import { userRepository } from "@/lib/repositories/userRepository";
import type { UserProfile } from "@/lib/repositories/userRepository";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { getRuntimeBuildInfo, hasBuildInfoChanged } from "@/lib/config/buildInfo";

export const participationEngine = {
  async recordActivity(uid: string, action: "login" | "check-in" | "assessment" | "launch", profileOverride?: UserProfile) {
    const profile = profileOverride || await userRepository.getUserProfile(uid);
    if (!profile) return;
    const buildInfo = await getRuntimeBuildInfo();
    const profileBuildInfoChanged = hasBuildInfoChanged(profile, buildInfo);
    const metricsBuildInfoChanged = hasBuildInfoChanged(profile.participationMetrics, buildInfo);

    // Monitor activity for ALL users (Founder, Admin, Candidates, Guardians)
    const metrics = profile.participationMetrics || {
      loginCount: 0,
      lastSeen: new Date().toISOString(),
      hasCompletedCheckIn: false,
      hasCompletedAssessment: false,
      activeDays: []
    };

    const timezone = profile?.timezone || (profile as any)?.profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const today = getLocalDateKey(new Date(), timezone);
    const updatedActiveDays = Array.from(new Set([...(metrics.activeDays || []), today]));

    const nextMetrics = {
      ...metrics,
      lastSeen: new Date().toISOString(),
      activeDays: updatedActiveDays,
    };

    const update: Partial<UserProfile> = {
      participationMetrics: nextMetrics
    };

    if (profileBuildInfoChanged) {
      update.versionName = buildInfo.versionName;
      update.versionCode = buildInfo.versionCode;
      update.buildNumber = buildInfo.buildNumber;
      update.platform = buildInfo.platform;
    }

    if (metricsBuildInfoChanged) {
      Object.assign(nextMetrics, {
        buildNumber: buildInfo.buildNumber,
        versionName: buildInfo.versionName,
        versionCode: buildInfo.versionCode,
        appVersion: buildInfo.versionName,
        platform: buildInfo.platform
      });
    }

    if (action === "login") {
      nextMetrics.loginCount = (metrics.loginCount || 0) + 1;
      nextMetrics.lastLoginAt = new Date().toISOString();
    } else if (action === "check-in") {
      nextMetrics.hasCompletedCheckIn = true;
      nextMetrics.lastCheckInAt = new Date().toISOString();
    } else if (action === "assessment") {
      nextMetrics.hasCompletedAssessment = true;
      nextMetrics.lastAssessmentAt = new Date().toISOString();
    }

    await userRepository.upsertUserProfile(uid, update);
    await userRepository.updatePresence(uid, {
      email: profile.email,
      displayName: profile.displayName || profile.fullName || null,
      role: profile.guardianRole || profile.role || "user",
      buildInfo,
    });
  }
};
