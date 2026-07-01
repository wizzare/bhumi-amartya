"use client";

import React from "react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AccessGuard } from "@/components/auth/AccessGuard";
import { Dumbbell, ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics/usageAnalytics";
import { useAuth } from "@/context/AuthContext";
import { WORKOUT_DATABASE } from "@/lib/data/innerworkContent";
import { activityRepository } from "@/lib/repositories/activityRepository";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { dailyStateRepository } from "@/lib/repositories/dailyStateRepository";
import { InnerworkCelebration } from "@/components/ui/InnerworkCelebration";
import { INNERWORK_VARIATION_LIBRARY } from "@/lib/data/innerworkVariationLibrary";
import { GuidedLearningDetails } from "@/components/ui/GuidedLearningDetails";
import { getZoneBGuide, readZoneBContext, type ZoneBContext } from "@/lib/innerwork/zoneBContext";
import { formatSection4SaveError, logWellnessSection4Practice } from "@/lib/innerwork/wellnessSection4Logging";
import { MoanaRuntimeDiagnosticsPanel } from "@/components/debug/MoanaRuntimeDiagnosticsPanel";
import { appendMoanaRuntimeDiagnostic } from "@/lib/innerwork/moanaRuntimeDiagnostics";

const WORKOUT_ACTIVITIES = [...Object.values(WORKOUT_DATABASE), ...INNERWORK_VARIATION_LIBRARY.workout];
const WORKOUT_BY_ID = Object.fromEntries(WORKOUT_ACTIVITIES.map((activity) => [activity.id, activity]));

export default function WorkoutPage() {
  const router = useRouter();
  const auth = useAuth();
  const auditUser = process.env.NODE_ENV === "development" && typeof window !== "undefined"
    ? window.localStorage.getItem("bhumi_audit_user")
    : null;
  const activeUid = auth?.user?.uid || (auditUser ? `${auditUser}_uid` : "");
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
    if (zoneBContext?.practiceId) {
      setSelectedIds(new Set([zoneBContext.practiceId]));
    }
  }, [zoneBContext?.practiceId]);

    // KARA SoT: Workout adalah "area khusus" di dalam Wellness.
  // Daily Check-In bukan gate untuk Workout — gate hanya berlaku untuk membuka
  // halaman Hasil Wellness (Zona A) secara keseluruhan sesuai KARA SoT.
  // LIANA V3: Progress Workout dibaca dari dailyState.workoutDone untuk konsistensi UI.
  const [workoutDoneToday, setWorkoutDoneToday] = React.useState(false);

  React.useEffect(() => {
    trackEvent("open_workout", auth?.user?.uid);

    async function loadPersistedPractice() {
      if (!activeUid) return;
      try {
        const profile = auth?.userProfile;
        const nestedProfile = profile?.profile as { timezone?: string | null } | undefined;
        const timezone = profile?.timezone || nestedProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        const date = getLocalDateKey(new Date(), timezone);
        const state = await dailyStateRepository.getDailyState(activeUid, date);
        if (state?.workoutDone) {
          setWorkoutDoneToday(true);
        }
      } catch (err) {
        console.warn("[WORKOUT PERSIST NOTE]", err);
      }
    }
    void loadPersistedPractice();
  }, [auth?.user?.uid, auth?.userProfile, activeUid]);

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
    const activityIdsToSave = selectedIds.size > 0
      ? Array.from(selectedIds)
      : activities[0]?.id
        ? [activities[0].id]
        : [];
    appendMoanaRuntimeDiagnostic("section4_save_button_clicked", {
      practiceType: "workout",
      selectedIds: Array.from(selectedIds),
      activityIdsToSave,
      userId: activeUid || null,
      authUid: auth?.user?.uid ?? null,
      profileUid: auth?.userProfile?.uid ?? null,
    });
    if (activityIdsToSave.length === 0 || !activeUid || saving) return;

    const uid = activeUid;
    setSaving(true);
    try {
      const profile = auth?.userProfile;
      const nestedProfile = profile?.profile as { timezone?: string } | undefined;
      const timezone = profile?.timezone || nestedProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const date = getLocalDateKey(new Date(), timezone);

      const savePromises = activityIdsToSave.map(id => {
        const activity = WORKOUT_BY_ID[id] ?? activities.find((item) => item.id === id);
        if (!activity) {
          throw new Error(`Workout activity not found: ${id}`);
        }
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
      for (const id of activityIdsToSave) {
        const activity = WORKOUT_BY_ID[id] ?? activities.find((item) => item.id === id);
        if (!activity) {
          throw new Error(`Workout activity not found: ${id}`);
        }
        const context = zoneBContext ?? {
          issue: "general_innerwork",
          practiceId: id,
          practiceCategory: "workout" as const,
          sourceTheme: "workout learning",
          title: activity.title,
          durationMinutes: activity.durationMinutes,
        };
        await logWellnessSection4Practice({
          uid,
          dateKey: date,
          practiceId: context.practiceId,
          practiceType: "workout",
          practiceTitle: context.title,
          durationMinutes: context.durationMinutes,
          reflectionResult: reflectionResult || "Belum Yakin",
        });
      }
      trackEvent("complete_workout", uid);
      setSaved(true);
      router.replace("/wellness");
    } catch (err) {
      const detail = formatSection4SaveError(err);
      console.error("[WORKOUT_SAVE_ERROR]", detail, err);
      alert(`Gagal menyimpan praktik olahraga.\n${detail}`);
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
    : WORKOUT_ACTIVITIES;

    // KARA SoT Lock Removed: Workout dapat diakses tanpa Daily Check-In.
  // workoutDoneToday digunakan untuk indikator UI opsional saja — tidak memblokir halaman.
  void workoutDoneToday;
  const canSave = activities.length > 0;

  return (
    <ProtectedRoute>
      <AccessGuard feature="workout">
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />

        <div className="mx-auto max-w-lg">
          <Link href="/wellness" className="flex items-center gap-2 text-[#7B8776] mb-6 hover:text-[#4F5E52] transition-colors">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Kembali ke Wellness</span>
          </Link>

                    <header className="mb-8">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
              <Dumbbell size={32} />
            </div>
            <h1 className="text-3xl font-serif text-[#4F5E52] mb-2">Workout</h1>
            <p className="text-[#7B8776]">Gerakkan tubuhmu untuk melepaskan energi yang tertahan.</p>
            {workoutDoneToday && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                Latihan terakhir kamu tersimpan.
              </p>
            )}
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

                <GuidedLearningDetails
                  title={activity.title}
                  description={activity.description}
                  benefits={activity.benefits}
                  steps={activity.instruction}
                  duration={`${activity.durationMinutes} menit`}
                  googleSearchPhrase={`${activity.title} exercise proper form`}
                  youtubeSearchPhrase={`${activity.title} beginner workout tutorial`}
                  accentClass="bg-orange-50 text-orange-600"
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
                      className={`rounded-xl border p-3 text-xs font-semibold ${reflectionResult === result ? "border-orange-600 bg-orange-50 text-orange-700" : "border-[#E8E9E5] bg-white text-[#7B8776]"}`}
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
              disabled={!canSave || saving || saved}
              className={`w-full py-5 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all shadow-lg active:scale-[0.98] ${saved ? 'bg-emerald-600 text-white' : canSave ? 'bg-[#4F5E52] text-white hover:bg-[#3D4A3F]' : 'bg-[#E8E9E5] text-[#9AA394] cursor-not-allowed'}`}
            >
              {saved ? 'Langkah Tersimpan ✨' : saving ? 'Menyimpan...' : 'Save'}
            </button>
          </div>
          <MoanaRuntimeDiagnosticsPanel label="Workout Section 4 save flow" />
        </div>
      </main>
      <InnerworkCelebration isOpen={saved} />
      </AccessGuard>
    </ProtectedRoute>
  );
}
