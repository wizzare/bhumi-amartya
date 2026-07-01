"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AccessGuard } from "@/components/auth/AccessGuard";
import { WellnessPageClient } from "@/components/wellness/WellnessPageClient";

export default function WellnessPage() {
  return (
    <ProtectedRoute>
      <AccessGuard feature="wellness">
      <WellnessPageClient />
      </AccessGuard>
    </ProtectedRoute>
  );
}
