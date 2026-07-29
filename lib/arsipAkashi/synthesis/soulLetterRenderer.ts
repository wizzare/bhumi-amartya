import type { ArsipAkashiInsightModel } from "./types";
import type { ArsipAkashiSoulLetter, ArsipAkashiSoulTheme } from "../types";
import { ARSIP_AKASHI_SOUL_LETTER_IDS } from "../types";
import { composePastSelfParagraphs, composeFutureSelfParagraphs } from "./soulLetterTemplates";
import { buildPresentLetterContext, composePresentSelfParagraphs } from "./presentLetterTemplates";
import { sanitizeSoulLetterParagraph } from "./soulLetterSanitizer";
import { factSignatureToken } from "../factValue";

function sentenceCount(text: string): number {
  return text.split(/(?<=[.!?])\s+/).filter((s: string) => s.trim().length >= 6).length;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map((s: string) => s.trim()).filter((s: string) => s.length >= 6);
}

function fifthSentence(letterId: string, paragraphIndex: number): string {
  const pools: Record<string, string[]> = {
    "letter-to-past-self": [
      "Kelembutan ini tidak menghapus masa lalu, tetapi mengubah cara kamu memegangnya hari ini.",
      "Dari titik itu, kamu boleh berhenti menyebut bertahan sebagai satu-satunya bentuk kekuatan.",
      "Yang dulu terasa terlalu besar kini bisa ditemui pelan-pelan dengan napas yang lebih aman.",
      "Bagian kecil yang kamu rawat saat itu tetap menjadi bukti bahwa hidupmu tidak pernah kosong.",
      "Kini kamu dapat melihat masa lalu sebagai tempat belajar, bukan ruang yang harus kamu huni kembali.",
    ],
    "letter-to-present-self": [
      "Hari ini, hidup menjadi lebih ringan ketika kamu memilih satu langkah yang benar-benar bisa dijalani.",
      "Kejernihan tidak harus datang sekaligus, karena ia sering tumbuh setelah satu tindakan jujur.",
      "Tubuh, hati, dan arah hidupmu boleh diajak berjalan dengan tempo yang lebih manusiawi.",
      "Fase ini meminta kehadiran yang cukup nyata, bukan jawaban sempurna tentang seluruh perjalanan.",
      "Dari sini, kamu dapat merawat yang penting tanpa menambah beban yang tidak perlu.",
    ],
    "letter-from-future-self": [
      "Aku menulis dari ruang yang lebih matang, tempat kamu akhirnya belajar mempercayai prosesmu.",
      "Apa yang kamu pilih dengan jujur hari ini akan menjadi pijakan yang terasa lebih kuat nanti.",
      "Masa depan tidak meminta kamu berlari, tetapi mengajakmu mengulang keberanian kecil dengan sadar.",
      "Kamu akan mengenali hasilnya melalui hidup yang terasa lebih selaras, bukan sekadar lebih ramai.",
      "Dari sini, aku ingin kamu tahu bahwa pertumbuhan yang lembut tetap bisa mengubah arah.",
    ],
  };
  const pool = pools[letterId] ?? pools["letter-to-present-self"];
  return pool[(paragraphIndex - 1) % pool.length];
}

function fallbackParagraph(letterId: string, paragraphIndex: number): string {
  const opener = letterId === "letter-to-past-self"
    ? "Aku ingin memeluk bagian dirimu yang dulu belajar bertahan tanpa banyak saksi."
    : letterId === "letter-to-present-self"
      ? "Aku ingin menemani bagian dirimu yang sedang berdiri di tengah fase hidup hari ini."
      : "Aku menulis dari sisi dirimu yang sudah melihat perjalanan ini dengan lebih lapang.";
  const second = letterId === "letter-to-past-self"
    ? "Saat itu, kamu mungkin belum punya bahasa untuk semua rasa yang bergerak di dalam tubuh."
    : letterId === "letter-to-present-self"
      ? "Saat ini, tidak semua jawaban harus langsung disusun menjadi keputusan besar."
      : "Suatu hari, kamu akan mengerti mengapa langkah kecil yang jujur tidak pernah sia-sia.";
  const third = letterId === "letter-to-past-self"
    ? "Namun, ada keberanian sunyi yang tetap bekerja bahkan ketika kamu merasa hanya sedang bertahan."
    : letterId === "letter-to-present-self"
      ? "Namun, kamu tetap bisa memilih satu kebutuhan nyata dan memberinya tempat yang cukup."
      : "Namun, masa depan yang matang dibangun dari pilihan kecil yang kamu rawat berulang kali.";
  const fourth = letterId === "letter-to-past-self"
    ? "Bagian itu layak dikenang dengan hormat, bukan terus diadili memakai pengetahuan hari ini."
    : letterId === "letter-to-present-self"
      ? "Bagian yang paling membutuhkan perhatian tidak perlu dibesar-besarkan agar pantas dirawat."
      : "Bagian dirimu yang sedang belajar hari ini akan menjadi dasar dari ketenangan nanti.";
  return [opener, second, third, fourth, fifthSentence(letterId, paragraphIndex)].join(" ");
}

function letterSignature(
  letterId: string,
  themes: { themeId: string; emotionalDirection: string; coverageStatus: string }[],
  model: ArsipAkashiInsightModel,
): string {
  const ids = themes.map(t => t.themeId).sort().join(",");
  const eds = themes.map(t => t.emotionalDirection).sort().join(",");
  const factTokens = model.sections.flatMap(s => s.selectedFacts.map(f => factSignatureToken(f.value, 10))).slice(0, 8).join("|");
  return `${letterId}|${ids}|${eds}|${factTokens}`;
}

export function renderSoulLetters(model: ArsipAkashiInsightModel): ArsipAkashiSoulLetter[] {
  const allThemes = model.soulLetterThemes;

  const letters: ArsipAkashiSoulLetter[] = [];

  for (const letterId of ARSIP_AKASHI_SOUL_LETTER_IDS) {
    const selected = allThemes.filter(t =>
      letterId === "letter-to-past-self"
        ? ["recurring-patterns", "emotional-wounds", "inner-child", "self-sabotage", "forgiveness", "healing"].includes(t.themeId)
        : letterId === "letter-to-present-self"
          ? ["recurring-patterns", "healing", "growth", "self-sabotage", "karmic-lessons"].includes(t.themeId)
          : ["karmic-lessons", "growth", "returning-to-self", "future-direction", "healing", "recurring-patterns"].includes(t.themeId),
    );

    const sig = letterSignature(letterId, selected, model);
    const presentPlan = letterId === "letter-to-present-self" ? buildPresentLetterContext(model) : undefined;
    const raw = letterId === "letter-to-past-self"
      ? composePastSelfParagraphs(selected, sig)
      : letterId === "letter-to-present-self"
        ? composePresentSelfParagraphs(model, presentPlan!)
        : composeFutureSelfParagraphs(selected, sig);

    const usedParagraphs = new Set<string>();
    const usedPrefixes = new Set<string>();
    const paragraphs: string[] = [];

    for (const parts of raw) {
      if (paragraphs.length >= 5) break;
      const text = parts.join(" ").trim();
      const san = sanitizeSoulLetterParagraph(text);
      if (san.issues.length > 0) continue;
      const normal = san.cleaned.toLowerCase().trim();
      if (usedParagraphs.has(normal)) continue;
      const prefix = normal.split(/\s+/).slice(0, 8).join(" ");
      if (usedPrefixes.has(prefix)) continue;
      const parsedSentences = sentences(san.cleaned);
      if (parsedSentences.length < 4 || parsedSentences.length > 5) continue;
      const exact = parsedSentences.length === 5 ? parsedSentences.join(" ") : [...parsedSentences, fifthSentence(letterId, paragraphs.length + 1)].join(" ");
      if (sentenceCount(exact) !== 5) continue;
      if (wordCount(exact) < 20) continue;
      usedParagraphs.add(normal);
      usedPrefixes.add(prefix);
      paragraphs.push(exact);
    }

    while (paragraphs.length < 5) {
      paragraphs.push(fallbackParagraph(letterId, paragraphs.length + 1));
    }

    const supportIds = selected.flatMap(t => t.supportingFactIds).slice(0, 20);
    const systems = [...new Set(selected.flatMap(t => t.contributingSystems))].sort();

    letters.push({
      letterId,
      title: letterId === "letter-to-past-self"
        ? "Surat untuk Dirimu di Masa Lalu"
        : letterId === "letter-to-present-self"
          ? "Surat untuk Dirimu di Masa Sekarang"
          : "Surat dari Dirimu di Masa Depan",
      paragraphs,
      sourceSystemIds: systems,
      supportingFactIds: supportIds,
      themes: selected.map(t => t.themeId) as ArsipAkashiSoulTheme[],
      limitations: selected.filter(t => t.coverageStatus !== "fully-supported").map(t => `coverage:${t.themeId}`),
      presentPlan: presentPlan ? {
        currentPhaseThemes: presentPlan.phaseThemes,
        currentTransitThemes: presentPlan.phaseThemes,
        currentIdentityThemes: presentPlan.identityThemes,
        activePatternThemes: presentPlan.patterns,
        presentTensionThemes: presentPlan.tensions,
        presentCareDirection: "Memberi perhatian pada kebutuhan yang paling nyata di fase ini.",
        presentGrowthDirection: "Memilih satu langkah kecil yang dapat dijalani dengan sadar dan berkelanjutan.",
        referenceDate: presentPlan.referenceDate,
        contributingFactIds: presentPlan.factIds,
        contributingSystems: presentPlan.contributingSystems as any,
        timingLimitations: presentPlan.timingLimitations,
      } : undefined,
      generatedAt: model.generatedAt,
      contentVersion: model.sourceVersion,
    });
  }

  return letters;
}
