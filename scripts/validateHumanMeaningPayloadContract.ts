import fs from "node:fs";

const types = fs.readFileSync("lib/types/humanMeaning.ts", "utf8");
const service = fs.readFileSync("lib/services/canonicalHumanMeaningService.ts", "utf8");
if (!types.includes("export interface HumanMeaningPayload")) throw new Error("HumanMeaningPayload owner missing");
if (!service.includes("HumanMeaningPayload") || !service.includes("generatePayload")) throw new Error("active import contract missing");
for (const field of ["identity", "daily", "relationships", "economics", "wellness", "growth", "companion", "psychologicalMeaning", "narrativeDirectionMeaning"]) if (!types.includes(field)) throw new Error(`payload field missing: ${field}`);
if (/HumanMeaningPayload[\\s\\S]{0,500}any/.test(types) || types.includes("@ts-ignore") || types.includes("@ts-expect-error")) throw new Error("unsafe payload contract");
if ((types.match(/export interface HumanMeaningPayload/g) || []).length !== 1) throw new Error("duplicate payload owner");
console.log("HUMAN_MEANING_PAYLOAD_CONTRACT_PASS");
export {};
