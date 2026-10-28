"use client";

import React, { useState } from "react";
import { AstroTodayCard } from "@/components/dashboard/AstroTodayCard";
import { CelestialMoon, getMoonIllumination } from "@/components/celestial/CelestialMoon";

export default function TestAstroTransitPage() {
  const [activeTab, setActiveTab] = useState<"card" | "moons" | "transit-6" | "transit-11">("card");

  // Synthetic Context for Fixture 25 October 2026
  const fixtureContext = {
    profile: {
      uid: "test-astro-user",
      timezone: "Asia/Jakarta",
      birthDate: "1990-05-15",
      birthTime: "10:30",
      birthCity: "Jakarta",
    },
    blueprint: {
      astrology: {
        houses: { 1: "Leo", 4: "Scorpio", 7: "Aquarius", 10: "Taurus" },
      },
    },
  };

  const moonTestCases = [
    { label: "Bulan Baru (New Moon)", angle: 0, desc: "0° · Cakram gelap terlihat" },
    { label: "Perbani Awal (First Quarter)", angle: 90, desc: "90° · 50% kanan terang" },
    { label: "Menjelang Purnama (Waxing Gibbous)", angle: 171.794, desc: "171.8° · ≈99.5% terang (25 Okt)" },
    { label: "Bulan Purnama (Full Moon)", angle: 180, desc: "180° · 100% cakram terang" },
    { label: "Cembung Akhir (Waning Gibbous)", angle: 225, desc: "225° · ≈85.4% kiri terang" },
  ];

  const mock6Events = [
    { body: "Sun", sign: "Scorpio", isRetrograde: false, aspects: ["Kuadrat Pluto (0.9°)", "Konjungsi Venus (2.3°)"] },
    { body: "Mercury", sign: "Scorpio", isRetrograde: true, aspects: ["Kuadrat Jupiter (2.6°)", "Kuadrat Mars (5.5°)"] },
    { body: "Venus", sign: "Libra", isRetrograde: true, aspects: ["Konjungsi Sun (2.3°)", "Kuadrat Pluto (3.2°)"] },
    { body: "Mars", sign: "Leo", isRetrograde: false, aspects: ["Trigon Saturn (5.6°)", "Kuadrat Mercury (5.5°)"] },
    { body: "Jupiter", sign: "Leo", isRetrograde: false, aspects: ["Kuadrat Mercury (2.6°)"] },
    { body: "Saturn", sign: "Aries", isRetrograde: true, aspects: ["Trigon Mars (5.6°)", "Sekstil Uranus (4.8°)"] },
  ];

  const mock11Events = [
    ...mock6Events,
    { body: "Uranus", sign: "Gemini", isRetrograde: true, aspects: ["Trigon Pluto (1.8°)", "Sekstil Neptune (2.7°)"] },
    { body: "Neptune", sign: "Aries", isRetrograde: true, aspects: ["Sekstil Pluto (0.9°)", "Sekstil Uranus (2.7°)"] },
    { body: "Pluto", sign: "Aquarius", isRetrograde: false, aspects: ["Sekstil Neptune (0.9°)", "Kuadrat Sun (0.9°)"] },
    { body: "North Node", sign: "Leo", isRetrograde: false, aspects: ["Konjungsi Moon (1.2°)"] },
    { body: "Chiron", sign: "Gemini", isRetrograde: false, aspects: ["Konjungsi Uranus (2.0°)"] },
  ];

  return (
    <main className="min-h-screen bg-[#F7F4EE] text-[#2D352E] p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="border-b border-[#E4DFD5] pb-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5F6B5E]">
            Astro Hari Ini · Verification Harness
          </span>
          <h1 className="text-2xl font-serif font-medium text-[#2D352E] mt-1">
            Langit & Transit Hari Ini & Moon Phase
          </h1>
          <p className="text-xs text-[#5F6B5E] mt-1">
            Fixture 25 Oktober 2026 20:23 WIB · Browser Verification Suite
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab("card")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "card" ? "bg-[#4A5849] text-white" : "bg-white text-[#4A5849] border border-[#E4DFD5]"
              }`}
            >
              AstroTodayCard (Modal)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("moons")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "moons" ? "bg-[#4A5849] text-white" : "bg-white text-[#4A5849] border border-[#E4DFD5]"
              }`}
            >
              Fase-Fase Moon (Visual)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("transit-6")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "transit-6" ? "bg-[#4A5849] text-white" : "bg-white text-[#4A5849] border border-[#E4DFD5]"
              }`}
            >
              Transit 6 Hasil
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("transit-11")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "transit-11" ? "bg-[#4A5849] text-white" : "bg-white text-[#4A5849] border border-[#E4DFD5]"
              }`}
            >
              Transit 11 Hasil
            </button>
          </div>
        </header>

        {activeTab === "card" && (
          <div className="space-y-4">
            <div className="p-3 bg-white rounded-xl border border-[#E4DFD5] text-xs">
              <span className="font-semibold text-[#4A5849]">Petunjuk Pengujian:</span> Klik tombol{" "}
              <strong>&quot;Buka Langit & Transit Lengkap&quot;</strong> di bawah untuk membuka modal verifikasi.
            </div>
            <AstroTodayCard context={fixtureContext} />
          </div>
        )}

        {activeTab === "moons" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {moonTestCases.map((m) => {
              const illum = getMoonIllumination(m.angle);
              return (
                <div
                  key={m.label}
                  id={`moon-test-${m.angle}`}
                  className="p-5 rounded-2xl bg-white border border-[#E4DFD5] flex flex-col items-center text-center space-y-3 shadow-xs"
                >
                  <CelestialMoon
                    phaseAngle={m.angle}
                    illuminationFraction={illum.fraction}
                    isWaxing={illum.isWaxing}
                    size={100}
                    showAmbientGlow={true}
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-[#2D352E]">{m.label}</h3>
                    <p className="text-[11px] text-[#5F6B5E]">{m.desc}</p>
                    <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#E5EBE3] text-[#4A5849]">
                      Iluminasi: {(illum.fraction * 100).toFixed(1)}% · {illum.isWaxing ? "Waxing" : "Waning"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "transit-6" && (
          <div id="transit-6-container" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-serif font-medium text-[#2D352E]">
                Transit & Aspek Aktif (6 Hasil)
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E5EBE3] text-[#4A5849] font-medium">
                6 peristiwa / grup aktif
              </span>
            </div>
            <div className="space-y-3">
              {mock6Events.map((evt) => (
                <div key={evt.body} className="p-4 rounded-2xl bg-white border border-[#E4DFD5] shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#2D352E]">{evt.body} di {evt.sign}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F2EFE8] text-[#4A5849] font-medium">
                      {evt.isRetrograde ? "Retrograde (Rx)" : "Direct"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {evt.aspects.map((asp) => (
                      <span key={asp} className="text-[10px] px-2 py-0.5 rounded-md bg-[#F7F4EE] text-[#4A5849]">
                        {asp}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "transit-11" && (
          <div id="transit-11-container" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-serif font-medium text-[#2D352E]">
                Transit & Aspek Aktif (11 Hasil)
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E5EBE3] text-[#4A5849] font-medium">
                11 peristiwa / grup aktif
              </span>
            </div>
            <div className="space-y-3">
              {mock11Events.map((evt) => (
                <div key={evt.body} className="p-4 rounded-2xl bg-white border border-[#E4DFD5] shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#2D352E]">{evt.body} di {evt.sign}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F2EFE8] text-[#4A5849] font-medium">
                      {evt.isRetrograde ? "Retrograde (Rx)" : "Direct"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {evt.aspects.map((asp) => (
                      <span key={asp} className="text-[10px] px-2 py-0.5 rounded-md bg-[#F7F4EE] text-[#4A5849]">
                        {asp}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
