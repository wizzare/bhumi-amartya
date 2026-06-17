"use client";

import React from "react";
import { Sparkles, Zap, Target } from "lucide-react";
import { cleanMarkdown } from "@/lib/utils/markdown";
import { useAuth } from "@/context/AuthContext";
import { dailyStateRepository } from "@/lib/repositories/dailyStateRepository";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";

interface ManifestationCardProps {
  language: "id" | "en";
  manifestation?: {
    affirmation: string;
    attraction: string;
    assumption: string;
  };
}

export function ManifestationCard({ language, manifestation }: ManifestationCardProps) {
  const auth = useAuth();

  React.useEffect(() => {
    if (!manifestation || !auth?.user?.uid) return;

    const profile = auth.userProfile;
    const timezone = profile?.timezone || (profile as any)?.profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const dateKey = getLocalDateKey(new Date(), timezone);

    void dailyStateRepository.saveDailyState(auth.user.uid, dateKey, {
      manifestDone: true,
    });
  }, [auth?.user?.uid, manifestation, auth?.userProfile]);

  if (!manifestation) return null;

  return (
    <div className="mt-8 space-y-4">
      <div className="px-1">
        <h3 className="text-[#4F6658] font-serif text-2xl font-bold italic">
          {language === "id" ? "Manifestasi Hari Ini" : "Today's Manifestation"}
        </h3>
        <p className="text-[#3C3C3C] text-[13px] mt-1 font-medium opacity-70">
          {language === "id" ? "Menyelaraskan batin dengan energi dan niatmu." : "Aligning your inner self with your intention."}
        </p>
      </div>

      <div className="bhumi-card p-8 bg-white border-none shadow-sm space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/30 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

        {/* A. Affirmation */}
        <div className="flex items-start gap-4 relative z-10">
          <div className="mt-1 p-2.5 rounded-2xl bg-orange-50 text-orange-500 shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#7B8776] mb-1.5">
              Affirmation
            </p>
            <p className="text-[15px] text-[#3C3C3C] leading-relaxed font-bold italic">
              &quot;{cleanMarkdown(manifestation.affirmation)}&quot;
            </p>
          </div>
        </div>

        {/* B. Assumption */}
        <div className="flex items-start gap-4 relative z-10">
          <div className="mt-1 p-2.5 rounded-2xl bg-blue-50 text-blue-500 shrink-0">
            <Target size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#7B8776] mb-1.5">
              Assumption
            </p>
            <p className="text-[15px] text-[#3C3C3C] leading-relaxed font-bold italic">
              &quot;{cleanMarkdown(manifestation.assumption)}&quot;
            </p>
          </div>
        </div>

        {/* C. Attraction */}
        <div className="flex items-start gap-4 relative z-10">
          <div className="mt-1 p-2.5 rounded-2xl bg-emerald-50 text-emerald-500 shrink-0">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#7B8776] mb-1.5">
              Attraction
            </p>
            <p className="text-[15px] text-[#3C3C3C] leading-relaxed font-bold italic">
              &quot;{cleanMarkdown(manifestation.attraction)}&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
