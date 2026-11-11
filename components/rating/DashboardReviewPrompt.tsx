"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { reviewTriggerService } from "@/lib/rating/reviewTriggerService";
import type { UserProfile } from "@/lib/repositories/userRepository";

type Props = {
  profile: UserProfile | null;
  dashboardReady: boolean;
  blockedByModal?: boolean;
};

/**
 * Presents Google's native rating/review card when allowed by Play.
 * Avoids a custom preliminary star modal (Google Play review guidelines).
 */
export function DashboardReviewPrompt({
  profile,
  dashboardReady,
  blockedByModal = false,
}: Props) {
  const pathname = usePathname();
  const auth = useAuth();
  const attemptedInThisDashboard = useRef(new Set<string>());

  const uid = auth?.user?.uid;
  const firebaseCreatedAt = auth?.user?.metadata?.creationTime;

  useEffect(() => {
    if (
      pathname !== "/dashboard" ||
      !dashboardReady ||
      blockedByModal ||
      !auth?.authStateResolved ||
      auth?.authLoading ||
      !uid ||
      profile?.uid !== uid ||
      attemptedInThisDashboard.current.has(uid)
    ) return;

    let active = true;
    reviewTriggerService.initialize();

    const requestIfEligible = () => {
      if (!active || document.visibilityState !== "visible") return;
      if (!reviewTriggerService.isEligibleForDashboard(profile, firebaseCreatedAt)) return;
      attemptedInThisDashboard.current.add(uid);
      void reviewTriggerService.requestReview(uid);
    };

    // Do not interrupt the sign-in animation or the first dashboard render.
    const timer = window.setTimeout(requestIfEligible, 3000);
    const onFocus = () => {
      if (document.visibilityState === "visible") {
        window.setTimeout(requestIfEligible, 1000);
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      active = false;
      window.clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [
    pathname,
    dashboardReady,
    blockedByModal,
    auth?.authStateResolved,
    auth?.authLoading,
    uid,
    profile,
    firebaseCreatedAt,
  ]);

  return null;
}
