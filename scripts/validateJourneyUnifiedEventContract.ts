import fs from "node:fs";

const types = fs.readFileSync("lib/types/journeyDailyRecord.ts", "utf8");
const repository = fs.readFileSync("lib/repositories/journeyRepository_v2.ts", "utf8");
if (!types.includes("export interface JourneyUnifiedEvent")) throw new Error("canonical JourneyUnifiedEvent owner missing");
if (!repository.includes("JourneyUnifiedEvent")) throw new Error("repository import missing");
for (const field of ["id: string", "originId: string", "originSource: string", "dateKey: string", "timestamp: string", "title: string", "category: string", "significance", "originVersion", "rawReference"]) {
  if (!types.includes(field)) throw new Error(`required event field missing: ${field}`);
}
if (/JourneyUnifiedEvent[\\s\\S]{0,300}any/.test(types) || repository.includes("@ts-ignore")) throw new Error("unsafe Journey type escape");
if (types.match(/export interface JourneyUnifiedEvent/g)?.length !== 1) throw new Error("duplicate JourneyUnifiedEvent owner");
if (types.includes("Firestore") || types.includes("setDoc")) throw new Error("type owner contains runtime persistence");
console.log("JOURNEY_UNIFIED_EVENT_CONTRACT_PASS");
export {};
