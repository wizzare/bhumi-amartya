import type { WellnessSnapshot } from "@/lib/data/types";
import { buildLifeSituationContext, type LifeSituationContext } from "@/lib/intelligence/lifeSituationIntelligence";

type SelectedContext = { id: string; icon: string; category: string; label: string };

const CONTEXT_PRESENTATION: Record<string, Omit<SelectedContext, "id">> = {
  rel_falling_love: { icon: "❤️", category: "Relasi", label: "Sedang jatuh cinta" },
  rel_heartbreak: { icon: "❤️", category: "Relasi", label: "Patah hati" },
  rel_drifting: { icon: "❤️", category: "Relasi", label: "Hubungan sedang renggang" },
  rel_partner_conflict: { icon: "❤️", category: "Relasi", label: "Konflik dengan pasangan" },
  rel_divorce: { icon: "❤️", category: "Relasi", label: "Dalam proses perceraian" },
  rel_family_conflict: { icon: "❤️", category: "Relasi", label: "Konflik keluarga" },
  rel_grief_close: { icon: "❤️", category: "Relasi", label: "Kehilangan orang terdekat" },
  rel_missing_someone: { icon: "❤️", category: "Relasi", label: "Merindukan seseorang" },
  wf_job_hunting: { icon: "💼", category: "Pekerjaan & Finansial", label: "Sedang mencari pekerjaan" },
  wf_job_loss: { icon: "💼", category: "Pekerjaan & Finansial", label: "Baru kehilangan pekerjaan" },
  wf_economic_strain: { icon: "💼", category: "Pekerjaan & Finansial", label: "Tekanan ekonomi" },
  wf_income_drop: { icon: "💼", category: "Pekerjaan & Finansial", label: "Penghasilan menurun" },
  wf_debt_bills: { icon: "💼", category: "Pekerjaan & Finansial", label: "Tagihan atau cicilan" },
  wf_high_workload: { icon: "💼", category: "Pekerjaan & Finansial", label: "Beban pekerjaan tinggi" },
  wf_work_conflict: { icon: "💼", category: "Pekerjaan & Finansial", label: "Konflik di tempat kerja" },
  wf_starting_business: { icon: "💼", category: "Pekerjaan & Finansial", label: "Sedang membangun usaha" },
  wf_career_direction: { icon: "💼", category: "Pekerjaan & Finansial", label: "Sedang mencari arah karier" },
  fam_child_care: { icon: "🏡", category: "Keluarga", label: "Mengurus anak" },
  fam_parent_care: { icon: "🏡", category: "Keluarga", label: "Mengurus orang tua" },
  fam_heavy_responsibility: { icon: "🏡", category: "Keluarga", label: "Banyak tanggung jawab keluarga" },
  fam_conflict: { icon: "🏡", category: "Keluarga", label: "Konflik keluarga" },
  fam_major_transition: { icon: "🏡", category: "Keluarga", label: "Perubahan besar dalam keluarga" },
  soc_lonely: { icon: "👥", category: "Sosial", label: "Merasa kesepian" },
  soc_trust_issues: { icon: "👥", category: "Sosial", label: "Sulit percaya orang" },
  soc_friend_conflict: { icon: "👥", category: "Sosial", label: "Konflik dengan teman" },
  soc_community_conflict: { icon: "👥", category: "Sosial", label: "Konflik komunitas" },
  soc_withdrawing: { icon: "👥", category: "Sosial", label: "Sedang menarik diri" },
  soc_misunderstood: { icon: "👥", category: "Sosial", label: "Merasa tidak dipahami" },
  soc_social_loss: { icon: "👥", category: "Sosial", label: "Kehilangan lingkungan sosial" },
  cog_overthinking: { icon: "🧠", category: "Pikiran", label: "Pikiran berulang" },
  cog_focus_issues: { icon: "🧠", category: "Pikiran", label: "Sulit fokus" },
  cog_decision_paralysis: { icon: "🧠", category: "Pikiran", label: "Sulit mengambil keputusan" },
  cog_life_direction: { icon: "🧠", category: "Pikiran", label: "Bingung arah hidup" },
  cog_worrying: { icon: "🧠", category: "Pikiran", label: "Banyak kekhawatiran" },
  cog_busy_mind: { icon: "🧠", category: "Pikiran", label: "Pikiran terasa penuh" },
  emo_sad: { icon: "🌧", category: "Emosi", label: "Sedih" },
  emo_disappointed: { icon: "🌧", category: "Emosi", label: "Kecewa" },
  emo_angry: { icon: "🌧", category: "Emosi", label: "Marah" },
  emo_anxious: { icon: "🌧", category: "Emosi", label: "Cemas" },
  emo_afraid: { icon: "🌧", category: "Emosi", label: "Takut" },
  emo_grieving: { icon: "🌧", category: "Emosi", label: "Berduka" },
  emo_empty: { icon: "🌧", category: "Emosi", label: "Merasa hampa" },
  spi_reflecting: { icon: "🌿", category: "Spiritualitas", label: "Sedang banyak berefleksi" },
  spi_seeking_meaning: { icon: "🌿", category: "Spiritualitas", label: "Sedang mencari makna hidup" },
  spi_disconnected: { icon: "🌿", category: "Spiritualitas", label: "Merasa jauh dari diri sendiri" },
  spi_seeking_peace: { icon: "🌿", category: "Spiritualitas", label: "Ingin lebih tenang" },
  spi_spiritual_journey: { icon: "🌿", category: "Spiritualitas", label: "Sedang menjalani perjalanan spiritual" },
};

export type WellnessContextSynthesis = {
  primaryCondition: string;
  activeContext: string;
  summary: string;
  selectedContexts: SelectedContext[];
  careFocus: string;
  capacityLevel: "low" | "medium" | "high";
  safetyLevel: "normal" | "reduced" | "restorative";
  emotionalNeed: string;
  physicalNeed: string;
  recommendedIntensity: "micro" | "gentle" | "moderate";
  explanation: string;
  theme: string;
  rhythm: "Jeda" | "Selaras" | "Aktif";
  lifeSituation: LifeSituationContext;
};

export type WellnessDayContext = {
  localDate?: string;
  dayOfWeek?: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  isWeekend?: boolean;
  weatherCondition?: string;
  temperatureLevel?: "normal" | "hot" | "extreme" | "unknown";
  precipitationLevel?: "none" | "rain" | "heavy_rain" | "storm" | "unknown";
  airQualityLevel?: "good" | "moderate" | "poor" | "hazardous" | "unknown";
  hazardType?: string;
  hazardSeverity?: "none" | "advisory" | "active" | "unknown";
  astroTheme?: string;
  astroEnabled?: boolean;
  akashiEnabled?: boolean;
  akashiPatternLabel?: string;
  akashiStrength?: string;
};

function resolveRhythm(snapshot: WellnessSnapshot): WellnessContextSynthesis["rhythm"] {
  const energy = snapshot.metrics.energy ?? 5;
  const sleep = snapshot.metrics.sleep ?? 5;
  if (snapshot.healthCondition && snapshot.healthCondition !== "Healthy") return "Jeda";
  if (energy <= 4 || sleep <= 3) return "Jeda";
  if (energy >= 8 && sleep >= 6) return "Aktif";
  return "Selaras";
}

function buildSummary(snapshot: WellnessSnapshot, context: LifeSituationContext, rhythm: WellnessContextSynthesis["rhythm"]): string {
  const { sleep, emotion, focus, social } = snapshot.metrics;
  const capacity = rhythm === "Aktif"
    ? "tubuhmu tampak memiliki tenaga yang cukup"
    : rhythm === "Jeda"
      ? "tubuhmu tampak membutuhkan ritme yang lebih ringan"
      : "ritme tubuhmu tampak cukup seimbang";
  const metricNotes = [
    sleep <= 4 ? "tidurmu belum sepenuhnya memulihkan" : "",
    emotion <= 4 ? "perasaanmu membutuhkan lebih banyak kelembutan" : "",
    focus <= 4 ? "pikiranmu mungkin belum mudah menetap" : "",
    social <= 4 ? "kebutuhan akan rasa terhubung juga patut diperhatikan" : "",
  ].filter(Boolean);
  const currentNote = context.narrative || metricNotes[0] || "tidak ada kondisi khusus yang sedang menonjol";
  return `Hari ini ${capacity}, namun ${currentNote.charAt(0).toLowerCase()}${currentNote.slice(1)}`;
}

function buildCareFocus(snapshot: WellnessSnapshot, context: LifeSituationContext): string {
  if (snapshot.healthCondition && snapshot.healthCondition !== "Healthy") return "Menghormati kebutuhan tubuh untuk pulih.";
  if (snapshot.metrics.energy <= 4 || snapshot.metrics.sleep <= 4) return "Menjaga tenaga agar tidak terkuras terlalu cepat.";
  const focusByTone: Record<NonNullable<LifeSituationContext["tone"]>, string> = {
    gentle: "Memberi waktu bagi tubuh dan hati untuk pulih.",
    clarifying: "Menjaga pikiran tetap jernih tanpa memikul semuanya sekaligus.",
    connecting: "Menjaga kedekatan tanpa meninggalkan kebutuhan diri sendiri.",
    steady: "Menjaga respons tetap tenang di tengah hal yang sedang berlangsung.",
  };
  return context.tone ? focusByTone[context.tone] : "Menjaga ritme yang sudah terasa cukup seimbang.";
}

function buildTheme(context: LifeSituationContext, rhythm: WellnessContextSynthesis["rhythm"]): string {
  const themeByTone: Record<NonNullable<LifeSituationContext["tone"]>, string> = {
    gentle: "Merawat diri di tengah hal yang sedang menyentuh hati.",
    clarifying: "Menemukan kejernihan di tengah pikiran yang penuh.",
    connecting: "Menjaga hubungan dengan tetap hadir bagi diri sendiri.",
    steady: "Menjaga ketenangan di tengah ritme yang sedang berubah.",
  };
  if (context.tone) return themeByTone[context.tone];
  if (rhythm === "Jeda") return "Memberi tubuh kesempatan untuk kembali pulih.";
  if (rhythm === "Aktif") return "Menyalurkan tenaga dengan arah yang tetap terjaga.";
  return "Merawat keseimbangan yang sudah hadir hari ini.";
}

export function buildWellnessContextSynthesis(snapshot: WellnessSnapshot, dayContext?: WellnessDayContext): WellnessContextSynthesis {
  const lifeSituation = buildLifeSituationContext(snapshot.lifeSituation);
  const rhythm = resolveRhythm(snapshot);
  const selectedContexts = Array.isArray(snapshot.lifeSituation)
    ? snapshot.lifeSituation.filter((id) => typeof id === "string" && !id.endsWith("_none"))
        .map((id) => CONTEXT_PRESENTATION[id] ? { id, ...CONTEXT_PRESENTATION[id] } : null)
        .filter((item): item is SelectedContext => Boolean(item))
    : [];
  const energy = snapshot.metrics.energy ?? 5;
  const health = snapshot.healthCondition === "berat" || snapshot.healthCondition === "Severe Illness"
    ? "berat"
    : snapshot.healthCondition === "sedang" || snapshot.healthCondition === "Moderate Illness"
      ? "sedang"
      : snapshot.healthCondition === "ringan" || snapshot.healthCondition === "Mild Illness"
        ? "ringan"
        : snapshot.healthCondition === "kurang_fit" || snapshot.healthCondition === "Less Fit"
          ? "kurang_fit"
          : "normal";
  const capacityLevel = energy <= 4 || health === "berat" || health === "sedang" ? "low" : energy >= 8 ? "high" : "medium";
  const safetyLevel = health === "berat" || health === "sedang" ? "restorative" : health === "ringan" || health === "kurang_fit" ? "reduced" : "normal";
  const recommendedIntensity = capacityLevel === "low" ? "micro" : capacityLevel === "high" ? "moderate" : "gentle";
  const primaryCondition = health !== "normal"
    ? ({ kurang_fit: "Tubuh sedang kurang fit", ringan: "Ada kebutuhan pemulihan ringan", sedang: "Kapasitas tubuh sedang menurun", berat: "Tubuh membutuhkan pemulihan" } as const)[health]
    : energy <= 4 ? "Energi sedang terbatas" : "Kondisi relatif seimbang";
  const activeContext = lifeSituation.activeCount > 0
    ? selectedContexts.map((item) => item.label).join(", ") || "Ada konteks hidup yang sedang aktif"
    : "Tidak ada tekanan khusus yang dipilih";
  const emotionalNeed = snapshot.metrics.emotion <= 4 ? "kelembutan dan regulasi emosi" : snapshot.metrics.social <= 4 ? "rasa terhubung yang aman" : "ruang untuk menjaga ketenangan";
  const physicalNeed = health !== "normal" || snapshot.metrics.sleep <= 4 ? "pemulihan dan ritme yang tidak menguras tenaga" : "menjaga ritme tubuh yang stabil";
  const baseSummary = buildSummary(snapshot, lifeSituation, rhythm);
  const dayNote = dayContext?.isWeekend
    ? " Akhir pekan ini dapat menjadi ruang pemulihan, dengan kapasitas tubuh tetap menjadi batas utama."
    : dayContext?.dayOfWeek === "Monday"
      ? " Memasuki awal pekan, ritme yang bertahap dapat membantu menjaga tenaga."
      : dayContext?.dayOfWeek === "Friday"
        ? " Menjelang akhir pekan, ruang untuk melepas beban yang terkumpul dapat membantu."
        : "";
  const summaryText = `${baseSummary}${dayNote}`;
  const environmentNote = dayContext?.hazardSeverity === "active"
    ? " Keselamatan menjadi prioritas utama; pastikan kamu berada di tempat aman dan mengikuti informasi resmi."
    : dayContext?.precipitationLevel === "heavy_rain" || dayContext?.precipitationLevel === "storm"
      ? " Cuaca kurang bersahabat membuat praktik dalam ruang lebih sesuai hari ini."
      : dayContext?.temperatureLevel === "extreme"
        ? " Panas yang cukup kuat menjadi alasan tambahan untuk menurunkan intensitas dan menjaga tubuh tetap sejuk."
        : dayContext?.airQualityLevel === "poor" || dayContext?.airQualityLevel === "hazardous"
          ? " Kualitas udara menjadi alasan untuk mengutamakan aktivitas dalam ruang dengan intensitas rendah."
          : dayContext?.weatherCondition ? ` Kondisi sekitar (${dayContext.weatherCondition.toLowerCase()}) menjadi konteks tambahan untuk membaca ritmemu.` : "";
  const astroNote = dayContext?.astroEnabled !== false && dayContext?.astroTheme
    ? " Tema langit hari ini dapat menjadi konteks tambahan untuk refleksi, selama terasa relevan bagimu."
    : "";
  const akashiNote = dayContext?.akashiEnabled && dayContext.akashiPatternLabel
    ? ` Jika terasa relevan bagimu, kondisi ini mungkin menyentuh pola tentang ${dayContext.akashiPatternLabel}; gunakan ${dayContext.akashiStrength || "kekuatan yang sudah tersedia"} sebagai pegangan, bukan sebagai label tetap.`
    : "";
  const explanation = `${summaryText}. Kebutuhan utama hari ini adalah ${emotionalNeed} serta ${physicalNeed}.${environmentNote}${astroNote}${akashiNote}`;
  return {
    primaryCondition,
    activeContext,
    summary: summaryText,
    selectedContexts,
    careFocus: buildCareFocus(snapshot, lifeSituation),
    capacityLevel,
    safetyLevel,
    emotionalNeed,
    physicalNeed,
    recommendedIntensity,
    explanation,
    theme: buildTheme(lifeSituation, rhythm),
    rhythm,
    lifeSituation,
  };
}
