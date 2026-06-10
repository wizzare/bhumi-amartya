import type {
  DailyGuidance,
  DailyGuidanceAdaptiveContext,
  DailyGuidancePractice,
} from "@/lib/dailyGuidance/types";
import { buildUnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";

type PracticeId = "grounding" | "reflection" | "action";

type GenerateAdaptiveDailyPracticesInput = {
  date: string;
  language: "id" | "en";
  profile: Record<string, unknown> | null;
  blueprint: Record<string, unknown> | null;
  astrologyToday?: string | null;
  adaptiveContext: DailyGuidanceAdaptiveContext;
  previousGuidance?: DailyGuidance[];
  aiPractices?: Array<Partial<DailyGuidancePractice>>;
};

type PracticeTemplate = {
  id: PracticeId;
  category: PracticeId;
  title: string;
  description: string;
  estimatedMinutes: number;
};

const PRACTICE_IDS: PracticeId[] = ["grounding", "reflection", "action"];

function normalizeText(value: string | undefined): string {
  return (value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function getYesterdayPractices(input: GenerateAdaptiveDailyPracticesInput): DailyGuidancePractice[] {
  const yesterday = new Date(`${input.date}T00:00:00.000Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);
  return input.previousGuidance?.find((guidance) => guidance.date === yesterdayKey)?.dailyPractices ?? [];
}

function isIdenticalToYesterday(template: PracticeTemplate, yesterday: DailyGuidancePractice[]): boolean {
  const title = normalizeText(template.title);
  const description = normalizeText(template.description);

  return yesterday.some((practice) => (
    normalizeText(practice.title) === title
    || normalizeText(practice.description) === description
  ));
}

function pickTemplate(
  templates: PracticeTemplate[],
  input: GenerateAdaptiveDailyPracticesInput,
  yesterday: DailyGuidancePractice[],
): PracticeTemplate {
  const seed = Number(input.date.replaceAll("-", "")) || 0;
  const start = seed % templates.length;

  for (let offset = 0; offset < templates.length; offset += 1) {
    const candidate = templates[(start + offset) % templates.length];
    if (!isIdenticalToYesterday(candidate, yesterday)) return candidate;
  }

  const fallback = templates[start];
  return {
    ...fallback,
    description: `${fallback.description} ${input.language === "en" ? "Use today's date as a fresh anchor." : "Gunakan tanggal hari ini sebagai jangkar baru."}`,
  };
}

function buildTemplates(input: GenerateAdaptiveDailyPracticesInput): Record<PracticeId, PracticeTemplate[]> {
  const isEn = input.language === "en";
  const synthesis = buildUnifiedBlueprintSynthesis({
    language: input.language,
    profile: input.profile,
    blueprint: input.blueprint,
    astrologyToday: input.astrologyToday,
    adaptiveContext: input.adaptiveContext,
  });
  const [minMinutes, maxMinutes] = synthesis.progressTone.durationRange;
  const easy = synthesis.progressTone.key === "restart";
  const growth = synthesis.progressTone.key === "growth" || synthesis.progressTone.key === "celebration";
  const groundingTheme = synthesis.practiceThemes.grounding;
  const reflectionTheme = synthesis.practiceThemes.reflection;
  const actionTheme = synthesis.practiceThemes.action;
  const coreNeed = synthesis.coreNeeds[0] || (isEn ? "steadiness" : "kestabilan");
  const astroLine = input.astrologyToday
    ? isEn
      ? ` Let today's sky context set the tone: ${input.astrologyToday.slice(0, 90)}.`
      : ` Biarkan konteks langit hari ini memberi warna: ${input.astrologyToday.slice(0, 90)}.`
    : "";
  const synthesisLine = isEn
    ? ` Keep the whole practice connected to ${coreNeed}.`
    : ` Jaga seluruh praktik tetap terhubung dengan ${coreNeed}.`;

  return {
    grounding: [
      {
        id: "grounding",
        category: "grounding",
        title: easy ? (isEn ? "Gentle Body Return" : "Kembali ke Tubuh Lembut") : growth ? (isEn ? "Deeper Energy Check" : "Cek Energi Lebih Dalam") : (isEn ? "Grounded Capacity Check" : "Cek Kapasitas Membumi"),
        description: isEn
          ? `Sit with both feet on the floor, breathe slowly, and name 3 body sensations connected to ${groundingTheme}. Finish by choosing one word for your capacity today.${synthesisLine}`
          : `Duduk dengan dua kaki menapak, bernapas perlahan, lalu sebutkan 3 sensasi tubuh yang terhubung dengan ${groundingTheme}. Tutup dengan satu kata untuk kapasitasmu hari ini.${synthesisLine}`,
        estimatedMinutes: easy ? minMinutes : growth ? Math.min(maxMinutes, 12) : Math.min(maxMinutes, 8),
      },
      {
        id: "grounding",
        category: "grounding",
        title: isEn ? "Three-Sense Reset" : "Reset Tiga Indra",
        description: isEn
          ? `Notice 3 things you see, 2 sounds you hear, and 1 body signal. Let the practice support ${groundingTheme} without forcing a mood change.`
          : `Perhatikan 3 hal yang terlihat, 2 suara yang terdengar, dan 1 sinyal tubuh. Biarkan praktik ini mendukung ${groundingTheme} tanpa memaksa suasana hati berubah.`,
        estimatedMinutes: easy ? minMinutes : Math.min(maxMinutes, 9),
      },
    ],
    reflection: [
      {
        id: "reflection",
        category: "reflection",
        title: easy ? (isEn ? "One Gentle Page" : "Satu Halaman Lembut") : growth ? (isEn ? "Integrated Reflection" : "Refleksi Terpadu") : (isEn ? "Supportive Reflection" : "Refleksi yang Mendukung"),
        description: isEn
          ? `Write ${easy ? "3" : "5"} bullets: what feels present, what ${reflectionTheme} is asking for, what yesterday taught you, what support is realistic, and what can wait.`
          : `Tulis ${easy ? "3" : "5"} poin: apa yang hadir, apa yang diminta oleh ${reflectionTheme}, apa pelajaran kemarin, dukungan apa yang realistis, dan apa yang bisa menunggu.`,
        estimatedMinutes: easy ? minMinutes : growth ? Math.min(maxMinutes, 15) : Math.min(maxMinutes, 10),
      },
      {
        id: "reflection",
        category: "reflection",
        title: isEn ? "Pattern-to-Need Journal" : "Jurnal Pola ke Kebutuhan",
        description: isEn
          ? `Journal one pattern you noticed recently, the need underneath it, and one supportive response for today.${astroLine}`
          : `Tulis satu pola yang akhir-akhir ini terlihat, kebutuhan di baliknya, dan satu respons yang mendukung untuk hari ini.${astroLine}`,
        estimatedMinutes: easy ? Math.min(maxMinutes, 7) : Math.min(maxMinutes, 12),
      },
    ],
    action: [
      {
        id: "action",
        category: "action",
        title: easy ? (isEn ? "Tiny Real-Life Completion" : "Satu Selesai Kecil") : growth ? (isEn ? "Next-Level Practical Step" : "Langkah Praktis Berikutnya") : (isEn ? "One Practical Step" : "Satu Langkah Praktis"),
        description: isEn
          ? `Choose one real-life task that expresses ${actionTheme}. Set a timer, complete one visible step, then stop and mark it done.`
          : `Pilih satu tugas nyata yang mengekspresikan ${actionTheme}. Pasang timer, selesaikan satu langkah yang terlihat, lalu berhenti dan tandai selesai.`,
        estimatedMinutes: easy ? minMinutes : growth ? Math.min(maxMinutes, 18) : Math.min(maxMinutes, 12),
      },
      {
        id: "action",
        category: "action",
        title: isEn ? "Clear One Small Container" : "Rapikan Satu Wadah Kecil",
        description: isEn
          ? `Create or tidy one small container for today's energy: calendar block, checklist, desk corner, message, or reminder. Keep it measurable and complete.`
          : `Buat atau rapikan satu wadah kecil untuk energi hari ini: blok kalender, checklist, sudut meja, pesan, atau pengingat. Buat terukur dan selesai.`,
        estimatedMinutes: easy ? Math.min(maxMinutes, 7) : Math.min(maxMinutes, 14),
      },
    ],
  };
}

export function generateAdaptiveDailyPractices(
  input: GenerateAdaptiveDailyPracticesInput,
): DailyGuidancePractice[] {
  const templates = buildTemplates(input);
  const yesterday = getYesterdayPractices(input);

  return PRACTICE_IDS.map((id) => {
    const picked = pickTemplate(templates[id], input, yesterday);
    return {
      ...picked,
      completed: false,
    };
  });
}
