/**
 * Simple hash function for string data.
 */
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generates a hash for the user\u0027s blueprint to detect meaningful changes.
 */
export function generateBlueprintHash(blueprint: any): string {
  if (!blueprint) return "no-blueprint";

  // Extract key fields that affect Human Design and Astrology
  const parts = [
    blueprint.input?.birthDate,
    blueprint.input?.birthTime,
    blueprint.input?.birthCity,
    blueprint.input?.latitude,
    blueprint.input?.longitude,
    blueprint.input?.timezone,
    blueprint.humanDesign?.type,
    blueprint.humanDesign?.profile,
    blueprint.lifePath?.number,
    blueprint.destinyMatrix?.center,
  ].map(p => String(p || "").trim());

  return simpleHash(parts.join("|"));
}

/**
 * Generates a hash for the user\u0027s recent memory to detect meaningful changes.
 */
export function generateMemoryHash(context: any): string {
  if (!context) return "no-memory";

  // Hash recent journal and meditation counts + themes
  const journalIds = (context.previousJournalEntries || []).map((e: any) => e.id).sort().join(",");
  const meditationIds = (context.previousMeditationEntries || []).map((e: any) => e.id).sort().join(",");
  const emotionalState = context.profile?.emotionalState?.currentMood || "none";
  const themes = (context.profile?.emotionalState?.recurringThemes || []).sort().join(",");
  const journeyLearning = context.healingMemory
    ? JSON.stringify(context.healingMemory)
    : "no-journey-learning";

  return simpleHash(`${journalIds}|${meditationIds}|${emotionalState}|${themes}|${journeyLearning}`);
}

/**
 * Calculates similarity between two strings (0 to 1).
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1;

  const s1 = str1.toLowerCase().replace(/[^\w\s]/g, "");
  const s2 = str2.toLowerCase().replace(/[^\w\s]/g, "");

  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));

  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}
