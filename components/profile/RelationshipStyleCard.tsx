"use client";

import React from "react";
import { Heart, MessageCircle, Users } from "lucide-react";
import { InsightCard } from "./InsightCard";
import { HumanDesignStyle } from "@/lib/humandesign/intelligence/styleEngine";

interface RelationshipStyleCardProps {
  style: HumanDesignStyle;
}

export function RelationshipStyleCard({ style }: RelationshipStyleCardProps) {
  return (
    <InsightCard
      icon={Heart}
      iconColor="text-rose-600"
      bgColor="bg-rose-50"
      title="Gaya Relasi"
      summary={`Gaya komunikasimu: ${style.communication}`}
    >
      <section className="space-y-6">
        <div className="p-5 rounded-3xl bg-white border border-[#E8E9E5] space-y-3">
          <div className="flex items-center gap-2 text-rose-500">
            <MessageCircle size={16} />
            <p className="text-[10px] font-bold uppercase tracking-wider">Komunikasi & Koneksi</p>
          </div>
          <p className="text-sm text-[#4F5E52] leading-relaxed font-medium">
            {style.communication}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E8E9E5] space-y-3">
          <div className="flex items-center gap-2 text-blue-500">
            <Users size={16} />
            <p className="text-[10px] font-bold uppercase tracking-wider">Dinamika Interpersonal</p>
          </div>
          <p className="text-sm text-[#4F5E52] leading-relaxed font-medium">
            {style.relationship}
          </p>
        </div>
      </section>
    </InsightCard>
  );
}
