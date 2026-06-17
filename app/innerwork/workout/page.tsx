"use client";

import React from "react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Dumbbell, ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics/usageAnalytics";
import { useAuth } from "@/context/AuthContext";
import { WORKOUT_DATABASE } from "@/lib/data/innerworkContent";
import { activityRepository } from "@/lib/repositories/activityRepository";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { InnerworkCelebration } from "@/components/ui/InnerworkCelebration";
import { INNERWORK_VARIATION_LIBRARY } from "@/lib/data/innerworkVariationLibrary";

const WORKOUT_ACTIVITIES = [...Object.values(WORKOUT_DATABASE), ...INNERWORK_VARIATION_LIBRARY.workout];
const WORKOUT_BY_ID = Object.fromEntries(WORKOUT_ACTIVITIES.map((activity) => [activity.id, activity]));

export default function WorkoutPage() {
  const auth = useAuth();
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    trackEvent("open_workout", auth?.user?.uid);
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
        const activity = WORKOUT_BY_ID[id];
        return activityRepository.completeActivity({
          uid,
          date,
          activity: {
            id: `workout-${id}-${Date.now()}`,
            category: "workout",
            contentId: id,
            title: activity.title,
            duration: activity.durationMinutes,
            sourceVersion: "1.0",
          }
        });
      });

      await Promise.all(savePromises);
      trackEvent("complete_workout", uid);
      setSaved(true);
    } catch (err) {
      console.error("[WORKOUT_SAVE_ERROR]", err);
    } finally {
      setSaving(false);
    }
  };

  const activities = WORKOUT_ACTIVITIES;

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
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
              <Dumbbell size={32} />
            </div>
            <h1 className="text-3xl font-serif text-[#4F5E52] mb-2">Workout</h1>
            <p className="text-[#7B8776]">Gerakkan tubuhmu untuk melepaskan energi yang tertahan.</p>
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
                className={`bhumi-card p-6 transition-all duration-300 border-2 cursor-pointer ${selectedIds.has(activity.id) ? 'bg-orange-50/30 border-orange-200 shadow-md' : 'bg-white border-transparent'}`}
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
                  <div className={`p-2 rounded-full transition-colors ${selectedIds.has(activity.id) ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-300'}`}>
                    <CheckCircle2 size={24} />
                  </div>
                </div>

                <p className="text-[#7B8776] text-sm mb-4">{activity.description}</p>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#9AA394] mb-2">Langkah-langkah</h3>
                    <ul className="space-y-2">
                      {activity.instruction.map((step, idx) => (
                        <li key={idx} className="text-sm text-[#4F5E52] flex gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#F5F1E8] text-[#9AA394] flex items-center justify-center text-[10px] shrink-0">{idx + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#9AA394] mb-2">Manfaat</h3>
                    <div className="flex flex-wrap gap-2">
                      {activity.benefits.map((benefit, idx) => (
                        <span key={idx} className="px-2 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-semibold">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
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
        </div>
      </main>
      <InnerworkCelebration isOpen={saved} />
    </ProtectedRoute>
  );
}
