export type DailyRhythmLocale = "id" | "en" | "ms";
export type DailyNeed = "tired" | "overwhelmed" | "unknown" | "curious" | "reflective" | "same-as-yesterday" | "just-show-me";
export type DailyPath = "learn" | "reflect" | "journal" | "explore" | "comfort" | "do-nothing";

export interface OrientationInput {
  now: Date;
  lastOpenedAt?: string | null;
  lastTheme?: string | null;
}

export type OrientationState = "new" | "same-day" | "next-day" | "absence-3" | "absence-7" | "absence-30";

const DAY_MS = 86_400_000;

export function resolveOrientation(input: OrientationInput): OrientationState {
  if (!input.lastOpenedAt) return "new";
  const last = new Date(input.lastOpenedAt);
  if (Number.isNaN(last.getTime())) return "new";
  const elapsedDays = Math.max(0, Math.floor((input.now.getTime() - last.getTime()) / DAY_MS));
  if (input.now.toDateString() === last.toDateString()) return "same-day";
  if (elapsedDays >= 30) return "absence-30";
  if (elapsedDays >= 7) return "absence-7";
  if (elapsedDays >= 3) return "absence-3";
  return "next-day";
}

const ALL_NEEDS: DailyNeed[] = ["tired", "curious", "reflective", "overwhelmed", "same-as-yesterday", "unknown", "just-show-me"];

export function getNeedOptions(familiar: boolean, recentNeeds: DailyNeed[] = []): DailyNeed[] {
  if (!familiar) return [...ALL_NEEDS];
  const prioritized: DailyNeed[] = [...recentNeeds, "tired", "curious", "reflective"];
  return [...new Set(prioritized)].filter((need) => ALL_NEEDS.includes(need)).slice(0, 3);
}

export function primaryPathForNeed(need: DailyNeed): DailyPath {
  if (need === "tired" || need === "overwhelmed" || need === "unknown") return "comfort";
  if (need === "reflective") return "journal";
  return "learn";
}

export function availablePaths(): DailyPath[] {
  return ["learn", "reflect", "journal", "explore", "comfort", "do-nothing"];
}

export function buildTinyStep(locale: DailyRhythmLocale): string {
  if (locale === "en") return "If you want, take one slow breath. Doing nothing is also valid.";
  if (locale === "ms") return "Jika anda mahu, tarik satu nafas perlahan. Tidak melakukan apa-apa juga sah.";
  return "Kalau kamu mau, ambil satu napas perlahan. Tidak melakukan apa pun juga sah.";
}

export function dailyRhythmFallback(reason: "ai" | "network" | "empty", locale: DailyRhythmLocale): string {
  const copy = {
    id: {
      ai: "Bhumi sedang hening sejenak. Berikut satu refleksi lembut untukmu.",
      network: "Kamu sedang offline. Catatan terakhir tetap bisa kamu baca.",
      empty: "Kadang hari yang bermakna dimulai tanpa jawaban apa pun.",
    },
    en: {
      ai: "Bhumi is having a quiet moment. Here is one gentle reflection.",
      network: "You are offline. Your last note is still here to read.",
      empty: "Sometimes a meaningful day starts without any answer.",
    },
    ms: {
      ai: "Bhumi sedang hening seketika. Ini satu refleksi lembut untuk anda.",
      network: "Anda sedang luar talian. Catatan terakhir masih boleh dibaca.",
      empty: "Kadangkala hari yang bermakna bermula tanpa sebarang jawapan.",
    },
  } as const;
  return copy[locale][reason];
}

export function shouldOfferEveningReflection(input: { localHour: number; journaledToday: boolean }): boolean {
  return input.journaledToday && input.localHour >= 18 && input.localHour < 22;
}

export function canContinueYesterday(draftUpdatedAt: string | null | undefined, now: Date): boolean {
  if (!draftUpdatedAt) return false;
  const draft = new Date(draftUpdatedAt);
  if (Number.isNaN(draft.getTime())) return false;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return draft.toDateString() === yesterday.toDateString();
}

export function periodicReflectionDue(input: {
  kind: "weekly" | "monthly";
  optedIn: boolean;
  activityCount: number;
  localDate: Date;
}): boolean {
  if (!input.optedIn || input.activityCount < 1) return false;
  return input.kind === "weekly" ? input.localDate.getDay() === 0 : input.localDate.getDate() === 1;
}
