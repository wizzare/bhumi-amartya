"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Sparkles } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { storageProvider } from "@/lib/storage/storageProvider";
import { BlueprintDetailV1, createBlueprintDetail } from "@/lib/profile/echo";
import { calculateBhumiMatrix } from "@/lib/engines/calculateBhumiMatrix";
import { buildDestinyMatrixVisualModel, type DestinyMatrixVisualModel } from "@/lib/visual/destinyMatrixVisualModel";

function DataGroup({ title, values }: { title: string; values: Record<string, string> }) {
  return (
    <section className="rounded-[2rem] border border-[#E8E9E5] bg-white p-7 shadow-sm">
      <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9AA394]">{title}</p>
      <div className="space-y-1">
        {Object.entries(values).map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-5 border-b border-[#E8E9E5] py-3 last:border-0">
            <p className="text-xs font-bold uppercase tracking-wider text-[#7B8776]">{label}</p>
            <p className="text-right text-sm font-semibold text-[#4F5E52]">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function BlueprintPage() {
  const [detail, setDetail] = useState<BlueprintDetailV1 | null>(null);
  const [matrix, setMatrix] = useState<DestinyMatrixVisualModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const blueprint = await storageProvider.getUserBlueprint();
        if (blueprint) {
          setDetail(createBlueprintDetail(blueprint));
          const source = blueprint as unknown as { input?: { birthDate?: string } };
          if (source.input?.birthDate) {
            setMatrix(buildDestinyMatrixVisualModel(calculateBhumiMatrix(source.input.birthDate)));
          }
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const core: Record<string, string> = detail ? {
    "Life Path": detail.coreIdentity.lifePath,
    "Arcana Center": matrix?.center.values[0]?.toString() || "Coming Soon",
    "Sun Sign": detail.coreIdentity.sunSign,
    "Human Design Type": detail.coreIdentity.humanDesignType,
  } : {};
  const matrixValues: Record<string, string> = matrix ? {
    "Arcana Center": matrix.center.values.join(" · "),
    "Soul Searching": "Coming Soon",
    "Socialization": matrix.socialization.values.join(" · "),
    "Spiritual Knowledge": "Coming Soon",
  } : {};

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />
        <div className="mx-auto max-w-lg">
          <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#7B8776]"><ArrowLeft size={16} />Kembali ke Profil</Link>
          <header className="mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F5E52] text-white"><Compass size={25} /></div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9AA394]">Blueprint</p>
            <h1 className="mt-2 text-4xl font-serif text-[#4F5E52]">Peta Dasar Dirimu</h1>
            <p className="mt-3 leading-7 text-[#7B8776]">Halaman ini menampilkan data sistem yang menjadi bahan sintesis Profile Echo.</p>
          </header>

          {loading ? <p className="text-center text-[#7B8776]">Membuka blueprint...</p> : detail ? (
            <div className="space-y-5">
              <DataGroup title="Core Identity" values={core} />
              <DataGroup title="Human Design" values={detail.humanDesign} />
              <DataGroup title="Natal Chart" values={detail.natalChart} />
              <DataGroup title="Destiny Matrix" values={matrixValues} />
              <div className="flex items-center gap-2 rounded-2xl bg-[#F5F1E8] p-4 text-xs leading-5 text-[#7B8776]"><Sparkles size={15} />Data ini tidak menggantikan makna dan refleksi yang ada di Profile Echo.</div>
            </div>
          ) : <p className="text-center text-[#7B8776]">Blueprint belum tersedia.</p>}
        </div>
      </main>
    </ProtectedRoute>
  );
}
