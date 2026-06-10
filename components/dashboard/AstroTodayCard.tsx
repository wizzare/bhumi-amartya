import { useState, useEffect } from "react";
import { calculateCurrentSky, CurrentSky } from "@/lib/astrology/calculateCurrentSky";
import { buildAstroHouseActivations, AstroHouseActivation } from "@/lib/astrology/astroHouseActivations";
import { ChevronDown, ChevronUp, Moon, Compass, ShieldAlert, Calendar } from "lucide-react";

type BlueprintAstroContext = {
  profile?: Record<string, unknown> | null;
  blueprint?: Record<string, unknown> | null;
  birthDate?: string | null;
  sunSign?: string | null;
  moonSign?: string | null;
  risingSign?: string | null;
  lifePathNumber?: number | null;
  arcanaCenter?: number | null;
  humanDesignType?: string | null;
};

type AstroTodayCardProps = {
  context: BlueprintAstroContext;
};

const GLYPHS: Record<string, string> = {
  Sun: "☀",
  Moon: "🌙",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
  "North Node": "☊",
  Chiron: "⚷",
  Lilith: "⚸",
};

const BODY_LABELS: Record<string, string> = {
  Sun: "Matahari",
  Moon: "Bulan",
  Mercury: "Merkurius",
  Venus: "Venus",
  Mars: "Mars",
  Jupiter: "Jupiter",
  Saturn: "Saturnus",
  Uranus: "Uranus",
  Neptune: "Neptunus",
  Pluto: "Pluto",
  "North Node": "North Node",
  Chiron: "Chiron",
  Lilith: "Lilith",
};

export function AstroTodayCard({ context }: AstroTodayCardProps) {
  const [sky, setSky] = useState<CurrentSky | null>(null);
  const [activations, setActivations] = useState<AstroHouseActivation[]>([]);
  const [calcError, setCalcError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const calc = async () => {
      try {
        const skyResult = calculateCurrentSky(new Date());
        setSky(skyResult);

        if (context.blueprint || context.profile) {
          const { activations: houseActs } = buildAstroHouseActivations({
            currentSky: skyResult,
            natalChart: (context.blueprint as any)?.astrology || (context.blueprint as any)?.natalChart || null,
            natalHouses: (context.blueprint as any)?.astrology?.houses || null,
          });
          setActivations(houseActs);
        }
      } catch (e: any) {
        console.error("Astro Card Error:", e);
        setCalcError(true);
      }
    };
    void calc();
  }, [context.blueprint, context.profile]);

  if (calcError || !sky) {
    return (
      <div className="mt-8 bhumi-card p-10 bg-[#FCFAF5] border border-[#E8E9E5]/50 text-center italic text-[#7B8776] text-sm">
        Membaca data langit...
      </div>
    );
  }

  const moonActivation = activations.find(a => a.planet === "Moon");
  const majorPlanets = ["Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
  const activePlanets = sky.bodies.filter(b => majorPlanets.includes(b.body) && !b.isRetrograde);
  const retrogrades = sky.bodies.filter(b => b.isRetrograde);

  return (
    <div className="mt-10 space-y-6">
      <div className="px-1">
        <h3 className="text-[#4F6658] font-serif text-2xl font-bold italic">✨ Astro Hari Ini</h3>
        <p className="text-[#3C3C3C] text-[13px] mt-1 font-medium opacity-70">
          Konteks kosmik untuk perjalanan jiwamu.
        </p>
      </div>

      {/* SECTION 1: MOON PHASE */}
      <div className="bhumi-card bg-white shadow-sm overflow-hidden border-none group">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-500 group-hover:scale-110 transition-transform duration-500">
                <Moon size={22} />
              </div>
              <div>
                <h4 className="font-bold text-[#4F6658] text-lg">Bulan: {sky.moonInfo.label}</h4>
                <p className="text-[12px] text-[#3C3C3C] font-semibold italic mt-0.5 opacity-70">
                  Menuju {sky.moonInfo.nextPhaseLabel} (±{sky.moonInfo.daysRemaining} hari)
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[15px] text-[#3C3C3C] font-bold italic leading-relaxed">
              Theme: {sky.moonInfo.theme}
            </p>

            {isExpanded && moonActivation && (
              <div className="pt-5 mt-5 border-t border-[#F5F1E8] animate-in fade-in slide-in-from-top-2 duration-500">
                <p className="text-sm text-[#4F6658] leading-relaxed">
                  Fase ini mengaktifkan <span className="font-bold">Area {moonActivation.lifeArea}</span> kamu.
                </p>
                <p className="text-[13px] text-[#7B8776] mt-2 leading-relaxed italic">
                  Waktunya menyelaraskan kebutuhan emosional dengan tema {moonActivation.keywords.join(", ")}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: ACTIVE PLANETS */}
      <div className="bhumi-card bg-white shadow-sm overflow-hidden border-none group">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-500 group-hover:rotate-12 transition-transform duration-500">
              <Compass size={22} />
            </div>
            <h4 className="font-bold text-[#4F6658] text-lg">Planet Aktif</h4>
          </div>

          <div className="space-y-6">
            {activePlanets.map(planet => {
              const activation = activations.find(a => a.planet === planet.body);
              return (
                <div key={planet.body} className="relative">
                  <div className="space-y-1.5">
                    <p className="text-[15px] font-bold text-[#4F5E52] flex items-center gap-3">
                      <span className="text-xl opacity-80">{GLYPHS[planet.body]}</span>
                      {BODY_LABELS[planet.body]} di {planet.sign}
                    </p>
                    <p className="text-[10px] font-bold text-[#9AA394] uppercase tracking-widest ml-8">Periode Berjalan</p>
                  </div>

                  {isExpanded && activation && (
                    <div className="mt-3 ml-8 pl-5 border-l-2 border-[#F5F1E8] animate-in fade-in slide-in-from-left-2 duration-500">
                      <p className="text-[13px] text-[#4F6658] leading-relaxed">
                        Mengaktifkan <span className="font-bold">Area {activation.lifeArea}</span>.
                      </p>
                      <p className="text-[12px] text-[#7B8776] mt-1.5 italic font-medium">
                        Mendukung fokus pada {activation.keywords.slice(0, 2).join(" dan ")}.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 3: RETROGRADE */}
      {retrogrades.length > 0 && (
        <div className="bhumi-card bg-white shadow-sm overflow-hidden border-none group">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-2xl bg-orange-50 text-orange-600 group-hover:scale-95 transition-transform duration-500">
                <ShieldAlert size={22} />
              </div>
              <h4 className="font-bold text-[#4F6658] text-lg">Fase Evaluasi (℞)</h4>
            </div>

            <div className="space-y-6">
              {retrogrades.map(planet => {
                const activation = activations.find(a => a.planet === planet.body);
                return (
                  <div key={planet.body} className="space-y-1.5">
                    <p className="text-[15px] font-bold text-orange-700 flex items-center gap-3">
                      <span className="text-xl opacity-80">{GLYPHS[planet.body]}</span>
                      {BODY_LABELS[planet.body]} Retrograde
                    </p>
                    <p className="text-[10px] font-bold text-orange-200 uppercase tracking-widest ml-8">Fase Tinjau Ulang</p>

                    {isExpanded && activation && (
                      <div className="mt-3 ml-8 pl-5 border-l-2 border-orange-100 animate-in fade-in duration-500">
                        <p className="text-[13px] text-[#4F6658] leading-relaxed">
                          Meninjau ulang <span className="font-bold">Area {activation.lifeArea}</span>.
                        </p>
                        <p className="text-[12px] text-[#7B8776] mt-1.5 leading-relaxed italic font-medium">
                          Waktunya mengevaluasi {activation.keywords.join(", ")} tanpa terburu-buru.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] bg-[#FCFAF5] border border-[#E8E9E5]/60 text-[11px] font-bold text-[#7B8776] uppercase tracking-[0.2em] hover:bg-white active:scale-[0.98] transition-all shadow-sm group"
      >
        {isExpanded ? (
          <>Tutup Detail <ChevronUp size={16} className="group-hover:-translate-y-1 transition-transform" /></>
        ) : (
          <>Lihat Pengaruh ke Blueprint <ChevronDown size={16} className="group-hover:translate-y-1 transition-transform" /></>
        )}
      </button>

      <div className="pt-2">
        <p className="text-[9px] text-[#9AA394] text-center font-bold uppercase tracking-[0.25em] opacity-60 flex items-center justify-center gap-2">
          <Calendar size={10} /> Data Sinkronis 24 Jam
        </p>
      </div>
    </div>
  );
}
