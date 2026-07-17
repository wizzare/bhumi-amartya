import type { WeeklyRecommendation } from "@/lib/types/communication";

const SECTIONS: Array<{ key: keyof WeeklyRecommendation; label: string }> = [
  { key: "kabarMingguIni", label: "Kabar Minggu Ini" },
  { key: "pikiran", label: "Pikiran" },
  { key: "ekonomi", label: "Ekonomi & Rezeki" },
  { key: "asmara", label: "Asmara & Percintaan" },
  { key: "orangTerdekat", label: "Orang Terdekat" },
  { key: "maknaBatin", label: "Makna Batin" },
  { key: "yangLagiBerat", label: "Yang Lagi Berat" },
  { key: "ruangBaru", label: "Ruang Baru" },
];

function formatRange(value: WeeklyRecommendation): string {
  const start = new Date(`${value.startDate}T12:00:00`);
  const end = new Date(`${value.endDate}T12:00:00`);
  const formatDay = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long" });
  return `${formatDay.format(start)}\u2013${formatDay.format(end)}`;
}

export function WeeklyGuidanceCard({ recommendation, loading }: { recommendation: WeeklyRecommendation | null; loading: boolean }) {
  if (loading) {
    return <section className="mt-8 rounded-[2rem] bg-[#F7F5EF] p-6 text-sm text-[#7B8776]">Menyiapkan panduan perjalanan untuk minggu ini...</section>;
  }
  if (!recommendation) return null;

  return (
    <section className="mt-8 rounded-[2rem] bg-[#F7F5EF] p-6" aria-labelledby="weekly-guidance-title">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7B8776]">{formatRange(recommendation)}</p>
      <h2 id="weekly-guidance-title" className="mt-2 font-serif text-2xl text-[#4F5E52]">Panduan Minggu Ini</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#7B8776]">Panduan perjalanan dari Bhumi untuk kamu.</p>
      <div className="mt-6 space-y-5">
        {SECTIONS.map(({ key, label }) => (
          <article key={String(key)}>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#4F5E52]">{label}</h3>
            <p className="mt-1 text-sm leading-relaxed text-[#667064]">{String(recommendation[key] || "")}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
