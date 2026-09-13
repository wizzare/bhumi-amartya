"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { isEnlEdition } from "@/lib/config/edition";

interface AIReminderStateProps {
  groundingDone: boolean;
  journalingDone: boolean;
  moodLevel: number;
  language?: "id" | "en";
}

export function AIReminderState({
  groundingDone,
  journalingDone,
  moodLevel,
  language: propLanguage,
}: AIReminderStateProps) {
  const isEn = false;

  // Determine reminder message based on state
  let reminderMessage = "";
  let showReminder = false;

  if (!groundingDone && moodLevel < 7) {
    reminderMessage = isEn
      ? "🌿 You haven't taken a moment to ground today. Take 5 minutes to return to your body and your breath."
      : "🌿 Kamu belum sempat grounding hari ini. Ambil 5 menit untuk kembali ke tubuh dan napasmu.";
    showReminder = true;
  } else if (!journalingDone && moodLevel < 6) {
    reminderMessage = isEn
      ? "📝 If your heart feels heavy or full, journaling can be a quiet place to gently set it down."
      : "📝 Kalau hati terasa penuh, journaling bisa jadi tempat menaruhnya pelan-pelan.";
    showReminder = true;
  }

  if (!showReminder) {
    return null;
  }

  return (
    <div className="mt-6 bhumi-card p-4 bg-[#FFFBF7] border-l-4 border-[#C4A57B]">
      <p className="text-[#4F5E52] text-sm">{reminderMessage}</p>
    </div>
  );
}
