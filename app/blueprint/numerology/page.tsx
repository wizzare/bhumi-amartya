"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Sparkles } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { storageProvider } from "@/lib/storage/storageProvider";
import { Blueprint } from "@/lib/types/blueprint";
import { useAuth } from "@/context/AuthContext";
import { calculateNumerology } from "@/lib/calculations/calculateNumerology";
import { calculateBirthDayNumber, calculatePersonalYear } from "@/lib/calculations/calculateLifePath";
import { buildNumerologyPresentation } from "@/lib/numerology/presentation";

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

  const presentation = useMemo(() => buildNumerologyPresentation({
    lifePath: finalLifePath === undefined ? undefined : Number(finalLifePath),
    expression: finalExpression === undefined ? undefined : Number(finalExpression),
    soulUrge: finalSoulUrge === undefined ? undefined : Number(finalSoulUrge),
    personality: finalPersonality === undefined ? undefined : Number(finalPersonality),
    birthday: finalBirthDay === undefined ? undefined : Number(finalBirthDay),
    personalYear: finalPersonalYear === undefined ? undefined : Number(finalPersonalYear),
  }), [finalLifePath, finalExpression, finalSoulUrge, finalPersonality, finalBirthDay, finalPersonalYear]);

  const cards = presentation.sections.filter((section) => section.availabilityStatus === "available");

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
                {cards.map((card) => (
                  <div key={card.sectionId} className="rounded-2xl border border-[#E8E1D3] bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                          <Compass size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-wider text-[#9AA394]">{card.label}</h3>
                          <p className="text-2xl font-serif font-bold text-[#4F5E52]">{card.displayValue || "-"}</p>
                        </div>
                      </div>
                    </div>
                    {card.shortExplanation && (
                      <div className="mt-4 border-t border-[#F5F1E8] pt-4">
                        <p className="text-sm leading-relaxed text-[#7B8776]">{card.shortExplanation}</p>
                        {card.fullExplanation && <details className="mt-3"><summary className="cursor-pointer text-xs font-semibold text-[#4F5E52]">Lihat detail selengkapnya</summary><p className="mt-3 text-sm leading-relaxed text-[#7B8776]">{card.fullExplanation}</p></details>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Kesimpulan */}
              <div className="mt-10 rounded-2xl bg-[#4F5E52] p-6 text-white shadow-md">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-[#D4AF37]" />
                  <h2 className="text-lg font-bold">Kesimpulan Dirimu</h2>
                </div>
                <div className="space-y-4 text-sm leading-relaxed text-[#D2D8D0]">
                  {presentation.identity.summary.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </div>

            </div>
          ) : <p className="text-center text-[#7B8776]">Data belum tersedia.</p>}
        </div>
      </main>
    </ProtectedRoute>
  );
}
