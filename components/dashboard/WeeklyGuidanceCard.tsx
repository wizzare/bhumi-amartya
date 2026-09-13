"use client";

import type { WeeklyGuidance } from "@/lib/weeklyGuidance/types";
import { normalizeIndonesianSentenceCase } from "@/lib/utils/sentenceCase";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/data/translations";
import { isEnlEdition } from "@/lib/config/edition";

function formatRange(value: WeeklyGuidance, isEn: boolean): string {
  const locale = isEn ? "en-US" : "id-ID";
  const format = (date: string) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: value.timezone,
    }).format(new Date(`${date}T12:00:00`));
  return `${format(value.weekStart)}–${format(value.weekEnd)}`;
}

export function WeeklyGuidanceCard({ guidance }: { guidance: WeeklyGuidance | null }) {
  const isEn = false;
  const t = translations["id"].weeklyGuidance || {
    title: "Panduan Minggu Ini",
    preparing: "Panduan praktis mingguan dari Bhumi sedang disiapkan.",
    completeProfile: "Lengkapi data profil agar potensi dan arah pengembangan minggu ini dapat dibaca.",
    subtitle: "Panduan praktis mingguan dari Bhumi.",
    earlyWeek: "Awal Pekan",
    midWeek: "Tengah Pekan",
    weekend: "Akhir Pekan",
    bhumiAdvice: "Saran Bhumi",
    weeklyDirection: "Arah Minggu Ini",
  };

  if (!guidance) {
    return (
      <section className="mt-8 rounded-[2rem] bg-[#F7F5EF] p-6" aria-labelledby="weekly-guidance-title">
        <h2 id="weekly-guidance-title" className="font-serif text-2xl text-[#4F5E52]">{t.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#7B8776]">{t.preparing}</p>
      </section>
    );
  }

  if (guidance.state === "unavailable") {
    return (
      <section className="mt-8 rounded-[2rem] bg-[#F7F5EF] p-6" aria-labelledby="weekly-guidance-title">
        <h2 id="weekly-guidance-title" className="font-serif text-2xl text-[#4F5E52]">{t.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#7B8776]">{t.completeProfile}</p>
      </section>
    );
  }

  return (
    <section className="mt-8" aria-labelledby="weekly-guidance-title">
      <div className="rounded-[2rem] bg-[#F7F5EF] p-6">
        <h2 id="weekly-guidance-title" className="font-serif text-2xl text-[#4F5E52]">{t.title}</h2>
        <p className="mt-2 text-sm font-bold tracking-[0.04em] text-[#7B8776]">{formatRange(guidance, isEn)}</p>
        <p className="mt-2 text-sm leading-relaxed text-[#7B8776]">{t.subtitle}</p>
      </div>
      <div className="mt-4 space-y-4">
        {guidance.sections.map((section) => (
          <article key={section.key} className="rounded-[2rem] border border-[#E8E9E5] bg-white p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#4F5E52]">{section.title}</h3>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#667064]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9AA394]">{t.earlyWeek}</p>
                {section.phases.awalPekan.map((paragraph, i) => (
                  <p className="mt-1" key={`${section.key}-awal-${i}`}>{normalizeIndonesianSentenceCase(paragraph)}</p>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9AA394]">{t.midWeek}</p>
                {section.phases.tengahPekan.map((paragraph, i) => (
                  <p className="mt-1" key={`${section.key}-tengah-${i}`}>{normalizeIndonesianSentenceCase(paragraph)}</p>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9AA394]">{t.weekend}</p>
                {section.phases.akhirPekan.map((paragraph, i) => (
                  <p className="mt-1" key={`${section.key}-akhir-${i}`}>{normalizeIndonesianSentenceCase(paragraph)}</p>
                ))}
              </div>
            </div>
            <div className="mt-3 rounded-2xl border border-[#DDE4D8] bg-white/60 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7B8776]">{t.bhumiAdvice}</p>
              <p className="mt-1 text-sm leading-relaxed text-[#667064]">{normalizeIndonesianSentenceCase(section.advice.join(" "))}</p>
            </div>
          </article>
        ))}
        <article className="rounded-[2rem] border border-[#DDE4D8] bg-[#F7F5EF] p-5">
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#4F5E52]">{t.weeklyDirection}</h3>
          <div className="mt-2 space-y-3 text-sm leading-relaxed text-[#667064]">
            {guidance.weeklyDirection.paragraphs.map((paragraph, i) => (
              <p key={`direction-${i}`}>{normalizeIndonesianSentenceCase(paragraph)}</p>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
