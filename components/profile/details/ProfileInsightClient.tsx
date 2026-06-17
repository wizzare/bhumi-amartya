"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import { storageProvider } from "@/lib/storage/storageProvider";
import { synthesizeGaiaProfile } from "@/lib/profile/gaia/synthesisEngine";
import { getVisibleGaiaInsights } from "@/lib/profile/gaia/selectors";
import { GAIA_SECTION_PRESENTATION, isGaiaTheme } from "@/lib/profile/gaia/presentation";
import type { GaiaDataPoint, GaiaInsight, GaiaProfile } from "@/lib/profile/gaia/types";
import { isCompleteGaiaWarehouse } from "@/lib/profile/gaia/validation";

const VISUAL_INSIGHT_IDS = new Set(["chakraProfile", "elementComposition", "physics"]);

function scoredDataPoints(insight: GaiaInsight): GaiaDataPoint[] {
  return insight.dataPoints.filter((point) => typeof point.score === "number" && Number.isFinite(point.score));
}

function barWidth(point: GaiaDataPoint, maxScore: number): string {
  if (typeof point.score !== "number" || !Number.isFinite(point.score) || maxScore <= 0) return "0%";
  return `${Math.max(8, Math.min(100, (point.score / maxScore) * 100))}%`;
}

function scoreTone(point: GaiaDataPoint): string {
  if (point.value) return point.value;
  return "Sedang dibaca";
}

function insightVisualCopy(insight: GaiaInsight, points: GaiaDataPoint[]) {
  const strongest = [...points].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
  const weakest = [...points].sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0];
  const strongestLabel = strongest?.label.toLowerCase() ?? "area utama";
  const weakestLabel = weakest?.label.toLowerCase() ?? "area yang perlu dirawat";

  if (insight.id === "elementComposition") {
    return {
      title: "Komposisi Elemen",
      visualLabel: "Distribusi Elemen",
      meaningTitle: "Makna Per Elemen",
      conclusion: `Komposisi ini paling menonjol pada ${strongestLabel}, sementara ${weakestLabel} meminta dukungan agar ritme diri tidak bergerak dari satu sisi saja.`,
      action: "Seimbangkan elemen dominan dengan praktik kecil yang membumi: rapikan satu prioritas, gerakkan tubuh sebentar, lalu pilih satu respons yang paling tenang.",
      strengthLabel: "Kekuatan",
      challengeLabel: "Imbalance",
      contributionLabel: "Kontribusi",
    };
  }

  if (insight.id === "physics") {
    return {
      title: "Peta Fisik",
      visualLabel: "Indikator Vitalitas Tubuh",
      meaningTitle: "Interpretasi Tubuh",
      conclusion: `Lapisan fisik paling kuat terlihat pada ${strongestLabel}, sementara ${weakestLabel} menjadi area yang paling perlu dijaga ritmenya.`,
      action: "Gunakan pemulihan yang sederhana dan terukur: hidrasi, napas lebih panjang, peregangan ringan, dan jeda sebelum tubuh masuk ke mode memaksa.",
      strengthLabel: "Daya dukung",
      challengeLabel: "Beban tubuh",
      contributionLabel: "Petunjuk praktik",
    };
  }

  return {
    title: "Peta Chakra",
    visualLabel: "Keseimbangan 7 Chakra",
    meaningTitle: "Makna Per Chakra",
    conclusion: `Area paling kuat saat ini terlihat pada ${strongestLabel}, sementara ${weakestLabel} paling meminta perhatian agar energi terasa lebih utuh.`,
    action: "Mulai dari satu praktik tubuh ringan: napas pelan, peregangan lembut, atau jeda singkat sebelum mengambil keputusan penting.",
    strengthLabel: "Kondisi saat stabil",
    challengeLabel: "Tantangan",
    contributionLabel: "Dampak harian",
  };
}

function InsightVisualization({ insight }: { insight: GaiaInsight }) {
  if (!VISUAL_INSIGHT_IDS.has(insight.id)) return null;
  const points = scoredDataPoints(insight);
  if (!points.length) return null;

  const maxScore = Math.max(...points.map((point) => point.score ?? 0));
  const copy = insightVisualCopy(insight, points);
  const showValue = insight.id === "elementComposition";

  return (
    <section className="space-y-4">
      <div className="bhumi-card border-none bg-white p-6 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9AA394]">{copy.visualLabel}</p>
        <div className="mt-5 space-y-4">
          {points.map((point) => (
            <div key={`${insight.id}-${point.label}`} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#4F5E52]">{point.label}</p>
                  <p className="text-xs text-[#8A9384]">{scoreTone(point)}</p>
                </div>
                {showValue && <p className="text-sm font-semibold text-[#6F7B68]">{point.value}</p>}
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#E8E9E5]">
                <div className="h-full rounded-full bg-[#4F5E52]" style={{ width: barWidth(point, maxScore) }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bhumi-card border-none bg-white p-6 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9AA394]">{copy.meaningTitle}</p>
        <div className="mt-4 space-y-4">
          {points.map((point) => (
            <div key={`${insight.id}-${point.label}-meaning`} className="rounded-2xl bg-[#F8F6EF] p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-[#4F5E52]">{point.label}</p>
                <p className="shrink-0 text-xs font-semibold text-[#7B8776]">{scoreTone(point)}</p>
              </div>
              <div className="mt-3 space-y-2 text-sm leading-6 text-[#5E6A61]">
                <p><span className="font-semibold text-[#4F5E52]">{copy.strengthLabel}: </span>{point.meaning}</p>
                <p><span className="font-semibold text-[#4F5E52]">{copy.challengeLabel}: </span>Saat area ini tidak seimbang, tubuh biasanya meminta ritme yang lebih lembut sebelum bergerak lebih jauh.</p>
                <p><span className="font-semibold text-[#4F5E52]">{copy.contributionLabel}: </span>{point.effect}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-[#F5F1E8] p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9AA394]">Kesimpulan</p>
        <p className="mt-3 text-sm leading-7 text-[#4F5E52]">{copy.conclusion}</p>
      </div>

      <div className="rounded-3xl bg-[#EEF1EA] p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A9384]">Aksi Kecil</p>
        <p className="mt-3 text-sm leading-7 text-[#4F5E52]">{copy.action}</p>
      </div>
    </section>
  );
}

export default function ProfileInsightClient({ section, insightId }: { section: string; insightId: string }) {
  const [insight, setInsight] = useState<GaiaInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = isGaiaTheme(section) ? section : null;

  useEffect(() => {
    async function load() {
      try {
        if (!theme) return;
        const [profile, blueprint] = await Promise.all([storageProvider.getUserProfile(), storageProvider.getUserBlueprint()]);
        const stored = (profile as unknown as { gaiaProfile?: GaiaProfile } | null)?.gaiaProfile;
        const generated = blueprint ? synthesizeGaiaProfile(blueprint) : null;
        const gaia = isCompleteGaiaWarehouse(stored)
          ? stored
          : generated;
        const currentInsight = gaia ? getVisibleGaiaInsights(gaia, theme).find((item) => item.id === insightId) ?? null : null;
        const generatedInsight = generated ? getVisibleGaiaInsights(generated, theme).find((item) => item.id === insightId) ?? null : null;
        const needsFreshVisualData = currentInsight && VISUAL_INSIGHT_IDS.has(currentInsight.id) && scoredDataPoints(currentInsight).length === 0 && generatedInsight;
        setInsight(needsFreshVisualData ? generatedInsight : currentInsight);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [insightId, theme]);

  const presentation = theme ? GAIA_SECTION_PRESENTATION[theme] : null;
  const Icon = presentation?.icon;
  const guidanceParagraphs = insight?.guidance[0]?.split(/\n\s*\n/).filter(Boolean) ?? [];

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />
        <div className="mx-auto max-w-lg">
          <BhumiPageHeader className="mb-8" />
          <Link href={theme ? `/profile/${theme}` : "/profile"} className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#7B8776]"><ArrowLeft size={16} />Kembali</Link>
          {loading ? <p className="text-center text-[#7B8776]">Membuka insight...</p> : insight ? (
            <>
              <header className="mb-8 text-center">
                {Icon && <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${presentation?.color}`}><Icon size={28} /></div>}
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9AA394]">{presentation?.title}</p>
                <h1 className="mt-3 text-3xl font-serif text-[#4F5E52]">{insight.title}</h1>
                <p className="mt-3 text-sm leading-6 text-[#7B8776]">{insight.summary}</p>
              </header>
              <article className="space-y-5">
                <InsightVisualization insight={insight} />

                <section className="bhumi-card border-none bg-white p-7 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9AA394]">Penjelasan Personal</p>
                  <p className="mt-4 text-base leading-8 text-[#526057]">{insight.narrative}</p>
                </section>

                <section className="bhumi-card border-none bg-white p-7 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9AA394]">Efek dalam Hidupmu</p>
                  <p className="mt-4 text-sm leading-7 text-[#526057]">{insight.effect}</p>
                </section>

                {guidanceParagraphs.length > 0 && <section className="rounded-3xl bg-[#F5F1E8] p-6"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9AA394]">Saran Praktis</p><div className="mt-3 space-y-4">{guidanceParagraphs.map((paragraph, index) => <p key={index} className="text-sm leading-7 text-[#4F5E52]">{paragraph}</p>)}</div></section>}
              </article>
            </>
          ) : <p className="text-center text-[#7B8776]">Insight ini belum tersedia.</p>}
        </div>
      </main>
    </ProtectedRoute>
  );
}
