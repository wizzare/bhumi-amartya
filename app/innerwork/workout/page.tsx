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
import { v4 as uuidv4 } from "uuid";

export default function WorkoutPage() {
  const auth = useAuth();
  const [completed, setCompleted] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    trackEvent("open_workout", auth?.user?.uid);
  }, [auth?.user?.uid]);

  const toggleComplete = async (activity: any) => {
    const id = activity.id;
    if (completed[id]) return;

    setCompleted(prev => ({ ...prev, [id]: true }));

    if (auth?.user?.uid) {
      try {
        await activityRepository.completeActivity({
          uid: auth.user.uid,
          date: getLocalDateKey(),
          activity: {
            id: uuidv4(),
            category: "workout",
            contentId: id,
            title: activity.title,
            duration: activity.durationMinutes,
            sourceVersion: "1.0",
          }
        });
        trackEvent("complete_workout_item", auth.user.uid);
      } catch (err) {
        console.error("[WORKOUT_COMPLETE_ERROR]", err);
        setCompleted(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  const activities = Object.values(WORKOUT_DATABASE);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />

        <div className="mx-auto max-w-lg">
          <Link href="/innerwork" className="flex items-center gap-2 text-[#7B8776] mb-6 hover:text-[#4F5E52] transition-colors">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Kembali ke Hub</span>
          </Link>

          <header className="mb-10">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
              <Dumbbell size={32} />
            </div>
            <h1 className="text-3xl font-serif text-[#4F5E52] mb-2">Workout</h1>
            <p className="text-[#7B8776]">Gerakkan tubuhmu untuk melepaskan energi yang tertahan.</p>
          </header>

          <div className="space-y-6">
            {activities.map((activity) => (
              <section key={activity.id} className="bhumi-card p-6 bg-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#4F5E52]">{activity.title}</h2>
                    <div className="flex items-center gap-2 mt-1 text-[#9AA394]">
                      <Clock size={14} />
                      <span className="text-xs font-medium">{activity.durationMinutes} menit</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleComplete(activity.id)}
                    className={`p-2 rounded-full transition-colors ${completed[activity.id] ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                  >
                    <CheckCircle2 size={24} />
                  </button>
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

                <button
                  onClick={() => toggleComplete(activity.id)}
                  className={`w-full mt-6 py-3 rounded-xl font-semibold text-sm transition-all ${completed[activity.id] ? 'bg-green-600 text-white shadow-md' : 'bg-[#F5F1E8] text-[#4F5E52] hover:bg-[#E8E4D8]'}`}
                >
                  {completed[activity.id] ? 'Selesai ✨' : 'Tandai Selesai'}
                </button>
              </section>
            ))}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
