"use client";

import type { WeeklyGuidance } from "@/lib/weeklyGuidance/types";

function formatRange(value: WeeklyGuidance): string {
  const format = (date: string) => new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: value.timezone }).format(new Date(`${date}T12:00:00`));
  return `${format(value.weekStart)}–${format(value.weekEnd)}`;
}

export function WeeklyGuidanceCard({ guidance }: { guidance: WeeklyGuidance | null }) {
  if (!guidance) return <section className="mt-8 rounded-[2rem] bg-[#F7F5EF] p-6" aria-labelledby="weekly-guidance-title"><h2 id="weekly-guidance-title" className="font-serif text-2xl text-[#4F5E52]">Panduan Minggu Ini</h2><p className="mt-2 text-sm leading-relaxed text-[#7B8776]">Panduan praktis mingguan dari Bhumi sedang disiapkan.</p></section>;
  if (guidance.state === "unavailable") return <section className="mt-8 rounded-[2rem] bg-[#F7F5EF] p-6" aria-labelledby="weekly-guidance-title"><h2 id="weekly-guidance-title" className="font-serif text-2xl text-[#4F5E52]">Panduan Minggu Ini</h2><p className="mt-2 text-sm leading-relaxed text-[#7B8776]">Lengkapi data profil agar potensi dan arah pengembangan minggu ini dapat dibaca.</p></section>;
  return <section className="mt-8" aria-labelledby="weekly-guidance-title">
    <div className="rounded-[2rem] bg-[#F7F5EF] p-6"><h2 id="weekly-guidance-title" className="font-serif text-2xl text-[#4F5E52]">Panduan Minggu Ini</h2>
    <p className="mt-2 text-sm font-bold tracking-[0.04em] text-[#7B8776]">{formatRange(guidance)}</p>
    <p className="mt-2 text-sm leading-relaxed text-[#7B8776]">Panduan praktis mingguan dari Bhumi.</p>
    </div>
    <div className="mt-4 space-y-4">
      {guidance.sections.map((section) => <article key={section.key} className="rounded-[2rem] border border-[#E8E9E5] bg-white p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#4F5E52]">{section.title}</h3>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#667064]">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9AA394]">Awal Pekan</p>{section.phases.awalPekan.map((paragraph, i) => <p className="mt-1" key={`${section.key}-awal-${i}`}>{paragraph}</p>)}</div>
          <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9AA394]">Tengah Pekan</p>{section.phases.tengahPekan.map((paragraph, i) => <p className="mt-1" key={`${section.key}-tengah-${i}`}>{paragraph}</p>)}</div>
          <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9AA394]">Akhir Pekan</p>{section.phases.akhirPekan.map((paragraph, i) => <p className="mt-1" key={`${section.key}-akhir-${i}`}>{paragraph}</p>)}</div>
        </div>
        <div className="mt-3 rounded-2xl border border-[#DDE4D8] bg-white/60 p-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7B8776]">Saran Bhumi</p><p className="mt-1 text-sm leading-relaxed text-[#667064]">{section.advice.join(" ")}</p></div>
      </article>)}
      <article className="rounded-[2rem] border border-[#DDE4D8] bg-[#F7F5EF] p-5"><h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#4F5E52]">Arah Minggu Ini</h3><div className="mt-2 space-y-3 text-sm leading-relaxed text-[#667064]">{guidance.weeklyDirection.paragraphs.map((paragraph, i) => <p key={`direction-${i}`}>{paragraph}</p>)}</div></article>
    </div>
  </section>;
}
