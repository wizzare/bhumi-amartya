"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { bootstrapCanonicalAccess } from "@/lib/billing/canonicalAccessBootstrap";

export function CanonicalAccessBootstrap() {
  const auth = useAuth();
  const user = auth?.user;
  const ready = Boolean(auth?.authStateResolved && !auth?.profileLoading);

  useEffect(() => {
    if (!user || !ready || !auth?.refreshUserProfile) return;
    void bootstrapCanonicalAccess(user.uid, user.getIdToken.bind(user), auth.refreshUserProfile).then((result) => {
      if (!result.ok && result.outcome !== "RETRYABLE_ERROR") console.warn("[ACCESS BOOTSTRAP] Canonical access was not changed:", result.outcome);
    });
  }, [auth?.refreshUserProfile, ready, user]);

  return null;
}
