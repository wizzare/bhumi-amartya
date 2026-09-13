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
    daily: { title: "Catatanmu siap", body: "Ruangmu ada di sini kapan pun kamu siap." },
    return: { title: "Memikirkanmu", body: "Ruang Bhumi tetap ada di sini, tanpa tuntutan." },
    weekly: { title: "Refleksi mingguanmu", body: "Lihat kembali minggu ini jika terasa berguna." },
    milestone: { title: "Sebuah penanda lembut", body: "Terima kasih sudah memberi ruang untuk perjalananmu." },
  },
  "en-US": {
    daily: { title: "Your note is ready", body: "Your space is here whenever you are ready." },
    return: { title: "Thinking of you", body: "Your Bhumi space is still here, with no expectations." },
    weekly: { title: "Your weekly reflection", body: "Look back on this week if that feels useful." },
    milestone: { title: "A gentle milestone", body: "Thank you for making space for your journey." },
  },
  "ms-MY": {
    daily: { title: "Catatan anda sudah sedia", body: "Ruang anda ada di sini apabila anda bersedia." },
    return: { title: "Mengingati anda", body: "Ruang Bhumi masih ada di sini, tanpa tuntutan." },
    weekly: { title: "Refleksi mingguan anda", body: "Lihat kembali minggu ini jika ia terasa berguna." },
    milestone: { title: "Satu penanda lembut", body: "Terima kasih kerana memberi ruang untuk perjalanan anda." },
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
