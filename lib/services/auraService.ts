import { Blueprint } from "../types/blueprint";
import { calculateAuraScores } from "./auraAdapter";
import { generateAuraResult, AuraResult } from "./auraResultGenerator";

const COLOR_MAP: Record<string, string> = {
  RED: "MERAH",
  ORANGE: "JINGGA",
  YELLOW: "KUNING",
  GREEN: "HIJAU",
  BLUE: "BIRU",
  PURPLE: "UNGU",
  GOLD: "EMAS",
  SILVER: "PERAK",
};

export class AuraService {
  public static calculateAura(blueprint: Blueprint): AuraResult {
    // 1. Get raw scores from adapter
    const rawScores = calculateAuraScores(blueprint);

    // 2. Normalize and scale scores so they fall between 45 and 95 (percentage representation)
    const scoresList = Object.entries(rawScores);
    const rawVals = scoresList.map(([_, v]) => v);
    const maxRaw = Math.max(...rawVals);
    const minRaw = Math.min(...rawVals);
    const range = maxRaw - minRaw || 1;

    const normalizedScores: Record<string, number> = {};
    scoresList.forEach(([color, val]) => {
      // Scale from 45% to 95%
      normalizedScores[color] = Math.round(45 + ((val - minRaw) / range) * 50);
    });

    // 3. Sort colors by score to determine rankings
    const sortedColors = Object.entries(normalizedScores)
      .map(([color, score]) => ({
        color: color.toUpperCase(),
        score,
      }))
      .sort((a, b) => b.score - a.score);

    // Map English colors to Indonesian keys
    const primaryAura = COLOR_MAP[sortedColors[0].color] || "KUNING";
    const secondaryAura = COLOR_MAP[sortedColors[1].color] || "HIJAU";
    const shadowAura = COLOR_MAP[sortedColors[2].color] || "PERAK";

    // 4. Generate final result details
    return generateAuraResult(primaryAura, secondaryAura, shadowAura, normalizedScores);
  }
}
