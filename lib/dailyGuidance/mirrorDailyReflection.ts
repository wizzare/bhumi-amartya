import type { DailyGuidance } from "@/lib/dailyGuidance/types";
import { buildMirrorDailyConclusionContract } from "@/lib/dailyGuidance/dailyConclusionContract";

export type MirrorDailyState = "loading" | "ready" | "limited" | "unavailable" | "error";

export type MirrorDailyReflection = {
  state: MirrorDailyState;
  text: string;
  dailyConclusionText: string | null;
  localDateKey: string | null;
  timezone: string | null;
  synthesisFingerprint: string | null;
};

export type MirrorDailyLanguage = "id" | "en" | "ms";

const MIRROR_COPY: Record<MirrorDailyLanguage, {
  error: string;
  unavailable: string;
  greeting: (name: string, daypart: string) => string;
  signoff: string;
}> = {
  id: {
    error: "Refleksi Jiwa belum berhasil dibuka. Silakan muat ulang halaman ini sebentar lagi.",
    unavailable: "Refleksi Jiwa hari ini belum tersedia karena Kesimpulan Hari Ini belum selesai disusun.",
    greeting: (name, daypart) => `Halo, ${name}, bagaimana kabarmu ${daypart} ini.`,
    signoff: "Semoga menjadi petunjuk bagi kamu.\nPeluk hangat dari Bhumi.",
  },
  en: {
    error: "Soul Reflection could not be opened. Please reload this page in a moment.",
    unavailable: "Today's Soul Reflection is not available because Today's Conclusion has not been completed.",
    greeting: (name, daypart) => `Hello, ${name}. How are you this ${daypart}?`,
    signoff: "May this offer you a gentle direction.\nWarm hugs from Bhumi.",
  },
  ms: {
    error: "Refleksi Jiwa belum dapat dibuka. Sila muat semula halaman ini sebentar lagi.",
    unavailable: "Refleksi Jiwa hari ini belum tersedia kerana Kesimpulan Hari Ini belum selesai disusun.",
    greeting: (name, daypart) => `Hai, ${name}. Apa khabar pada ${daypart} ini?`,
    signoff: "Semoga ini menjadi petunjuk yang lembut untukmu.\nPelukan hangat daripada Bhumi.",
  },
};

function normalizeMirrorLanguage(value: unknown): MirrorDailyLanguage {
  const short = String(value ?? "id").toLowerCase().split("-")[0];
  return short === "en" || short === "ms" ? short : "id";
}

function getLocalizedDaypart(date: Date, timezone: string, language: MirrorDailyLanguage): string {
  const idDaypart = getMirrorDaypart(date, timezone);
  if (language === "en") {
    return ({ "dini hari": "early morning", pagi: "morning", siang: "afternoon", sore: "late afternoon", malam: "evening" } as const)[idDaypart];
  }
  if (language === "ms") {
    return ({ "dini hari": "awal pagi", pagi: "pagi", siang: "tengah hari", sore: "petang", malam: "malam" } as const)[idDaypart];
  }
  return idDaypart;
}

export function getMirrorDaypart(date: Date, timezone: string): "dini hari" | "pagi" | "siang" | "sore" | "malam" {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const rawHour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const hour = rawHour === 24 ? 0 : rawHour;

  if (hour >= 0 && hour <= 3) return "dini hari";
  if (hour >= 4 && hour <= 10) return "pagi";
  if (hour >= 11 && hour <= 14) return "siang";
  if (hour >= 15 && hour <= 17) return "sore";
  return "malam";
}

export function safeMirrorDisplayName(value: unknown, language: MirrorDailyLanguage | string = "id"): string {
  const isEn = String(language).toLowerCase().startsWith("en");
  const fallback = isEn ? "Friend of Bhumi" : "Sahabat Bhumi";
  const raw = String(value ?? "").trim();
  if (!raw || raw.includes("@")) return fallback;
  return raw.split(/\s+/).filter(Boolean).slice(0, 2).join(" ") || fallback;
}

export function buildMirrorDailyReflection({
  guidance,
  userName,
  now,
  timezone,
  language = "id",
  loading = false,
  error = null,
}: {
  guidance: DailyGuidance | null;
  userName: unknown;
  now: Date;
  timezone: string;
  language?: MirrorDailyLanguage | string;
  loading?: boolean;
  error?: string | null;
}): MirrorDailyReflection {
  const locale = normalizeMirrorLanguage(language);
  const copy = MIRROR_COPY[locale];
  if (loading) {
    return {
      state: "loading",
      text: "",
      dailyConclusionText: null,
      localDateKey: null,
      timezone,
      synthesisFingerprint: null,
    };
  }

  if (error) {
    return {
      state: "error",
      text: copy.error,
      dailyConclusionText: null,
      localDateKey: null,
      timezone,
      synthesisFingerprint: null,
    };
  }

  // State-aware guard: when the synthesis engine itself reports unavailable,
  // do not inspect dailyConclusion.text — it contains the error message string
  // (non-empty) and would otherwise be wrapped in greeting/farewell as if it
  // were real reflection content.
  if (guidance?.dailySynthesisState === "unavailable") {
    return {
      state: "unavailable",
      text: copy.unavailable,
      dailyConclusionText: null,
      localDateKey: guidance.localDateKey ?? guidance.date ?? null,
      timezone,
      synthesisFingerprint: null,
    };
  }

  const contract = buildMirrorDailyConclusionContract(guidance);
  if (!contract?.dailyConclusion.text) {
    return {
      state: "unavailable",
      text: copy.unavailable,
      dailyConclusionText: null,
      localDateKey: guidance?.localDateKey ?? guidance?.date ?? null,
      timezone,
      synthesisFingerprint: guidance?.dailyVariationSeed ?? guidance?.blueprintHash ?? null,
    };
  }

  const displayName = safeMirrorDisplayName(userName, locale);
  const daypart = getLocalizedDaypart(now, contract.timezone || timezone, locale);
  const reflectionText = locale === "id"
    ? contract.dailyConclusion.text
    : guidance?.soulReflectionText?.trim() || contract.dailyConclusion.text;
  const text = [
    copy.greeting(displayName, daypart),
    reflectionText,
    copy.signoff,
  ].join("\n\n");

  return {
    state: guidance?.dailySynthesisState === "limited" ? "limited" : "ready",
    text,
    dailyConclusionText: contract.dailyConclusion.text,
    localDateKey: contract.localDateKey,
    timezone: contract.timezone,
    synthesisFingerprint: guidance?.dailyVariationSeed ?? guidance?.blueprintHash ?? null,
  };
}
