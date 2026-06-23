import type { DailyGuidance, DailyGuidanceCategory } from "@/lib/dailyGuidance/types";
import { seededIndex } from "@/lib/dailyGuidance/dailyContentKey";
import { WellnessMapping } from "@/lib/engines/wellnessMappingEngine";
import type { UnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";

type DailyGuidanceCategories = NonNullable<DailyGuidance["categories"]>;

type CompanionAdviceInput = {
  baseAdvice: string;
  categoryKey: string;
  language: "id" | "en";
  dailyVariationSeed: string;
  localDateKey: string;
  completionRateYesterday?: number;
  streakDays?: number;
  practiceCompletedCountYesterday?: number;
  astrologyToday?: string | null;
  wellnessMapping?: WellnessMapping | null;
  unifiedBlueprint?: UnifiedBlueprintSynthesis | null;
};

function dayOffset(localDateKey: string): number {
  return Number(localDateKey.replaceAll("-", "")) || 0;
}

function weekdayIndex(localDateKey: string): number {
  const date = new Date(`${localDateKey}T12:00:00`);
  return Number.isFinite(date.getTime()) ? date.getDay() : 0;
}

function weekdayName(localDateKey: string, language: "id" | "en"): string {
  const date = new Date(`${localDateKey}T12:00:00`);
  const locale = language === "id" ? "id-ID" : "en-US";
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString(locale, { weekday: "long" })
    : localDateKey;
}

function pickDaily<T>(items: T[], seed: string, localDateKey: string, offset = 0): T {
  const index = (seededIndex(seed, items.length, offset) + dayOffset(localDateKey)) % items.length;
  return items[index];
}

function activityContext(input: CompanionAdviceInput): string {
  const completion = input.completionRateYesterday ?? 0;
  const streak = input.streakDays ?? 0;
  const practiceCount = input.practiceCompletedCountYesterday ?? 0;

  if (input.language === "en") {
    if (streak >= 3) return `Because your rhythm has repeated for ${streak} days, let today's practice protect consistency without turning it into pressure.`;
    if (completion >= 70) return "Because yesterday had solid completion, begin by appreciating what already worked before adding a new edge.";
    if (completion === 0) return "Because there were no records yesterday, today is a kind invitation to begin again from one small step.";
    if (practiceCount > 0) return "Because one practice was already touched recently, continue from that small proof of presence.";
    return "Because the recent rhythm looks quiet, make today's step small enough to actually finish.";
  }

  if (streak >= 3) return `Karena ritmemu sudah berulang ${streak} hari, biarkan praktik hari ini menjaga konsistensi tanpa berubah menjadi tekanan.`;
  if (completion >= 70) return "Karena kemarin cukup terisi, mulai dengan menghargai yang sudah berjalan sebelum menambah tepi baru.";
  if (completion === 0) return "Karena kemarin belum ada catatan baru, hari ini adalah undangan lembut untuk mulai kembali dari satu langkah kecil.";
  if (practiceCount > 0) return "Karena sudah ada satu praktik yang tersentuh belakangan ini, lanjutkan dari bukti kecil bahwa kamu tetap hadir.";
  return "Karena ritme terakhirmu tampak masih pelan, buat langkah hari ini cukup kecil untuk benar-benar selesai.";
}

function skyContext(input: CompanionAdviceInput): string {
  const sky = (input.astrologyToday || "").slice(0, 90).trim();
  if (!sky) {
    return input.language === "en"
      ? "Let today's sky stay as gentle context, not a prediction."
      : "Biarkan kondisi langit hari ini menjadi konteks lembut, bukan kepastian masa depan.";
  }
  return input.language === "en"
    ? `Let today's sky context, ${sky}, become a soft timing cue rather than something to chase.`
    : `Biarkan konteks langit hari ini, ${sky}, menjadi penanda ritme yang lembut, bukan sesuatu yang harus dikejar.`;
}

function wellnessContext(input: CompanionAdviceInput): string {
  const theme = input.wellnessMapping?.results?.[0];
  if (!theme) return "";

  if (input.language === "en") {
    return `Your current reflection suggests a theme of ${theme.label}: ${theme.explanation}`;
  }

  return `Refleksi harianmu menunjukkan adanya tema ${theme.label}: ${theme.explanation}`;
}

function blueprintContext(input: CompanionAdviceInput): string {
  const details = input.unifiedBlueprint?.differentiators?.slice(0, 3) ?? [];
  if (details.length === 0) return "";

  if (input.language === "en") {
    return "Your daily direction is personalized to match your unique design contours, helping you move with more flow.";
  }

  return "Arah harianmu disesuaikan dengan keunikan rancangan dirimu, membantumu melangkah dengan lebih selaras.";
}

function weekdayContext(input: CompanionAdviceInput): string {
  const weekday = weekdayIndex(input.localDateKey);
  const name = weekdayName(input.localDateKey, input.language);

  if (input.language === "en") {
    if (weekday === 1) return `${name} is a gentle direction-setting day: choose one intention and keep the first step kind.`;
    if (weekday >= 2 && weekday <= 4) return `${name} sits in the middle of the week: sustain focus, adjust pace, and protect your energy from scattering.`;
    if (weekday === 5) return `${name} carries end-of-week rhythm: close one loop, review your energy, and leave space for the weekend.`;
    return `${name} belongs to restoration: reflect, reconnect, and let one simple practice refill your inner room.`;
  }

  if (weekday === 1) return `${name} membawa ritme awal pekan: tetapkan satu arah dengan lembut, lalu mulai dari langkah yang ramah untuk tubuhmu.`;
  if (weekday >= 2 && weekday <= 4) return `${name} berada di tengah pekan: jaga fokus, sesuaikan tempo, dan lindungi energimu agar tidak tercecer.`;
  if (weekday === 5) return `${name} membawa nuansa menjelang akhir pekan: tutup satu lingkaran kecil, tinjau energimu, lalu sisakan ruang untuk bernapas.`;
  return `${name} adalah ruang pemulihan: refleksi, sambung kembali dengan dirimu, dan biarkan satu praktik sederhana mengisi ulang ruang batinmu.`;
}

export function buildDailyCompanionAdvice(input: CompanionAdviceInput): string {
  const isId = input.language === "id";
  const weekday = weekdayIndex(input.localDateKey);
  const seed = `${input.dailyVariationSeed}|weekday-${weekday}|companion|${input.categoryKey}`;
  const practicalDirections = isId
    ? [
        "Pilih satu tindakan yang bisa selesai dalam sepuluh menit, lalu berhenti sebelum ia berubah menjadi daftar panjang.",
        "Mulai dari tubuh: rapikan napas, turunkan bahu, lalu jawab satu hal yang memang perlu dijawab hari ini.",
        "Tulis satu kalimat yang paling jujur, kemudian ubah kalimat itu menjadi langkah kecil yang bisa kamu lakukan.",
        "Kurangi satu tuntutan yang tidak perlu, supaya energimu bisa kembali ke hal yang paling bermakna.",
        "Beri batas yang sederhana pada waktumu, lalu gunakan ruang itu untuk merawat satu kebutuhan yang nyata.",
      ]
    : [
        "Choose one action that can be completed in ten minutes, then stop before it becomes a long list.",
        "Begin with the body: settle your breath, lower your shoulders, then answer one thing that truly needs an answer today.",
        "Write one honest sentence, then turn that sentence into one small step you can take.",
        "Remove one unnecessary demand so your energy can return to what matters most.",
        "Place a simple boundary around your time, then use that space to care for one real need.",
      ];
  const companionOpenings = isId
    ? [
        "Hari ini bukan tentang melakukan lebih banyak, tetapi memilih arah yang lebih jernih.",
        "Hari ini, cobalah menukar reaksi cepat dengan respons yang lebih sadar.",
        "Arah paling membumi hari ini adalah memperlakukan energi kecil sebagai sesuatu yang cukup berharga.",
        "Hari ini, jangan ukur kemajuan dari seberapa berat langkahmu, tetapi dari seberapa jujur kamu menjalaninya.",
        "Kuncinya hari ini adalah membuat ruang sebelum bergerak, supaya pilihanmu tidak lahir dari dorongan sesaat.",
      ]
    : [
        "Today is not about doing more, but choosing a clearer direction.",
        "Today, try trading a quick reaction for a more conscious response.",
        "The grounded direction today is to treat small energy as something valuable enough.",
        "Today, do not measure progress by how heavy the step feels, but by how honest it is.",
        "The key today is to make space before moving so your choice is not born from a passing impulse.",
      ];
  const categoryDirections: Record<string, string[]> = {
    general: isId
      ? ["Jaga hari tetap sederhana: satu prioritas, satu jeda, satu penyelesaian kecil.", "Gunakan hal yang paling dekat sebagai pintu masuk untuk kembali hadir."]
      : ["Keep the day simple: one priority, one pause, one small completion.", "Use what is closest as the entry point for returning to presence."],
    mental: isId
      ? ["Rapikan satu pikiran berulang dengan menuliskannya, bukan memutarnya terus di kepala.", "Beri pikiranmu wadah yang jelas: catatan singkat, urutan kecil, lalu jeda."]
      : ["Tidy one recurring thought by writing it down instead of replaying it.", "Give your mind a clear container: a short note, a small order, then a pause."],
    finance: isId
      ? ["Pilih satu keputusan sumber daya yang membuatmu merasa lebih tenang, bukan lebih tegang.", "Tinjau satu angka atau rencana kecil, lalu berhenti sebelum kecemasan mengambil alih."]
      : ["Choose one resource decision that makes you feel calmer, not tighter.", "Review one number or small plan, then stop before worry over."],
    love: isId
      ? ["Sampaikan satu kebenaran dengan lembut, terutama pada relasi yang paling ingin kamu jaga.", "Berikan perhatian tanpa mengorbankan pusat dirimu sendiri."]
      : ["Speak one truth gently, especially in a relationship you want to protect.", "Offer care without abandoning your own center."],
    relational: isId
      ? ["Dengarkan satu percakapan sampai selesai sebelum menyiapkan pembelaan atau jawaban.", "Pilih kata yang menenangkan, tetapi tetap jujur pada batasmu."]
      : ["Listen to one conversation fully before preparing defense or reply.", "Choose words that soothe while staying honest about your boundary."],
    spiritual: isId
      ? ["Ambil satu momen hening sebagai cara pulang, bukan cara melarikan diri.", "Biarkan praktik batin tetap sederhana: napas, syukur, lalu satu tindakan nyata."]
      : ["Take one quiet moment as a way home, not a way to escape.", "Keep inner practice simple: breath, gratitude, then one real action."],
    challenges: isId
      ? ["Saat dorongan terburu-buru muncul, perlambat satu keputusan sebelum melangkah.", "Temui bagian yang tegang dengan napas, bukan dengan tuntutan baru."]
      : ["When urgency appears, slow one decision before moving.", "Meet the tense part with breath, not with another demand."],
    opportunities: isId
      ? ["Buka ruang untuk peluang kecil, terutama yang terasa realistis dan tidak membuatmu meninggalkan diri.", "Sambut kemungkinan baru lewat satu percakapan atau langkah yang masih membumi."]
      : ["Make room for a small opening, especially one that feels realistic and does not make you abandon yourself.", "Welcome new possibility through one grounded conversation or step."],
    advice: isId
      ? ["Jadikan pelajaran hari ini sebagai tindakan kecil, bukan hanya pemahaman yang indah.", "Integrasikan satu hal yang kamu sadari lewat pilihan yang bisa terlihat."]
      : ["Turn today's lesson into a small action, not only a beautiful understanding.", "Integrate one thing you noticed through a visible choice."],
  };

  const opening = pickDaily(companionOpenings, `${seed}|opening`, input.localDateKey);
  const practical = pickDaily(practicalDirections, `${seed}|practical`, input.localDateKey, 7);
  const category = pickDaily(categoryDirections[input.categoryKey] || categoryDirections.general, `${seed}|category`, input.localDateKey, 13);

  const wellness = wellnessContext(input);
  const otherContext = pickDaily([activityContext(input), skyContext(input)], `${seed}|context`, input.localDateKey, 19);
  const contextLine = [wellness, otherContext].filter(Boolean).join(" ");

  const base = input.baseAdvice.trim();

  // Combine elements naturally to form a tight, cohesive paragraph (max 3-4 sentences) without raw differentiators leak
  const fallbackAdvice = [opening, category, contextLine, practical]
    .filter(Boolean)
    .join(" ");

  return [
    fallbackAdvice,
    base,
  ].filter(Boolean).join("\n\n");
}

export function refreshDailyCompanionCategories(
  categories: DailyGuidanceCategories | undefined,
  input: Omit<CompanionAdviceInput, "baseAdvice" | "categoryKey">,
): DailyGuidanceCategories | undefined {
  if (!categories) return categories;
  const entries = Object.entries(categories).map(([key, category]) => {
    const nextCategory: DailyGuidanceCategory = {
      ...category,
      advice: buildDailyCompanionAdvice({
        ...input,
        categoryKey: key,
        baseAdvice: category.advice,
      }),
    };
    return [key, nextCategory];
  });
  return Object.fromEntries(entries) as DailyGuidanceCategories;
}
