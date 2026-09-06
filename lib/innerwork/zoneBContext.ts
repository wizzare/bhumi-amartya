import type { JourneyInnerworkCompletion, JourneyInnerworkRecommendation } from "@/lib/types/journeyDailyRecord";
import { journeyRepository } from "@/lib/repositories/journeyRepository";
import { isEnlEdition } from "@/lib/config/edition";

export type ZoneBPracticeCategory = "journaling" | "meditation" | "breathwork" | "mudra" | "yoga" | "workout" | "manifestation" | "healthyFood";

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
  if (!["journaling", "meditation", "breathwork", "mudra", "yoga", "workout", "manifestation", "healthyFood"].includes(practiceCategory)) return null;
  return {
    issue,
    practiceId,
    practiceCategory,
    sourceTheme,
    title,
    durationMinutes: Number.isFinite(durationMinutes) && durationMinutes > 0 ? durationMinutes : 5,
  };
}

const issueLanguageId: Record<string, { focus: string; benefit: string; action: string }> = {
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

const issueLanguageEn: Record<string, { focus: string; benefit: string; action: string }> = {
  difficulty_resting: {
    focus: "resting without guilt",
    benefit: "helps the body recognize that pausing is safe",
    action: "Choose one demand that can be postponed today.",
  },
  over_responsibility: {
    focus: "excessive burdens and over-responsibility",
    benefit: "helps distinguish genuine care from carrying what isn't yours",
    action: "Choose one burden you can set down.",
  },
  boundary_issue: {
    focus: "personal boundaries",
    benefit: "helps body and mind recognize space that needs protection",
    action: "Formulate one clear, calm boundary statement.",
  },
  low_energy: {
    focus: "energy restoration",
    benefit: "reduces pressure and supports gradual recovery",
    action: "Reduce one non-urgent activity today.",
  },
  anxiety: {
    focus: "anxiety and bodily tension",
    benefit: "brings awareness back to what is real right now",
    action: "Choose one thing within your control right now.",
  },
  love_block: {
    focus: "intimacy and safety in relationships",
    benefit: "creates space for emotional needs without losing boundaries",
    action: "Write down one honest need you wish to express.",
  },
  inner_child: {
    focus: "unmet needs of your younger self",
    benefit: "builds internal comfort, companionship, and safety",
    action: "Offer yourself one form of comfort you once needed.",
  },
  money_block: {
    focus: "money, self-worth, and security",
    benefit: "helps separate financial reality from anxiety",
    action: "Choose one small, realistic financial action step.",
  },
  self_worth: {
    focus: "self-worth beyond accomplishments",
    benefit: "reminds you that your worth needs no proof through performance",
    action: "Note one personal quality that remains true without achievement.",
  },
};

export function getZoneBGuide(context: ZoneBContext): ZoneBGuide {
  const isEn = isEnlEdition();
  const issueDict = isEn ? issueLanguageEn : issueLanguageId;
  const language = issueDict[context.issue] ?? (isEn
    ? {
        focus: context.sourceTheme,
        benefit: `helps create space for ${context.sourceTheme}`,
        action: "Choose one small step that feels most honest.",
      }
    : {
        focus: context.sourceTheme,
        benefit: `membantu memberi ruang pada tema ${context.sourceTheme}`,
        action: "Pilih satu langkah kecil yang terasa paling jujur.",
      });

  const shared = {
    title: context.title,
    durationMinutes: context.durationMinutes,
    benefits: isEn
      ? [language.benefit, "Building a more mindful response"]
      : [language.benefit, "Membangun respons yang lebih sadar"],
    reflectionQuestions: isEn
      ? [
          `How does the theme of ${language.focus} feel in your experience today?`,
          "What does your body or heart need most right now?",
          language.action,
        ]
      : [
          `Bagaimana tema ${language.focus} terasa dalam pengalamanmu hari ini?`,
          "Apa yang paling dibutuhkan tubuh atau hatimu sekarang?",
          language.action,
        ],
  };

  switch (context.practiceCategory) {
    case "journaling":
      return {
        ...shared,
        description: isEn
          ? `Written reflection centered on ${language.focus}.`
          : `Refleksi tertulis yang tetap berpusat pada ${language.focus}.`,
        steps: isEn
          ? ["Write down the situation that feels most present.", "Separate facts, feelings, and needs.", language.action]
          : ["Tuliskan situasi yang paling terasa.", "Pisahkan fakta, perasaan, dan kebutuhan.", language.action],
      };
    case "meditation":
      return {
        ...shared,
        description: isEn
          ? `Meditation to accompany ${language.focus} without forcing change.`
          : `Meditasi untuk menemani ${language.focus} tanpa memaksa perubahan.`,
        steps: isEn
          ? ["Sit or lie down comfortably.", "Follow ten natural breaths.", `Acknowledge ${language.focus} gently.`, language.action]
          : ["Duduk atau berbaring nyaman.", "Ikuti sepuluh napas alami.", `Akui ${language.focus} dengan lembut.`, language.action],
      };
    case "breathwork":
      return {
        ...shared,
        description: isEn
          ? `Breathing practice to help the body soften around ${language.focus}.`
          : `Latihan napas untuk membantu tubuh melunak saat berhadapan dengan ${language.focus}.`,
        steps: isEn
          ? ["Inhale for four counts.", "Exhale for six counts.", "Repeat without holding your breath.", language.action]
          : ["Tarik napas empat hitungan.", "Embuskan enam hitungan.", "Ulangi tanpa menahan napas.", language.action],
      };
    case "mudra":
      return {
        ...shared,
        description: isEn
          ? `Hand posture as an anchor of awareness for ${language.focus}.`
          : `Posisi tangan sebagai jangkar perhatian untuk tema ${language.focus}.`,
        steps: isEn
          ? ["Form the hand gesture as described.", "Rest hands comfortably.", "Breathe slowly.", language.action]
          : ["Bentuk posisi tangan sesuai nama praktik.", "Letakkan tangan dengan nyaman.", "Bernapas perlahan.", language.action],
      };
    case "yoga":
      return {
        ...shared,
        description: isEn
          ? `Mindful movement selected to support ${language.focus}.`
          : `Gerakan sadar yang dipilih untuk mendukung ${language.focus}.`,
        steps: isEn
          ? ["Prepare a stable surface.", `Move into ${context.title} slowly.`, "Maintain natural breathing.", "Exit the pose without rushing."]
          : ["Siapkan alas yang stabil.", `Masuk ke ${context.title} secara perlahan.`, "Pertahankan napas alami.", "Keluar dari pose tanpa terburu-buru."],
      };
    case "workout":
      return {
        ...shared,
        description: isEn
          ? `Measured physical movement that maintains awareness of ${language.focus}.`
          : `Gerak tubuh terukur yang tetap menjaga tema ${language.focus}.`,
        steps: isEn
          ? ["Begin with a gentle warm-up.", "Move at a rhythm that allows easy breathing.", "Ease intensity if the body tenses.", language.action]
          : ["Mulai dengan pemanasan ringan.", "Lakukan gerakan dengan ritme yang masih memungkinkan bernapas nyaman.", "Kurangi intensitas bila tubuh menegang.", language.action],
      };
    case "manifestation":
      return {
        ...shared,
        description: isEn
          ? `Grounded intention and reflection crafted for ${language.focus}.`
          : `Arah refleksi dan niat yang disusun dengan membumi untuk ${language.focus}.`,
        steps: isEn
          ? ["Acknowledge current circumstances.", "Choose one realistic intention for today.", "Write down one small step within your control.", language.action]
          : ["Akui keadaan yang sedang berlangsung.", "Pilih satu niat yang realistis untuk hari ini.", "Tuliskan satu langkah kecil yang berada dalam kendalimu.", language.action],
      };
    case "healthyFood":
      return {
        ...shared,
        description: isEn
          ? `Simple nourishment supporting ${language.focus} without perfectionism.`
          : `Pilihan asupan sederhana yang mendukung ${language.focus} tanpa tuntutan perfeksionisme.`,
        steps: isEn
          ? ["Select an accessible option suited to your body's needs.", "Savor slowly without self-judgment.", "Stop when your body feels nourished.", language.action]
          : ["Pilih satu pilihan yang tersedia dan sesuai kebutuhan tubuh.", "Nikmati perlahan tanpa menghakimi diri.", "Berhenti bila tubuh sudah cukup.", language.action],
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
  const isEn = isEnlEdition();
  const recommendation: JourneyInnerworkRecommendation = {
    practiceId: context.practiceId,
    practiceType: context.practiceCategory,
    practiceTitle: context.title,
    durationMinutes: context.durationMinutes,
    intensity: "guided",
    reason: isEn ? `Zone B practice for the theme of ${context.sourceTheme}.` : `Praktik Zone B untuk tema ${context.sourceTheme}.`,
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
      ? /calmer|lighter|relieved|lebih tenang|lebih ringan|lega/i.test(params.reflectionResult)
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
