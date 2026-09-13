"use client";

import type { EmotionalMemory } from "@/lib/data/types";
import { isEnlEdition } from "@/lib/config/edition";

interface EmotionalTimelineProps {
  memory: EmotionalMemory;
}

export function EmotionalTimeline({ memory }: EmotionalTimelineProps) {
  const isEn = isEnlEdition();
  if (memory.healingMilestones.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="bhumi-card rounded-[28px] p-8 bg-gradient-to-br from-[#F7F4ED] to-[#FCFAF5] shadow-soft">
        <h2 className="text-3xl text-[#4F5E52] font-light mb-6">
          Perjalanan Pemulihanmu
        </h2>

        {/* Timeline */}
        <div className="relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#A08963] to-[#E8E9E5]" />

          {/* Milestones */}
          <div className="space-y-8">
            {memory.healingMilestones.map((milestone, idx) => (
              <div key={idx} className="relative">
                {/* Dot */}
                <div className="absolute -left-4 top-1 w-3 h-3 rounded-full bg-[#A08963] shadow-lg" />

                {/* Content */}
                <div className="bg-white rounded-xl p-4">
                  <p className="text-[#8B9488] text-xs uppercase tracking-wide mb-1">
                    {new Date(milestone.date).toLocaleDateString("id-ID", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-[#4F5E52] leading-relaxed">
                    {milestone.milestone}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary message */}
        <div className="mt-8 pt-8 border-t border-[#E8E9E5]">
          <p className="text-[#8B9488] leading-relaxed italic">
            Lihatlah sejauh mana langkahmu telah bertumbuh. Setiap tonggak adalah saat kamu memilih untuk
            menyimak dirimu sendiri secara utuh.
          </p>
        </div>
      </div>
    </section>
  );
}
