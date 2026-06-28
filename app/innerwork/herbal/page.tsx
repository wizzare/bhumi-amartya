"use client";

import React from "react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Utensils, ArrowLeft, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics/usageAnalytics";
import { useAuth } from "@/context/AuthContext";
import { HEALTHY_FOOD_DATABASE } from "@/lib/data/innerworkContent";
import { activityRepository } from "@/lib/repositories/activityRepository";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { InnerworkCelebration } from "@/components/ui/InnerworkCelebration";
import { INNERWORK_VARIATION_LIBRARY } from "@/lib/data/innerworkVariationLibrary";
import { logWellnessSection4Practice } from "@/lib/innerwork/wellnessSection4Logging";

const FOOD_ACTIVITIES = [...Object.values(HEALTHY_FOOD_DATABASE), ...INNERWORK_VARIATION_LIBRARY.healthyFood];
const FOOD_BY_ID = Object.fromEntries(FOOD_ACTIVITIES.map((activity) => [activity.id, activity]));

export default function HealthyFoodPage() {
  const auth = useAuth();
  const auditUser = process.env.NODE_ENV === "development" && typeof window !== "undefined"
    ? window.localStorage.getItem("bhumi_audit_user")
    : null;
  const activeUid = auth?.user?.uid || (auditUser ? `${auditUser}_uid` : "");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    trackEvent("open_healthy_food", auth?.user?.uid);
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
    if (selectedIds.size === 0 || !activeUid || saving) return;

    const uid = activeUid;
    setSaving(true);
    try {
      const profile = auth?.userProfile;
      const nestedProfile = profile?.profile as { timezone?: string } | undefined;
      const timezone = profile?.timezone || nestedProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const date = getLocalDateKey(new Date(), timezone);

      const savePromises = Array.from(selectedIds).map(id => {
        const activity = FOOD_BY_ID[id];
        return activityRepository.completeActivity({
          uid,
          date,
          activity: {
            id: `food-${id}-${Date.now()}`,
            category: "healthyFood",
            contentId: id,
            title: activity.title,
            duration: activity.durationMinutes,
            sourceVersion: "1.0",
          }
        });
      });

      await Promise.all(savePromises);
      for (const id of Array.from(selectedIds)) {
        const activity = FOOD_BY_ID[id];
        await logWellnessSection4Practice({
          uid,
          dateKey: date,
          practiceId: id,
          practiceType: "healthyFood",
          practiceTitle: activity.title,
          durationMinutes: activity.durationMinutes,
        });
      }
      trackEvent("complete_healthy_food", uid);
      setSaved(true);
    } catch (err) {
      console.error("[HEALTHY_FOOD_SAVE_ERROR]", err);
    } finally {
      setSaving(false);
    }
  };

  const activities = FOOD_ACTIVITIES;

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />

        <div className="mx-auto max-w-lg">
          <Link href="/wellness" className="flex items-center gap-2 text-[#7B8776] mb-6 hover:text-[#4F5E52] transition-colors">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Kembali ke Wellness</span>
          </Link>

          <header className="mb-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <Utensils size={32} />
            </div>
            <h1 className="text-3xl font-serif text-[#4F5E52] mb-2">Healthy Food</h1>
            <p className="text-[#7B8776]">Rekomendasi makanan sehat, jamu, dan herbal untuk mendukung tubuhmu.</p>
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
                className={`bhumi-card p-6 transition-all duration-300 border-2 cursor-pointer ${selectedIds.has(activity.id) ? 'bg-emerald-50/30 border-emerald-200 shadow-md' : 'bg-white border-transparent'}`}
                onClick={() => toggleSelection(activity.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#4F5E52]">{activity.title}</h2>
                    <div className="flex items-center gap-2 mt-1 text-[#9AA394]">
                      <Clock size={14} />
                      <span className="text-xs font-medium">{activity.durationMinutes} menit persiapan</span>
                    </div>
                  </div>
                  <div className={`p-2 rounded-full transition-colors ${selectedIds.has(activity.id) ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-300'}`}>
                    <CheckCircle2 size={24} />
                  </div>
                </div>

                <p className="text-[#7B8776] text-sm mb-4">{activity.description}</p>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#9AA394] mb-2">Bahan-bahan</h3>
                    <div className="flex flex-wrap gap-2">
                      {activity.ingredients?.map((item, idx) => (
                        <span key={idx} className="px-3 py-1 bg-[#F5F1E8] text-[#4F5E52] rounded-lg text-xs font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#9AA394] mb-2">Cara Menyiapkan</h3>
                    <ul className="space-y-2">
                      {activity.instruction.map((step, idx) => (
                        <li key={idx} className="text-sm text-[#4F5E52] flex gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#F5F1E8] text-[#9AA394] flex items-center justify-center text-[10px] shrink-0">{idx + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {activity.disclaimer && (
                    <div className="p-3 bg-blue-50/50 rounded-xl flex gap-3">
                      <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-blue-700 leading-relaxed italic">
                        {activity.disclaimer}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12">
            <p className="mb-4 text-[10px] text-[#7B8776] font-bold uppercase tracking-wider text-center">
              Klik save hanya jika kamu sudah melakukan.
            </p>
            <button
              onClick={handleSaveAll}
              disabled={selectedIds.size === 0 || saving || saved}
              className={`w-full py-5 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all shadow-lg active:scale-[0.98] ${saved ? 'bg-emerald-600 text-white' : selectedIds.size > 0 ? 'bg-[#4F5E52] text-white hover:bg-[#3D4A3F]' : 'bg-[#E8E9E5] text-[#9AA394] cursor-not-allowed'}`}
            >
              {saved ? 'Langkah Tersimpan ✨' : saving ? 'Menyimpan...' : 'Save'}
            </button>
          </div>

          <div className="mt-10 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-[10px] text-[#9AA394] text-center leading-relaxed">
              Rekomendasi ini bersifat pendamping gaya hidup, bukan pengganti saran medis.
              Jika kamu memiliki kondisi kesehatan tertentu, konsultasikan dengan tenaga profesional.
            </p>
          </div>
        </div>
      </main>
      <InnerworkCelebration isOpen={saved} />
    </ProtectedRoute>
  );
}
