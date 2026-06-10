import React from "react";

interface HealingHeroProps {
  userName: string;
  focus: string;
  soulGift: string;
  supportiveMessage: string;
}

export function HealingHero({
  userName,
  focus,
  soulGift,
  supportiveMessage,
}: HealingHeroProps) {
  return (
    <section className="rounded-[32px] border border-[#E8E9E5] bg-white/90 p-8 shadow-soft backdrop-blur-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-4">
          <p className="text-sm text-[#8B9488] uppercase tracking-[0.24em]">Tempat penyembuhan</p>
          <h1 className="text-4xl font-light text-[#33413A] leading-tight">
            Halo, {userName}. <br />
            Hari ini jiwa mengundang kelembutan.
          </h1>
          <p className="max-w-2xl text-[#5F6B60] leading-relaxed">
            {supportiveMessage}
          </p>
        </div>
        <div className="rounded-[28px] bg-[#F7F4ED] p-6 shadow-inner">
          <p className="text-[#7B8776] text-sm uppercase tracking-[0.24em] mb-2">
            Fokus hari ini
          </p>
          <h2 className="text-2xl font-semibold text-[#4F5E52] leading-snug">
            {focus}
          </h2>
          <p className="mt-4 text-sm text-[#6B7B6C] leading-relaxed">
            Hadiah jiwa: <span className="font-semibold text-[#4F5E52]">{soulGift}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
