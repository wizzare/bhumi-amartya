"use client";

import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AccessGuard } from "@/components/auth/AccessGuard";
import { InsightPageClient } from "@/components/insights/InsightPageClient";

export default function InsightsPage() {
  return (
    <ProtectedRoute>
      <AccessGuard feature="journey">
        <InsightPageClient />
      </AccessGuard>
    </ProtectedRoute>
  );
}
