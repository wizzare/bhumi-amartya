"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Minimalist Protected Route.
 * Its ONLY job is to ensure a user is logged in.
 * Profile/Setup validation is handled inside specific page components
 * (SetupPage, DashboardClient) to avoid redirect loops.
 */
export function ProtectedRoute({
  children,
  redirectTo = '/login',
  // @ts-ignore - keeping for compatibility
  requireProfile = false,
  // @ts-ignore - keeping for compatibility
  allowSetupAccess = false,
}: {
  children: React.ReactNode;
  redirectTo?: string;
  requireProfile?: boolean;
  allowSetupAccess?: boolean;
}) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    // P1 AUDIT BYPASS (Dev Only)
    if (process.env.NODE_ENV === "development") {
      const isAudit = typeof window !== 'undefined' && localStorage.getItem("bhumi_audit_user");
      if (isAudit) return;
    }

    if (auth?.authStateResolved && !auth.user) {
      console.log("[PROTECTED ROUTE] No User -> Redirecting to:", redirectTo);
      router.replace(redirectTo);
      return;
    }

    // MANDATORY BASELINE WELLNESS CHECK (KARA V3)
    if (
      auth?.authStateResolved &&
      auth.user &&
      auth.userProfile &&
      !auth.userProfile.baselineWellnessCompleted &&
      auth.userProfile.guardianRole !== 'founder' &&
      typeof window !== 'undefined' &&
      window.location.pathname !== '/wellness-assessment' &&
      window.location.pathname !== '/setup'
    ) {
      console.log("[PROTECTED ROUTE] Baseline Pending -> Redirecting to Wellness Assessment");
      router.replace('/wellness-assessment');
    }
  }, [auth?.authStateResolved, auth?.user, router, redirectTo]);

  if (!auth?.authStateResolved || auth.authLoading) {
    // P1 AUDIT BYPASS (Dev Only)
    if (process.env.NODE_ENV === "development") {
      if (typeof window !== 'undefined' && localStorage.getItem("bhumi_audit_user")) {
        return <>{children}</>;
      }
    }

    return (
      <div className="min-h-screen bg-[#FCFAF5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-[#4F5E52]/10 border-t-[#4F5E52] rounded-full animate-spin"></div>
          <p className="text-[#4F5E52]/60 font-serif">Menyelaraskan ruang...</p>
        </div>
      </div>
    );
  }

  if (!auth.user) {
    // P1 AUDIT BYPASS (Dev Only)
    if (process.env.NODE_ENV === "development") {
      if (typeof window !== 'undefined' && localStorage.getItem("bhumi_audit_user")) {
        return <>{children}</>;
      }
    }
    return null;
  }

  return <>{children}</>;
}
