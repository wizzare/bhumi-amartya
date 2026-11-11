import type { UserProfile } from "@/lib/repositories/userRepository";
import { useEffect, useState } from "react";
import { getEntitlementStatus, type EntitlementStatus } from "./entitlementService";
import type { FounderTesterRecord } from "./founderTesterSourceOfTruth";

export interface EntitlementMonitorState {
  hasAccess: boolean;
  checking: boolean;
  expiresAt: Date | null;
  entitlement: EntitlementStatus;
}

/**
 * Shared live entitlement evaluator with real-time expiration monitoring.
 *
 * Re-evaluates immediately when:
 * 1. userProfile or testerRecord changes.
 * 2. Exact trialEndsAt / expiresAt wall-clock timestamp is crossed (setTimeout).
 * 3. Page visibility changes (document.visibilityState === "visible") or window focus.
 */
export function useEntitlementMonitor(
  userProfile: UserProfile | null | undefined,
  testerRecord: FounderTesterRecord | null | undefined,
  fallbackSignedCheck?: () => Promise<boolean>,
): EntitlementMonitorState {
  const [clockTick, setClockTick] = useState(0);
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [entitlement, setEntitlement] = useState<EntitlementStatus>(() =>
    getEntitlementStatus(userProfile || null, new Date(), testerRecord || null),
  );

  useEffect(() => {
    let cancelled = false;

    async function evaluate() {
      const now = new Date();
      const current = getEntitlementStatus(userProfile || null, now, testerRecord || null);
      if (cancelled) return;

      setEntitlement(current);
      setExpiresAt(current.expiresAt ?? null);

      if (current.isPremium) {
        setHasAccess(true);
        setChecking(false);
        return;
      }

      if (fallbackSignedCheck) {
        try {
          const signedValid = await fallbackSignedCheck();
          if (cancelled) return;
          if (signedValid) {
            setHasAccess(true);
            setChecking(false);
            return;
          }
        } catch {
          // signed check error -> fail closed
        }
      }

      if (!cancelled) {
        setHasAccess(false);
        setChecking(false);
      }
    }

    setChecking(true);
    void evaluate();

    return () => {
      cancelled = true;
    };
  }, [userProfile, testerRecord, clockTick]);

  // Real-time wall-clock timer & visibility/focus listener
  useEffect(() => {
    if (!hasAccess || !expiresAt) return;

    const msUntilExpiry = expiresAt.getTime() - Date.now();
    if (msUntilExpiry <= 0) {
      setClockTick((t) => t + 1);
      return;
    }

    // Schedule timer right at expiration (capped at max 32-bit int ~24.8 days)
    const delay = Math.min(Math.max(100, msUntilExpiry), 2_147_483_647);
    const timer = setTimeout(() => {
      setClockTick((t) => t + 1);
    }, delay);

    const onVisibleOrFocus = () => {
      if (Date.now() >= expiresAt.getTime()) {
        setClockTick((t) => t + 1);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("focus", onVisibleOrFocus);
      document.addEventListener("visibilitychange", onVisibleOrFocus);
    }

    return () => {
      clearTimeout(timer);
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", onVisibleOrFocus);
        document.removeEventListener("visibilitychange", onVisibleOrFocus);
      }
    };
  }, [hasAccess, expiresAt]);

  return { hasAccess, checking, expiresAt, entitlement };
}
