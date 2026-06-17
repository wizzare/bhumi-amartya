"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Sparkles } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import { storageProvider } from "@/lib/storage/storageProvider";
import { synthesizeGaiaProfile } from "@/lib/profile/gaia/synthesisEngine";
import { getVisibleGaiaInsights } from "@/lib/profile/gaia/selectors";
import { GAIA_SECTION_PRESENTATION, isGaiaTheme } from "@/lib/profile/gaia/presentation";
import type { GaiaInsight, GaiaProfile } from "@/lib/profile/gaia/types";
import { isCompleteGaiaWarehouse } from "@/lib/profile/gaia/validation";

export default function ProfileSectionClient({ section }: { section: string }) {
  const [insights, setInsights] = useState<GaiaInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = isGaiaTheme(section) ? section : null;

  useEffect(() => {
    async function load() {
      try {
        if (!theme) return;
        const [profile, blueprint] = await Promise.all([storageProvider.getUserProfile(), storageProvider.getUserBlueprint()]);
        const stored = (profile as unknown as { gaiaProfile?: GaiaProfile } | null)?.gaiaProfile;
        const gaia = isCompleteGaiaWarehouse(stored)
          ? stored
          : blueprint ? synthesizeGaiaProfile(blueprint) : null;
        if (gaia) setInsights(getVisibleGaiaInsights(gaia, theme));
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [theme]);

  const presentation = theme ? GAIA_SECTION_PRESENTATION[theme] : null;
  const Icon = presentation?.icon ?? Sparkles;

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />
        <div className="mx-auto max-w-lg">
          <BhumiPageHeader className="mb-8" />
          <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#7B8776]"><ArrowLeft size={16} />Kembali ke Profil</Link>
          {presentation && <header className="mb-8 text-center"><div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${presentation.color}`}><Icon size={28} /></div><h1 className="text-3xl font-serif text-[#4F5E52]">{presentation.title}</h1><p className="mt-3 text-sm leading-6 text-[#7B8776]">{presentation.subtitle}</p></header>}
          {loading ? <p className="text-center text-[#7B8776]">Membuka bagian ini...</p> : insights.length ? (
            <div className="space-y-3">{insights.map((insight) => <Link key={insight.id} href={`/profile/${section}/${insight.id}`} className="bhumi-card flex items-center justify-between bg-white p-5 transition-transform active:scale-[0.98]"><div className="flex min-w-0 items-center gap-4"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${presentation?.color ?? "bg-[#F5F1E8] text-[#4F5E52]"}`}><Sparkles size={19} /></div><div className="min-w-0"><h2 className="text-sm font-bold text-[#4F5E52]">{insight.title}</h2><p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#8A9489]">{insight.summary}</p></div></div><ChevronRight size={18} className="shrink-0 text-[#9AA394]" /></Link>)}</div>
          ) : <p className="text-center text-[#7B8776]">Bagian ini belum tersedia.</p>}
        </div>
      </main>
    </ProtectedRoute>
  );
}
