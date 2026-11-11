"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Sparkles, Activity, Shield, Sun, BookOpen } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { buildFullAstrologyReading, type AstroFullReading } from "@/lib/astrology/synthesis";
import { resolveAstroBirthData } from "@/lib/astrology/dataState";
import { storageProvider } from "@/lib/storage/storageProvider";
import { getEphemerisStatus } from "@/lib/astrology/ephemerisClassification";
import { NatalChartWheel } from "@/components/blueprint/NatalChartWheel";
import { isEnlEdition } from "@/lib/config/edition";

const NAV_CHAPTERS = [
  { id: "wheel", label: "Peta Langit" },
  { id: "big-three", label: "Sun, Moon & Rising" },
  { id: "planets", label: "10 Planet Utama" },
  { id: "houses", label: "12 House & Ruler" },
  { id: "aspects", label: "Aspek & Geometri" },
  { id: "chiron", label: "Chiron" },
  { id: "lilith-nodes", label: "Lilith, Nodes & Fortune" },
  { id: "asteroids", label: "4 Asteroid Utama" },
  { id: "kesimpulan", label: "Kesimpulan Dirimu" },
];

function FourPillarPanel({
  title,
  penjelasan,
  gift,
  shadow,
  integrasi,
}: {
  title: string;
  penjelasan: string;
  gift: string;
  shadow: string;
  integrasi: string;
}) {
  const pillars = [
    ["1. Penjelasan Umum", penjelasan, "bg-[#FCFAF5]"],
    ["2. Kekuatan (Gift)", gift, "bg-white text-[#4F8A5B]"],
    ["3. Shadow / Sisi Bayangan", shadow, "bg-white text-[#C25E5E]"],
    ["4. Keseluruhan & Integrasi", integrasi, "bg-[#F5F1E8] text-[#273B4A]"],
  ];
  return (
    <div className="space-y-3" data-testid="bp04-four-pillar-panel">
      <h4 className="font-serif text-base font-bold text-[#4F5E52]">{title}</h4>
      {pillars.map(([heading, content, style]) => (
        <details key={heading} open className={`rounded-xl border border-[#E8E1D3] p-4 text-xs sm:text-sm text-[#4F5E52] leading-relaxed ${style}`}>
          <summary className="cursor-pointer font-bold">{heading}</summary>
          <p className="mt-2">{content}</p>
        </details>
      ))}
    </div>
  );
}

export default function NatalChartPage() {
  const auth = useAuth();
  const user = auth?.user;
  const [reading, setReading] = useState<AstroFullReading | null>(null);
  const [readingUid, setReadingUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string>("Sun");
  const [selectedHouse, setSelectedHouse] = useState<number>(1);

  useEffect(() => {
    let cancelled = false;
    setReading(null);
    setLoading(true);
    setErrorStatus(null);
    async function load() {
      if (!user?.uid) {
        setLoading(false);
        setErrorStatus("authentication_required");
        return;
      }
      try {
        const [blueprint, profile] = await Promise.all([
          storageProvider.getUserBlueprint(),
          storageProvider.getUserProfile(),
        ]);
        if (cancelled) return;
        if ((blueprint && blueprint.uid !== user.uid) || (profile && profile.uid !== user.uid)) throw new Error("ownership_mismatch");
        const input = (blueprint as { input?: any } | null)?.input ?? null;
        const storedProfile = (profile as any) ?? null;
        const resolution = resolveAstroBirthData({ input, profile: storedProfile });

        if (resolution.status !== "ready" || !resolution.birthProfile) {
          setErrorStatus(resolution.status);
          setLoading(false);
          return;
        }

        const bp = resolution.birthProfile;
        const full = buildFullAstrologyReading({
          birthDate: bp.birthDate!,
          birthTime: bp.birthTime!,
          timezone: bp.timezone,
          latitude: bp.latitude,
          longitude: bp.longitude,
        });
        if (!cancelled) {
          setReading(full);
          setReadingUid(user.uid);
        }
      } catch {
        if (!cancelled) setErrorStatus("error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [user?.uid]);

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
          <AppNav />
          <div className="mx-auto max-w-4xl text-center mt-24">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#4F5E52] border-t-transparent mb-4" />
            <p className="text-[#7B8776] text-sm">Menghitung posisi 10 planet, 12 house, dan aspek kosmik...</p>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (errorStatus && errorStatus !== "ready") {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
          <AppNav />
          <div className="mx-auto max-w-xl text-center mt-20 p-8 rounded-3xl bg-white border border-[#E8E1D3] shadow-sm">
            <Compass className="mx-auto text-[#4F5E52] mb-4" size={36} />
            <h2 className="text-xl font-serif text-[#4F5E52] mb-2">Data Kelahiran Belum Lengkap</h2>
            <p className="text-sm text-[#7B8776] mb-6 leading-relaxed">
              Astrologi personal membutuhkan tanggal lahir, jam lahir, dan lokasi yang akurat untuk menghitung Ascendant, Midheaven, dan penempatan house.
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-xl bg-[#4F5E52] px-6 py-3 text-sm font-bold text-white hover:bg-[#3d493f] transition-colors"
            >
              Lengkapi di Profil
            </Link>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (!reading || readingUid !== user?.uid) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
          <AppNav />
          <p className="text-center text-[#7B8776] mt-20">Menyiapkan interpretasi natal chart...</p>
        </main>
      </ProtectedRoute>
    );
  }

  const chart = reading.natal;
  const allPlanetsList = [chart.sun, chart.moon, chart.mercury, chart.venus, chart.mars, chart.jupiter, chart.saturn, chart.uranus, chart.neptune, chart.pluto, chart.chiron, chart.partOfFortune];
  const wheelSelectablePlanets = [...allPlanetsList, chart.northNode, chart.southNode, chart.lilith];
  const activeSelectedPlanet = wheelSelectablePlanets.find((p) => p.name === selectedPlanet) || chart.sun;
  const activePlanetReading = reading.planetReadings.find((item) => item.planet.name === activeSelectedPlanet.name) ?? reading.planetReadings[0];
  const ephemerisInfo = getEphemerisStatus(activeSelectedPlanet.name);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-4 py-8 pb-36">
        <AppNav />

        <div className="mx-auto max-w-5xl">
          {/* TOP NAV LINK */}
          <Link href="/profile" className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7B8776] hover:text-[#4F5E52]">
            <ArrowLeft size={14} /> Kembali ke Profil
          </Link>

          {/* HERO HEADER */}
          <header className="mb-8">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4F5E52] text-white">
              <Compass size={22} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9AA394]">Astrologi Amartya</p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-serif text-[#4F5E52]">Peta Langit Kelahiran (Natal Chart)</h1>
            <p className="mt-2 text-sm sm:text-base leading-relaxed text-[#7B8776]">
              {reading.heroInsight}
            </p>
          </header>

          {/* STICKY 10-CHAPTER HORIZONTAL NAVIGATION */}
          <nav className="sticky top-2 z-20 mb-8 rounded-2xl border border-[#E8E1D3] bg-white/95 p-2 shadow-sm backdrop-blur-md overflow-x-auto scrollbar-none">
            <div className="flex gap-1 min-w-max text-xs font-medium text-[#7B8776]">
              {NAV_CHAPTERS.map((ch) => (
                <a
                  key={ch.id}
                  href={`#${ch.id}`}
                  className="px-3 py-1.5 rounded-xl hover:bg-[#F5F1E8] hover:text-[#4F5E52] transition-colors whitespace-nowrap"
                >
                  {ch.label}
                </a>
              ))}
            </div>
          </nav>

          <div className="space-y-12">

            {/* CHAPTER 1: INTERACTIVE NATAL CHART WHEEL */}
            <section id="wheel" className="scroll-mt-20">
              <div className="overflow-hidden rounded-3xl border border-[#DED7CA] bg-[linear-gradient(180deg,#FFFFFF_0%,#FCFAF5_100%)] p-4 sm:p-6 shadow-sm">
                <div className="mb-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9AA394]">Visualisasi Roda Zodiak & House Interaktif</p>
                  <p className="mt-1 font-serif text-2xl text-[#273B4A]">Peta Astrologi Natal & Transit Overlay</p>
                </div>

                {/* Interactive Natal Chart Wheel */}
                <div aria-label="Interactive Natal Chart Wheel" className="mx-auto w-full max-w-[620px]">
                  <NatalChartWheel
                    natal={chart}
                    transits={reading.transits}
                    selectedPlanet={selectedPlanet}
                    selectedHouse={selectedHouse}
                    onSelectPlanet={setSelectedPlanet}
                    onSelectHouse={setSelectedHouse}
                    isEn={isEnlEdition()}
                  />
                </div>

                {/* Selected Planet Interactive Detail Card */}
                <div className="mt-6 rounded-2xl bg-white border border-[#E8E1D3] p-5 sm:p-6 shadow-sm">
                  <div className="flex flex-wrap justify-between items-baseline gap-2 mb-3 pb-3 border-b border-[#E8E1D3]">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9AA394]">
                        Status Ephemeris: <strong className={ephemerisInfo.status === "VERIFIED" ? "text-emerald-600" : "text-amber-600"}>{ephemerisInfo.status}</strong>
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#4F5E52]">
                        {activeSelectedPlanet.name} di Zodiak {activeSelectedPlanet.sign} (House {activeSelectedPlanet.house})
                      </h3>
                      <p className="text-xs text-[#8A8175] font-mono">{activeSelectedPlanet.formattedDegree} {activeSelectedPlanet.isRetrograde ? "- (Retrograde)" : ""}</p>
                    </div>
                    <span className="text-xs font-semibold text-[#8A8175] bg-[#F5F1E8] px-3 py-1 rounded-lg">
                      {ephemerisInfo.status === "VERIFIED" ? "Posisi presisi terhitung" : "Pembacaan arketipal"}
                    </span>
                  </div>

                  {activePlanetReading && (
                    <FourPillarPanel
                      title={`${activeSelectedPlanet.name} ${activeSelectedPlanet.sign} di House ${activeSelectedPlanet.house}`}
                      penjelasan={activePlanetReading.pillar.penjelasan}
                      gift={activePlanetReading.pillar.gift}
                      shadow={activePlanetReading.pillar.shadow}
                      integrasi={activePlanetReading.pillar.integrasi}
                    />
                  )}
                </div>
              </div>
            </section>

            {/* CHAPTER 2: BIG THREE (SUN, MOON, RISING) */}
            <section id="big-three" className="scroll-mt-20 rounded-3xl border border-[#E8E1D3] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9AA394] mb-1">
                <Sun size={16} className="text-[#D4AF37]" /> Inti Kesadaran & Emosi
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#4F5E52] mb-3">Sun, Moon & Rising (Big Three)</h2>
              <p className="text-sm text-[#7B8776] leading-relaxed mb-6">Tiga pilar utama yang membentuk identitas sadar, kebutuhan batin, dan kesan pertama yang kamu tampilkan ke dunia.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(() => {
                  const sunPlanet = reading.planetReadings.find((pr) => pr.planet.name === "Sun");
                  const moonPlanet = reading.planetReadings.find((pr) => pr.planet.name === "Moon");
                  const rulerPlacement = reading.planetReadings.find((pr) => pr.planet.name === chart.chartRuler);
                  return (
                    <>
                      <div key="Sun" className="rounded-2xl bg-[#FCFAF5] border border-[#E8E1D3] p-5">
                        <span className="text-xs font-bold uppercase text-[#8A8175] block mb-1">Matahari (Sun) - Jiwa Sadar</span>
                        <h3 className="font-serif text-lg font-bold text-[#4F5E52] mb-2">{chart.sun.formattedDegree} (House {chart.sun.house})</h3>
                        {sunPlanet && (
                          <FourPillarPanel
                            title={`${sunPlanet.planet.name} ${sunPlanet.planet.sign} di House ${sunPlanet.planet.house}`}
                            penjelasan={sunPlanet.pillar.penjelasan}
                            gift={sunPlanet.pillar.gift}
                            shadow={sunPlanet.pillar.shadow}
                            integrasi={sunPlanet.pillar.integrasi}
                          />
                        )}
                      </div>
                      <div key="Moon" className="rounded-2xl bg-[#FCFAF5] border border-[#E8E1D3] p-5">
                        <span className="text-xs font-bold uppercase text-[#8A8175] block mb-1">Bulan (Moon) - Emosi & Batin</span>
                        <h3 className="font-serif text-lg font-bold text-[#4F5E52] mb-2">{chart.moon.formattedDegree} (House {chart.moon.house})</h3>
                        {moonPlanet && (
                          <FourPillarPanel
                            title={`${moonPlanet.planet.name} ${moonPlanet.planet.sign} di House ${moonPlanet.planet.house}`}
                            penjelasan={moonPlanet.pillar.penjelasan}
                            gift={moonPlanet.pillar.gift}
                            shadow={moonPlanet.pillar.shadow}
                            integrasi={moonPlanet.pillar.integrasi}
                          />
                        )}
                      </div>
                      <div key="Ascendant" className="rounded-2xl bg-[#FCFAF5] border border-[#E8E1D3] p-5">
                        <span className="text-xs font-bold uppercase text-[#8A8175] block mb-1">Ascendant (Rising) - Cara Hadir</span>
                        <h3 className="font-serif text-lg font-bold text-[#4F5E52] mb-2">{chart.ascendant.formattedDegree}</h3>
                        <p className="text-xs sm:text-sm text-[#4F5E52] leading-relaxed mb-3">
                          {reading.ascendantReading?.level2Combination ?? `Rising di ${chart.ascendant.sign} adalah cara hadir alami kamu menyapa dunia.`}
                        </p>
                        <FourPillarPanel
                          title={`Rising ${chart.ascendant.sign} (Chart Ruler: ${chart.chartRuler})`}
                          penjelasan={reading.ascendantReading?.pillar.penjelasan ?? (rulerPlacement ? `Rising kamu di ${chart.ascendant.sign}, Chart Ruler ${chart.chartRuler} berada di ${rulerPlacement.planet.sign} House ${rulerPlacement.planet.house}.` : `Rising kamu di ${chart.ascendant.sign}.`)}
                          gift={reading.ascendantReading?.pillar.gift ?? `Kualitas ${chart.ascendant.sign} menghidupkan gaya hadirmu.`}
                          shadow={reading.ascendantReading?.pillar.shadow ?? `Terlalu menyamar ke ${chart.ascendant.sign} bisa membuatmu lupa kebutuhan Batin (Moon).`}
                          integrasi={reading.ascendantReading?.pillar.integrasi ?? `Chart Ruler ${chart.chartRuler} menaut Rising ke bagian carta lain; perhatikan rumah ${rulerPlacement?.planet.house ?? 1} dan sign ${rulerPlacement?.planet.sign ?? chart.ascendant.sign}.`}
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            </section>

            {/* CHAPTER 3: TEN PLANETS */}
            <section id="planets" className="scroll-mt-20 rounded-3xl border border-[#E8E1D3] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9AA394] mb-1">
                <Sparkles size={16} className="text-[#D4AF37]" /> Sepuluh Planet Utama
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#4F5E52] mb-3">Penempatan 10 Planet</h2>
              <p className="text-sm text-[#7B8776] leading-relaxed mb-6">Setiap planet mewakili fungsi psikologis dan dorongan batin tertentu dalam carta kelahiranmu.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allPlanetsList.slice(0, 10).map((p) => {
                  const readingEntry = reading.planetReadings.find((pr) => pr.planet.name === p.name);
                  return (
                    <div key={p.name} className="rounded-2xl bg-[#FCFAF5] border border-[#E8E1D3] p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-serif text-base font-bold text-[#4F5E52]">{p.name}</h3>
                        <span className="text-xs font-bold text-[#4F5E52] bg-[#F5F1E8] px-2.5 py-0.5 rounded">
                          House {p.house} {p.isRetrograde ? "- (Rx)" : ""}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#4F5E52] mb-2">{p.formattedDegree}</p>
                      {readingEntry && (
                        <FourPillarPanel
                          title={`${p.name} ${p.sign} di House ${p.house}`}
                          penjelasan={readingEntry.pillar.penjelasan}
                          gift={readingEntry.pillar.gift}
                          shadow={readingEntry.pillar.shadow}
                          integrasi={readingEntry.pillar.integrasi}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* CHAPTER 4: 12 HOUSES */}
            <section id="houses" className="scroll-mt-20 rounded-3xl border border-[#E8E1D3] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9AA394] mb-1">
                <Compass size={16} className="text-[#D4AF37]" /> Arena Pengalaman Hidup
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#4F5E52] mb-3">12 House & Chart Ruler</h2>
              <p className="text-sm text-[#7B8776] leading-relaxed mb-6">Chart Ruler carta ini adalah <strong className="text-[#4F5E52]">{chart.chartRuler}</strong>, yang mengarahkan fokus utama tema hidupmu.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {chart.houses.map((cuspLon, idx) => {
                  const houseNum = idx + 1;
                  const planetsInHouse = allPlanetsList.filter((p) => p.house === houseNum);
                  const isSelected = selectedHouse === houseNum;
                  return (
                    <div
                      key={houseNum}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      aria-label={`Baca House ${houseNum}`}
                      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedHouse(houseNum); } }}
                      onClick={() => setSelectedHouse(houseNum)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? "bg-[#F5F1E8] border-[#4F5E52] shadow-sm"
                          : "bg-[#FCFAF5] border-[#E8E1D3] hover:border-[#4F5E52]/40"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold uppercase text-[#8A8175]">House {houseNum}</span>
                        {isSelected && <span className="text-[10px] font-bold text-[#4F5E52] bg-white px-2 py-0.5 rounded">Aktif</span>}
                      </div>
                      <p className="text-xs font-semibold text-[#4F5E52] mb-2">Cusp: {Math.floor(cuspLon % 30)}°</p>
                      <div className="space-y-1 text-xs text-[#7B8776]">
                        {planetsInHouse.length > 0 ? (
                          planetsInHouse.map((p) => <p key={p.name} className="font-medium text-[#4F5E52]">- {p.name} ({p.sign})</p>)
                        ) : (
                          <p className="italic text-[#9AA394]">Kosong (fokus di tempat lain)</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected House Four-Pillar Detail Card */}
              {reading.houseReadings.find((h) => h.house === selectedHouse) && (
                <div className="rounded-2xl bg-white border border-[#E8E1D3] p-5 sm:p-6 shadow-sm">
                  {(() => {
                    const hr = reading.houseReadings.find((h) => h.house === selectedHouse)!;
                    return (
                      <FourPillarPanel
                        title={`House ${hr.house} (Cusp di ${hr.cuspSign} ${Math.floor(hr.cuspDegree)}°)`}
                        penjelasan={hr.pillar.penjelasan}
                        gift={hr.pillar.gift}
                        shadow={hr.pillar.shadow}
                        integrasi={hr.pillar.integrasi}
                      />
                    );
                  })()}
                </div>
              )}
            </section>

            {/* CHAPTER 5: ASPECTS */}
            <section id="aspects" className="scroll-mt-20 rounded-3xl border border-[#E8E1D3] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9AA394] mb-1">
                <Activity size={16} className="text-[#D4AF37]" /> Geometri Kosmik
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#4F5E52] mb-3">Aspek & Interaksi Planet</h2>
              <p className="text-sm text-[#7B8776] leading-relaxed mb-6">Sudut geometris antarplanet yang menunjukkan bagaimana energimu saling mendukung atau menciptakan gesekan kreatif.</p>

              <div className="space-y-3">
                {chart.aspects.map((asp, idx) => (
                  <div key={idx} className="rounded-2xl bg-[#FCFAF5] border border-[#E8E1D3] p-4 flex flex-wrap justify-between items-center gap-2 text-xs sm:text-sm">
                    <div>
                      <strong className="text-[#4F5E52]">{asp.planet1}</strong> <span className="text-[#8A8175] mx-1">({asp.aspectType})</span> <strong className="text-[#4F5E52]">{asp.planet2}</strong>
                    </div>
                    <span className="font-mono text-xs text-[#7B8776] bg-[#F5F1E8] px-2.5 py-1 rounded-lg">
                      Orb: {asp.orb.toFixed(1)} deg
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* CHAPTER 6: CHIRON */}
            <section id="chiron" className="scroll-mt-20 rounded-3xl border border-[#E8E1D3] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9AA394] mb-1">
                <Shield size={16} className="text-[#D4AF37]" /> Titik Penyembuhan
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#4F5E52] mb-3">Chiron: Luka & Kebijaksanaan</h2>
              <p className="text-sm text-[#7B8776] leading-relaxed mb-6">
                Status Ephemeris: <strong className="text-amber-600">Tabel Swiss Ephemeris dengan interpolasi; batas galat seluruh rentang belum diverifikasi</strong>. Chiron di zodiak {chart.chiron.sign} (House {chart.chiron.house}) menunjukkan area kepekaan batin.
              </p>

              {(() => {
                const chironReading = reading.planetReadings.find((pr) => pr.planet.name === "Chiron");
                return chironReading && (
                  <FourPillarPanel
                    title={`Chiron ${chironReading.planet.sign} di House ${chironReading.planet.house}`}
                    penjelasan={chironReading.pillar.penjelasan}
                    gift={chironReading.pillar.gift}
                    shadow={chironReading.pillar.shadow}
                    integrasi={chironReading.pillar.integrasi}
                  />
                );
              })()}
            </section>

            {/* CHAPTER 7: LILITH, NODES & PART OF FORTUNE */}
            <section id="lilith-nodes" className="scroll-mt-20 rounded-3xl border border-[#E8E1D3] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9AA394] mb-1">
                <Sparkles size={16} className="text-[#D4AF37]" /> Sisi Bayangan, Poros Jiwa & Titik Keselarasan
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#4F5E52] mb-3">Lilith, Lunar Nodes & Part of Fortune</h2>
              <p className="text-sm text-[#7B8776] leading-relaxed mb-6">
                Titik-titik kunci evolusi batin: Lilith dan Lunar Nodes (Status Ephemeris: <strong className="text-amber-600">PROVISIONAL</strong>), serta Part of Fortune (Status: <strong className="text-emerald-600">VERIFIED</strong> &bull; Kalkulasi Sekte Geometris Tradisional Hellenistik / Arab).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  const lilithReading = reading.planetReadings.find((pr) => pr.planet.name === "Black Moon Lilith");
                  return lilithReading && (
                    <FourPillarPanel
                      key="lilith"
                      title={`Black Moon Lilith ${lilithReading.planet.sign} di House ${lilithReading.planet.house}`}
                      penjelasan={lilithReading.pillar.penjelasan}
                      gift={lilithReading.pillar.gift}
                      shadow={lilithReading.pillar.shadow}
                      integrasi={lilithReading.pillar.integrasi}
                    />
                  );
                })()}
                {(() => {
                  const nodesReading = reading.planetReadings.find((pr) => pr.planet.name === "North Node");
                  return nodesReading && (
                    <FourPillarPanel
                      key="nodes"
                      title={`North Node ${nodesReading.planet.sign} House ${nodesReading.planet.house} / South Node ${chart.southNode.sign} House ${chart.southNode.house}`}
                      penjelasan={nodesReading.pillar.penjelasan}
                      gift={nodesReading.pillar.gift}
                      shadow={nodesReading.pillar.shadow}
                      integrasi={nodesReading.pillar.integrasi}
                    />
                  );
                })()}
              </div>

              {/* Part of Fortune Dedicated 4-Pillar Panel */}
              {(() => {
                const pofReading = reading.planetReadings.find((pr) => pr.planet.name === "Part of Fortune");
                const pof = chart.partOfFortune;
                return pofReading && pof && (
                  <div className="mt-8 border-t border-[#E8E1D3] pt-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-[#F5F1E8] text-[#4F5E52]">
                          Part of Fortune (Pars Fortunae)
                        </span>
                        <span className="text-xs font-semibold text-[#8A8175]">
                          {pof.formattedDegree} &bull; House {pof.house} &bull; Sekte: {pof.sect === 'day' ? 'Siang (Day Chart)' : 'Malam (Night Chart)'}
                        </span>
                      </div>
                      <span className="text-xs text-[#7B8776]">
                        Penguasa: <strong>{pof.ruler}</strong> di {pof.rulerPlacement.sign} House {pof.rulerPlacement.house}
                      </span>
                    </div>
                    <p className="text-xs text-[#7B8776] mb-4">
                      Titik matematis tradisi Hellenistik dan Arab yang merefleksikan perpaduan Ascendant, Matahari, dan Bulan: wadah kelancaran alami, rasa cukup, dan keselarasan material batiniah.
                    </p>
                    <FourPillarPanel
                      key="part-of-fortune"
                      title={`Part of Fortune ${pof.sign} di House ${pof.house} (Dipandu ${pof.ruler} di ${pof.rulerPlacement.sign} House ${pof.rulerPlacement.house})`}
                      penjelasan={pofReading.pillar.penjelasan}
                      gift={pofReading.pillar.gift}
                      shadow={pofReading.pillar.shadow}
                      integrasi={pofReading.pillar.integrasi}
                    />
                  </div>
                );
              })()}
            </section>

            {/* CHAPTER 8: ASTEROIDS */}
            <section id="asteroids" className="scroll-mt-20 rounded-3xl border border-[#E8E1D3] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9AA394] mb-1">
                <BookOpen size={16} className="text-[#D4AF37]" /> Arketipe Tambahan
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#4F5E52] mb-3">Ceres, Pallas, Juno & Vesta</h2>
              <p className="text-sm text-[#7B8776] leading-relaxed mb-6">
                Status Ephemeris: <strong className="text-amber-600">PROVISIONAL (Linear Mean Motion)</strong>. Empat asteroid utama yang memperkaya nuansa pengasuhan, strategi, komitmen relasi, dan pengabdian batin.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[chart.ceres, chart.pallas, chart.juno, chart.vesta].map((ast) => {
                  const readingEntry = reading.planetReadings.find((pr) => pr.planet.name === ast.name);
                  return (
                    <div key={ast.name} className="rounded-2xl bg-[#FCFAF5] border border-[#E8E1D3] p-4">
                      <span className="text-[10px] font-bold uppercase text-[#8A8175] block mb-1">Asteroid</span>
                      <h3 className="font-serif text-base font-bold text-[#4F5E52] mb-1">{ast.name}</h3>
                      <p className="text-xs font-semibold text-[#4F5E52] mb-2">{ast.formattedDegree}</p>
                      {readingEntry && (
                        <FourPillarPanel
                          title={`${ast.name} ${ast.sign} di House ${ast.house}`}
                          penjelasan={readingEntry.pillar.penjelasan}
                          gift={readingEntry.pillar.gift}
                          shadow={readingEntry.pillar.shadow}
                          integrasi={readingEntry.pillar.integrasi}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* CHAPTER 9: KESIMPULAN DIRIMU (SYNTHESIS) */}
            <section id="kesimpulan" className="scroll-mt-20 rounded-3xl bg-[#4F5E52] text-white p-6 sm:p-10 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
                <Sparkles size={18} /> Rangkuman Integratif
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl mb-2">{reading.synthesis.title}</h2>
              <p className="text-xs sm:text-sm text-[#D2D8D0] mb-8">{reading.synthesis.subtitle}</p>

              <p className="text-sm sm:text-base leading-relaxed text-[#E8EAE6] mb-8 pb-8 border-b border-white/15">
                {reading.synthesis.summaryParagraph}
              </p>

              {/* 4 Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {reading.synthesis.pillars.map((p) => (
                  <div key={p.id} className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm border border-white/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] block mb-1">{p.eyebrow}</span>
                    <h3 className="font-serif text-lg font-bold mb-2">{p.title}</h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-[#D2D8D0] mb-3">{p.narrative}</p>
                    <p className="text-[11px] text-white/80 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                      {p.practicalKey}
                    </p>
                  </div>
                ))}
              </div>

              {/* Micro-Commitments */}
              <div className="rounded-2xl bg-white/10 p-6 border border-white/10 mb-8">
                <h3 className="font-serif text-xl font-bold mb-4 text-[#D4AF37]">Langkah Sederhana Hari Ini</h3>
                <div className="space-y-4">
                  {reading.synthesis.microCommitments.map((mc) => (
                    <div key={mc.order} className="flex gap-3 items-start">
                      <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-[#D4AF37] text-[#4F5E52] text-xs font-bold">
                        {mc.order}
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase text-[#D4AF37]">{mc.area}</p>
                        <p className="text-xs sm:text-sm font-semibold text-white mb-1">{mc.invitation}</p>
                        <p className="text-xs text-[#D2D8D0] leading-relaxed">{mc.practicalAction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs sm:text-sm italic leading-relaxed text-[#D2D8D0] border-t border-white/15 pt-6">
                "{reading.synthesis.closingReflection}"
              </p>
            </section>

          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}