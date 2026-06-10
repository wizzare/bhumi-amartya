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
      "🌿 Hari ini kamu belum grounding ya. Ambil 5 menit untuk menghubungkan diri dengan bumi.";
    showReminder = true;
  } else if (!journalingDone && moodLevel < 6) {
    reminderMessage =
      "📝 Journaling bisa membantu mengeluarkan apa yang ada di hati. Yuk mulai sekarang.";
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
