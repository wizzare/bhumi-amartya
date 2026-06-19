"use client";

import React from "react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Flower2, ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics/usageAnalytics";
import { useAuth } from "@/context/AuthContext";
import { YOGA_DATABASE } from "@/lib/data/innerworkContent";
import { activityRepository } from "@/lib/repositories/activityRepository";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { InnerworkCelebration } from "@/components/ui/InnerworkCelebration";
import { GuidedLearningDetails } from "@/components/ui/GuidedLearningDetails";
import { getZoneBGuide, readZoneBContext, saveZoneBJourneyContext, type ZoneBContext } from "@/lib/innerwork/zoneBContext";

export default function YogaPage() {
  const auth = useAuth();
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [reflectionResult, setReflectionResult] = React.useState("");
  const zoneBSearch = React.useSyncExternalStore(
    () => () => {},
    () => window.location.search,
    () => "",
  );
  const zoneBContext = React.useMemo<ZoneBContext | null>(
    () => readZoneBContext(zoneBSearch),
    [zoneBSearch],
  );

  React.useEffect(() => {
    trackEvent("open_yoga", auth?.user?.uid);
  }, [auth?.user?.uid]);

  const toggleSelection = (id: string) => {
    if (saved) return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveAll = async () => {
    if (selectedIds.size === 0 || !auth?.user?.uid || saving) return;

    const uid = auth.user.uid;
    setSaving(true);
    try {
      const profile = auth.userProfile;
      const nestedProfile = profile?.profile as { timezone?: string } | undefined;
      const timezone = profile?.timezone || nestedProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const date = getLocalDateKey(new Date(), timezone);

      const savePromises = Array.from(selectedIds).map(id => {
        const activity = YOGA_DATABASE[id];
        return activityRepository.completeActivity({
          uid,
          date,
          activity: {
            id: `yoga-${id}-${Date.now()}`,
            category: "yoga",
            contentId: id,
            title: activity.title,
            duration: activity.durationMinutes,
            sourceVersion: "1.0",
          }
        });
      });

      await Promise.all(savePromises);
      for (const id of selectedIds) {
        const activity = YOGA_DATABASE[id] ?? activities.find((item) => item.id === id);
        const context = zoneBContext ?? {
          issue: "general_innerwork",
          practiceId: id,
          practiceCategory: "yoga" as const,
          sourceTheme: "yoga learning",
          title: activity.title,
          durationMinutes: activity.durationMinutes,
        };
        await saveZoneBJourneyContext({ uid, date, context, reflectionResult: reflectionResult || "Belum Yakin" });
      }
      trackEvent("complete_yoga", uid);
      setSaved(true);
    } catch (err) {
      console.error("[YOGA_SAVE_ERROR]", err);
    } finally {
      setSaving(false);
    }
  };

  const lockedGuide = zoneBContext ? getZoneBGuide(zoneBContext) : null;
  const activities = lockedGuide
    ? [{
        id: zoneBContext!.practiceId,
        title: lockedGuide.title,
        description: lockedGuide.description,
        instruction: lockedGuide.steps,
        benefits: lockedGuide.benefits,
        durationMinutes: lockedGuide.durationMinutes,
      }]
    : Object.values(YOGA_DATABASE);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />

        <div className="mx-auto max-w-lg">
          <Link href="/innerwork" className="flex items-center gap-2 text-[#7B8776] mb-6 hover:text-[#4F5E52] transition-colors">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Kembali ke Hub</span>
          </Link>

          <header className="mb-8">
            <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-6">
              <Flower2 size={32} />
            </div>
            <h1 className="text-3xl font-serif text-[#4F5E52] mb-2">Yoga</h1>
            <p className="text-[#7B8776]">Penyelarasan tubuh dan napas untuk ketenangan batin.</p>
          </header>

          <div className="mb-8 p-4 rounded-2xl bg-white border border-[#E8E9E5] shadow-sm">
            <p className="text-[11px] text-[#7B8776] leading-relaxed italic text-center">
              Aktivitas ini bersifat opsional dan bukan syarat untuk melanjutkan perjalananmu di Bhumi.
            </p>
          </div>

          <div className="space-y-6">
            {activities.map((activity) => (
              <section
                key={activity.id}
                className={`bhumi-card p-6 transition-all duration-300 border-2 cursor-pointer ${selectedIds.has(activity.id) ? 'bg-green-50/30 border-green-200 shadow-md' : 'bg-white border-transparent'}`}
                onClick={() => toggleSelection(activity.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#4F5E52]">{activity.title}</h2>
                    <div className="flex items-center gap-2 mt-1 text-[#9AA394]">
                      <Clock size={14} />
                      <span className="text-xs font-medium">{activity.durationMinutes} menit</span>
                    </div>
                  </div>
                  <div className={`p-2 rounded-full transition-colors ${selectedIds.has(activity.id) ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-300'}`}>
                    <CheckCircle2 size={24} />
                  </div>
                </div>

                <GuidedLearningDetails
                  title={activity.title}
                  description={activity.description}
                  benefits={activity.benefits}
                  steps={activity.instruction}
                  duration={`${activity.durationMinutes} menit`}
                  googleSearchPhrase={`${activity.title} yoga pose step by step`}
                  youtubeSearchPhrase={`${activity.title} beginner yoga tutorial`}
                  accentClass="bg-green-50 text-green-600"
                />
              </section>
            ))}
          </div>

          <div className="mt-12">
            {zoneBContext && (
              <div className="mb-6">
                <p className="mb-3 text-center text-sm font-medium text-[#4F5E52]">Bagaimana keadaanmu setelah praktik?</p>
                <div className="grid grid-cols-2 gap-2">
                  {["Lebih Tenang", "Sama Saja", "Sedikit Lebih Berat", "Belum Yakin"].map((result) => (
                    <button
                      key={result}
                      type="button"
                      onClick={() => setReflectionResult(result)}
                      className={`rounded-xl border p-3 text-xs font-semibold ${reflectionResult === result ? "border-green-600 bg-green-50 text-green-700" : "border-[#E8E9E5] bg-white text-[#7B8776]"}`}
                    >
                      {result}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="mb-4 text-[10px] text-[#7B8776] font-bold uppercase tracking-wider text-center">
              Klik save hanya jika kamu sudah melakukan.
            </p>
            <button
              onClick={handleSaveAll}
              disabled={selectedIds.size === 0 || saving || saved || Boolean(zoneBContext && !reflectionResult)}
              className={`w-full py-5 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all shadow-lg active:scale-[0.98] ${saved ? 'bg-emerald-600 text-white' : selectedIds.size > 0 ? 'bg-[#4F5E52] text-white hover:bg-[#3D4A3F]' : 'bg-[#E8E9E5] text-[#9AA394] cursor-not-allowed'}`}
            >
              {saved ? 'Selesai ✨' : saving ? 'Menyimpan...' : 'Save'}
            </button>
          </div>
        </div>
      </main>
      <InnerworkCelebration isOpen={saved} />
    </ProtectedRoute>
  );
}
