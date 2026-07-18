import fs from "node:fs";

const repository = fs.readFileSync("lib/repositories/astrologyRepository.ts", "utf8");
const consumer = fs.readFileSync("lib/services/weeklyRecommendationService.ts", "utf8");
if (!repository.includes("export const astrologyRepository")) throw new Error("canonical owner missing");
if (!repository.includes("async getWeeklyTransits(): Promise<AstrologyTransitContext | null>")) throw new Error("weekly method contract missing");
if (!repository.includes("return this.getCurrentTransits();")) throw new Error("weekly method is not a narrow compatibility delegate");
if (!consumer.includes("astrologyRepository.getWeeklyTransits()")) throw new Error("consumer contract missing");
if (repository.includes("return [];")) throw new Error("fabricated empty fallback");
if (/getWeeklyTransits[\\s\\S]{0,300}any/.test(repository) || repository.includes("@ts-ignore") || repository.includes("@ts-expect-error")) throw new Error("unsafe astrology contract");
console.log("ASTROLOGY_WEEKLY_TRANSITS_CONTRACT_PASS");
export {};
