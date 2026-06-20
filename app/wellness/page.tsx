"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { WellnessPageClient } from "@/components/wellness/WellnessPageClient";

export default function WellnessPage() {
  return (
    <ProtectedRoute>
      <WellnessPageClient />
    </ProtectedRoute>
  );
}
