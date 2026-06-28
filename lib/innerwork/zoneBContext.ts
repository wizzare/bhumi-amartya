import type { JourneyInnerworkCompletion, JourneyInnerworkRecommendation } from "@/lib/types/journeyDailyRecord";
import { journeyRepository } from "@/lib/repositories/journeyRepository";

export type ZoneBPracticeCategory = "journaling" | "meditation" | "breathwork" | "mudra" | "yoga" | "workout";

export type ZoneBContext = {
  issue: string;
  practiceId: string;
  practiceCategory: ZoneBPracticeCategory;
  sourceTheme: string;
  title: string;
  durationMinutes: number;
};

export type ZoneBGuide = {
  title: string;
  description: string;
  steps: string[];
  benefits: string[];
  durationMinutes: number;
  reflectionQuestions: string[];
};

export function buildZoneBHref(baseHref: string, context: ZoneBContext): string {
  const params = new URLSearchParams({
    issue: context.issue,
    practiceId: context.practiceId,
    practiceCategory: context.practiceCategory,
    sourceTheme: context.sourceTheme,
    title: context.title,
    duration: String(context.durationMinutes),
  });
  return `${baseHref}?${params.toString()}`;
}

export function readZoneBContext(search: string): ZoneBContext | null {
  const params = new URLSearchParams(search);
  const issue = params.get("issue");
  const practiceId = params.get("practiceId");
  const practiceCategory = params.get("practiceCategory") as ZoneBPracticeCategory | null;
  const sourceTheme = params.get("sourceTheme");
  const title = params.get("title");
  const durationMinutes = Number(params.get("duration"));
  if (!issue || !practiceId || !practiceCategory || !sourceTheme || !title) return null;
  if (!["journaling", "meditation", "breathwork", "mudra", "yoga", "workout"].includes(practiceCategory)) return null;
  return {
    issue,
    practiceId,
    practiceCategory,
    sourceTheme,
    title,
    durationMinutes: Number.isFinite(durationMinutes) && durationMinutes > 0 ? durationMinutes : 5,
  };
}

const issueLanguage: Record<string, { focus: string; benefit: string; action: string }> = {
  difficulty_resting: {
    focus: "kesulitan beristirahat tanpa rasa bersalah",
    benefit: "membantu tubuh mengenali bahwa berhenti sejenak tetap aman",
    action: "Pilih satu tuntutan yang dapat ditunda hari ini.",
  },
  over_responsibility: {
    focus: "beban dan tanggung jawab yang berlebihan",
    benefit: "membantu membedakan kepedulian dari beban yang bukan milikmu",
    action: "Pilih satu beban yang dapat kamu letakkan kembali.",
  },
  boundary_issue: {
    focus: "batas pribadi",
    benefit: "membantu tubuh dan pikiran mengenali ruang yang perlu dijaga",
    action: "Susun satu kalimat batas yang jujur dan tenang.",
  },
  low_energy: {
    focus: "pemulihan tenaga",
    benefit: "mengurangi beban dan mendukung pemulihan bertahap",
    action: "Kurangi satu aktivitas yang tidak mendesak.",
  },
  anxiety: {
    focus: "kecemasan dan ketegangan tubuh",
    benefit: "membantu perhatian kembali pada keadaan yang nyata saat ini",
    action: "Pilih satu hal yang dapat kamu kendalikan sekarang.",
  },
  love_block: {
    focus: "kedekatan dan rasa aman dalam hubungan",
    benefit: "memberi ruang bagi kebutuhan hati tanpa kehilangan batas",
    action: "Tuliskan satu kebutuhan yang ingin disampaikan dengan jujur.",
  },
  inner_child: {
    focus: "kebutuhan lama dari bagian diri yang lebih muda",
    benefit: "membangun rasa ditemani dan dilindungi dari dalam",
    action: "Berikan satu bentuk dukungan yang dulu kamu butuhkan.",
  },
  money_block: {
    focus: "uang, nilai diri, dan rasa aman",
    benefit: "membantu memisahkan fakta dari ketakutan finansial",
    action: "Pilih satu langkah finansial kecil yang realistis.",
  },
  self_worth: {
    focus: "nilai diri di luar pencapaian",
    benefit: "mengingatkan bahwa nilai diri tidak perlu dibuktikan melalui hasil",
    action: "Catat satu kualitas diri yang tetap ada tanpa pencapaian.",
  },
};

export function getZoneBGuide(context: ZoneBContext): ZoneBGuide {
  const language = issueLanguage[context.issue] ?? {
    focus: context.sourceTheme,
    benefit: `membantu memberi ruang pada tema ${context.sourceTheme}`,
    action: "Pilih satu langkah kecil yang terasa paling jujur.",
  };
  const shared = {
    title: context.title,
    durationMinutes: context.durationMinutes,
    benefits: [language.benefit, "Membangun respons yang lebih sadar"],
    reflectionQuestions: [
      `Bagaimana tema ${language.focus} terasa dalam pengalamanmu hari ini?`,
      "Apa yang paling dibutuhkan tubuh atau hatimu sekarang?",
      language.action,
    ],
  };

  switch (context.practiceCategory) {
    case "journaling":
      return {
        ...shared,
        description: `Refleksi tertulis yang tetap berpusat pada ${language.focus}.`,
        steps: ["Tuliskan situasi yang paling terasa.", "Pisahkan fakta, perasaan, dan kebutuhan.", language.action],
      };
    case "meditation":
      return {
        ...shared,
        description: `Meditasi untuk menemani ${language.focus} tanpa memaksa perubahan.`,
        steps: ["Duduk atau berbaring nyaman.", "Ikuti sepuluh napas alami.", `Akui ${language.focus} dengan lembut.`, language.action],
      };
    case "breathwork":
      return {
        ...shared,
        description: `Latihan napas untuk membantu tubuh melunak saat berhadapan dengan ${language.focus}.`,
        steps: ["Tarik napas empat hitungan.", "Embuskan enam hitungan.", "Ulangi tanpa menahan napas.", language.action],
      };
    case "mudra":
      return {
        ...shared,
        description: `Posisi tangan sebagai jangkar perhatian untuk tema ${language.focus}.`,
        steps: ["Bentuk posisi tangan sesuai nama praktik.", "Letakkan tangan dengan nyaman.", "Bernapas perlahan.", language.action],
      };
    case "yoga":
      return {
        ...shared,
        description: `Gerakan sadar yang dipilih untuk mendukung ${language.focus}.`,
        steps: ["Siapkan alas yang stabil.", `Masuk ke ${context.title} secara perlahan.`, "Pertahankan napas alami.", "Keluar dari pose tanpa terburu-buru."],
      };
    case "workout":
      return {
        ...shared,
        description: `Gerak tubuh terukur yang tetap menjaga tema ${language.focus}.`,
        steps: ["Mulai dengan pemanasan ringan.", "Lakukan gerakan dengan ritme yang masih memungkinkan bernapas nyaman.", "Kurangi intensitas bila tubuh menegang.", language.action],
      };
  }
}

export async function saveZoneBJourneyContext(params: {
  uid: string;
  date: string;
  context: ZoneBContext;
  completed?: boolean;
  source?: string;
  reflectionResult?: string;
  reflectionResponse?: string;
}): Promise<void> {
  const { uid, date, context } = params;
  const recommendation: JourneyInnerworkRecommendation = {
    practiceId: context.practiceId,
    practiceType: context.practiceCategory,
    practiceTitle: context.title,
    durationMinutes: context.durationMinutes,
    intensity: "guided",
    reason: `Praktik Zone B untuk tema ${context.sourceTheme}.`,
    sourceSignals: [`zoneA:${context.issue}`, `zoneB:${context.practiceCategory}`, `sourceTheme:${context.sourceTheme}`],
  };
  const completion: JourneyInnerworkCompletion = {
    completed: params.completed ?? true,
    skipped: false,
    completedAt: new Date().toISOString(),
    actualPracticeId: context.practiceId,
    actualPracticeType: context.practiceCategory,
    actualDuration: context.durationMinutes,
    reflectionResult: params.reflectionResult,
    reflectionResponse: params.reflectionResponse,
    practiceHelped: params.reflectionResult
      ? /lebih tenang|lebih ringan|lega/i.test(params.reflectionResult)
      : null,
    userFelt: params.reflectionResult,
  };
  await journeyRepository.updateDailyRecord(uid, date, {
    dominantIssue: context.issue,
    issueCategory: context.sourceTheme,
    innerworkRecommendation: recommendation,
    innerworkCompletion: completion,
    sourceConfidence: 1,
  });
  await journeyRepository.appendPracticeResult(uid, date, {
    zone: "B",
    issue: context.issue,
    issueCategory: context.sourceTheme,
    practiceId: context.practiceId,
    practiceCategory: context.practiceCategory,
    practiceTitle: context.title,
    durationMinutes: context.durationMinutes,
    completedAt: completion.completedAt ?? new Date().toISOString(),
    source: params.source,
    reflectionResult: params.reflectionResult,
    reflectionResponse: params.reflectionResponse,
    practiceHelped: completion.practiceHelped,
  });
}
