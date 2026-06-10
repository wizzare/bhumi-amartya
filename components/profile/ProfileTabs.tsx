"use client";

import React, { useState } from "react";
import { User, Map, Sparkles, TrendingUp } from "lucide-react";
import { IdentityTab } from "./IdentityTab";
import { SoulMapTab } from "./SoulMapTab";
import { PotentialTab } from "./PotentialTab";
import { GrowthChart } from "./GrowthChart";
import { TranslatedProfile } from "@/lib/profile/v2/insightTranslator";
import { GrowthProfile } from "@/lib/engines/growthEngine";

interface ProfileTabsProps {
  data: TranslatedProfile;
  growth: GrowthProfile | null;
}

export function ProfileTabs({ data, growth }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"identity" | "soulMap" | "potential" | "growth">("identity");

  const tabs = [
    { id: "identity", label: "Identitas", icon: User },
    { id: "soulMap", label: "Peta Jiwa", icon: Map },
    { id: "potential", label: "Potensi", icon: Sparkles },
    { id: "growth", label: "Pertumbuhan", icon: TrendingUp },
  ];

  return (
    <div className="w-full">
      <div className="flex gap-1 mb-8 p-1 bg-[#E8E9E5]/30 rounded-2xl overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[80px] flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-white text-[#4F5E52] shadow-sm"
                  : "text-[#9AA394] hover:text-[#7B8776]"
              }`}
            >
              <Icon size={18} className={isActive ? "text-[#4F5E52]" : ""} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-[400px]">
        {activeTab === "identity" && <IdentityTab data={data.identity} />}
        {activeTab === "soulMap" && <SoulMapTab data={data.soulMap} />}
        {activeTab === "potential" && <PotentialTab data={data.potentials} />}
        {activeTab === "growth" && growth && <GrowthChart growth={growth} />}
        {activeTab === "growth" && !growth && (
          <div className="flex items-center justify-center py-20 italic text-[#7B8776]">
            Data pertumbuhan sedang dikumpulkan...
          </div>
        )}
      </div>
    </div>
  );
}
