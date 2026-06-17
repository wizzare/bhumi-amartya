"use client";

import React from "react";
import { Compass, Heart, Repeat, Sprout, Users, BriefcaseBusiness, HandHeart } from "lucide-react";

interface DestinyMatrixTabProps {
  data: {
    soulMission: string;
    greatestPotential: string;
    repeatingPatterns: string;
    innerChild: string;
    ancestorKarma: string;
    moneyAndWork: string;
    loveAndRelationships: string;
  };
}

const sections = [
  { key: "soulMission", title: "Misi Jiwa", icon: Compass },
  { key: "greatestPotential", title: "Potensi Terbesar", icon: Sprout },
  { key: "repeatingPatterns", title: "Pola Berulang", icon: Repeat },
  { key: "innerChild", title: "Inner Child", icon: Heart },
  { key: "ancestorKarma", title: "Karma Leluhur", icon: Users },
  { key: "moneyAndWork", title: "Uang & Karya", icon: BriefcaseBusiness },
  { key: "loveAndRelationships", title: "Relasi & Cinta", icon: HandHeart },
] as const;

export function DestinyMatrixTab({ data }: DestinyMatrixTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <section key={section.key} className="bhumi-card p-5 bg-white border-none shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-[#FCFAF5] text-[#4F6658]">
                <Icon size={18} />
              </div>
              <h3 className="font-bold text-[#4F6658]">{section.title}</h3>
            </div>
            <p className="text-sm text-[#3C3C3C] leading-relaxed font-medium">
              {data[section.key]}
            </p>
          </section>
        );
      })}
    </div>
  );
}
