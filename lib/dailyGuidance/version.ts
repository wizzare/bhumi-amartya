import type { DailyGuidance } from "@/lib/dailyGuidance/types";
import { generateBlueprintHash, generateMemoryHash, calculateSimilarity } from "@/lib/utils/hashing";

export const DAILY_GUIDANCE_SCHEMA_VERSION = "dailyGuidance.v8";
export const DAILY_GUIDANCE_PROMPT_VERSION = "BHUMI_DAILY_COMPANION_ENGINE_V8_QUOTA_SAFE";

export function getDailyGuidanceStaleReason(
  guidance: DailyGuidance | null,
  expected: { uid: string; localDateKey: string; blueprint?: any; context?: any; previousGuidance?: DailyGuidance | null },
): string | null {
  if (!guidance) return null;

  if (guidance.uid !== expected.uid) return "uid_mismatch";
  if (guidance.localDateKey !== expected.localDateKey) return "local_date_key_mismatch";
  if (guidance.schemaVersion !== DAILY_GUIDANCE_SCHEMA_VERSION) return "schema_version_mismatch";
  if (guidance.generatedWithPromptVersion !== DAILY_GUIDANCE_PROMPT_VERSION) return "prompt_version_mismatch";

  // Build 31.3: Quota-safe hash validation
  if (expected.blueprint) {
    const bpHash = generateBlueprintHash(expected.blueprint);
    if (guidance.blueprintHash && guidance.blueprintHash !== bpHash) {
      return "blueprint_hash_mismatch";
    }
  }

  if (expected.context) {
    const memHash = generateMemoryHash(expected.context);
    if (guidance.memoryHash && guidance.memoryHash !== memHash) {
      return "memory_hash_mismatch";
    }
  }

  // P2: Previous-text repetition detection (similarity > 0.85)
  if (expected.previousGuidance) {
    const soulSim = calculateSimilarity(guidance.soulReflectionText || "", expected.previousGuidance.soulReflectionText || "");
    const noteSim = calculateSimilarity(guidance.dailyNoteText || "", expected.previousGuidance.dailyNoteText || "");

    if (soulSim > 0.85) return "repetition_detected_soul";
    if (noteSim > 0.85) return "repetition_detected_note";
  }

  // Stale Rule: If it was generated via fallback but AI is now available (server side)
  const isServer = typeof window === "undefined";
  if (isServer && guidance.source === "fallback" && process.env.GEMINI_API_KEY) {
    return "fallback_needs_ai_upgrade";
  }

  // Stale Rule: Detect static non-personalized soul reflection text
  const staticFallbacks = [
    "Tidak semua jawaban harus datang hari ini. Biarkan tenang hadir lebih dulu, lalu jernih menyusul pelan-pelan.",
    "Hari ini mungkin tidak meminta sebanyak yang kamu kira. Izinkan dirimu bergerak dengan lembut.",
    "Satu langkah kecil yang tulus sering lebih kuat daripada sepuluh langkah yang lahir dari tekanan.",
    "Kamu tidak harus memegang semuanya sekaligus. Mulailah dari yang terasa baik dan jujur.",
    "Not every answer needs to arrive today. Let peace come first, and clarity follow later.",
    "Today may ask less from you than you think. Give yourself permission to move gently.",
    "One sincere small step can be more powerful than ten taken from pressure.",
    "You do not have to hold everything at once. Begin with what feels kind and true.",
    "Bernapaslah sejenak. Hari ini adalah awal baru untuk mengenal dirimu lebih dalam.",
    "Fokuslah pada hal-hal kecil yang memberimu ketenangan hari ini."
  ];
  if (staticFallbacks.includes(guidance.soulReflectionText || "")) {
    return "static_fallback_detected";
  }

  if (!guidance.companionReflection) return "missing_companionReflection";
  if (!guidance.companionReflection.preview?.trim()) return "missing_companionReflection.preview";
  if (guidance.companionReflection.preview.includes("Catatan belum tersedia")) return "missing_catatan_static_fallback";
  if (!guidance.companionReflection.fullReflection?.trim()) return "missing_companionReflection.fullReflection";
  if (guidance.companionReflection.fullReflection.includes("Catatan belum tersedia")) return "missing_catatan_static_fallback";
  if (guidance.companionReflection.fullReflection.trim().length < 3000) return "short_companionReflection.fullReflection";
  if (!guidance.soulReflectionText?.trim()) return "missing_soulReflectionText";

  // Build 31.3: Removed aggressive character count checks to prevent 429 loops.
  // Validation is now primarily handled via input hashes in the engine.

  return null;
}
