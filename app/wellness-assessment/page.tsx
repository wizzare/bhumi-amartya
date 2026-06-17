"use client";

import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { WellnessAssessmentFlow } from "@/components/wellness/WellnessAssessmentFlow";
import { useLanguage } from "@/app/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";

export default function WellnessAssessmentPage() {
  const { language } = useLanguage();
  const auth = useAuth();

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />

        <div className="mx-auto max-w-lg space-y-6">
          <BhumiPageHeader />
          <WellnessAssessmentFlow
            uid={auth?.user?.uid || ""}
            language={language}
          />
        </div>
      </main>
    </ProtectedRoute>
  );
}
