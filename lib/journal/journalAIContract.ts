// V5-03 Journal AI Response Contract — reflective only, never diagnostic.
// 2-4 sentences, user-controllable per mode, crisis → resource card (no AI).

import { crisisScanJournalText, sanitizeAIOutput } from "./journalSafety";
import type { JournalType } from "@/lib/data/types";

export interface JournalAIResponse {
  suppressed: boolean;
  reason?: "crisis";
  reflectiveText?: string; // 2-4 sentences, provenance ai-insight
  provenance: "ai-insight" | "none";
}

// Local fallback generative — mirrors generateLocalJournalInsight but under AI contract.
// Never includes diagnostic language; always framed as "one possible reflection".
export function generateJournalAIResponse(input: {
  journalType: JournalType;
  content: string;
  locale: "id" | "en" | "ms";
  theme?: string;
}): JournalAIResponse {
  const scan = crisisScanJournalText(input.content);
  if (scan.shouldSuppressAI) {
    return { suppressed: true, reason: "crisis", provenance: "none" };
  }
  if (!input.content.trim()) {
    return { suppressed: false, reflectiveText: undefined, provenance: "none" };
  }

  const t = input.locale;
  const themeLine = input.theme ? `tema ${input.theme}` : t === "en" ? "what you wrote" : t === "ms" ? "apa yang anda tulis" : "apa yang kamu tulis";

  const templates: Record<string, string[]> = {
    id: [
      `Satu kemungkinan refleksi: ${themeLine} tampak membawa sesuatu yang ingin didengar tanpa dihakimi.`,
      `Mungkin ada kebutuhan lembut di baliknya — seperti keinginan untuk merasa aman, dimengerti, atau diberi ruang.`,
      `Jika berguna, kamu bisa menyimpan refleksi ini atau membiarkannya lewat tanpa harus ditindaklanjuti.`,
    ],
    en: [
      `One possible reflection: ${themeLine} seems to carry something that wants to be heard without judgment.`,
      `There may be a gentle need underneath — like wanting to feel safe, understood, or given space.`,
      `If helpful, you can keep this reflection or let it pass without needing to act on it.`,
    ],
    ms: [
      `Satu kemungkinan refleksi: ${themeLine} seolah membawa sesuatu yang ingin didengari tanpa dihakimi.`,
      `Mungkin ada keperluan lembut di sebaliknya — seperti keinginan untuk rasa selamat atau difahami.`,
      `Jika membantu, anda boleh menyimpan refleksi ini atau membiarkannya berlalu tanpa perlu bertindak.`,
    ],
  };

  const sentences = templates[t] || templates.id;
  // 2-3 sentences base; mode hint adds specificity without diagnosis.
  const modeHint: Record<JournalType, string> = {
    FREE: t === "id" ? "Menulis bebas memberi ruang untuk kejujuran." : t === "en" ? "Free writing gives space for honesty." : "Menulis bebas memberi ruang untuk kejujuran.",
    GUIDED: t === "id" ? "Pertanyaan tadi mungkin membuka sudut pandang baru." : t === "en" ? "The prompt may have opened a new angle." : "Soalan tadi mungkin membuka sudut baru.",
    EMOTION: t === "id" ? "Perasaan yang kamu beri nama layak ditemani dengan lembut." : t === "en" ? "The feeling you named deserves gentle company." : "Perasaan yang anda namakan wajar ditemani lembut.",
    CBT: t === "id" ? "Memisahkan situasi, pikiran, dan interpretasi bisa memberi jarak yang menenangkan." : t === "en" ? "Separating situation, thought, and interpretation can create calming distance." : "Memisahkan situasi, fikiran dan tafsiran boleh memberi jarak menenangkan.",
    SPIRITUAL_AWAKENING: t === "id" ? "Makna yang kamu jelajahi tidak perlu dibuktikan — cukup ditemani." : t === "en" ? "The meaning you explore need not be proven — just accompanied." : "Makna yang anda terokai tidak perlu dibuktikan — cukup ditemani.",
  };

  const text = `${sentences[0]} ${modeHint[input.journalType]} ${sentences[2]}`;
  return { suppressed: false, reflectiveText: sanitizeAIOutput(text), provenance: "ai-insight" };
}
