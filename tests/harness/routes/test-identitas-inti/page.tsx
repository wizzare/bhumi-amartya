"use client";

import React, { useState } from "react";
import { CoreIdentity } from "@/components/dashboard/CoreIdentity";
import type { HumanDesignChart } from "@/lib/humandesign/types";

// User A Fixture (Standard Founder/User)
const userAFixture = {
  uid: "user-alpha-001",
  lifePath: 4,
  lifePathRole: "Pembangun",
  sunSign: "Taurus",
  arcanaCenter: 8,
  humanDesign: {
    type: "Manifesting Generator",
    status: "ready",
    source: "gaia-server",
    calculationQuality: "canonical",
    hdEngineVersion: "gaia-hd-v1",
  } as unknown as Partial<HumanDesignChart>,
};

// User B Fixture (Distinct User)
const userBFixture = {
  uid: "user-beta-002",
  lifePath: 7,
  lifePathRole: "Pencari Kebenaran",
  sunSign: "Scorpio",
  arcanaCenter: 16,
  humanDesign: {
    type: "Projector",
    status: "ready",
    source: "gaia-server",
    calculationQuality: "canonical",
    hdEngineVersion: "gaia-hd-v1",
  } as unknown as Partial<HumanDesignChart>,
};

// User C Fixture (Saved Historical Result with Service Unavailable)
const userCSavedUnavailableFixture = {
  uid: "user-gamma-003",
  lifePath: 11,
  lifePathRole: "Inspirator",
  sunSign: "Leo",
  arcanaCenter: 21,
  humanDesign: {
    type: "Generator",
    status: "retriable_error",
    calculationStatus: "service_unavailable",
    source: "historical",
    calculationQuality: "historical",
    hdEngineVersion: "gaia-hd-legacy",
  } as unknown as Partial<HumanDesignChart>,
};

// User D Fixture (No Saved Result + Service Unavailable)
const userDNoSavedUnavailableFixture = {
  uid: "user-delta-004",
  lifePath: 9,
  lifePathRole: "Humanitarian",
  sunSign: "Pisces",
  arcanaCenter: 9,
  humanDesign: {
    status: "retriable_error",
    calculationStatus: "service_unavailable",
    source: "error",
    type: null,
  } as unknown as Partial<HumanDesignChart>,
};

// User E Fixture (Malformed / Partial Data)
const userEMalformedFixture = {
  uid: "user-epsilon-005",
  lifePath: 0,
  lifePathRole: "",
  sunSign: "",
  arcanaCenter: 0,
  humanDesign: {
    corrupted: true,
    foo: "bar",
  } as unknown as Partial<HumanDesignChart>,
};

// Old Component implementation for Before-After comparison screenshot
const OldStat = ({ label, value, subValue, fallback = "Belum tersedia" }: { label: string; value?: string | number; subValue?: string; fallback?: string }) => (
  <div className="flex flex-col items-center justify-center p-3 min-h-[110px] border border-[#E8E9E5]/60 rounded-3xl bg-white overflow-hidden shadow-sm">
    <p className="text-base sm:text-lg font-bold text-[#4F6658] leading-tight text-center w-full break-words">
      {value || fallback}
    </p>
    {subValue && <p className="text-[10px] text-[#3C3C3C] mt-1.5 text-center leading-tight font-semibold opacity-80">{subValue}</p>}
    <p className="text-[9px] text-[#7B8776] mt-auto pt-3 text-center uppercase tracking-[0.15em] font-bold">{label}</p>
  </div>
);

const OldCoreIdentity = () => (
  <div id="before-container" className="mt-8 bhumi-card p-6 bg-[#FCFAF5]/50 shadow-none border-dashed border-2 border-[#E8E9E5]">
    <h2 className="text-center text-[10px] font-bold text-[#7B8776] mb-5 uppercase tracking-[0.25em]">
      IDENTITAS INTI
    </h2>
    <div className="grid grid-cols-2 gap-4">
      <OldStat label="LIFE PATH" value={4} subValue="Pembangun" />
      <OldStat label="ZODIAK MATAHARI" value="Taurus" />
      <OldStat label="PUSAT ARCANA" value={8} />
      <OldStat label="HUMAN DESIGN" value="ManGen" />
      <p role="status" className="col-span-1 text-xs text-red-700 bg-red-50 p-2 rounded-lg">
        Layanan belum tersedia. Chart tersimpan tetap dipertahankan.
      </p>
    </div>
  </div>
);

export default function TestIdentitasIntiPage() {
  const [activeUser, setActiveUser] = useState<"A" | "B" | "C" | "D" | "E">("A");
  const [loading, setLoading] = useState(false);
  const [showBefore, setShowBefore] = useState(false);

  const getActiveFixture = () => {
    switch (activeUser) {
      case "A":
        return userAFixture;
      case "B":
        return userBFixture;
      case "C":
        return userCSavedUnavailableFixture;
      case "D":
        return userDNoSavedUnavailableFixture;
      case "E":
        return userEMalformedFixture;
    }
  };

  const fixture = getActiveFixture();

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#2D352E] p-4 sm:p-8 max-w-2xl mx-auto">
      {/* Test Controls Panel */}
      <div className="bg-white rounded-2xl p-4 mb-6 border border-[#E8E9E5] shadow-sm">
        <h1 className="text-sm font-bold uppercase tracking-wider text-[#5F6B5E] mb-3">
          Bhumi Amartya — Test Harness: Identitas Inti
        </h1>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            data-testid="btn-user-a"
            onClick={() => { setActiveUser("A"); setShowBefore(false); }}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
              activeUser === "A" && !showBefore ? "bg-[#4F6658] text-white" : "bg-[#F0EDE6] text-[#2D352E]"
            }`}
          >
            User A (Taurus/4/ManGen)
          </button>
          <button
            data-testid="btn-user-b"
            onClick={() => { setActiveUser("B"); setShowBefore(false); }}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
              activeUser === "B" && !showBefore ? "bg-[#4F6658] text-white" : "bg-[#F0EDE6] text-[#2D352E]"
            }`}
          >
            User B (Scorpio/7/Projector)
          </button>
          <button
            data-testid="btn-user-c"
            onClick={() => { setActiveUser("C"); setShowBefore(false); }}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
              activeUser === "C" && !showBefore ? "bg-[#4F6658] text-white" : "bg-[#F0EDE6] text-[#2D352E]"
            }`}
          >
            User C (Saved HD + Service Down)
          </button>
          <button
            data-testid="btn-user-d"
            onClick={() => { setActiveUser("D"); setShowBefore(false); }}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
              activeUser === "D" && !showBefore ? "bg-[#4F6658] text-white" : "bg-[#F0EDE6] text-[#2D352E]"
            }`}
          >
            User D (No Saved HD + Service Down)
          </button>
          <button
            data-testid="btn-user-e"
            onClick={() => { setActiveUser("E"); setShowBefore(false); }}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
              activeUser === "E" && !showBefore ? "bg-[#4F6658] text-white" : "bg-[#F0EDE6] text-[#2D352E]"
            }`}
          >
            User E (Malformed/Zero)
          </button>
          <button
            data-testid="btn-toggle-loading"
            onClick={() => setLoading(!loading)}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium border border-[#4F6658] ${
              loading ? "bg-[#4F6658] text-white" : "text-[#4F6658]"
            }`}
          >
            {loading ? "Matikan Loading" : "Nyalakan Loading"}
          </button>
          <button
            data-testid="btn-toggle-before"
            onClick={() => setShowBefore(!showBefore)}
            className={`px-3 py-1.5 text-xs rounded-xl font-medium border border-amber-600 ${
              showBefore ? "bg-amber-600 text-white" : "text-amber-700 bg-amber-50"
            }`}
          >
            {showBefore ? "Tampilkan Desain Baru (AFTER)" : "Tampilkan Desain Lama (BEFORE)"}
          </button>
        </div>
        <p className="text-[11px] text-[#5F6B5E]">
          Active UID: <strong data-testid="active-uid">{fixture.uid}</strong> | Mode:{" "}
          <span data-testid="active-scenario">
            {showBefore ? "BEFORE_LEGACY" : loading ? "LOADING" : `SCENARIO_${activeUser}`}
          </span>
        </p>
      </div>

      {/* Main Tested Component */}
      {showBefore ? (
        <div id="before-comparison-container" className="bg-[#FAF8F5] p-4 sm:p-6 rounded-[28px] border border-[#E8E9E5]/60 shadow-sm">
          <OldCoreIdentity />
        </div>
      ) : (
        <div id="identitas-inti-container" className="bg-[#FAF8F5] p-4 sm:p-6 rounded-[28px] border border-[#E8E9E5]/60 shadow-sm">
          <CoreIdentity
            lifePath={fixture.lifePath}
            lifePathRole={fixture.lifePathRole}
            arcanaCenter={fixture.arcanaCenter}
            sunSign={fixture.sunSign}
            humanDesign={fixture.humanDesign}
            subtitle="Empat perspektif tentang dirimu"
            loading={loading}
            uid={fixture.uid}
            labels={{
              title: "Identitas Inti",
              lifePath: "Life Path",
              arcanaCenter: "Pusat Arcana",
              sunSign: "Zodiak Matahari",
              humanDesign: "Human Design",
              humanDesignPending: "Menghitung...",
              unavailable: "Belum tersedia",
              calculatingInProgress: "Sedang diproses",
              cannotCalculate: "Data belum dihitung",
            }}
          />
        </div>
      )}
    </div>
  );
}
