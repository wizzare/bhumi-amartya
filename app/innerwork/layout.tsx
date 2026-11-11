"use client";

import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AccessGuard } from "@/components/auth/AccessGuard";

export default function InnerworkLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireProfile>
      <AccessGuard feature="wellness">{children}</AccessGuard>
    </ProtectedRoute>
  );
}
