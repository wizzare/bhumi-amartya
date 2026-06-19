"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, CircleDot, Compass, Heart, Layers3, MoonStar, Sparkles, Sun } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { storageProvider } from "@/lib/storage/storageProvider";
import { calculateVedic } from "@/lib/vedic/calculateVedic";
import type { VedicBlueprint } from "@/lib/vedic/types";
import type { Blueprint } from "@/lib/types/blueprint";

export default function VedicPage() {
  const [vedic, setVedic] = useState<VedicBlueprint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [stored, profile] = await Promise.all([storageProvider.getUserBlueprint(), storageProvider.getUserProfile()]);
        if (!stored) return;
        const blueprint = stored as unknown as Blueprint;
        if (blueprint.vedic) { setVedic(blueprint.vedic); return; }
        const input = blueprint.input;
        const birthDate = input?.birthDate || profile?.birthDate;
        const birthTime = input?.birthTime || profile?.birthTime;
        if (!birthDate || !birthTime) return;
        const calculated = calculateVedic({
          birthDate, birthTime,
          birthCity: input?.birthCity || profile?.birthCity,
          latitude: input?.latitude ?? profile?.latitude,
          longitude: input?.longitude ?? profile?.longitude,
          timezone: input?.timezone || profile?.timezone,
        });
        await storageProvider.saveUserBlueprint({ ...stored, vedic: calculated, updatedAt: new Date().toISOString() });
        setVedic(calculated);
      } finally { setLoading(false); }
    }
    void load();
  }, []);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />
        <div className="mx-auto max-w-lg">
          <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#7B8776]"><ArrowLeft size={16} />Kembali ke Profil</Link>
          <header className="mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F5E52] text-white"><Sun size={25} /></div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9AA394]">Vedic Astrology</p>
            <h1 className="mt-2 text-4xl font-serif text-[#4F5E52]">Peta Langit Vedikmu</h1>
            <p className="mt-3 leading-7 text-[#7B8776]">Jyotish sidereal dengan Lahiri ayanamsha, rumah whole-sign, dan Vimshottari Dasha.</p>
          </header>
          {loading ? <p className="py-16 text-center text-[#7B8776]">Menghitung peta langit sidereal...</p> : vedic ? <VedicContent vedic={vedic} /> : <p className="py-16 text-center text-[#7B8776]">Data waktu dan lokasi kelahiran belum lengkap.</p>}
        </div>
      </main>
    </ProtectedRoute>
  );
}

function VedicContent({ vedic }: { vedic: VedicBlueprint }) {
  const focus: Array<[string, VedicBlueprint["dharmaFocus"]]> = [["Dharma", vedic.dharmaFocus], ["Artha", vedic.arthaFocus], ["Kama", vedic.kamaFocus], ["Moksha", vedic.mokshaFocus]];
  return <div className="space-y-8">
    <section className="grid grid-cols-2 gap-4">
      <CoreCard icon={Compass} label="Lagna" value={vedic.lagna.sign} detail={`${vedic.lagna.degree.toFixed(2)}°`} />
      <CoreCard icon={MoonStar} label="Moon Sign" value={vedic.moonSign.sign} detail={`Rumah ${vedic.moonSign.house}`} />
      <CoreCard icon={Sun} label="Sun Sign" value={vedic.sunSign.sign} detail={`Rumah ${vedic.sunSign.house}`} />
      <CoreCard icon={Sparkles} label="Nakshatra" value={vedic.nakshatra} detail={`Pada ${vedic.pada}`} />
    </section>
    <section>
      <Title>Karakas</Title>
      <div className="grid grid-cols-2 gap-4">
        <CoreCard icon={CircleDot} label="Atmakaraka" value={vedic.atmakaraka.planet} detail={`${vedic.atmakaraka.sign} · Rumah ${vedic.atmakaraka.house}`} />
        <CoreCard icon={Heart} label="Darakaraka" value={vedic.darakaraka.planet} detail={`${vedic.darakaraka.sign} · Rumah ${vedic.darakaraka.house}`} />
      </div>
    </section>
    <section>
      <Title>Vimshottari Dasha</Title>
      <div className="grid gap-3">
        <Dasha label="Mahadasha" period={vedic.currentMahadasha} />
        <Dasha label="Antardasha" period={vedic.currentAntardasha} />
      </div>
    </section>
    <section>
      <Title>Kekuatan Graha</Title>
      <div className="grid grid-cols-3 gap-3">{vedic.planetaryStrength.map((item) => <div key={item.planet} className="rounded-xl border border-[#E8E1D3] bg-white p-3 text-center"><p className="font-serif font-bold text-[#4F5E52]">{item.planet}</p><p className={`mt-1 text-xs font-bold ${item.level === "Strong" ? "text-emerald-700" : item.level === "Weak" ? "text-rose-700" : "text-amber-700"}`}>{item.level}</p></div>)}</div>
    </section>
    <section>
      <Title>Yoga Utama</Title>
      <div className="space-y-3">{vedic.majorYogas.length ? vedic.majorYogas.map((yoga) => <div key={yoga.name} className="rounded-2xl border border-[#E8E1D3] bg-white p-4"><p className="font-serif font-bold text-[#4F5E52]">{yoga.name}</p><p className="mt-1 text-sm leading-relaxed text-[#7B8776]">{yoga.evidence}</p></div>) : <p className="rounded-2xl border border-[#E8E1D3] bg-white p-4 text-sm text-[#7B8776]">Tidak ada yoga utama dalam aturan inti yang terpenuhi.</p>}</div>
    </section>
    <section>
      <Title>Purushartha</Title>
      <div className="grid grid-cols-2 gap-3">{focus.sort((a, b) => a[1].rank - b[1].rank).map(([name, item]) => <div key={name} className="rounded-xl border border-[#E8E1D3] bg-white p-4"><p className="text-xs font-bold uppercase tracking-wider text-[#9AA394]">Peringkat {item.rank}</p><p className="mt-1 font-serif text-xl font-bold text-[#4F5E52]">{name}</p><p className="text-xs text-[#7B8776]">Skor {item.score}</p></div>)}</div>
    </section>
    <section className="grid gap-4">
      <Insight icon={Sparkles} title="Kekuatan" items={vedic.strengths} />
      <Insight icon={Layers3} title="Tantangan" items={vedic.challenges} />
      <Insight icon={BriefcaseBusiness} title="Gaya Karier" text={vedic.careerStyle} />
      <Insight icon={Heart} title="Gaya Relasi" text={vedic.relationshipStyle} />
      <Insight icon={Compass} title="Gaya Spiritual" text={vedic.spiritualStyle} />
    </section>
    <section className="rounded-2xl bg-[#4F5E52] p-6 text-white shadow-md">
      <div className="mb-5 flex items-center gap-2"><Sparkles size={18} className="text-[#D4AF37]" /><h2 className="text-xl font-serif font-bold">Kesimpulan Jyotish</h2></div>
      <div className="space-y-4 text-sm leading-relaxed text-[#D2D8D0]">{vedic.summary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
    </section>
  </div>;
}

function Title({ children }: { children: React.ReactNode }) { return <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#7B8776]">{children}</h2>; }
function CoreCard({ icon: Icon, label, value, detail }: { icon: typeof Sun; label: string; value: string; detail: string }) { return <div className="rounded-2xl border border-[#E8E1D3] bg-white p-4 shadow-sm"><Icon size={18} className="text-[#9AA394]" /><p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#9AA394]">{label}</p><p className="mt-1 font-serif text-xl font-bold text-[#4F5E52]">{value}</p><p className="mt-1 text-xs text-[#7B8776]">{detail}</p></div>; }
function Dasha({ label, period }: { label: string; period: VedicBlueprint["currentMahadasha"] }) { return <div className="rounded-2xl border border-[#D8D0C3] bg-[#F5F1E8] p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#9AA394]">{label}</p><p className="mt-1 text-2xl font-serif font-bold text-[#4F5E52]">{period.planet}</p><p className="mt-1 text-sm text-[#7B8776]">{new Date(period.startDate).toLocaleDateString("id-ID")} – {new Date(period.endDate).toLocaleDateString("id-ID")}</p></div>; }
function Insight({ icon: Icon, title, text, items }: { icon: typeof Sparkles; title: string; text?: string; items?: string[] }) { return <div className="rounded-2xl border border-[#E8E1D3] bg-white p-5 shadow-sm"><div className="mb-3 flex items-center gap-2"><Icon size={18} className="text-[#9AA394]" /><h3 className="font-serif text-lg font-bold text-[#4F5E52]">{title}</h3></div>{items ? <ul className="space-y-2 text-sm leading-relaxed text-[#7B8776]">{items.map((item) => <li key={item}>• {item}</li>)}</ul> : <p className="text-sm leading-relaxed text-[#7B8776]">{text}</p>}</div>; }
