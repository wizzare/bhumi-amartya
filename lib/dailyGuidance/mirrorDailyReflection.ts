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

export function safeMirrorDisplayName(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw || raw.includes("@")) return "Sahabat Bhumi";
  return raw.split(/\s+/).filter(Boolean).slice(0, 2).join(" ") || "Sahabat Bhumi";
}

export function buildMirrorDailyReflection({
  guidance,
  userName,
  now,
  timezone,
  loading = false,
  error = null,
}: {
  guidance: DailyGuidance | null;
  userName: unknown;
  now: Date;
  timezone: string;
  loading?: boolean;
  error?: string | null;
}): MirrorDailyReflection {
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
      text: "Refleksi Jiwa belum berhasil dibuka. Silakan muat ulang halaman ini sebentar lagi.",
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
      text: "Refleksi Jiwa hari ini belum tersedia karena Kesimpulan Hari Ini belum selesai disusun.",
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
      text: "Refleksi Jiwa hari ini belum tersedia karena Kesimpulan Hari Ini belum selesai disusun.",
      dailyConclusionText: null,
      localDateKey: guidance?.localDateKey ?? guidance?.date ?? null,
      timezone,
      synthesisFingerprint: guidance?.dailyVariationSeed ?? guidance?.blueprintHash ?? null,
    };
  }

  const displayName = safeMirrorDisplayName(userName);
  const daypart = getMirrorDaypart(now, contract.timezone || timezone);
  const text = [
    `Halo, ${displayName}, bagaimana kabarmu ${daypart} ini.`,
    contract.dailyConclusion.text,
    "Semoga menjadi petunjuk bagi kamu.\nPeluk hangat dari Bhumi.",
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
