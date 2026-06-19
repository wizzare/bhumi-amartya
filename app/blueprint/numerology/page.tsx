"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Sparkles, User, Heart, Brain, Calendar, Target, Globe } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { storageProvider } from "@/lib/storage/storageProvider";
import { Blueprint } from "@/lib/types/blueprint";
import { useAuth } from "@/context/AuthContext";
import { AuditSection } from "../components/AuditSection";
import { calculateNumerology } from "@/lib/calculations/calculateNumerology";
import { calculateBirthDayNumber, calculatePersonalYear } from "@/lib/calculations/calculateLifePath";
import { 
  lifePathData, 
  birthDayData, 
  personalYearData, 
  expressionData, 
  soulUrgeData, 
  personalityData 
} from "@/lib/data/numerology";

export default function NumerologyPage() {
  const auth = useAuth();
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const bp = await storageProvider.getUserBlueprint();
        if (bp) setBlueprint(bp as any);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const isFounder = auth?.userProfile?.guardianRole === "founder" || auth?.userProfile?.role === "founder" || auth?.userProfile?.isDeveloper === true;

  const numerology = (blueprint?.numerology as any) || {};
  const core = (blueprint?.lifePath as any) || {}; 
  const source = Object.keys(numerology).length > 0 ? numerology : core;

  // Derive missing values if possible
  const derived = useMemo(() => {
    if (!auth?.userProfile?.birthDate || !auth?.userProfile?.fullName) return null;
    return calculateNumerology(auth.userProfile.fullName, auth.userProfile.birthDate);
  }, [auth?.userProfile]);

  const birthDate = auth?.userProfile?.birthDate;
  const derivedBirthDay = birthDate ? calculateBirthDayNumber(birthDate) : undefined;
  const derivedPersonalYear = birthDate ? calculatePersonalYear(birthDate) : undefined;

  const getVal = (key: string, derivedKey?: string) => source[key] !== undefined ? source[key] : (derived ? (derived as any)[derivedKey || key] : undefined);

  const finalLifePath = source.number || source.lifePath || getVal("lifePath");
  const finalBirthDay = source.birthDay || derivedBirthDay;
  const finalPersonalYear = source.personalYear || derivedPersonalYear;
  const finalExpression = getVal("expression");
  const finalSoulUrge = getVal("soulUrge");
  const finalPersonality = getVal("personality");

  const meaningLifePath = finalLifePath ? (lifePathData as any)[finalLifePath]?.role : undefined;
  const meaningBirthDay = finalBirthDay ? (birthDayData as any)[finalBirthDay] : undefined;
  const meaningPersonalYear = finalPersonalYear ? (personalYearData as any)[finalPersonalYear] : undefined;
  const meaningExpression = finalExpression ? (expressionData as any)[finalExpression] : undefined;
  const meaningSoulUrge = finalSoulUrge ? (soulUrgeData as any)[finalSoulUrge] : undefined;
  const meaningPersonality = finalPersonality ? (personalityData as any)[finalPersonality] : undefined;

  // For Founder Debug Only
  const debugFields = [
    { label: "Life Path Number", value: finalLifePath, sourcePath: "numerology.number" },
    { label: "Life Path Meaning", value: meaningLifePath, sourcePath: "numerology.role" },
    { label: "Birth Day Number", value: finalBirthDay, sourcePath: "numerology.birthDay" },
    { label: "Birth Day Meaning", value: meaningBirthDay, sourcePath: "" },
    { label: "Personal Year", value: finalPersonalYear, sourcePath: "numerology.personalYear" },
    { label: "Personal Year Meaning", value: meaningPersonalYear, sourcePath: "" },
    { label: "Expression Number", value: finalExpression, sourcePath: "numerology.expression" },
    { label: "Expression Meaning", value: meaningExpression, sourcePath: "" },
    { label: "Soul Urge Number", value: finalSoulUrge, sourcePath: "numerology.soulUrge" },
    { label: "Soul Urge Meaning", value: meaningSoulUrge, sourcePath: "" },
    { label: "Personality Number", value: finalPersonality, sourcePath: "numerology.personality" },
    { label: "Personality Meaning", value: meaningPersonality, sourcePath: "" },
  ];

  const cards = [
    { title: "Life Path", num: finalLifePath, text: meaningLifePath, icon: Compass, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Birth Day", num: finalBirthDay, text: meaningBirthDay, icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Expression", num: finalExpression, text: meaningExpression, icon: Globe, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Soul Urge", num: finalSoulUrge, text: meaningSoulUrge, icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
    { title: "Personality", num: finalPersonality, text: meaningPersonality, icon: User, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Personal Year", num: finalPersonalYear, text: meaningPersonalYear, icon: Calendar, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />
        <div className="mx-auto max-w-lg">
          <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#7B8776]"><ArrowLeft size={16} />Kembali ke Profil</Link>
          <header className="mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F5E52] text-white"><Compass size={25} /></div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9AA394]">Numerology</p>
            <h1 className="mt-2 text-4xl font-serif text-[#4F5E52]">Jalan Jiwamu</h1>
            <p className="mt-3 leading-7 text-[#7B8776]">Enam pilar utama numerologi yang mengungkap tujuan, dorongan, dan potensimu.</p>
          </header>

          {loading ? <p className="text-center text-[#7B8776]">Membuka data...</p> : blueprint ? (
            <div className="space-y-6">
              
              {/* User View Cards */}
              <div className="grid gap-4">
                {cards.map((card, idx) => (
                  <div key={idx} className="rounded-2xl border border-[#E8E1D3] bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg} ${card.color}`}>
                          <card.icon size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-wider text-[#9AA394]">{card.title}</h3>
                          <p className="text-2xl font-serif font-bold text-[#4F5E52]">{card.num || "-"}</p>
                        </div>
                      </div>
                    </div>
                    {card.text && (
                      <div className="mt-4 border-t border-[#F5F1E8] pt-4">
                        <p className="text-sm leading-relaxed text-[#7B8776]">{card.text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Kesimpulan */}
              <div className="mt-10 rounded-2xl bg-[#4F5E52] p-6 text-white shadow-md">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-[#D4AF37]" />
                  <h2 className="text-lg font-bold">Kesimpulan Numerologi</h2>
                </div>
                <div className="space-y-4 text-sm leading-relaxed text-[#D2D8D0]">
                  {finalLifePath && <p><strong className="text-white">Arah Jiwamu (Life Path {finalLifePath}):</strong> Perjalanan utamamu adalah menjadi <strong>{meaningLifePath?.toLowerCase()}</strong>. Ini adalah misi terbesar dalam hidupmu.</p>}
                  {finalExpression && <p><strong className="text-white">Cara Bakat Muncul (Birth Day {finalBirthDay} & Expression {finalExpression}):</strong> Kamu mengekspresikan diri secara unik, di mana bakat alamimu ({finalBirthDay}) bersinergi untuk <strong>{meaningExpression?.toLowerCase().replace("mengekspresikan diri melalui ", "").replace("bakat ", "")}</strong>.</p>}
                  {finalSoulUrge && <p><strong className="text-white">Dorongan Batin (Soul Urge {finalSoulUrge}):</strong> Jauh di dalam lubuk hati, kamu digerakkan oleh <strong>{meaningSoulUrge?.toLowerCase().replace("dorongan batin untuk ", "").replace("kebutuhan jiwa akan ", "").replace("dorongan jiwa untuk ", "").replace("dorongan batin yang ", "").replace("kebutuhan jiwa untuk ", "").replace("kebutuhan mendalam untuk ", "").replace("kebutuhan untuk ", "")}</strong>.</p>}
                  {finalPersonality && <p><strong className="text-white">Cara Dunia Melihatmu (Personality {finalPersonality}):</strong> Orang lain cenderung melihatmu sebagai <strong>{meaningPersonality?.toLowerCase().replace("terlihat sebagai ", "").replace("dianggap sebagai ", "").replace("dilihat sebagai ", "").replace("terkesan ", "").replace("memancarkan ", "").replace("terlihat ", "")}</strong>.</p>}
                  {finalPersonalYear && <p><strong className="text-white">Fase Saat Ini (Personal Year {finalPersonalYear}):</strong> Tahun ini adalah momen yang tepat untuk <strong>{meaningPersonalYear?.toLowerCase().replace("tahun awal yang ", "").replace("tahun kemitraan dan ", "").replace("tahun ekspresi diri dan ", "").replace("tahun kerja keras dan ", "").replace("tahun perubahan dan ", "").replace("tahun tanggung jawab dan ", "").replace("tahun evaluasi diri dan ", "").replace("tahun panen dan ", "").replace("tahun penyelesaian dan ", "").replace("tahun pencerahan ", "").replace("tahun perwujudan ", "").replace("tahun pelayanan ", "").split(".")[0]}</strong>. {meaningPersonalYear?.split(". ")[1] || ""}</p>}
                </div>
              </div>

              {/* Founder Debug */}
              {isFounder && (
                <div className="mt-12 pt-8 border-t border-dashed border-[#E8E1D3]">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#9AA394]">Audit & Debug (Founder Only)</h3>
                  <AuditSection title="Numerology Data" fields={debugFields} isFounder={true} />
                </div>
              )}

            </div>
          ) : <p className="text-center text-[#7B8776]">Data belum tersedia.</p>}
        </div>
      </main>
    </ProtectedRoute>
  );
}
