"use client";

import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { InsightPageClient } from "@/components/insights/InsightPageClient";

export default function InsightsPage() {
  return (
    <ProtectedRoute>
      <InsightPageClient />
    </ProtectedRoute>
  );
}
