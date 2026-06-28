"use client";

interface AIReminderStateProps {
  groundingDone: boolean;
  journalingDone: boolean;
  moodLevel: number;
}

export function AIReminderState({
  groundingDone,
  journalingDone,
  moodLevel,
}: AIReminderStateProps) {
  // Determine reminder message based on state
  let reminderMessage = "";
  let showReminder = false;

  if (!groundingDone && moodLevel < 7) {
    reminderMessage =
      "🌿 Kamu belum sempat grounding hari ini. Ambil 5 menit untuk kembali ke tubuh dan napasmu.";
    showReminder = true;
  } else if (!journalingDone && moodLevel < 6) {
    reminderMessage =
      "📝 Kalau hati terasa penuh, journaling bisa jadi tempat menaruhnya pelan-pelan.";
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
