"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Compass,
  Flower2,
  Heart,
  Layers3,
  MoonStar,
  Sparkles,
  Sprout,
  Sun,
  Activity,
} from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { storageProvider } from "@/lib/storage/storageProvider";
import type { Blueprint } from "@/lib/types/blueprint";
import { calculateTzolkin } from "@/lib/tzolkin/calculateTzolkin";
import type { GalacticTone, SolarSeal, TzolkinBlueprint } from "@/lib/tzolkin/types";

type DisplayCard = {
  title: string;
  value: string;
  detail?: string;
  icon: typeof Compass;
  color: string;
  background: string;
};

const LEGACY_FORMAL_PRONOUN_PATTERN = /(^|[^A-Za-z])[Aa]nda([^A-Za-z]|$)/;

function hasLegacyTzolkinSummary(tzolkin: TzolkinBlueprint | null | undefined): boolean {
  return Boolean(tzolkin?.summary?.some((paragraph) =>
    LEGACY_FORMAL_PRONOUN_PATTERN.test(paragraph)
    || /menuju\s+menuju/i.test(paragraph)
    || /\.\./.test(paragraph)
  ));
}

export default function TzolkinPage() {
  const [tzolkin, setTzolkin] = useState<TzolkinBlueprint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [storedBlueprint, profile] = await Promise.all([
          storageProvider.getUserBlueprint(),
          storageProvider.getUserProfile(),
        ]);
        if (!storedBlueprint) return;

        const blueprint = storedBlueprint as unknown as Blueprint;
        const birthDate = blueprint.input?.birthDate || profile?.birthDate;
        if (blueprint.tzolkin && blueprint.tzolkin.oracle && !hasLegacyTzolkinSummary(blueprint.tzolkin)) {
          setTzolkin(blueprint.tzolkin);
          return;
        }

        if (!birthDate) {
          setTzolkin(blueprint.tzolkin ?? null);
          return;
        }

        const calculated = calculateTzolkin({ birthDate });
        const updatedBlueprint = {
          ...storedBlueprint,
          tzolkin: calculated,
          updatedAt: new Date().toISOString(),
        };
        await storageProvider.saveUserBlueprint(updatedBlueprint);
        setTzolkin(calculated);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const cards: DisplayCard[] = tzolkin ? [
    {
      title: "Kin Identity",
      value: `Kin ${tzolkin.kin}`,
      detail: tzolkin.kinName,
      icon: Sparkles,
      color: "text-amber-600",
      background: "bg-amber-50",
    },
    {
      title: "Solar Seal",
      value: tzolkin.solarSeal.name,
      detail: tzolkin.solarSeal.keyword,
      icon: Sun,
      color: "text-orange-600",
      background: "bg-orange-50",
    },
    {
      title: "Galactic Tone",
      value: tzolkin.galacticTone.name,
      detail: tzolkin.galacticTone.function,
      icon: MoonStar,
      color: "text-blue-600",
      background: "bg-blue-50",
    },
    {
      title: "Wavespell",
      value: tzolkin.wavespell.name,
      detail: tzolkin.wavespell.theme,
      icon: Layers3,
      color: "text-emerald-600",
      background: "bg-emerald-50",
    },
    {
      title: "Castle",
      value: tzolkin.castle.name,
      detail: tzolkin.castle.theme,
      icon: Compass,
      color: "text-rose-600",
      background: "bg-rose-50",
    },
    {
      title: "Color",
      value: tzolkin.color,
      icon: Flower2,
      color: "text-purple-600",
      background: "bg-purple-50",
    },
  ] : [];

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />
        <div className="mx-auto max-w-lg">
          <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#7B8776]">
            <ArrowLeft size={16} />
            Kembali ke Profil
          </Link>

          <header className="mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F5E52] text-white">
              <Sprout size={25} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9AA394]">Tzolkin</p>
            <h1 className="mt-2 text-4xl font-serif text-[#4F5E52]">Kalender Kesadaran Maya</h1>
            <p className="mt-3 leading-7 text-[#7B8776]">
              Peta evolusi jiwa berdasarkan siklus 260 Kin yang terbentuk dari Solar Seal dan Galactic Tone.
            </p>
          </header>

          {loading ? (
            <p className="py-16 text-center text-[#7B8776]">Membaca energi waktu...</p>
          ) : tzolkin ? (
            <div className="space-y-8">
              {tzolkin.oracle && <OracleGraphic tzolkin={tzolkin} />}

              <section>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#7B8776]">Kin Identity</h2>
                <div className="grid gap-4">
                  {cards.map(({ title, value, detail, icon: Icon, color, background }) => (
                    <section key={title} className="rounded-2xl border border-[#E8E1D3] bg-white p-5 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${background} ${color}`}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <h2 className="text-sm font-bold uppercase tracking-wider text-[#9AA394]">{title}</h2>
                          <p className="mt-1 text-xl font-serif font-bold leading-relaxed text-[#4F5E52]">{value}</p>
                        </div>
                      </div>
                      {detail && <p className="mt-4 border-t border-[#F5F1E8] pt-4 text-sm leading-relaxed text-[#7B8776]">{detail}</p>}
                    </section>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#7B8776]">Solar Seal</h2>
                <div className="grid gap-4">
                  <InsightCard icon={Sun} title="Keyword" text={tzolkin.solarSeal.keyword} />
                  <InsightCard icon={Sparkles} title="Gift" text={tzolkin.solarSeal.gift} />
                  <InsightCard icon={Layers3} title="Challenge" text={tzolkin.solarSeal.challenge} />
                  <InsightCard icon={Compass} title="Purpose" text={tzolkin.solarSeal.purpose} />
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#7B8776]">Galactic Tone</h2>
                <div className="grid gap-4">
                  <InsightCard icon={MoonStar} title="Function" text={tzolkin.galacticTone.function} />
                  <InsightCard icon={Sparkles} title="Gift" text={tzolkin.galacticTone.gift} />
                  <InsightCard icon={Layers3} title="Shadow" text={tzolkin.galacticTone.shadow} />
                  <InsightCard icon={Compass} title="Life Lesson" text={tzolkin.galacticTone.lesson} />
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#7B8776]">Wavespell</h2>
                <div className="grid gap-4">
                  <InsightCard icon={Layers3} title="Theme" text={tzolkin.wavespell.theme} />
                  <InsightCard icon={Compass} title="Meaning" text={tzolkin.wavespell.meaning} />
                  <InsightCard icon={Sparkles} title="Growth Direction" text={tzolkin.wavespell.growthDirection} />
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#7B8776]">Castle</h2>
                <div className="grid gap-4">
                  <InsightCard icon={Compass} title="Theme" text={tzolkin.castle.theme} />
                  <InsightCard icon={Layers3} title="Meaning" text={tzolkin.castle.meaning} />
                  <InsightCard icon={Sparkles} title="Spiritual Lesson" text={tzolkin.castle.spiritualLesson} />
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#7B8776]">Galactic Activation Portal</h2>
                <div className="grid gap-4">
                  <InsightCard icon={Activity} title="Portal Status" text={tzolkin.gap ? "Galactic Activation Portal" : "Non-Portal Kin"} />
                  <InsightCard icon={Compass} title="Interpretation" text={tzolkin.gap ? "Heightened transformation dan intensitas tinggi" : "Pertumbuhan bertahap dan mantap"} />
                  <InsightCard icon={Sparkles} title="Growth Pattern" text={tzolkin.gap ? "Percepatan evolusi dan sinkronisitas kuat" : "Perkembangan yang konsisten dan stabil"} />
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#7B8776]">Tzolkin Archetype</h2>
                <div className="grid gap-4">
                  <InsightCard icon={Sparkles} title="Kekuatan" items={tzolkin.strengths} />
                  <InsightCard icon={Layers3} title="Tantangan" items={tzolkin.challenges} />
                  <InsightCard icon={Heart} title="Gaya Relasi" text={tzolkin.relationshipStyle} />
                  <InsightCard icon={BriefcaseBusiness} title="Gaya Kerja" text={tzolkin.workStyle} />
                  <InsightCard icon={Compass} title="Gaya Pertumbuhan" text={tzolkin.growthStyle} />
                  <InsightCard icon={Sun} title="Misi Kehidupan" text={tzolkin.lifePurpose} />
                </div>
              </section>

              <section className="rounded-2xl bg-[#4F5E52] p-6 text-white shadow-md">
                <div className="mb-5 flex items-center gap-2">
                  <Sparkles size={18} className="text-[#D4AF37]" />
                  <h2 className="text-xl font-serif font-bold">Tzolkin Synthesis</h2>
                </div>
                <div className="space-y-4 text-sm leading-relaxed text-[#D2D8D0]">
                  {tzolkin.summary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>
            </div>
          ) : (
            <p className="py-16 text-center text-[#7B8776]">
              Data kelahiran belum tersedia untuk menghitung Tzolkin.
            </p>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}

function InsightCard({
  icon: Icon,
  title,
  text,
  items,
}: {
  icon: typeof Sparkles;
  title: string;
  text?: string;
  items?: string[];
}) {
  return (
    <div className="rounded-2xl border border-[#E8E1D3] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={18} className="text-[#9AA394]" />
        <h3 className="font-serif text-lg font-bold text-[#4F5E52]">{title}</h3>
      </div>
      {items ? (
        <ul className="space-y-2 text-sm leading-relaxed text-[#7B8776]">
          {items.map((item) => <li key={item}>• {item}</li>)}
        </ul>
      ) : (
        <p className="text-sm leading-relaxed text-[#7B8776]">{text}</p>
      )}
    </div>
  );
}

function getSealBgColor(sealName: string) {
  if (sealName.includes("Merah") || sealName.includes("Red") || ["Naga", "Ular", "Bulan", "Nabi", "Bumi"].some(x => sealName.includes(x))) return "bg-[#e76f51] text-white border-transparent";
  if (sealName.includes("Putih") || sealName.includes("White") || ["Angin", "Penghubung", "Anjing", "Penyihir", "Cermin"].some(x => sealName.includes(x))) return "bg-[#f8f9fa] text-gray-800 border-gray-800";
  if (sealName.includes("Biru") || sealName.includes("Blue") || ["Malam", "Tangan", "Monyet", "Elang", "Badai"].some(x => sealName.includes(x))) return "bg-[#457b9d] text-white border-transparent";
  if (sealName.includes("Kuning") || sealName.includes("Yellow") || ["Benih", "Bintang", "Manusia", "Prajurit", "Matahari"].some(x => sealName.includes(x))) return "bg-[#e9c46a] text-gray-900 border-gray-900";
  return "bg-gray-200 text-gray-800 border-transparent";
}

function ToneDotsBars({ toneName }: { toneName: string }) {
  const numMatch = toneName.match(/^(\d+)/);
  if (!numMatch) return null;
  const num = parseInt(numMatch[1], 10);
  const bars = Math.floor(num / 5);
  const dots = num % 5;

  return (
    <div className="flex flex-col items-center gap-1 mb-1">
      <div className="flex gap-1 h-1.5 items-center justify-center">
        {Array.from({ length: dots }).map((_, i) => (
          <div key={i} className="h-1.5 w-1.5 rounded-full bg-gray-800" />
        ))}
      </div>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} className="h-1 w-6 rounded-full bg-gray-800" />
      ))}
    </div>
  );
}

function SealNode({ seal, tone, label }: { seal: SolarSeal; tone?: GalacticTone; label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center relative">
      {tone && (
        <div className="absolute -top-6">
          <ToneDotsBars toneName={tone.name} />
        </div>
      )}
      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 p-1 text-center text-[9px] font-bold leading-tight shadow-sm ${getSealBgColor(seal.name)}`}>
        {seal.name.split(" ")[0]}
        <br />
        {seal.name.split(" ")[1]}
      </div>
      {label && <span className="mt-1 text-[10px] font-bold uppercase text-gray-500">{label}</span>}
    </div>
  );
}

function OracleGraphic({ tzolkin }: { tzolkin: TzolkinBlueprint }) {
  const { oracle } = tzolkin;
  
  return (
    <div className="rounded-2xl border border-[#E8E1D3] bg-[#fbf9f4] p-8 shadow-sm">
      <div className="mb-8 text-center flex flex-col items-center gap-1">
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-500">Destiny Oracle</span>
        <h2 className="text-xl font-serif font-bold text-[#4F5E52] uppercase tracking-wider">{tzolkin.kinName}</h2>
      </div>

      <div className="relative mx-auto flex w-full max-w-[280px] flex-col items-center gap-4">
        {/* Connecting Lines (Cross) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="absolute h-[160px] w-0.5 bg-gray-800 mt-6" />
          <div className="absolute h-0.5 w-[160px] bg-gray-800" />
        </div>

        {/* Guide */}
        <div className="z-10 mt-6 bg-[#fbf9f4] p-1 rounded-3xl">
          <SealNode seal={oracle.guide.seal} tone={oracle.guide.tone} label="Guide" />
        </div>

        {/* Middle Row: Antipode, Destiny, Analog */}
        <div className="flex items-center justify-center gap-2 z-10 w-full">
          <div className="flex-1 flex justify-end bg-[#fbf9f4] p-1 rounded-3xl">
             <SealNode seal={oracle.antipode.seal} label="Antipode" />
          </div>
          <div className="relative mx-2 bg-[#fbf9f4] p-1 rounded-3xl">
            <SealNode seal={oracle.destiny.seal} label="Destiny" />
            <div className="absolute -right-12 bottom-2 text-xs font-bold text-[#4F5E52]">
              KIN<br />{tzolkin.kin}
            </div>
          </div>
          <div className="flex-1 flex justify-start bg-[#fbf9f4] p-1 rounded-3xl">
            <SealNode seal={oracle.analog.seal} label="Analog" />
          </div>
        </div>

        {/* Occult */}
        <div className="z-10 bg-[#fbf9f4] p-1 rounded-3xl">
          <SealNode seal={oracle.occult.seal} label="Occult" />
        </div>
      </div>

      <div className="mt-10 flex justify-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f9fa] border-2 border-gray-800 text-gray-800">
            <div className="grid grid-cols-2 gap-0.5 p-1">
               <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
               <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
               <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
               <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase text-gray-800 tracking-widest">WS</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f9fa] border-2 border-gray-800 text-gray-800">
            <Compass size={18} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-bold uppercase text-gray-800 tracking-widest">Kastil</span>
        </div>
      </div>
    </div>
  );
}
