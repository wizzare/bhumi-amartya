import type {
  DailyGuidance,
  DailyGuidanceAdaptiveContext,
  DailyGuidancePractice,
} from "@/lib/dailyGuidance/types";
import { buildUnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";
import { pickLocale } from "@/lib/i18n/pickLocale";

type PracticeId = "grounding" | "reflection" | "action";

type GenerateAdaptiveDailyPracticesInput = {
  date: string;
  // R-PRD-31 / DS-AI1: id/en/ms are all first-class; ms is native Bahasa Melayu below.
  language: "id" | "en" | "ms";
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
    description: `${fallback.description} ${pickLocale(input.language, {
      en: "Use today's date as a fresh anchor.",
      id: "Gunakan tanggal hari ini sebagai jangkar baru.",
      ms: "Gunakan tarikh hari ini sebagai sauh baharu.",
    })}`,
  };
}

function buildTemplates(input: GenerateAdaptiveDailyPracticesInput): Record<PracticeId, PracticeTemplate[]> {
  const L = (en: string, id: string, ms: string) => pickLocale(input.language, { en, id, ms });
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
  const coreNeed = synthesis.coreNeeds[0] || L("steadiness", "kestabilan", "kestabilan");
  const astroLine = input.astrologyToday
    ? L(
        ` Let today's sky context set the tone: ${input.astrologyToday.slice(0, 90)}.`,
        ` Biarkan konteks langit hari ini memberi warna: ${input.astrologyToday.slice(0, 90)}.`,
        ` Biarkan konteks langit hari ini memberi warna: ${input.astrologyToday.slice(0, 90)}.`,
      )
    : "";
  const synthesisLine = L(
    ` Keep the whole practice connected to ${coreNeed}.`,
    ` Jaga seluruh praktik tetap terhubung dengan ${coreNeed}.`,
    ` Pastikan seluruh amalan kekal terhubung dengan ${coreNeed}.`,
  );

  return {
    grounding: [
      {
        id: "grounding",
        category: "grounding",
        title: easy
          ? L("Gentle Body Return", "Kembali ke Tubuh Lembut", "Kembali kepada Tubuh dengan Lembut")
          : growth
            ? L("Deeper Energy Check", "Cek Energi Lebih Dalam", "Semak Tenaga Lebih Dalam")
            : L("Grounded Capacity Check", "Cek Kapasitas Membumi", "Semak Kapasiti yang Membumi"),
        description: L(
          `Sit with both feet on the floor, breathe slowly, and name 3 body sensations connected to ${groundingTheme}. Finish by choosing one word for your capacity today.${synthesisLine}`,
          `Duduk dengan dua kaki menapak, bernapas perlahan, lalu sebutkan 3 sensasi tubuh yang terhubung dengan ${groundingTheme}. Tutup dengan satu kata untuk kapasitasmu hari ini.${synthesisLine}`,
          `Duduk dengan kedua-dua kaki mencecah lantai, bernafas perlahan, lalu namakan 3 sensasi tubuh yang terhubung dengan ${groundingTheme}. Akhiri dengan satu perkataan untuk kapasiti anda hari ini.${synthesisLine}`,
        ),
        estimatedMinutes: easy ? minMinutes : growth ? Math.min(maxMinutes, 12) : Math.min(maxMinutes, 8),
      },
      {
        id: "grounding",
        category: "grounding",
        title: L("Three-Sense Reset", "Reset Tiga Indra", "Set Semula Tiga Deria"),
        description: L(
          `Notice 3 things you see, 2 sounds you hear, and 1 body signal. Let the practice support ${groundingTheme} without forcing a mood change.`,
          `Perhatikan 3 hal yang terlihat, 2 suara yang terdengar, dan 1 sinyal tubuh. Biarkan praktik ini mendukung ${groundingTheme} tanpa memaksa suasana hati berubah.`,
          `Perhatikan 3 perkara yang kelihatan, 2 bunyi yang kedengaran, dan 1 isyarat tubuh. Biarkan amalan ini menyokong ${groundingTheme} tanpa memaksa suasana hati berubah.`,
        ),
        estimatedMinutes: easy ? minMinutes : Math.min(maxMinutes, 9),
      },
    ],
    reflection: [
      {
        id: "reflection",
        category: "reflection",
        title: easy
          ? L("One Gentle Page", "Satu Halaman Lembut", "Satu Halaman yang Lembut")
          : growth
            ? L("Integrated Reflection", "Refleksi Terpadu", "Refleksi Bersepadu")
            : L("Supportive Reflection", "Refleksi yang Mendukung", "Refleksi yang Menyokong"),
        description: L(
          `Write ${easy ? "3" : "5"} bullets: what feels present, what ${reflectionTheme} is asking for, what yesterday taught you, what support is realistic, and what can wait.`,
          `Tulis ${easy ? "3" : "5"} poin: apa yang hadir, apa yang diminta oleh ${reflectionTheme}, apa pelajaran kemarin, dukungan apa yang realistis, dan apa yang bisa menunggu.`,
          `Tulis ${easy ? "3" : "5"} poin: apa yang hadir, apa yang diminta oleh ${reflectionTheme}, apa pengajaran semalam, sokongan apa yang realistik, dan apa yang boleh menunggu.`,
        ),
        estimatedMinutes: easy ? minMinutes : growth ? Math.min(maxMinutes, 15) : Math.min(maxMinutes, 10),
      },
      {
        id: "reflection",
        category: "reflection",
        title: L("Pattern-to-Need Journal", "Jurnal Pola ke Kebutuhan", "Jurnal Corak kepada Keperluan"),
        description: L(
          `Journal one pattern you noticed recently, the need underneath it, and one supportive response for today.${astroLine}`,
          `Tulis satu pola yang akhir-akhir ini terlihat, kebutuhan di baliknya, dan satu respons yang mendukung untuk hari ini.${astroLine}`,
          `Tulis satu corak yang kebelakangan ini kelihatan, keperluan di sebaliknya, dan satu tindak balas yang menyokong untuk hari ini.${astroLine}`,
        ),
        estimatedMinutes: easy ? Math.min(maxMinutes, 7) : Math.min(maxMinutes, 12),
      },
    ],
    action: [
      {
        id: "action",
        category: "action",
        title: easy
          ? L("Tiny Real-Life Completion", "Satu Selesai Kecil", "Satu Penyelesaian Kecil")
          : growth
            ? L("Next-Level Practical Step", "Langkah Praktis Berikutnya", "Langkah Praktikal Seterusnya")
            : L("One Practical Step", "Satu Langkah Praktis", "Satu Langkah Praktikal"),
        description: L(
          `Choose one real-life task that expresses ${actionTheme}. Set a timer, complete one visible step, then stop and mark it done.`,
          `Pilih satu tugas nyata yang mengekspresikan ${actionTheme}. Pasang timer, selesaikan satu langkah yang terlihat, lalu berhenti dan tandai selesai.`,
          `Pilih satu tugasan nyata yang menyatakan ${actionTheme}. Tetapkan pemasa, selesaikan satu langkah yang kelihatan, kemudian berhenti dan tandakan sebagai selesai.`,
        ),
        estimatedMinutes: easy ? minMinutes : growth ? Math.min(maxMinutes, 18) : Math.min(maxMinutes, 12),
      },
      {
        id: "action",
        category: "action",
        title: L("Clear One Small Container", "Rapikan Satu Wadah Kecil", "Kemaskan Satu Bekas Kecil"),
        description: L(
          `Create or tidy one small container for today's energy: calendar block, checklist, desk corner, message, or reminder. Keep it measurable and complete.`,
          `Buat atau rapikan satu wadah kecil untuk energi hari ini: blok kalender, checklist, sudut meja, pesan, atau pengingat. Buat terukur dan selesai.`,
          `Cipta atau kemaskan satu bekas kecil untuk tenaga hari ini: blok kalendar, senarai semak, sudut meja, mesej, atau peringatan. Pastikan ia boleh diukur dan selesai.`,
        ),
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
