"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { ReviewDialog } from "./ReviewDialog";
import { reviewTriggerService } from "@/lib/rating/reviewTriggerService";

type Props = {
  profile: any;
  dashboardReady: boolean;
  blockedByModal?: boolean;
};

export function DashboardReviewPrompt({ profile, dashboardReady, blockedByModal = false }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const evaluated = useRef(false);

  useEffect(() => {
    if (evaluated.current || pathname !== "/dashboard" || !dashboardReady || blockedByModal) return;
    evaluated.current = true;
    reviewTriggerService.initialize();
    const timer = window.setTimeout(() => {
      if (reviewTriggerService.isEligibleForDashboard(profile)) setOpen(true);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [pathname, dashboardReady, blockedByModal, profile]);

  if (!open || !Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return null;

  return (
    <ReviewDialog
      onRate={() => {
        setOpen(false);
        void reviewTriggerService.requestReview();
      }}
      onDismiss={() => {
        setOpen(false);
        reviewTriggerService.markDismissed();
      }}
      onOptOut={() => {
        setOpen(false);
        reviewTriggerService.markOptOut();
      }}
    />
  );
}
