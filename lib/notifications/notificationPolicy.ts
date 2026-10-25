import { isWithinQuietHours } from "@/lib/notifications/quietHours";

export type NotificationLocale = "id-ID" | "en-US" | "ms-MY";
export type NotificationCategory = "daily" | "return" | "weekly" | "milestone";

export type NotificationCategoryPreferences = Record<NotificationCategory, boolean>;

export interface NotificationPolicyInput {
  category: NotificationCategory;
  locale: NotificationLocale;
  now: Date;
  timezone: string;
  categories: NotificationCategoryPreferences;
  comfortModeActive?: boolean;
  tiredCheckIns?: number;
  consecutiveDismissals?: number;
  absenceDays?: number;
  alreadyDelivered?: boolean;
}

export type NotificationPolicyDecision =
  | { status: "eligible"; title: string; body: string }
  | {
      status:
        | "suppressed_opt_out"
        | "suppressed_quiet_hours"
        | "suppressed_comfort"
        | "suppressed_low_energy"
        | "suppressed_dismissals"
        | "suppressed_frequency"
        | "suppressed_not_due";
    };

export const DEFAULT_NOTIFICATION_CATEGORIES: NotificationCategoryPreferences = {
  daily: false,
  return: false,
  weekly: false,
  milestone: false,
};

const COPY: Record<NotificationLocale, Record<NotificationCategory, { title: string; body: string }>> = {
  "id-ID": {
    daily: { title: "Catatan hari ini siap", body: "Catatanmu sudah tersimpan. Buka kapan pun kamu mau." },
    return: { title: "Sudah lama tidak melihat", body: "Aplikasi masih di sini. Tidak ada yang perlu buru-buru." },
    weekly: { title: "Ringkasan mingguanmu", body: "Kalau berguna, boleh lihat lagi minggu ini." },
    milestone: { title: "Satu langkah selesai", body: "Terima kasih sudah menyelesaikan satu langkah minggu ini." },
  },
  "en-US": {
    daily: { title: "Catatan hari ini siap", body: "Catatanmu sudah tersimpan. Buka kapan pun kamu mau." },
    return: { title: "Sudah lama tidak melihat", body: "Aplikasi masih di sini. Tidak ada yang perlu buru-buru." },
    weekly: { title: "Ringkasan mingguanmu", body: "Kalau berguna, boleh lihat lagi minggu ini." },
    milestone: { title: "Satu langkah selesai", body: "Terima kasih sudah menyelesaikan satu langkah minggu ini." },
  },
  "ms-MY": {
    daily: { title: "Catatan hari ini siap", body: "Catatanmu sudah tersimpan. Buka kapan pun kamu mau." },
    return: { title: "Sudah lama tidak melihat", body: "Aplikasi masih di sini. Tidak ada yang perlu buru-buru." },
    weekly: { title: "Ringkasan mingguanmu", body: "Kalau berguna, boleh lihat lagi minggu ini." },
    milestone: { title: "Satu langkah selesai", body: "Terima kasih sudah menyelesaikan satu langkah minggu ini." },
  },
};

export function notificationCopy(category: NotificationCategory, _locale: NotificationLocale = "id-ID") {
  return COPY["id-ID"][category];
}

export function evaluateNotificationPolicy(input: NotificationPolicyInput): NotificationPolicyDecision {
  if (!input.categories[input.category]) return { status: "suppressed_opt_out" };
  if (input.alreadyDelivered) return { status: "suppressed_frequency" };
  if (isWithinQuietHours(input.now, input.timezone)) return { status: "suppressed_quiet_hours" };

  if (input.category !== "return" && input.comfortModeActive) {
    return { status: "suppressed_comfort" };
  }
  if (input.category !== "return" && (input.tiredCheckIns ?? 0) >= 3) {
    return { status: "suppressed_low_energy" };
  }
  if (input.category === "daily" && (input.consecutiveDismissals ?? 0) >= 3) {
    return { status: "suppressed_dismissals" };
  }
  if (input.category === "return" && (input.absenceDays ?? 0) < 3) {
    return { status: "suppressed_not_due" };
  }

  return { status: "eligible", ...notificationCopy(input.category, input.locale) };
}
