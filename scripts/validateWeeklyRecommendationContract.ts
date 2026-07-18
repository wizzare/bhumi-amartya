import fs from "node:fs";

const typeSource = fs.readFileSync("lib/types/communication.ts", "utf8");
const service = fs.readFileSync("lib/services/weeklyRecommendationService.ts", "utf8");
const repository = fs.readFileSync("lib/repositories/weeklyRecommendationRepository.ts", "utf8");
if (!typeSource.includes("export interface WeeklyRecommendation")) throw new Error("canonical type owner missing");
for (const field of ["kabarMingguIni", "pikiran", "ekonomi", "asmara", "orangTerdekat", "maknaBatin", "yangLagiBerat", "ruangBaru"]) {
  if (!typeSource.includes(`${field}: string`)) throw new Error(`weekly field missing: ${field}`);
  if (!service.includes(`${field}:`)) throw new Error(`producer mapping missing: ${field}`);
}
if (!service.includes("WeeklyRecommendationRepository.get") || !repository.includes("WeeklyRecommendation")) throw new Error("consumer contract missing");
if (service.includes("kabarMingguIni: \"\"")) throw new Error("empty fallback invented");
if (/WeeklyRecommendation[\\s\\S]{0,400}any/.test(typeSource) || typeSource.includes("@ts-ignore") || typeSource.includes("@ts-expect-error")) throw new Error("unsafe weekly contract");
if ((typeSource.match(/export interface WeeklyRecommendation/g) || []).length !== 1) throw new Error("duplicate weekly owner");
console.log("WEEKLY_RECOMMENDATION_CONTRACT_PASS");
export {};
