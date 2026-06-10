import React from "react";
import type { EmotionalMemory } from "@/lib/data/types";

interface EmotionalProgressTimelineProps {
  memory: EmotionalMemory;
}

export function EmotionalProgressTimeline({ memory }: EmotionalProgressTimelineProps) {
  return (
    <section className="rounded-[32px] bg-white p-7 shadow-soft border border-[#E8E9E5]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-2">Perjalanan penyembuhan</p>
          <h2 className="text-2xl font-semibold text-[#33413A]">Garis waktu perkembangan emosional</h2>
        </div>
        <p className="text-sm text-[#7B8776]">{memory.healingMilestones.length} tonggak</p>
      </div>

      <div className="mt-6 space-y-6">
        {memory.healingMilestones.length === 0 ? (
          <div className="rounded-[24px] bg-[#F7F4ED] p-6 text-[#5F6B60] leading-relaxed">
            <p>Belum ada tonggak yang tercatat.</p>
            <p className="mt-2 text-sm text-[#7B8776]">Praktik pertamamu hari ini akan memulai sejarah transformasi yang lembut.</p>
          </div>
        ) : (
          memory.healingMilestones.map((milestone) => (
            <div key={milestone.date} className="relative rounded-[24px] border border-[#E8E9E5] bg-[#FAF7F1] p-6">
              <div className="absolute left-5 top-5 h-3 w-3 rounded-full bg-[#A08963] shadow-lg" />
              <div className="ml-6 space-y-2">
                <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em]">{new Date(milestone.date).toLocaleDateString("id-ID", { weekday:"short", day:"numeric", month:"short", year:"numeric" })}</p>
                <p className="text-[#4F5E52] font-semibold">{milestone.milestone}</p>
                <p className="text-[#6B7B6C] text-sm leading-relaxed">Journal ref: {milestone.journalReference}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {memory.recurringThemes.length > 0 && (
        <div className="mt-8 rounded-[24px] bg-[#F4F2EC] p-5 border border-[#E8E9E5]">
          <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-3">Recurring themes</p>
          <div className="flex flex-wrap gap-2">
            {memory.recurringThemes.slice(0, 4).map((theme) => (
              <span key={theme.theme} className="rounded-full bg-[#EDE8DC] px-3 py-1 text-xs text-[#4F5E52]">
                {theme.theme}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
