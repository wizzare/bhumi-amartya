"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Target,
  TrendingUp,
  AlertCircle,
  Mountain
} from "lucide-react";

interface GrowthStoryCardProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  children: React.ReactNode;
  summary?: string;
  defaultExpanded?: boolean;
}

export function GrowthStoryCard({
  title,
  icon,
  iconBg,
  iconColor,
  children,
  summary,
  defaultExpanded = false
}: GrowthStoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bhumi-card bg-white border-none shadow-sm overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-start gap-4 text-left active:bg-[#FCFAF5] transition-colors"
      >
        <div className={`p-2.5 rounded-2xl ${iconBg} ${iconColor} shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#4F6658] text-base mb-1">{title}</h3>
          {summary && !isExpanded && (
            <p className="text-xs text-[#7B8776] leading-relaxed line-clamp-1">{summary}</p>
          )}
        </div>
        <div className="text-[#9BB89A] mt-1">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="h-px bg-[#F5F1E8] w-full mb-6" />
          <div className="text-sm text-[#4F5E52] leading-relaxed">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Specific Cards ---

export function StageCard({ label, description }: { label: string; description: string }) {
  return (
    <GrowthStoryCard
      title="🌱 Tahap Pertumbuhan"
      icon={<TrendingUp size={20} />}
      iconBg="bg-emerald-50"
      iconColor="text-emerald-600"
      summary={label}
      defaultExpanded
    >
      <p className="font-bold text-emerald-800 text-lg mb-2">{label}</p>
      <p>{description}</p>
    </GrowthStoryCard>
  );
}

export function FocusCard({ focus }: { focus: string }) {
  return (
    <GrowthStoryCard
      title="Fokus Saat Ini"
      icon={<Target size={20} />}
      iconBg="bg-amber-50"
      iconColor="text-amber-600"
      summary={focus}
    >
      <p className="font-medium">{focus}</p>
    </GrowthStoryCard>
  );
}

export function InsightsGridCard({
  attention
}: {
  attention: string[]
}) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <GrowthStoryCard
        title="Yang Meminta Perhatian"
        icon={<AlertCircle size={20} />}
        iconBg="bg-rose-50"
        iconColor="text-rose-600"
      >
        <ul className="space-y-3">
          {attention.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-xs font-medium text-rose-900/70">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              {item}
            </li>
          ))}
        </ul>
      </GrowthStoryCard>
    </div>
  );
}

export function MilestoneCard({ milestone }: { milestone: string }) {
  return (
    <GrowthStoryCard
      title="🏔️ Milestone Berikutnya"
      icon={<Mountain size={20} />}
      iconBg="bg-purple-50"
      iconColor="text-purple-600"
      summary={milestone}
    >
      <div className="p-4 rounded-2xl bg-[#F5F1E8]/50 border border-[#E8E9E5]">
        <p className="font-bold text-purple-900/70">{milestone}</p>
      </div>
    </GrowthStoryCard>
  );
}
