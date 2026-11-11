"use client";

import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AccessGuard } from "@/components/auth/AccessGuard";

/**
 * Universal layout guard for all Blueprint routes (/blueprint, /blueprint/*).
 *
 * Enforces authentication and active entitlement BEFORE any blueprint
 * child page or child data-fetching hook can mount or execute.
 */
export default function BlueprintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AccessGuard feature="profile">
        {children}
      </AccessGuard>
    </ProtectedRoute>
  );
}
